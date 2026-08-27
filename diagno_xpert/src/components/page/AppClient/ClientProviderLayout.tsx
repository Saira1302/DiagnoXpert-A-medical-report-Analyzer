"use client";
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "@/redux/Store";
import SessionProviderWrapper from "@/context/SessionProviderWrapper";
import RealtimeProvider from "@/components/page/chat/RealtimeProvider";

export default function ClientProviders({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider store={store}>
      <SessionProviderWrapper>
        <Toaster position="top-right" reverseOrder={false} />
        <RealtimeProvider />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </SessionProviderWrapper>
    </Provider>
  );
}
