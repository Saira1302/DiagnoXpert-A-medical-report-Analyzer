import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/page/app-sidebar";
import NotificationBell from "@/components/page/chat/NotificationBell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="relative flex flex-col flex-1 w-full h-screen bg-white">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-white border-gray-200/40 sticky top-0 z-10">
          <SidebarTrigger className="text-gray-600 transition-colors" />
          <div className="flex-1" />
          <NotificationBell variant="light" />
          <span className="text-xs font-medium tracking-widest uppercase text-gray-700 ml-2">
            DiagnoXpert
          </span>
        </header>
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      </main>
    </SidebarProvider>
  );
}
