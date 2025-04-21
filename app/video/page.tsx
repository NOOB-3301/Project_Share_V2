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
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Video, PhoneCall, PhoneOff, VideoOff, Phone } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

export default function VideoPage() {

  const [isAnswering, setIsAnswering] = useState(false);


  const [senderpc, setSenderpc] = useState<RTCPeerConnection | null>(null);
  const [answerpc, setAnswerpc] = useState<RTCPeerConnection | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [callId, setCallId] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const getWebcam = async () => {
    const local = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(local);
  };
  
  const notify = (text:string)=> toast(`${text}`)
  const createOffer = async () => {
    if (!localStream){
        notify("First Get The Camera Access to start Sharing!!!")
        return;  
    } 
    const servers = {
      iceServers: [
        { urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] },
      ],
    };
    const newPc = new RTCPeerConnection(servers);
    localStream.getTracks().forEach((track) => newPc.addTrack(track, localStream));
    const remote = new MediaStream();
    setRemoteStream(remote);

    newPc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => remote.addTrack(track));
    };

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

    onSnapshot(callDocRef, (snapshot) => {
      const data = snapshot.data();
      if (!newPc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        newPc.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          newPc.addIceCandidate(candidate);
        }
      });
    });

    setSenderpc(newPc);
    notify("Call Created Successfully!!!")
  };

  const answerOffer = async () => {
      if (!callId || !localStream){
          notify("Get The Camera Access and CallId to start Sharing and Answer the Call.....")
          return;
        } 
    setIsAnswering(true);
    const calldoc = doc(db, "calls", callId);
    const answerCandidates = collection(calldoc, "answerCandidates");
    const offerCandidates = collection(calldoc, "offerCandidates");

    const servers = {
      iceServers: [
        { urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] },
      ],
    };
    const anspc = new RTCPeerConnection(servers);
    localStream.getTracks().forEach((track) => anspc.addTrack(track, localStream));
    const remote = new MediaStream();
    setRemoteStream(remote);

    anspc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => remote.addTrack(track));
    };

    anspc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(answerCandidates, event.candidate.toJSON());
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

    setAnswerpc(anspc);
    setIsAnswering(false);
    notify("Call Answered Successfully!!!")
  };

  const endCall = () => {
    senderpc?.close();
    answerpc?.close();
    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());
    setSenderpc(null);
    setAnswerpc(null);
    setLocalStream(null);
    setRemoteStream(null);
    setCallId(null);
    setIsAnswering(false);
    notify("Call Ended Successfully!!!")
  };

  return (
    <motion.div
      className="w-full min-h-screen bg-gradient-to-br from-white to-slate-100 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center"> P2P Video Share</h1>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={getWebcam}
          className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 border border-blue-500 px-4 py-2 rounded-lg shadow-sm transition"
        >
          <Video size={18} /> Get Webcam
        </button>

        <button
          onClick={createOffer}
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition"
        >
          <PhoneCall size={18} /> Create Offer
        </button>

        <input
          type="text"
          placeholder="Call ID"
          value={callId || ""}
          onChange={(e) => setCallId(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-48"
        />

        {isAnswering ? (
          <button
            disabled
            className="flex items-center gap-2 bg-gray-400 text-white px-4 py-2 rounded-lg shadow-sm transition cursor-not-allowed"
          >
            <Phone size={18} /> Answering...
          </button>
        ) : (
          <button
            onClick={answerOffer}
            className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg shadow-sm transition"
          >
            <Phone size={18} /> Answer Call
          </button>
        )}

        <button
          onClick={endCall}
          className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg shadow-sm transition"
        >
          <PhoneOff size={18} /> End Call
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full md:w-1/2 border-4 border-blue-400 rounded-2xl shadow-lg"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full md:w-1/2 border-4 border-green-400 rounded-2xl shadow-lg"
        />
      </div>
      <ToastContainer/>
    </motion.div>
  );
}
