"use client"
import { useParams } from "next/navigation"

export default function (){

    const {id} = useParams()

    return(
        <div>
            this is room page {id}
        </div>
    )
}