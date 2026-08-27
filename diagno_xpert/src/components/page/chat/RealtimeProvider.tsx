"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function RealtimeProvider() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?._id) return;

    let es: EventSource | null = null;
    let closed = false;
    let retryDelay = 2000;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (closed) return;
      try {
        es = new EventSource("/api/events");
      } catch {
        return;
      }

      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          window.dispatchEvent(new CustomEvent("dx:event", { detail: data }));
        } catch {
          // ignore
        }
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (closed) return;
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30000);
      };

      es.onopen = () => {
        retryDelay = 2000;
      };
    };

    connect();

    return () => {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      es?.close();
    };
  }, [session?.user?._id, status]);

  return null;
}
