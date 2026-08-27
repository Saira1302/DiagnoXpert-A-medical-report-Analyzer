"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import type { AppDispatch, RootState } from "@/redux/Store";
import { useSelector, useDispatch } from "react-redux";
import { FileScan } from "@/features/home/HomeSlice";
import {
  addLocalMessage,
  createChat,
  persistMessages,
} from "@/features/home/ChatHistorySlice";
import OCRReport from "@/components/page/home/ocrResult";
import {
  Paperclip,
  Stethoscope,
  X,
  FileText,
  FlaskConical,
  Pill,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import { ScanButton } from "@/components/Uimy/scanbutton";
import type { ChatHistoryMessage } from "@/ApiServices/chatHistoryApi";

const QUICK_ACTIONS = [
  {
    icon: FlaskConical,
    title: "Lab Report",
    hint: "Explain my lab report",
  },
  {
    icon: Pill,
    title: "Prescription",
    hint: "Decode this prescription",
  },
  {
    icon: HeartPulse,
    title: "Cholesterol",
    hint: "What does high cholesterol mean?",
  },
  {
    icon: FileText,
    title: "Blood Test",
    hint: "Explain my blood test results",
  },
];

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".gif", ".webp"];

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.home);
  const { messages, currentChatId, loadingChat } = useSelector(
    (state: RootState) => state.chatHistory,
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [message, setMessage] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [message]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, scanning, chatLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
    e.target.value = "";
  };

  const ensureChatId = async (): Promise<string | null> => {
    if (currentChatId) return currentChatId;
    try {
      const chat = await dispatch(createChat(undefined)).unwrap();
      return chat._id;
    } catch {
      toast.error("Could not start a new chat.");
      return null;
    }
  };

  const handleSend = async () => {
    const hasFile = !!selectedFile;
    const hasText = message.trim().length > 0;

    if (!hasFile && !hasText) {
      toast.error("Type a message or attach a file.");
      return;
    }

    const chatId = await ensureChatId();
    if (!chatId) return;

    if (hasFile) {
      const userQuestion = hasText
        ? message.trim()
        : "Explain this medical report in easy language for a non-medical person.";

      const userMsg: ChatHistoryMessage = {
        _id: crypto.randomUUID(),
        type: "scan",
        role: "user",
        fileName: selectedFile.name,
        userQuestion: hasText ? userQuestion : undefined,
      };
      dispatch(addLocalMessage(userMsg));

      const fileToScan = selectedFile;
      setSelectedFile(null);
      setMessage("");

      setScanning(true);
      try {
        const ext = "." + fileToScan.name.split(".").pop()?.toLowerCase();
        const isImage = IMAGE_EXTENSIONS.includes(ext);
        const formData = new FormData();
        formData.append("userQuestion", userQuestion);

        if (isImage) {
          const Tesseract = await import("tesseract.js");
          const worker = await Tesseract.createWorker("eng");
          const { data } = await worker.recognize(fileToScan);
          await worker.terminate();

          const confidence = (data as unknown as { confidence: number }).confidence ?? 0;
          formData.append("ocrText", data.text);
          formData.append("ocrConfidence", JSON.stringify({
            average: Math.round(confidence * 100) / 100,
            min: 0, max: 0, total_words: 0, low_confidence_words: 0,
            confidence_distribution: { "high (80-100)": 0, "medium (60-79)": 0, "low (0-59)": 0 },
          }));
        } else {
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

          const arrayBuffer = await fileToScan.arrayBuffer();
          const pdfDoc = await pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
            useWorkerFetch: false,
            isEvalSupported: false,
            useSystemFonts: true,
            disableAutoFetch: true,
            disableStream: true,
          }).promise;

          const allLines: string[] = [];
          for (let p = 1; p <= pdfDoc.numPages; p++) {
            const page = await pdfDoc.getPage(p);
            const content = await page.getTextContent();

            const rowMap = new Map<number, Array<{ x: number; text: string }>>();
            for (const item of content.items) {
              if (!("str" in item) || !(item as { str: string }).str.trim()) continue;
              const t = (item as { transform: number[] }).transform;
              const x = Math.round(t[4]);
              const yKey = Math.round(t[5] / 3) * 3;
              if (!rowMap.has(yKey)) rowMap.set(yKey, []);
              rowMap.get(yKey)!.push({ x, text: (item as { str: string }).str });
            }

            const sortedY = Array.from(rowMap.keys()).sort((a, b) => b - a);
            for (const yKey of sortedY) {
              const cells = rowMap.get(yKey)!.sort((a, b) => a.x - b.x);
              allLines.push(cells.map((c) => c.text).join("  "));
            }
          }

          formData.append("ocrText", allLines.join("\n"));
          formData.append("sourceType", "pdf");
        }

        const result = await dispatch(FileScan(formData)).unwrap();

        const assistantMsg: ChatHistoryMessage = {
          _id: crypto.randomUUID(),
          type: "scan",
          role: "assistant",
          result,
        };
        dispatch(addLocalMessage(assistantMsg));

        dispatch(
          persistMessages({
            id: chatId,
            messages: [
              {
                role: userMsg.role,
                type: userMsg.type,
                fileName: userMsg.fileName,
                userQuestion: userMsg.userQuestion,
              },
              {
                role: assistantMsg.role,
                type: assistantMsg.type,
                result: assistantMsg.result,
              },
            ],
          }),
        );
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast.error(error?.message || "Scan failed. Please try again.");
      } finally {
        setScanning(false);
      }
    } else {
      const userContent = message.trim();
      const userMsg: ChatHistoryMessage = {
        _id: crypto.randomUUID(),
        type: "text",
        role: "user",
        content: userContent,
      };
      dispatch(addLocalMessage(userMsg));
      setMessage("");

      setChatLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userContent }),
        });
        const data = await res.json();

        const assistantMsg: ChatHistoryMessage = {
          _id: crypto.randomUUID(),
          type: "text",
          role: "assistant",
          content: data.reply || "Sorry, I couldn't process that. Please try again.",
        };
        dispatch(addLocalMessage(assistantMsg));

        dispatch(
          persistMessages({
            id: chatId,
            messages: [
              {
                role: userMsg.role,
                type: userMsg.type,
                content: userMsg.content,
              },
              {
                role: assistantMsg.role,
                type: assistantMsg.type,
                content: assistantMsg.content,
              },
            ],
          }),
        );
      } catch {
        toast.error("Failed to send message.");
      } finally {
        setChatLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isLoading = scanning || loading || chatLoading;
  const hasMessages = messages.length > 0;

  return (
    <div className="relative flex flex-col w-full h-full bg-white dark:bg-[#0f1117] overflow-hidden">

      {/* ── Ambient background glow ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-md h-112 rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-indigo-300/20 dark:bg-indigo-500/10 blur-3xl" />
      </div>

      {/* ── Messages / Welcome area ── */}
      <div className="relative flex-1 overflow-y-auto pb-36">
        {loadingChat ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="flex gap-1 items-center">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        ) : !hasMessages ? (
          /* Welcome state */
          <div className="flex flex-col items-center justify-center h-full gap-6 px-4 max-w-3xl mx-auto">
            {/* Hero icon with halo */}
            <div className="relative">
              <div className="absolute inset-0 -m-2 rounded-3xl bg-linear-to-br from-blue-500/30 to-indigo-500/30 blur-xl" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20">
                <Stethoscope className="w-10 h-10 text-white" strokeWidth={1.8} />
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 mb-3">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 tracking-wide uppercase">
                  AI-powered medical analysis
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome to{" "}
                <span className="bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  DiagnoXpert
                </span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                Ask a medical question or upload a report for an instant, easy-to-understand explanation.
              </p>
            </div>

            {/* Quick action cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mt-2">
              {QUICK_ACTIONS.map(({ icon: Icon, title, hint }) => (
                <button
                  key={title}
                  onClick={() => setMessage(hint)}
                  className="group relative flex flex-col items-start gap-2 p-3.5 rounded-xl bg-white/70 dark:bg-[#1a1d27]/70 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/60 hover:border-blue-400/60 dark:hover:border-blue-500/50 hover:shadow-md hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-200 text-left"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                    {title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat messages */
          <div className="px-4 py-6 md:ml-30 space-y-4 mr-10">
            {messages.map((msg, idx) => {
              const key = msg._id || `${idx}-${msg.role}-${msg.type}`;

              if (msg.type === "text") {
                return (
                  <div key={key} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-md whitespace-pre-wrap leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "bg-linear-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-blue-500/20"
                          : "bg-white dark:bg-[#1a1d27] text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200/70 dark:border-gray-700/60"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              }

              if (msg.type === "scan" && msg.role === "user") {
                return (
                  <div key={key} className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2.5 bg-linear-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-md max-w-[80%] shadow-sm shadow-blue-500/20">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 shrink-0">
                        <Paperclip className="w-3.5 h-3.5" strokeWidth={2} />
                      </div>
                      <span className="truncate">{msg.fileName}</span>
                    </div>
                    {msg.userQuestion && (
                      <div className="bg-linear-to-br from-blue-500/90 to-indigo-500/90 text-white rounded-2xl rounded-br-sm px-4 py-2 text-sm max-w-[80%]">
                        {msg.userQuestion}
                      </div>
                    )}
                  </div>
                );
              }

              if (msg.type === "scan" && msg.role === "assistant" && msg.result) {
                return (
                  <div key={key} className="w-full">
                    <OCRReport result={msg.result} />
                  </div>
                );
              }

              return null;
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#1a1d27] border border-gray-200/70 dark:border-gray-700/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-2 h-2 bg-blue-500/70 dark:bg-blue-400/70 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input bar (fixed bottom) ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-3 sm:px-4 pb-5 md:ml-40 z-10">
        {/* Gradient glow ring */}
        <div className="relative">
          <div className="absolute -inset-px rounded-2xl bg-linear-to-r from-blue-500/30 via-indigo-500/30 to-blue-500/30 opacity-60 blur-md pointer-events-none" />

          <div className="relative bg-white/95 dark:bg-[#1a1d27]/95 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md">

            {/* Attached file pill */}
            {selectedFile && (
              <div className="flex items-center gap-2 px-3 pt-3 pb-1">
                <div className="flex items-center gap-2 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-800/50 rounded-xl px-3 py-1.5 max-w-full">
                  <div className="flex items-center justify-center w-5 h-5 rounded-md bg-blue-500/10 dark:bg-blue-400/10">
                    <Paperclip className="w-3 h-3 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                  </div>
                  <span className="text-sm text-blue-700 dark:text-blue-300 truncate max-w-[220px] sm:max-w-[340px]">
                    {selectedFile.name}
                  </span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="ml-1 flex items-center justify-center w-5 h-5 rounded-md text-blue-500 hover:text-white hover:bg-blue-500 dark:hover:bg-blue-500 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2 p-2">
              {/* Paperclip / attach button */}
              <label
                htmlFor="file-upload"
                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                aria-label="Attach file"
              >
                <Paperclip className="w-5 h-5" strokeWidth={1.8} />
              </label>

              <input
                ref={fileInputRef}
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
              />

              {/* Text input */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedFile
                    ? "Ask a question about this file… (optional)"
                    : "Ask about a medical report…"
                }
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none py-2.5 max-h-32 overflow-y-auto leading-relaxed"
              />

              <ScanButton
                loading={isLoading}
                onClick={handleSend}
                label={selectedFile ? "Scan" : "Send"}
              />
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2.5">
          Attach a medical file or type your question{" "}
          <span className="mx-1 text-gray-300 dark:text-gray-700">·</span>
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-mono text-gray-500 dark:text-gray-400">Enter</kbd>{" "}
          to send
        </p>
      </div>
    </div>
  );
};


export default Home;
