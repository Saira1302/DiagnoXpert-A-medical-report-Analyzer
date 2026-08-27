import "./globals.css";
import ClientProviders from "@/components/page/AppClient/ClientProviderLayout";
export const metadata = {
  title: "DiagnoXpert",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="min-h-screen w-full m-0 p-0">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
