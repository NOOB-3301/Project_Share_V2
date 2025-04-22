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


export default function GroupChat() {
  return (
    <div>
      hellow world
      <h1 className="text-2xl font-bold">Group Chat</h1>
    </div>
  )
}