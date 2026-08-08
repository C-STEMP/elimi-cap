import type { Metadata } from "next";
import { Inter, Work_Sans } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AntdProvider } from "@/src/components/ui/antd-provider";
import { ToastProvider } from "@/src/components/ui/toast";
import { ReduxProvider } from "@/store/provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "ELIMI | Unified TVET Platform",
  description:
    "ELIMI is a 3-in-1 Technical and Vocational Education and Training platform built on a unified identity model — one user, seamless access across all three modules.",
  icons: {
    icon: "/icons/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${workSans.variable} antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className="min-h-screen flex flex-col bg-white font-sans text-dark"
        suppressHydrationWarning
      >
        <ReduxProvider>
          <AntdRegistry>
            <AntdProvider>
              <ToastProvider>{children}</ToastProvider>
            </AntdProvider>
          </AntdRegistry>
        </ReduxProvider>
      </body>
    </html>
  );
}
