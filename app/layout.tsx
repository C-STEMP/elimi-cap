import type { Metadata } from "next";
import { Inter, Work_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { ReduxProvider } from "@/store/provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  display: "swap",
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
      className={`${inter.variable} ${workSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-white font-sans text-dark"
        suppressHydrationWarning
      >
        <ReduxProvider>
          <ToastProvider>{children}</ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
