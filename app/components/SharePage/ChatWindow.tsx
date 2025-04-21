// DraggableChatWindow.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface DraggableChatWindowProps {
  chatChannel: RTCDataChannel | null;
}

interface ChatMessage {
  text: string;
  sender: "me" | "peer";
  timestamp: string;
}

const DraggableChatWindow: React.FC<DraggableChatWindowProps> = ({ chatChannel }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatChannel) return;

    const handleMessage = (e: MessageEvent) => {
      const message: ChatMessage = {
        text: e.data,
        sender: "peer",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, message]);
    };

    chatChannel.addEventListener("message", handleMessage);

    return () => {
      chatChannel.removeEventListener("message", handleMessage);
    };
  }, [chatChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !chatChannel || chatChannel.readyState !== "open") return;

    const message: ChatMessage = {
      text: input.trim(),
      sender: "me",
      timestamp: new Date().toLocaleTimeString(),
    };

    chatChannel.send(message.text);
    setMessages((prev) => [...prev, message]);
    setInput("");
  };

  return (
    <motion.div
      className="fixed bottom-20 right-6 bg-white shadow-2xl rounded-2xl w-80 h-96 flex flex-col border border-gray-300 z-50"
      drag
      dragConstraints={{ top: -1000, bottom: 1000, left: -1000, right: 1000 }}
    >
      <div className="bg-blue-600 text-white text-center py-2 font-semibold rounded-t-2xl cursor-grab">
        WebRTC Chat
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
          >
            <div
              className={`px-3 py-1 rounded-lg text-sm max-w-[70%] ${
                msg.sender === "me" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 border-t flex items-center gap-2">
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 px-3 py-1 border rounded-full text-sm outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </motion.div>
  );
};

export default DraggableChatWindow;
