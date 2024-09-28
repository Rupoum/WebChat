"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import { IconUserBolt } from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ChatApp() {
  const people = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Alex Johnson" },
  ];

  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const handleChatClick = (id: number) => {
    setSelectedChat(id);
  };

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-neutral-800 dark:bg-neutral-800 w-full border border-neutral-900 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      {/* Left Sidebar for people */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {people.map((person) => (
                <SidebarLink
                  key={person.id}
                  link={{
                    label: person.name,
                    href: "#",
                    icon: (
                      <IconUserBolt className="text-neutral-200 h-5 w-5 flex-shrink-0" />
                    ),
                  }}
                  onClick={() => handleChatClick(person.id)}
                />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Right Panel for Chat */}
      <div className="flex flex-1">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-900 dark:border-neutral-700 bg-neutral-900 dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
          {selectedChat === null ? (
            <div className="flex items-center justify-center h-full text-white text-lg">
              Select a chat to start messaging
            </div>
          ) : (
            <ChatWindow selectedChat={selectedChat} />
          )}
        </div>
      </div>
    </div>
  );
}

const ChatWindow = ({ selectedChat }: { selectedChat: number }) => {
  const [messages, setMessages] = useState([
    { from: "John Doe", message: "Hello!", time: "10:30 AM" },
    { from: "You", message: "Hey, how are you?", time: "10:31 AM" },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return; // Prevent empty messages

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Add new message to the list
    setMessages([
      ...messages,
      { from: "You", message: newMessage, time: currentTime },
    ]);
    setNewMessage(""); // Clear the input field
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-white text-lg p-4 bg-neutral-800">
        Chat with {selectedChat === 1 ? "John Doe" : "Other User"}
      </div>

      {/* Messages display */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-neutral-900">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.from === "You" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="bg-neutral-700 text-white p-2 rounded-lg max-w-xs">
              <p>{msg.message}</p>
              <span className="text-xs">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className="p-4 bg-neutral-800 border-t border-neutral-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-lg bg-neutral-700 text-white outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-white whitespace-pre"
      >
        Tappa!
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
