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


export default function VideoPage() {

    const [senderpc, setSenderpc] = useState<RTCPeerConnection | null>(null)
    const [answerpc, setAnswerpc] = useState<RTCPeerConnection | null>(null)

    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)

    const [callId, setCallId] = useState<string | null>(null)

    const gettwebcam = async () => {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

        localStream.getTracks().forEach((track) => {
            if (senderpc) {
                senderpc.addTrack(track, localStream);
            }
            if (answerpc) {
                answerpc.addTrack(track, localStream);
            }
        })

        if (answerpc) {
            const remoteStream = new MediaStream();
            setRemoteStream(remoteStream);
            answerpc.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    remoteStream.addTrack(track);
                });
            };
        }
        if (senderpc) {
            const remoteStream = new MediaStream();
            setRemoteStream(remoteStream);
            senderpc.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    remoteStream.addTrack(track);
                });
            };
        }
        setLocalStream(localStream);
    }
    const createoffer = async () => {
        const servers = {
            iceServers: [
                {
                    urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
                },
            ],
        };

        const newPc = new RTCPeerConnection(servers);
        setSenderpc(newPc)
        console.log(newPc);
        console.log(localStream);
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
    }

    const answerOffer = async () => {
        console.log("Answering offer")
        if (!callId) {
            console.error("No call ID found. Please create an offer first.");
            return;
        }
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
        setAnswerpc(anspc);
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
    }

    return (
        <div className="w-full min-h-screen bg-white">
            <h1 className="text-4xl font-bold text-gray-800">Video Page</h1>
            <button onClick={() => gettwebcam()}>Webcam</button>
            <br />
            <button onClick={() => createoffer()}>Create Offer</button>
            <br />
            <input className="border-2 border-black" type="text" value={callId ? callId : ""} onChange={(e) => setCallId(e.target.value)} />
            <button onClick={() => answerOffer()}>Answer Offer</button>
            <video
                className="w-1/2"
                autoPlay
                playsInline
                muted
                ref={(video) => {
                    if (video && localStream) {
                        video.srcObject = localStream;
                    }
                }}
            />
            <video
                className="w-1/2"
                autoPlay
                playsInline
                ref={(video) => {
                    if (video && remoteStream) {
                        video.srcObject = remoteStream;
                    }
                }}
            />


        </div>
    )
}