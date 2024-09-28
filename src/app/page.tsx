"use client";
import React, { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import { decryptmessage } from "../lib/decrypt";
import { Sidebar, SidebarBody } from "../components/ui/sidebar";
import { cn } from "@/lib/utils";

// Interface for messages
interface Message {
  senderUid: string;
  receiverUid: string;
  message: string;
}

export default function ChatApp() {
  const [uid, setUid] = useState<string>(""); // Your own UID
  const [receiverUid, setReceiverUid] = useState<string>(""); // Receiver's UID
  const [message, setMessage] = useState<string>(""); // Message input
  const [chat, setChat] = useState<Message[]>([]); // Chat history
  const [socket, setSocket] = useState<Socket | null>(null);
  const [senderName, setSenderName] = useState<string>(""); // Sender's Name
  const [receiverName, setReceiverName] = useState<string>(""); // Receiver's Name
  const [open, setOpen] = useState<boolean>(false);

  // Establish socket connection
  useEffect(() => {
    const newSocket = io("https://wechat-3aqg.onrender.com");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join room and handle receiving messages
  useEffect(() => {
    if (socket && uid) {
      socket.emit("joinRoom", uid);

      socket.on("receiveMessage", async (messageData: Message) => {
        const { senderUid, receiverUid, message } = messageData;

        // Only process messages intended for this user
        if (receiverUid === uid) {
          try {
            // Decrypt the message if necessary
            const publicKeyResponse = await axios.get(
              `https://wechat-3aqg.onrender.com/auth/publickey/${uid}`
            );
            const privateKeyResponse = await axios.get(
              `https://wechat-3aqg.onrender.com/auth/privatekey/${uid}`
            );
            const publickey = publicKeyResponse.data;
            const privatekey = privateKeyResponse.data;
            const decryptedMessage = await decryptmessage(
              publickey,
              privatekey,
              message
            );

            // Add the received message to the chat history
            setChat((prevChat: Message[]) => [
              ...prevChat,
              { senderUid, receiverUid, message: decryptedMessage },
            ]);
          } catch (error) {
            console.error("Error fetching keys or decrypting message:", error);
          }
        }
      });

      // Fetch the sender's name
      fetchUserDetails(uid, true);
    }

    return () => {
      if (socket) {
        socket.off("receiveMessage");
      }
    };
  }, [socket, uid]);

  // Send a message
  const sendMessage = async () => {
    if (!message || !receiverUid || !uid) {
      alert("Please enter a message, your UID, and receiver UID!");
      return;
    }

    try {
      const messageData: Message = {
        senderUid: uid,
        receiverUid,
        message,
      };

      if (socket) {
        socket.emit("sendMessage", messageData);

        // Add the sent message to the chat history
        setChat((prevChat) => [...prevChat, messageData]);
        setMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Fetch sender and receiver names based on UIDs
  const fetchUserDetails = async (uid: string, isSender: boolean) => {
    try {
      const response = await axios.get(
        `https://wechat-3aqg.onrender.com/users/${uid}`
      );
      const userName = response.data.name;
      if (isSender) {
        setSenderName(userName);
      } else {
        setReceiverName(userName);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Handle UID input and fetch names
  const handleUidInput = async (uid: string, isSender: boolean) => {
    if (isSender) {
      setUid(uid);
      await fetchUserDetails(uid, true);
    } else {
      setReceiverUid(uid);
      await fetchUserDetails(uid, false);
    }
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
            {open ? "Logo" : "Logo"}
            <div className="mt-8 flex flex-col gap-2">
              <div>
                <input
                  type="text"
                  placeholder="Your UID"
                  value={uid}
                  onChange={(e) => handleUidInput(e.target.value, true)}
                  className="p-2 rounded-lg bg-neutral-700 text-white outline-none mb-2"
                />
                <input
                  type="text"
                  placeholder="Receiver UID"
                  value={receiverUid}
                  onChange={(e) => handleUidInput(e.target.value, false)}
                  className="p-2 rounded-lg bg-neutral-700 text-white outline-none"
                />
              </div>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Right Panel for Chat */}
      <div className="flex flex-1">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-900 dark:border-neutral-700 bg-neutral-900 dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
          <ChatWindow
            chat={chat}
            uid={uid}
            senderName={senderName}
            receiverName={receiverName}
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}

// Chat window props interface
interface ChatWindowProps {
  chat: Message[];
  uid: string;
  senderName: string;
  receiverName: string;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
}

// Chat window component
const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  uid,
  senderName,
  receiverName,
  message,
  setMessage,
  sendMessage,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="text-white text-lg p-4 bg-neutral-800">
        {receiverName}
      </div>

      {/* Messages display */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-neutral-900">
        {chat.map((msg: Message, index: number) => (
          <div
            key={index}
            className={`flex ${
              msg.senderUid === uid ? "justify-end" : "justify-start"
            }`}
          >
            <div className="bg-neutral-700 text-white p-2 rounded-lg max-w-xs">
              <p>{msg.message}</p>
              <span className="text-xs">
                From:{" "}
                {msg.senderUid === uid
                  ? senderName
                  : receiverName || msg.senderUid}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className="p-4 bg-neutral-800 border-t border-neutral-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-lg bg-neutral-700 text-white outline-none"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
