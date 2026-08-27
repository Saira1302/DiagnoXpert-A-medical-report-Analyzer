"use client";
import { useState, useEffect } from "react";
import {
  ChevronUp,
  Stethoscope,
  MessageSquareText,
  Clock3,
  LayoutDashboard,
  Plus,
  Trash2,
  Loader2,
  Download,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { RiLogoutCircleLine } from "react-icons/ri";
import { MdSupervisorAccount } from "react-icons/md";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import HomeApi from "@/ApiServices/HomeApi";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/Store";
import {
  fetchChats,
  fetchChatById,
  startNewChat,
  deleteChat,
} from "@/features/home/ChatHistorySlice";
import ChatHistoryApi from "@/ApiServices/chatHistoryApi";
import { downloadChatAsPdf } from "@/helper/chatExport";
import { toast } from "react-hot-toast";

const navItems = [
  { label: "Dashboard", href: "/home", icon: LayoutDashboard },
  { label: "Doctors", href: "/doctors", icon: Stethoscope },
  { label: "Messages", href: "/messages", icon: MessageSquareText },
];

export function AppSidebar() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { chats, currentChatId, loadingList } = useSelector(
    (state: RootState) => state.chatHistory,
  );

  const initials = session?.user?.username
    ? session.user.username.slice(0, 2).toUpperCase()
    : "U";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const id = session?.user?._id;
    if (!id) return;

    const fetchUserData = async () => {
      try {
        const data = await HomeApi.getUserProfileById(id);
        setUserData(data.user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [session?.user?._id]);

  useEffect(() => {
    if (session?.user?._id) {
      dispatch(fetchChats());
    }
  }, [session?.user?._id, dispatch]);

  const handleNewChat = () => {
    dispatch(startNewChat());
    if (pathname !== "/home") router.push("/home");
  };

  const handleSelectChat = (id: string) => {
    if (id === currentChatId) return;
    dispatch(fetchChatById(id));
    if (pathname !== "/home") router.push("/home");
  };

  const handleDeleteChat = async (
    e: React.MouseEvent,
    id: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await dispatch(deleteChat(id)).unwrap();
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  const handleDownloadChat = async (
    e: React.MouseEvent,
    id: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const loadingToast = toast.loading("Preparing chat…");
    try {
      const chat = await ChatHistoryApi.getChat(id);
      toast.dismiss(loadingToast);
      downloadChatAsPdf(chat);
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      const e = err as { message?: string };
      toast.error(e?.message || "Failed to download chat");
    }
  };

  return (
    <Sidebar className="border-r border-gray-800/60 bg-[#0b0d14]">
      {/* ── Brand ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/30">
          <Stethoscope className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold dark:text-white tracking-wide">
            DiagnoXpert
          </span>
          <span className="text-[10px] text-gray-500 tracking-widest uppercase">
            Medical AI
          </span>
        </div>
      </div>

      <SidebarContent className="flex flex-col overflow-hidden px-2 py-3">
        {/* ── New Chat ── */}
        <div className="px-1 mb-2 shrink-0">
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow shadow-blue-600/20"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* ── Navigation ── */}
        <SidebarGroup className="shrink-0">
          <SidebarGroupLabel className="px-2 text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ label, href, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150
                          ${
                            active
                              ? "bg-blue-600/15 text-blue-400 border border-blue-600/30"
                              : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-100"
                          }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3 bg-gray-800/60 shrink-0" />

        {/* ── Chat History ── */}
        <SidebarGroup className="flex flex-col flex-1 min-h-0">
          <SidebarGroupLabel className="px-2 text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1 flex items-center gap-2 shrink-0">
            <Clock3 className="h-3 w-3" /> Recent Chats
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 overflow-y-auto overflow-x-hidden">
            {loadingList && chats.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-3 rounded-lg border border-dashed border-gray-800 mt-2 gap-2">
                <MessageSquareText className="h-7 w-7 text-gray-700" />
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  No conversations yet.
                  <br />
                  Start a new chat to begin.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-0.5 mt-1">
                {chats.map((chat) => {
                  const active = chat._id === currentChatId;
                  return (
                    <li key={chat._id}>
                      <button
                        onClick={() => handleSelectChat(chat._id)}
                        className={`group flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left text-sm transition-colors
                          ${
                            active
                              ? "bg-blue-600/15 text-blue-300 border border-blue-600/30"
                              : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-100"
                          }`}
                      >
                        <MessageSquareText className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span className="flex-1 truncate text-xs">
                          {chat.title || "New Chat"}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleDownloadChat(e, chat._id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleDownloadChat(
                                e as unknown as React.MouseEvent,
                                chat._id,
                              );
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-blue-400 p-1 rounded cursor-pointer"
                          aria-label="Download chat"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleDeleteChat(e, chat._id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleDeleteChat(
                                e as unknown as React.MouseEvent,
                                chat._id,
                              );
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400 p-1 rounded cursor-pointer"
                          aria-label="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="border-t border-gray-800/60 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            {mounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-800/60 transition-colors w-full">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-[11px] font-bold text-white shadow">
                      {initials}
                    </div>
                    <div className="flex flex-col leading-none text-left overflow-hidden">
                      <span className="text-sm font-medium dark:text-gray-200 truncate">
                        {session?.user?.username ?? "User"}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate">
                        {userData?.email ?? ""}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto h-3.5 w-3.5 text-gray-600 shrink-0" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width] bg-[#13151f] border border-gray-800 text-gray-300"
                >
                  <DropdownMenuItem className="focus:bg-gray-800/60 focus:text-white cursor-pointer">
                    {userData?.role === "patient" && (
                      <Link
                        href={`/profile/${session?.user?._id}`}
                        className="flex items-center gap-2 w-full"
                      >
                        <MdSupervisorAccount className="h-4 w-4" /> Profile
                      </Link>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                    onClick={() => signOut()}
                  >
                    <RiLogoutCircleLine className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton className="flex items-center gap-3 rounded-lg px-3 py-2 w-full">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-[11px] font-bold text-white shadow">
                  U
                </div>
                <div className="flex flex-col leading-none text-left overflow-hidden">
                  <span className="text-sm font-medium dark:text-gray-200 truncate">
                    User
                  </span>
                  <span className="text-[10px] text-gray-500 truncate">
                    &nbsp;
                  </span>
                </div>
                <ChevronUp className="ml-auto h-3.5 w-3.5 text-gray-600 shrink-0" />
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
