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


export default function RoomPage() {
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [callId, setCallId] = useState<string>("");
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const receivedBuffers = useRef<Blob[]>([]);
  // const [receivedFileURL, setReceivedFileURL] = useState<string | null>(null);

  const receivedMetadata = useRef<{ name: string; type: string; size:number } | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>("received-file");


  const [sendProgress, setSendProgress] = useState<number>(0);
  const [receiveProgress, setReceiveProgress] = useState<number>(0);

  const receivedSize = useRef<number>(0);

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fileStream = useRef<WritableStreamDefaultWriter | null>(null);


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

    // ✅ Create data channel
    const channel = newPc.createDataChannel("fileTransfer",{ordered:true,maxRetransmits:0});
    console.log(channel)
    setDataChannel(channel);

    channel.onopen = () => console.log("Data channel opened");
    channel.onmessage = (event) => handleReceiveData(event.data);

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
    const pc = new RTCPeerConnection(servers)

    if (!pc) {
      console.error("No RTCPeerConnection instance");
      return;
    }

    pc.onicecandidate = async (event) => {
      console.log("ice candidate")
      console.log(event)
      if (event.candidate) {
        await addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    // ✅ Receive data channel
    pc.ondatachannel = (event) => {
      console.log("hit from datachannel")
      console.log("event", event)
      const channel = event.channel;
      console.log("answer", channel)
      setDataChannel(channel);

      channel.onopen = () => console.log("Data channel opened (Answerer)");
      channel.onmessage = (event) => handleReceiveData(event.data);
    };

    const callData = (await getDoc(calldoc)).data();
    const offerDescription = callData?.offer;

    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    await updateDoc(calldoc, { answer: answerDescription });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  };

  const handleReceiveData = async(data: any) => {
    console.log(data)
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
            console.log("sent: ", chunk)
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
  
  
  


  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center space-y-4">
      <button
        onClick={handleCreateOffer}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Offer
      </button>

      {callId && (
        <div>
          Call ID: <code>{callId}</code>
        </div>
      )}

      <input onChange={(e) => setCallId(e.target.value)} value={callId} type="text" placeholder="Call ID" />
      <button onClick={handleAnwserCall} className="bg-green-600 text-white px-4 py-2 rounded">
        Answer Call
      </button>

      {/* Upload file to send */}
      {dataChannel && dataChannel.readyState === "open" && (
        <div>
          <input type="file" onChange={handleSendFile} />
        </div>
      )}

      {/* Show download link when file is received */}
      {/* {receivedFileURL && (
        <div>
          <a href={receivedFileURL} download={downloadFilename}>
            Download Received File
          </a>
        </div>
      )} */}
{isUploading && (
  <div className="w-full px-4">
    <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
      <div
        className="bg-blue-600 h-full transition-all duration-300"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>
    <div className="text-sm text-center mt-1">{uploadProgress}%</div>
  </div>
)}


{receiveProgress > 0 && receiveProgress < 100 && (
  <div className="w-full px-4">
    <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
      <div
        className="bg-green-600 h-full transition-all duration-300"
        style={{ width: `${receiveProgress}%` }}
      />
    </div>
    <div className="text-sm text-center mt-1">{receiveProgress}% Downloading</div>
  </div>
)}

    </div>
  );
}
