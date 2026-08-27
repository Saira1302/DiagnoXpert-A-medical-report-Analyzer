"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import notificationApi from "@/ApiServices/notificationApi";

type Notification = {
  _id: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
  meta?: Record<string, unknown>;
};

function formatTime(d: string) {
  try {
    const diffMs = Date.now() - new Date(d).getTime();
    const mins = Math.round(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.round(hrs / 24);
    return `${days}d ago`;
  } catch {
    return "";
  }
}

export default function NotificationBell({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = async () => {
    try {
      const data = await notificationApi.list();
      setItems(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (!session?.user?._id) return;
    refresh();
  }, [session?.user?._id]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      if (detail.type === "notification" && detail.notification) {
        setItems((prev) => [detail.notification, ...prev].slice(0, 50));
        setUnread((u) => u + 1);
        try {
          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
              new Notification(detail.notification.title, {
                body: detail.notification.body,
                icon: "/logo.png",
              });
            }
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("dx:event", handler as EventListener);
    return () =>
      window.removeEventListener("dx:event", handler as EventListener);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const openItem = async (n: Notification) => {
    setOpen(false);
    if (!n.read) {
      setItems((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)),
      );
      setUnread((u) => Math.max(0, u - 1));
      notificationApi.markRead(n._id).catch(() => {});
    }
    if (n.link) router.push(n.link);
  };

  const markAll = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
    try {
      await notificationApi.markAllRead();
    } catch {
      // silent
    }
  };

  const isDark = variant === "dark";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative p-2 rounded-full transition-colors ${
          isDark
            ? "hover:bg-gray-800/60 text-gray-300"
            : "hover:bg-gray-100 text-gray-600"
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-sm text-gray-900">
              Notifications
            </span>
            {items.some((i) => !i.read) && (
              <button
                onClick={markAll}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-10">
                No notifications yet
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {items.map((n) => (
                  <li key={n._id}>
                    <button
                      onClick={() => openItem(n)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 ${
                        !n.read ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <span
                        className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                          n.read ? "bg-transparent" : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatTime(n.createdAt)}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
