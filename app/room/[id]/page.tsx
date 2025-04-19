"use client";

import { useParams } from "next/navigation";
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

export default function RoomPage() {
  const { id } = useParams();
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [callId, setCallId] = useState<string>("");
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const receivedBuffers = useRef<Blob[]>([]);
  const [receivedFileURL, setReceivedFileURL] = useState<string | null>(null);

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
    const channel = newPc.createDataChannel("fileTransfer");
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

  const handleReceiveData = (data: any) => {
    if (data !== "EOF") {
      receivedBuffers.current.push(data);
    } else {
      const blob = new Blob(receivedBuffers.current);
      const url = URL.createObjectURL(blob);
      setReceivedFileURL(url);
      receivedBuffers.current = [];
      console.log("File received and reconstructed");
    }
  };

  const handleSendFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !dataChannel || dataChannel.readyState !== "open") return;

    const chunkSize = 16 * 1024;
    const reader = new FileReader();

    let offset = 0;
    reader.onload = (e) => {
      if (e.target?.result && e.target.result instanceof ArrayBuffer) {
        dataChannel.send(e.target.result);
        offset += e.target.result.byteLength;

        if (offset < file.size) {
          readSlice(offset);
        } else {
          dataChannel.send("EOF"); // signal end of file
        }
      }
    };

    const readSlice = (o: number) => {
      const slice = file.slice(o, o + chunkSize);
      reader.readAsArrayBuffer(slice);
    };

    readSlice(0);
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center space-y-4">
      <div className="text-center text-lg font-semibold">
        This is room page: {id}
      </div>

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

      <input onChange={(e)=>setCallId(e.target.value)} value={callId} type="text" placeholder="Call ID" />
      <button  onClick={handleAnwserCall} className="bg-green-600 text-white px-4 py-2 rounded">
        Answer Call
      </button>

      {/* Upload file to send */}
      {dataChannel && dataChannel.readyState === "open" && (
        <div>
          <input type="file" onChange={handleSendFile} />
        </div>
      )}

      {/* Show download link when file is received */}
      {receivedFileURL && (
        <div>
          <a href={receivedFileURL} download="received-file">
            Download Received File
          </a>
        </div>
      )}
    </div>
  );
}
