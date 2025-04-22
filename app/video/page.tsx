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
import { Video, PhoneCall, PhoneOff, VideoOff, Phone, Mic, MicOff, ScreenShare, ScreenShareOff } from "lucide-react";
import { MessageCircle, X } from "lucide-react";

import { toast, ToastContainer } from "react-toastify";
import DraggableChatWindow from "../components/SharePage/ChatWindow";


export default function VideoPage() {

  const [isAnswering, setIsAnswering] = useState(false);

  //for chat management
  const [chatChannel, setChatChannel] = useState<RTCDataChannel | null>(null);
  const [ischatwindowOpen, setIsChatWindowOpen] = useState(false);

  //global stet managemnt
  const [senderpc, setSenderpc] = useState<RTCPeerConnection | null>(null);
  const [answerpc, setAnswerpc] = useState<RTCPeerConnection | null>(null);

  //for audio vid buttons
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);


  //for screen share state
  const [isScreenSharing, setIsScreenSharing] = useState(false);


  //video management
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

  const handlechatwindow = () => {
    if (chatChannel) {
      setIsChatWindowOpen(prev => !prev)
    } else {
      toast.error("Chat Channel is not open yet!")
    }
  }


  const getWebcam = async () => {
    const local = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(local);
    if (senderpc) {
      local.getTracks().forEach((track) => senderpc.addTrack(track, local));
      senderpc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => remoteStream?.addTrack(track));
      }
    } else if (answerpc) {
      local.getTracks().forEach((track) => answerpc.addTrack(track, local));
      answerpc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => remoteStream?.addTrack(track));
      }
    }
    else {
      console.log("No Peer Connection Found not enntede sender or answer block")
    }
  };

  const notify = (text: string) => toast(`${text}`)
  const createOffer = async () => {
    if (!localStream) {
      notify("First Get The Camera Access to start Sharing!!!")
      return;
    }
    const servers = {
      iceServers: [
        { urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] },
      ],
    };
    const newPc = new RTCPeerConnection(servers);
    const newchatChannel = newPc.createDataChannel("chat", {
      ordered: true,
      maxRetransmits: 0, // No retries = lower latency
    });
    newchatChannel.onopen = () => {
      console.log("Chat channel opened");
      notify("Chat channel is now open!");
    }
    setChatChannel(newchatChannel);
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
    if (!callId || !localStream) {
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

    anspc.ondatachannel = (event) => {
      const channel = event.channel;
      channel.onopen = () => {
        console.log("Chat channel opened", channel);
        notify("Chat Channel is opened successfully!");
        setChatChannel(channel);
      };
    }

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

  const handleScreenShare = async () => {
    if (!localStream) {
      notify("First Get The Camera Access to start Sharing!!!");
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Replace the video track
      const screenVideoTrack = screenStream.getVideoTracks()[0];
      const senders = (senderpc || answerpc)?.getSenders();
      const videoSender = senders?.find(sender => sender.track?.kind === 'video');

      if (videoSender && screenVideoTrack) {
        await videoSender.replaceTrack(screenVideoTrack);
        setLocalStream(screenStream);
        console.log("✅ Screen sharing started");

        screenVideoTrack.onended = async () => {
          notify("Screen sharing stopped");


          // Switch back to camera
          const camStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          const camTrack = camStream.getVideoTracks()[0];

          if (camTrack && videoSender) {
            await videoSender.replaceTrack(camTrack);
            setLocalStream(camStream);
            console.log("✅ Reverted to webcam");
          }
          setIsScreenSharing(false);
        };
        setIsScreenSharing(true);
      } else {
        console.error("❌ No video sender found or screen track unavailable");
      }
    } catch (err) {
      console.error("❌ Error during screen sharing:", err);
      notify("Failed to start screen sharing.");
    }
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
    setChatChannel(null);
    setIsChatWindowOpen(false);
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
      </div>

      <div className="relative flex flex-col md:flex-row gap-4 justify-center items-center">
        <div className="relative w-full md:w-1/2">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full border-4 border-blue-400 rounded-2xl shadow-lg"
          />
          {/* Controls over Local Video */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
            {/* Toggle Video */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (localStream) {
                  const videoTrack = localStream.getVideoTracks()[0];
                  videoTrack.enabled = !videoTrack.enabled;
                  setIsVideoOn(videoTrack.enabled);
                }
              }}
              className="bg-white/80 backdrop-blur p-2 rounded-full shadow hover:scale-105 transition"
            >
              {isVideoOn ? (
                <Video className="text-blue-600 w-6 h-6" />
              ) : (
                <VideoOff className="text-red-500 w-6 h-6" />
              )}
            </motion.button>

            {/* Toggle Audio */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (localStream) {
                  const audioTrack = localStream.getAudioTracks()[0];
                  audioTrack.enabled = !audioTrack.enabled;
                  setIsAudioOn(audioTrack.enabled);
                }
              }}
              className="bg-white/80 backdrop-blur p-2 rounded-full shadow hover:scale-105 transition"
            >
              {isAudioOn ? (
                <Mic className="text-blue-600 w-6 h-6" />
              ) : (
                <MicOff className="text-red-500 w-6 h-6" />
              )}
            </motion.button>
            {/* end call */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={endCall}
              className="bg-white/80 backdrop-blur p-2 rounded-full shadow hover:scale-105  transition "
              aria-label="End Call"
            >
              <PhoneOff className="text-blue-600 hover:text-red-500 w-6 h-6" />
            </motion.button>
            {/* Screen Share */}
            {isScreenSharing ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleScreenShare}
                className="bg-white/80 backdrop-blur p-2 rounded-full shadow hover:scale-105 transition"
                aria-label="End Call"
              >
                <ScreenShareOff className="text-red-500 w-6 h-6" />
              </motion.button>

            ) : (<motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleScreenShare}
              className="bg-white/80 backdrop-blur p-2 rounded-full shadow hover:scale-105 transition"
              aria-label="End Call"
            >
              <ScreenShare className="text-blue-600 w-6 h-6" />
            </motion.button>)}
          </div>

        </div>

        <div className="relative w-full md:w-1/2">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full border-4 border-green-400 rounded-2xl shadow-lg"
          />
        </div>
      </div>

      <div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handlechatwindow}
          className={`fixed bottom-4 right-4 sm:right-6 p-3 rounded-full z-50 shadow-lg transition-colors duration-300 ${ischatwindowOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          title={ischatwindowOpen ? "Close Chat Window" : "Open Chat Window"}
        >
          {ischatwindowOpen ? (
            <X className="text-white w-5 h-5" />
          ) : (
            <MessageCircle className="text-white w-5 h-5" />
          )}
        </motion.button>



        {ischatwindowOpen && chatChannel ? (
          <DraggableChatWindow chatChannel={chatChannel} />
        ) : (null)}

      </div>
      <ToastContainer />
    </motion.div>
  );
}
