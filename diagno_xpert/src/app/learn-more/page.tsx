"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  Stethoscope,
  Clock,
  FileScan,
  MessageSquare,
  UserCheck,
  Lock,
  Zap,
  HeartPulse,
  CheckCircle2,
} from "lucide-react";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Advanced AI Engine",
    description:
      "Our medical-trained models extract values, flag anomalies, and produce summaries you can actually understand.",
  },
  {
    icon: ShieldCheck,
    title: "HIPAA-grade Security",
    description:
      "End-to-end encryption with strict access controls. Your medical data never leaves your control.",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description:
      "Upload a report and get a clear, structured explanation in seconds — no jargon, no wait time.",
  },
  {
    icon: UserCheck,
    title: "Verified Doctors",
    description:
      "Connect with certified medical professionals for follow-ups, second opinions, and personalized care.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description:
      "Health questions don't wait. Get answers any time of day, any day of the week.",
  },
  {
    icon: HeartPulse,
    title: "Holistic Health View",
    description:
      "Track your reports over time and see trends so you can act early on what matters most.",
  },
];

const STEPS = [
  {
    icon: FileScan,
    title: "Upload Your Report",
    description:
      "Securely drop in any medical document — lab tests, prescriptions, scans, or PDFs. We support most common formats.",
  },
  {
    icon: BrainCircuit,
    title: "AI Reads It For You",
    description:
      "Our engine extracts every value, compares to medical reference ranges, and writes a plain-language summary.",
  },
  {
    icon: MessageSquare,
    title: "Ask Follow-up Questions",
    description:
      "Chat with the AI about anything in the report — what a value means, what to do next, or what to ask your doctor.",
  },
  {
    icon: Stethoscope,
    title: "Consult an Expert",
    description:
      "When you need a real specialist, book a consultation directly with a verified doctor on the platform.",
  },
];

const FAQS = [
  {
    q: "Is my data private?",
    a: "Yes. All uploads are encrypted in transit and at rest. We never share your medical data with third parties, and you can delete anything at any time.",
  },
  {
    q: "Does AI replace my doctor?",
    a: "No. DiagnoXpert is an educational and assistive tool that helps you understand your reports. For diagnosis or treatment, always consult a qualified medical professional — and we make that easy.",
  },
  {
    q: "What file formats are supported?",
    a: "We support PDFs and common image formats (PNG, JPG, JPEG, WebP). Scanned reports are processed with OCR before analysis.",
  },
  {
    q: "How accurate is the AI?",
    a: "Our system is continuously evaluated against expert-reviewed reports. We surface confidence scores and clearly mark anything uncertain so you always know what to trust.",
  },
];

export default function LearnMorePage() {
  return (
    <div className="relative min-h-screen w-full bg-blue-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-md h-112 rounded-full bg-blue-300/30 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-indigo-300/30 dark:bg-indigo-500/10 blur-3xl" />
      </div>

      {/* NAVBAR */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-7xl z-40 rounded-full border border-blue-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/80 backdrop-blur-md shadow-lg shadow-blue-500/10 px-6 py-3 flex justify-between items-center transition-all">
        <Link href="/" className="flex items-center gap-2">
          <img src="./logo.png" alt="Logo" className="h-10 w-auto object-contain" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-blue-400 hidden sm:block">
            DiagnoXpert
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="border-l border-gray-200 dark:border-gray-700 pl-6">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="relative pt-32 pb-16 px-4 md:px-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-500/20 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" strokeWidth={2.2} />
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-700 dark:text-blue-300">
              Learn More
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Healthcare,{" "}
            <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-blue-400 bg-clip-text text-transparent">
              made understandable
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            DiagnoXpert turns dense medical reports into clear, actionable insights — and connects you with the right experts when you need them.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/sign-up"
              className="group w-full sm:w-auto px-8 py-3.5 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 text-gray-700 dark:text-gray-200 font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="relative px-4 md:px-20 max-w-7xl mx-auto py-16">
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Capabilities
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white">What you get</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Built for clarity, privacy, and speed — without sacrificing medical depth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20 mb-4">
                <Icon className="w-6 h-6" strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - TIMELINE */}
      <section className="relative px-4 md:px-20 max-w-7xl mx-auto py-16">
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              The Process
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white">How DiagnoXpert works</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From upload to expert advice — in four simple steps.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-blue-500/40 via-indigo-500/40 to-transparent md:-translate-x-1/2" />

          <div className="space-y-10">
            {STEPS.map(({ icon: Icon, title, description }, idx) => (
              <div
                key={title}
                className={`relative flex gap-6 md:gap-0 md:items-center ${
                  idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Icon node */}
                <div className="relative z-10 flex items-center justify-center w-12 h-12 shrink-0 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 md:absolute md:left-1/2 md:-translate-x-1/2">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>

                {/* Content */}
                <div
                  className={`flex-1 md:max-w-[42%] bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-md ${
                    idx % 2 === 0 ? "md:mr-auto md:pr-8 md:text-right" : "md:ml-auto md:pl-8"
                  }`}
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                    Step {idx + 1}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY HIGHLIGHT */}
      <section className="relative px-4 md:px-20 max-w-7xl mx-auto py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-900/5">
          <div className="space-y-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-500/30">
              <Lock className="w-5 h-5" strokeWidth={2} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Your data, locked down by default
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We treat your health records the way we'd treat our own. Industry-grade encryption, strict access policies, and full export & deletion controls — always.
            </p>
            <ul className="space-y-2.5">
              {[
                "End-to-end encryption (in transit & at rest)",
                "No third-party data sharing, ever",
                "One-click delete for your reports & chats",
                "Granular role-based access controls",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" strokeWidth={2.4} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-tr from-blue-200/50 to-purple-200/50 dark:from-blue-900/20 dark:to-purple-900/20 blur-3xl rounded-full opacity-70" />
            <div className="relative grid grid-cols-2 gap-4">
              {[
                { icon: ShieldCheck, label: "HIPAA-aligned", color: "from-blue-500 to-indigo-500" },
                { icon: Lock, label: "AES-256", color: "from-emerald-500 to-green-500" },
                { icon: UserCheck, label: "Verified Pros", color: "from-purple-500 to-fuchsia-500" },
                { icon: Zap, label: "Instant Delete", color: "from-orange-500 to-pink-500" },
              ].map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-start gap-3"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br ${color} text-white`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative px-4 md:px-20 max-w-4xl mx-auto py-16">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              FAQ
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white">Frequently asked questions</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              <summary className="cursor-pointer list-none px-6 py-5 flex items-center justify-between gap-4 font-semibold text-gray-900 dark:text-white hover:bg-blue-50/40 dark:hover:bg-gray-700/40 transition-colors">
                <span>{q}</span>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-transform group-open:rotate-45">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-5 -mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-5xl mx-auto px-4 mb-20 mt-10">
        <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center shadow-2xl shadow-blue-500/30 text-white bg-linear-to-br from-blue-600 via-indigo-600 to-blue-500">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm mb-6">
              <Sparkles className="w-3 h-3" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Get Started</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to understand your health?</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto text-lg">
              Sign up free and get your first AI-powered report explained in under a minute.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all transform hover:-translate-y-1 inline-flex items-center gap-2"
              >
                Get Started Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="text-white/90 hover:text-white font-medium underline-offset-4 hover:underline transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
