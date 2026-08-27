"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageSquare, Search } from "lucide-react";
import chatApi from "@/ApiServices/chatApi";
import ChatWindow from "./ChatWindow";

type Peer = {
  _id: string;
  username: string;
  email?: string;
  role?: string;
  profilePicture?: { Url?: string; url?: string } | string;
};

type Conversation = {
  _id: string;
  peer: Peer;
  lastMessage: string;
  lastMessageAt: string | null;
  unread: number;
};

const DEFAULT_AVATAR = "/default-avatar.svg";

function avatar(p: Peer): string {
  const pic = p.profilePicture as any;
  if (!pic) return DEFAULT_AVATAR;
  if (typeof pic === "string") return pic || DEFAULT_AVATAR;
  return pic.Url || pic.url || DEFAULT_AVATAR;
}

function formatTime(d: string | null) {
  if (!d) return "";
  try {
    const date = new Date(d);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

type Props = {
  basePath: string; // "/messages" or "/doctors/messages"
};

export default function MessagesShell({ basePath }: Props) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeId = searchParams.get("c") || "";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await chatApi.listConversations();
      setConversations(data || []);
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (activeId) refresh();
  }, [activeId, refresh]);

  // Listen for incoming realtime events to refresh sidebar.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      if (detail.type === "message") {
        refresh();
      } else if (detail.type === "read") {
        refresh();
      }
    };
    window.addEventListener("dx:event", handler as EventListener);
    return () => window.removeEventListener("dx:event", handler as EventListener);
  }, [refresh]);

  const active = conversations.find((c) => c._id === activeId) || null;

  const filtered = conversations.filter((c) =>
    c.peer.username.toLowerCase().includes(search.toLowerCase()),
  );

  const select = (id: string) => {
    router.push(`${basePath}?c=${id}`);
  };

  const back = () => {
    router.push(basePath);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white text-gray-900">
      {/* Sidebar */}
      <aside
        className={`w-full lg:w-80 border-r border-gray-100 flex flex-col ${
          active ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" /> Messages
          </h1>
          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-400 text-sm py-8">
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-12 px-6">
              No conversations yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((c) => {
                const isActive = c._id === activeId;
                return (
                  <li key={c._id}>
                    <button
                      onClick={() => select(c._id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        isActive ? "bg-blue-50" : ""
                      }`}
                    >
                      <img
                        src={avatar(c.peer)}
                        alt={c.peer.username}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm truncate text-gray-900">
                            {c.peer.username}
                          </p>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {formatTime(c.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p
                            className={`text-xs truncate ${
                              c.unread > 0
                                ? "text-gray-900 font-medium"
                                : "text-gray-500"
                            }`}
                          >
                            {c.lastMessage || "No messages yet"}
                          </p>
                          {c.unread > 0 && (
                            <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5">
                              {c.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Chat panel */}
      <section
        className={`flex-1 ${active ? "flex" : "hidden lg:flex"} flex-col`}
      >
        {active && session?.user?._id ? (
          <ChatWindow
            key={active._id}
            conversationId={active._id}
            peer={active.peer}
            currentUserId={session.user._id as string}
            onBack={back}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <MessageSquare className="w-7 h-7 text-blue-500" />
            </div>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </section>
    </div>
  );
}
