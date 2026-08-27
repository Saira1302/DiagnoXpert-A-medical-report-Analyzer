import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/page/app-sidebar";
import NotificationBell from "@/components/page/chat/NotificationBell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="relative flex flex-col flex-1 w-full h-screen bg-[#0f1117]">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-white/80 dark:bg-[#0f1117]/80 border-gray-200/40 dark:border-gray-800/60 backdrop-blur-md sticky top-0 z-10">
          <SidebarTrigger className="text-gray-600 dark:text-gray-400 transition-colors" />
          <div className="flex-1" />
          <NotificationBell variant="dark" />
          <span className="text-xs font-medium tracking-widest uppercase text-gray-700 dark:text-gray-500 ml-2">
            DiagnoXpert
          </span>
        </header>

        {/* Page content */}
        <div className="flex-1 flex flex-col">{children}</div>
      </main>
    </SidebarProvider>
  );
}
