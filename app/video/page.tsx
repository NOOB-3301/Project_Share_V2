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

export default function VideoPage() {
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

    const gettwebcam = async () => {
        const local = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(local);

        if (senderpc) {
            console.log("Adding tracks to senderpc", senderpc);

            local.getTracks().forEach(track => senderpc.addTrack(track, local));
            console.log("Tracks added to senderpc", senderpc);
        }
        if (answerpc) {
            console.log("Adding tracks to answerpc", answerpc);
            local.getTracks().forEach(track => answerpc.addTrack(track, local));
            console.log("Tracks added to answerpc", answerpc);
        }

        const remote = new MediaStream();
        console.log("Creating remote stream", remote);
        setRemoteStream(remote);

        const setupOnTrack = (pc: RTCPeerConnection) => {
            console.log("Setting up ontrack for pc", pc);
            pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach(track => {
                    remote.addTrack(track);
                });
            };
        };

        
        if (senderpc) {
            setupOnTrack(senderpc);
            console.log("after sender", senderpc);
        };
        if (answerpc) setupOnTrack(answerpc);
        console.log("after remote", remote);
    };

    const createoffer = async () => {
        const servers = {
            iceServers: [{ urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] }],
        };
        const newPc = new RTCPeerConnection(servers);
        setSenderpc(newPc);

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
    };

    const answerOffer = async () => {
        if (!callId) {
            console.error("No call ID found.");
            return;
        }

        const calldoc = doc(db, "calls", callId);
        const answerCandidates = collection(calldoc, "answerCandidates");
        const offerCandidates = collection(calldoc, "offerCandidates");

        const servers = {
            iceServers: [{ urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] }], 
        };

        const anspc = new RTCPeerConnection(servers);
        console.log("Answering call with server",anspc);
        setAnswerpc(anspc);

        anspc.onicecandidate = async (event) => {
            console.log("ICE candidate:", event);
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

        const remote = new MediaStream();
        setRemoteStream(remote);

        // Ensure tracks from the remote peer are added to the remote stream
        anspc.ontrack = (event) => {
            console.log(event)
            event.streams[0].getTracks().forEach(track => {
                remote.addTrack(track);
            });
        };
    };

    return (
        <div className="w-full min-h-screen bg-white p-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Video Page</h1>

            <div className="space-x-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={gettwebcam}>Get Webcam</button>
                <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={createoffer}>Create Offer</button>
                <input
                    className="border px-2 py-1"
                    type="text"
                    placeholder="Call ID"
                    value={callId || ""}
                    onChange={(e) => setCallId(e.target.value)}
                />
                <button className="px-4 py-2 bg-purple-500 text-white rounded" onClick={answerOffer}>Answer</button>
            </div>

            <div className="flex mt-8 gap-4">
                <video
                    className="w-1/2 border-2 border-blue-500 rounded"
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                />
                <video
                    className="w-1/2 border-2 border-green-500 rounded"
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                />
            </div>
        </div>
    );
}
