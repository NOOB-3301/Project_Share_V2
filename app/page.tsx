"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const id = Math.floor(Math.random()*1000)
  const router = useRouter()



  

  return (
    <div>
      This is home page
      <br/>
      <button onClick={()=>{router.push(`/room/${id}`)}}>Join Room</button>
    </div>
  );
}
