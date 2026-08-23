import type { Metadata } from "next";
import { Inter, Work_Sans } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AntdProvider } from "@/src/components/ui/antd-provider";
import { ToastProvider } from "@/src/components/ui/toast";
import { ReduxProvider } from "@/store/provider";
import { RouteGuard } from "@/src/components/auth/RouteGuard";
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
  title: "ELIMI :: Nigeria's Unified TVET Platform",
  description:
    "ELIMI is a 3-in-1 Technical and Vocational Education and Training platform built on a unified identity model — one user, seamless access across all three modules for training, certification, and employment.",
  icons: {
    icon: [
      { url: "/icon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.icon",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "https://cap.elimi.africa",
  ),
  openGraph: {
    title: "ELIMI — Nigeria's Unified TVET Platform",
    description:
      "ELIMI is a 3-in-1 Technical and Vocational Education and Training platform built on a unified identity model — one user, seamless access across all three modules for training, certification, and employment.",
    url:
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "https://cap.elimi.africa",
    siteName: "ELIMI :: Nigeria's Unified TVET Platform",
    images: [
      {
        url: "/landing-img-1.jpg",
        width: 1200,
        height: 630,
        alt: "Preview image for ELIMI :: Nigeria's Unified TVET Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ELIMI :: Nigeria's Unified TVET Platform",
    description:
      "ELIMI is a 3-in-1 Technical and Vocational Education and Training platform built on a unified identity model — one user, seamless access across all three modules for training, certification, and employment.",
    images: ["/landing-img-1.jpg"],
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
              <ToastProvider>
                <RouteGuard>{children}</RouteGuard>
              </ToastProvider>
            </AntdProvider>
          </AntdRegistry>
        </ReduxProvider>
      </body>
    </html>
  );
}
