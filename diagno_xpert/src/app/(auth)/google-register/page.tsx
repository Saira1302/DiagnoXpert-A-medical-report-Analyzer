"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

export default function GoogleRegisterPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const role = params.get("role") || "patient";

  useEffect(() => {
    if (status !== "authenticated") return;

    const saveRole = async () => {
      try {
        await axios.post("/api/auth/google-role", { role });
        router.replace(role === "doctor" ? "/doctors" : "/home");
      } catch (err) {
        console.error(err);
        router.replace("/home");
      }
    };

    saveRole();
  }, [role, router, status]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Setting up your profile
          </h2>
          <p className="text-muted-foreground max-w-[300px]">
            Please wait while we configure your account settings based on your role.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
