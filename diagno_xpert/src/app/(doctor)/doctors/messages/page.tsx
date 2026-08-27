import { Suspense } from "react";
import MessagesShell from "@/components/page/chat/MessagesShell";

export default function DoctorMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-gray-400 text-sm">
          Loading messages…
        </div>
      }
    >
      <MessagesShell basePath="/doctors/messages" />
    </Suspense>
  );
}
