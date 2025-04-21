"use client";
import { useEffect, useRef, useState } from "react";
import { db } from "@/app/firebase";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  getDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
// import streamSaver from 'streamsaver'
import { UploadCloud, PhoneCall, PhoneIncoming, HomeIcon } from 'lucide-react';
import { toast, ToastContainer } from "react-toastify";
import DraggableChatWindow from "../components/SharePage/ChatWindow";



export default function RoomPage() {
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [callId, setCallId] = useState<string>("");
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const receivedBuffers = useRef<Blob[]>([]);
  const receivedMetadata = useRef<{ name: string; type: string; size: number } | null>(null);
  const [receiveProgress, setReceiveProgress] = useState<number>(0);
  const receivedSize = useRef<number>(0);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileStream = useRef<WritableStreamDefaultWriter | null>(null);

  const [anspc, setAnspc] = useState<RTCPeerConnection | null>(null)
  const [senderpc, setSenderpc] = useState<RTCPeerConnection | null>(null)


  const [chatChannel, setChatChannel] = useState<RTCDataChannel | null>(null)

//logging and closing peer connection
  const logpc =()=>{
    console.log("answers pc",anspc)
    console.log("sender",senderpc)
    anspc?.close()
    setAnspc(null)
    senderpc?.close()
    setSenderpc(null)
  }

  const notify = ()=> toast("Data Channel Opened, Share the Call ID With Your Friend for File Transfer !!")

  const handleCreateOffer = async () => {
    const servers = {
      iceServers: [
        {
          urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
      ],
    };

    const newPc = new RTCPeerConnection(servers);
    setPc(newPc);
    setSenderpc(newPc)

    // ✅ Create data channel
    const channel = newPc.createDataChannel("fileTransfer", { ordered: true, maxRetransmits: 0 });

    //craete chat chanenl
    const chatChannel = newPc.createDataChannel("chat", { ordered: true, maxRetransmits: 0 });
    console.log("this is chat channel",chatChannel)

    console.log(channel)
    setDataChannel(channel);
    setChatChannel(chatChannel)

    channel.onopen = () => console.log("Data channel opened");
    chatChannel.onopen = () => console.log("Chat channel opened");
    channel.onmessage = (event) => handleReceiveData(event.data);
    channel.onmessage = (e) =>{console.log("message from data channel",e)}
    const callDocRef = doc(collection(db, "calls"));
    const offerCandidates = collection(callDocRef, "offerCandidates");
    const answerCandidates = collection(callDocRef, "answerCandidates");

    setCallId(callDocRef.id);

    newPc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    const offerDescription = await newPc.createOffer();
    console.log(offerDescription)
    await newPc.setLocalDescription(offerDescription);

    await setDoc(callDocRef, { offer: offerDescription });

    // Listen for answer
    onSnapshot(callDocRef, (snapshot) => {
      const data = snapshot.data();
      if (!newPc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        newPc.setRemoteDescription(answerDescription);
      }
    });

    // Listen for remote ICE candidates
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          newPc.addIceCandidate(candidate);
        }
      });
    });
  };

  const handleAnwserCall = async () => {

    const calldoc = doc(db, "calls", callId);
    const answerCandidates = collection(calldoc, "answerCandidates");
    const offerCandidates = collection(calldoc, "offerCandidates");
    const servers = {
      iceServers: [
        {
          urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
      ],
    };
    const anspc = new RTCPeerConnection(servers)
    setAnspc(anspc);
    if (!anspc) {
      console.error("No RTCPeerConnection instance");
      return;
    }

    anspc.onicecandidate = async (event) => {
      console.log("ice candidate")
      console.log(event)
      if (event.candidate) {
        await addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    // ✅ Receive data channel
    anspc.ondatachannel = (event) => {
      console.log("hit from datachannel")
      console.log("event", event)

      if (event.channel.label === 'fileTransfer') {
        console.log("file transfer channnel")
        const channel = event.channel;
        console.log("answer", channel)
        setDataChannel(channel);
  
        channel.onopen = () => {
          console.log("Data channel opened (Answerer)");
        }
        channel.onmessage = (event) => handleReceiveData(event.data);

      }else if (event.channel.label === 'chat') {
        console.log("chat channel")
        const chatChannel = event.channel;
        setChatChannel(chatChannel)

        chatChannel.onopen = () => {
          console.log("Chat channel opened (Answerer)");
        }
      }

    };

    const callData = (await getDoc(calldoc)).data();
    const offerDescription = callData?.offer;

    await anspc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await anspc.createAnswer();
    await anspc.setLocalDescription(answerDescription);

    await updateDoc(calldoc, { answer: answerDescription });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          anspc.addIceCandidate(candidate);
        }
      });
    });

    notify()
  };

  const handleReceiveData = async (data: any) => {
    console.log("data is receiving")
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "metadata") {
          receivedMetadata.current = parsed.metadata;
          receivedSize.current = 0;
          setReceiveProgress(0);

          //import streamsaver dyammcally for fixing ssr, it is gigivng document not found error
          // Create stream
          const stereamsaver = (await import('streamsaver')).default
          const fileStreamObj = stereamsaver.createWriteStream(parsed.metadata.name, {
            size: parsed.metadata.size,
          });
          fileStream.current = fileStreamObj.getWriter();
          return;
        }
      } catch {
        if (data === "EOF") {
          fileStream.current?.close();
          fileStream.current = null;
          setReceiveProgress(100);
          console.log("File download completed");
          return;
        }
      }
    }

    // Binary chunk
    if (fileStream.current) {

      const chunk = new Uint8Array(data);
      fileStream.current.write(chunk);
      receivedSize.current += chunk.byteLength;

      const total = receivedMetadata.current?.size ?? 0;
      if (total) {
        const percent = Math.floor((receivedSize.current / total) * 100);
        setReceiveProgress(percent);
      }
    }
  };

  const handleSendFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !dataChannel) return;

    const metadata = {
      name: file.name,
      type: file.type,
      size: file.size,
    };

    // Check if data channel is open
    if (dataChannel.readyState !== "open") {
      alert("Data channel is not open yet. Please try again.");
      return;
    }

    // Send metadata first
    dataChannel.send(JSON.stringify({ type: "metadata", metadata }));

    const stream = file.stream();
    const reader = stream.getReader();

    const chunkSize = 216 * 1024; // 216 KB chunks
    let sentBytes = 0;

    setIsUploading(true);

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Wait for buffer to clear (backpressure)
        while (dataChannel.bufferedAmount > 8 * 1024 * 1024) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (dataChannel.readyState !== "open") {
          console.warn("Data channel closed during transfer.");
          break;
        }

        // Slice value manually to control chunkSize if needed
        if (value.byteLength > chunkSize) {
          for (let offset = 0; offset < value.byteLength; offset += chunkSize) {
            const chunk = value.slice(offset, offset + chunkSize);
            dataChannel.send(chunk);

            sentBytes += chunk.byteLength;
            setUploadProgress(Math.round((sentBytes / file.size) * 100));
            console.log("chunk sent")
          }
        } else {
          dataChannel.send(value);
          sentBytes += value.byteLength;
          setUploadProgress(Math.round((sentBytes / file.size) * 100));
        }
      }

      // Send end-of-file signal
      dataChannel.send("EOF");
      console.log("File transfer complete");
    } catch (err) {
      console.error("Stream reading failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const hanndlechat = () => {
    console.log("chatting")
    console.log('this is chatChannel from handlechat',chatChannel)
  }



  return (
    <>
      <div className="absolute top-4 left-4 cursor-pointer" onClick={() => window.location.href = '/'}>
        <HomeIcon size={24}/>
      </div>
    <div className="min-h-screen w-full flex flex-col justify-center items-center space-y-6 p-4 bg-gray-50">
      <div className="max-w-md w-full space-y-6 bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-center">Peer-to-Peer File Transfer</h1>
        <p className="text-gray-600 text-center">
          Create or join a call to start transferring files.
        </p>

        <button
          onClick={handleCreateOffer}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
        >
          <PhoneCall className="w-5 h-5" />
          <span>Create Call</span>
        </button>

        {callId && (
          <div className="text-center text-sm text-gray-800">
            Call ID: <code className="text-blue-600 font-mono">{callId}</code>
          </div>
        )}

        <input
          type="text"
          placeholder="Call ID"
          value={callId}
          onChange={(e) => setCallId(e.target.value)}
          className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleAnwserCall}
          className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition"
        >
          <PhoneIncoming className="w-5 h-5" />
          <span>Answer Call</span>
        </button>

        {dataChannel?.readyState === 'open' && (
          <div className="w-full">
            <label className="block mb-1 text-sm font-medium text-gray-700">Send a File:</label>
            <input
              type="file"
              onChange={handleSendFile}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-white file:bg-blue-600 hover:file:bg-blue-700"
            />
          </div>
        )}

        {isUploading && (
          <div className="w-full">
            <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-sm text-center mt-1 text-gray-700">{uploadProgress}% Uploading</div>
          </div>
        )}

        {isUploading && (
          <button onClick={() =>{logpc(); setIsUploading(false); setUploadProgress(0);}} className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl shadow hover:bg-red-700 transition">
            <UploadCloud className="w-5 h-5" />
            Close Transfer
          </button>
        )}

        {receiveProgress > 0 && receiveProgress < 100 && (
          <div className="w-full">
            <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
              <div
                className="bg-green-600 h-full transition-all duration-300"
                style={{ width: `${receiveProgress}%` }}
              />
            </div>
            <div className="text-sm text-center mt-1 text-gray-700">
              {receiveProgress}% Downloading
            </div>
          </div>
        )}

        {/* {isUploading || receiveProgress > 0 ? ( */}
        <div className="w-full flex items-center justify-center space-x-2 mt-4">

          <button
            className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-xl shadow hover:bg-purple-700 transition"
            onClick={()=> hanndlechat()}
          >
            Video Button
          </button>
        </div>
        {/* ):(null)} */}
      </div>
      <ToastContainer/>
        {chatChannel && (
          <DraggableChatWindow chatChannel={chatChannel}  />
        )}
    </div>
   </>

  );
}
