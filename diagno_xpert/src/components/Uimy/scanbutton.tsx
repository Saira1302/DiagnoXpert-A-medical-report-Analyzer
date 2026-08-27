// Drop-in replacement for the Scan button — responsive across all breakpoints
// On mobile: icon-only circle; sm+: icon + label; fully accessible with aria-label

import { Send, Loader2 } from "lucide-react";

interface ScanButtonProps {
  loading: boolean;
  onClick: () => void;
  label?: string;
}

export function ScanButton({ loading, onClick, label = "Scan" }: ScanButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      aria-label="Scan file"
      className={[
        // base
        "shrink-0 flex items-center justify-center gap-2",
        "font-semibold text-white rounded-xl transition-all duration-200",
        "shadow-md active:scale-95",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        // sizing — icon-only on xs, full label from sm up
        "w-10 h-10 p-0",                          // mobile: square icon button
        "sm:w-auto sm:h-auto sm:px-5 sm:py-2.5",  // sm+: pill with label
        // colors
        "bg-blue-600 hover:bg-blue-500",
        "hover:shadow-blue-500/30",
      ].join(" ")}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span className="hidden sm:inline text-sm">Scanning…</span>
        </>
      ) : (
        <>
          <Send className="w-4 h-4 shrink-0" strokeWidth={2} />
          <span className="hidden sm:inline text-sm">{label}</span>
        </>
      )}
    </button>
  );
}