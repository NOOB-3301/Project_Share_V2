"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

  const handleCreateOffer = async () => {
    const servers = {
      iceServers: [
        {
          urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
      ],
      iceCandidatePoolSize: 10,
    };

    const newPc = new RTCPeerConnection(servers);
    console.log(newPc)
    setPc(newPc);

    const callDocRef = doc(collection(db, "calls")); // auto-ID
    const offerCandidates = collection(callDocRef, "offerCandidates");
    const answerCandidates = collection(callDocRef, "answerCandidates");

    setCallId(callDocRef.id);
    newPc.createDataChannel("chat");

    // Collect ICE candidates
    newPc.onicecandidate = async (event) => {
      console.log(event)
      if (event.candidate) {
        console.log("new icecandidate", event.candidate)
        await addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    // Create offer
    const offerDescription = await newPc.createOffer();
    await newPc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDocRef, { offer });

    // Listen for answer
    onSnapshot(callDocRef, (snapshot) => {
      const data = snapshot.data();
      if (!newPc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        newPc.setRemoteDescription(answerDescription);
      }
    });

    // TODO: Later you’ll also want to listen for remote ICE candidates (answer side)
    onSnapshot(answerCandidates,(snapshot)=>{
        snapshot.docChanges().forEach((change)=>{
            if(change.type === 'added'){
                const candidate = new RTCIceCandidate(change.doc.data());
                newPc.addIceCandidate(candidate);
            }
        })
        
    })
  };

  const handleAnwserCall = async () => {
    const calldoc = doc(db,'calls',callId)
    const answerCandidates = collection(calldoc,"answerCandidates")
    console.log(pc)
    pc.onicecandidate =async (event) =>{
        if (event.candidate) {
            await addDoc(answerCandidates, event.candidate.toJSON())
        }
    } 
    const calldata = (await getDoc(calldoc)).data()

    console.log(calldata)
    const offerDescription = calldata?.offer

    await pc?.setRemoteDescription(new RTCSessionDescription(offerDescription))

    const answerDescription = await pc?.createAnswer()
    await pc?.setLocalDescription(answerDescription)

    console.log(answerDescription)

    const answer={
      type: answerDescription?.type,
      sdp: answerDescription?.sdp
    }

    await updateDoc(calldoc,answer)
  }

  const handlefirestore =async()=>{
    const docs = await getDocs(collection(db, 'calls'))
    docs.forEach(async doc =>{
      console.log(doc.id)
      const subcollection = await getDocs(collection(db, 'calls', doc.id, 'offerCandidates'))
      console.log(subcollection)
      subcollection.forEach(collection=>{
        console.log(collection.data())
      })
    })

  }
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
      {callId && <div>Call ID: <code>{callId}</code></div>}
      <input value={callId} type="text" placeholder="Call ID"/>
      <button onClick={handleAnwserCall}>Answer Call</button>

      <button onClick={handlefirestore}>Get docs</button>
    </div>
  );
}
