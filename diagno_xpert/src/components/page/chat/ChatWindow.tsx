"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ChevronLeft } from "lucide-react";
import chatApi from "@/ApiServices/chatApi";
import toast from "react-hot-toast";

type Message = {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  read: boolean;
  createdAt: string;
};

type Peer = {
  _id: string;
  username: string;
  email?: string;
  profilePicture?: { Url?: string; url?: string } | string;
  role?: string;
};

type Props = {
  conversationId: string;
  peer: Peer;
  currentUserId: string;
  onBack?: () => void;
};

const DEFAULT_AVATAR = "/default-avatar.svg";

function avatar(p: Peer): string {
  const pic = p.profilePicture as any;
  if (!pic) return DEFAULT_AVATAR;
  if (typeof pic === "string") return pic || DEFAULT_AVATAR;
  return pic.Url || pic.url || DEFAULT_AVATAR;
}

function formatTime(d: string) {
  try {
    return new Date(d).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function ChatWindow({
  conversationId,
  peer,
  currentUserId,
  onBack,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    chatApi
      .getMessages(conversationId)
      .then((data) => {
        if (cancelled) return;
        setMessages(data || []);
      })
      .catch(() => toast.error("Failed to load messages"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.type !== "message") return;
      if (detail.conversationId !== conversationId) return;
      const m = detail.message as Message;
      setMessages((prev) => {
        if (prev.some((x) => x._id === m._id)) return prev;
        return [...prev, m];
      });
    };
    window.addEventListener("dx:event", handler as EventListener);
    return () => window.removeEventListener("dx:event", handler as EventListener);
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const sent = await chatApi.sendMessage(conversationId, trimmed);
      setMessages((prev) => {
        if (prev.some((x) => x._id === sent._id)) return prev;
        return [...prev, sent];
      });
      setText("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <img
          src={avatar(peer)}
          alt={peer.username}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-gray-900 text-sm">
            {peer.username}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {peer.role || "User"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50"
      >
        {loading ? (
          <div className="flex justify-center text-gray-400 text-sm py-10">
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-400 text-sm py-12">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <Send className="w-5 h-5 text-blue-500" />
            </div>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = String(m.senderId) === String(currentUserId);
            return (
              <div
                key={m._id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm shadow-sm ${
                    mine
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      mine ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {formatTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-gray-100 px-3 py-3 bg-white"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
