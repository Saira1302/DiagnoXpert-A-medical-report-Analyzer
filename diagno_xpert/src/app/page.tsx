'use client'
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Activity } from "@/components/icons/Activity";
import { IoCloudUploadOutline } from "react-icons/io5";
import { HomeCard } from "@/components/Uimy";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  BrainCircuit,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const { data: session } = useSession();

  const [loginCheck, setLoginCheck] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  const handelLoginType = (LoginType: string) => {
    localStorage.setItem("LoginType", LoginType);
    setShowRoleDialog(false);
    window.location.href = "/sign-up";
    window.dispatchEvent(new Event("LoginTypeChanged"));
  };

  useEffect(() => {
    if (session) {
      setLoginCheck(true);
    } else {
      setLoginCheck(false);
    }
  }, [session]);

  return (
    <div className="relative min-h-screen w-full bg-blue-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-lg h-128 rounded-full bg-blue-300/30 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/4 -right-32 w-lg h-128 rounded-full bg-indigo-300/30 dark:bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-[24rem] h-128 rounded-full bg-purple-200/20 dark:bg-purple-500/10 blur-3xl" />
      </div>

      {/* NAVBAR */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-7xl z-40 rounded-full border border-blue-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/80 backdrop-blur-md shadow-lg shadow-blue-500/10 px-6 py-3 flex justify-between items-center transition-all">
        <div className="flex items-center gap-2">
          <img src="./logo.png" alt="Logo" className="h-10 w-auto object-contain" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-blue-400 hidden sm:block">
            DiagnoXpert
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
          <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How it works</a>
          <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
          <Link href="/learn-more" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Learn More</Link>
        </div>

        <div className="flex items-center space-x-6">
          {loginCheck ? (
            <Link href="/home" className="group relative px-6 py-2 rounded-full bg-linear-to-r from-blue-500 to-indigo-500 text-white font-medium shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              My Account
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="px-6 py-2 rounded-full border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                Join Us
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-xl border-blue-100 bg-white/90 backdrop-blur-sm p-2 shadow-xl dark:bg-gray-900/80 ml-10">
                <DropdownMenuItem onClick={() => handelLoginType("patient")} className="rounded-lg cursor-pointer focus:bg-blue-50 dark:focus:bg-gray-800 font-medium">As Patient</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handelLoginType("doctor")} className="rounded-lg cursor-pointer focus:bg-blue-50 dark:focus:bg-gray-800 font-medium">As Doctor</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <div className="border-l border-gray-200 dark:border-gray-700 pl-6">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="relative pt-32 pb-20 px-4 md:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-500/20 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" strokeWidth={2.2} />
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-700 dark:text-blue-300">
                The Future of Healthcare
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
              AI-Powered <br className="hidden lg:block" />
              <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-blue-400 bg-clip-text text-transparent">
                Medical Insights
              </span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Experience the next generation of expert consultation. Upload reports, get instant AI analysis, and connect with top-tier doctors in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={() => setShowRoleDialog(true)}
                className="group w-full sm:w-auto px-8 py-3.5 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Activity className="w-5 h-5" />
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <Link
                href="/learn-more"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 text-gray-700 dark:text-gray-200 font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                Learn More
              </Link>
            </div>

            {/* Stats row */}
            <div className="pt-8 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {[
                { value: "10K+", label: "Reports Analyzed" },
                { value: "500+", label: "Verified Doctors" },
                { value: "98%", label: "Accuracy Rate" },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
            <div className="absolute top-0 right-0 -z-10 w-full h-full bg-linear-to-tr from-blue-200/50 to-purple-200/50 dark:from-blue-900/20 dark:to-purple-900/20 blur-3xl rounded-full opacity-70" />
            <img
              src="/home-hero.png"
              alt="Home Illustration"
              className="w-full h-auto object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
            />

            {/* Floating cards */}
            <div className="hidden md:flex absolute top-10 -left-4 items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/70 dark:border-gray-700/60 shadow-xl shadow-blue-500/10 animate-pulse">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-green-500 to-emerald-500 text-white">
                <ShieldCheck className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900 dark:text-white">HIPAA Secure</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Your data is private</div>
              </div>
            </div>

            <div className="hidden md:flex absolute bottom-10 -right-4 items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/70 dark:border-gray-700/60 shadow-xl shadow-blue-500/10">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-indigo-500 text-white">
                <BrainCircuit className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900 dark:text-white">AI Analysis</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Instant insights</div>
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div id="how-it-works" className="mt-32 mb-10 relative">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold dark:text-white">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Simplify your healthcare journey in three easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            <HomeCard
              className="relative bg-white dark:bg-gray-800 shadow-xl shadow-blue-900/5 hover:shadow-blue-500/20 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 transition-all hover:-translate-y-2 h-full flex flex-col items-center text-center"
              title={<span className="text-xl font-bold mt-4 block">1. Upload Reports</span>}
              description={<span className="text-gray-500 mt-2 block text-sm">Upload your medical documents securely to our encrypted platform.</span>}
              icon={IoCloudUploadOutline}
            />

            <HomeCard
              className="relative bg-white dark:bg-gray-800 shadow-xl shadow-blue-900/5 hover:shadow-blue-500/20 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 transition-all hover:-translate-y-2 h-full flex flex-col items-center text-center"
              title={<span className="text-xl font-bold mt-4 block">2. AI Analysis</span>}
              description={<span className="text-gray-500 mt-2 block text-sm">Get instant, AI-driven insights and summary of your health status.</span>}
              imageUrl="/rebort-img.png"
            />

            <HomeCard
              className="relative bg-white dark:bg-gray-800 shadow-xl shadow-blue-900/5 hover:shadow-blue-500/20 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 transition-all hover:-translate-y-2 h-full flex flex-col items-center text-center"
              title={<span className="text-xl font-bold mt-4 block">3. Consult Experts</span>}
              description={<span className="text-gray-500 mt-2 block text-sm">Discuss results with certified doctors for professional advice.</span>}
              imageUrl="/chat.png"
            />
          </div>
        </div>

        {/* WHY CHOOSE US */}
        <div id="features" className="mt-24 mb-10">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">Why Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold dark:text-white">Why Choose Us</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We provide a comprehensive ecosystem for your health needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <HomeCard
              className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-2xl p-6 transition-all hover:-translate-y-1 border border-transparent hover:border-blue-500/30"
              title={<span className="font-semibold block mt-4">Deep AI Insights</span>}
              imageUrl="/ai-insights.webp"
            />
            <HomeCard
              className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-2xl p-6 transition-all hover:-translate-y-1 border border-transparent hover:border-blue-500/30"
              title={<span className="font-semibold block mt-4">Secure & Private</span>}
              imageUrl="/secure-private.png"
            />
            <HomeCard
              className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-2xl p-6 transition-all hover:-translate-y-1 border border-transparent hover:border-blue-500/30"
              title={<span className="font-semibold block mt-4">Expert Medics</span>}
              imageUrl="/expert-doctor-pannel.png"
            />
            <HomeCard
              className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-2xl p-6 transition-all hover:-translate-y-1 border border-transparent hover:border-blue-500/30"
              title={<span className="font-semibold block mt-4">Accessible 24/7</span>}
              imageUrl="/accessible.avif"
            />
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="mt-24">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold dark:text-white">What Our Users Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Sarah J.",
                quote:
                  "The AI analysis was incredibly accurate and helped me understand my report before even seeing the doctor!",
              },
              {
                name: "Dr. Ahmed K.",
                quote:
                  "DiagnoXpert streamlines my workflow and gives my patients clarity before our consultations begin.",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-start gap-6 transition-transform hover:scale-[1.01]"
              >
                <img
                  src="/images.jpeg"
                  alt="User"
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-50 dark:ring-gray-700 shrink-0"
                />
                <div>
                  <div className="flex text-yellow-400 mb-2 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic">&ldquo;{t.quote}&rdquo;</p>
                  <p className="font-bold mt-3 text-blue-500">— {t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA + FOOTER */}
      <div className="relative">
        <div className="max-w-5xl mx-auto px-4 relative z-10 mb-10">
          <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center shadow-2xl shadow-blue-500/30 text-white bg-linear-to-br from-blue-600 via-indigo-600 to-blue-500">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm mb-6">
                <Sparkles className="w-3 h-3" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Get Started</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Take Control?</h2>
              <p className="text-blue-100 mb-8 max-w-xl mx-auto text-lg">
                Join thousands of users who are making smarter health decisions today.
              </p>
              <button
                onClick={() => setShowRoleDialog(true)}
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all transform hover:-translate-y-1 inline-flex items-center gap-2"
              >
                Get Started Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 pt-16 pb-10 px-4 md:px-20 text-gray-400 text-sm rounded-tr-[100px] rounded-tl-[100px]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-gray-800 pb-12">
            <div className="col-span-1 md:col-span-1">
              <span className="text-2xl font-bold text-white block mb-4">DiagnoXpert</span>
              <p>Empowering health through advanced AI technology.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li className="hover:text-blue-400 cursor-pointer">About Us</li>
                <li className="hover:text-blue-400 cursor-pointer">Features</li>
                <li className="hover:text-blue-400 cursor-pointer">Pricing</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li className="hover:text-blue-400 cursor-pointer">Help Center</li>
                <li className="hover:text-blue-400 cursor-pointer">Contact</li>
                <li className="hover:text-blue-400 cursor-pointer">Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <p>© 2026 DiagnoXpert. All rights reserved.</p>
            </div>
          </div>
          <div className="text-center">
            <p>Made with ❤️ for better health.</p>
          </div>
        </div>
      </div>

      {/* Role Selection Dialog */}
      {showRoleDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowRoleDialog(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30">
              <Stethoscope className="w-7 h-7" strokeWidth={1.8} />
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
              Join As
            </h3>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
              Select your role to get started
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handelLoginType("patient")}
                className="w-full py-3 px-6 rounded-xl border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition-all text-lg"
              >
                As Patient
              </button>
              <button
                onClick={() => handelLoginType("doctor")}
                className="w-full py-3 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all text-lg"
              >
                As Doctor
              </button>
            </div>
            <button
              onClick={() => setShowRoleDialog(false)}
              className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
