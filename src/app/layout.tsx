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
  title: {
    default: "ELIMI :: Nigeria's Unified TVET Platform",
    template: "%s | ELIMI",
  },
  description:
    "ELIMI is Nigeria's premier Technical and Vocational Education and Training (TVET) platform for skills training, National Skills Qualification (NSQ), Recognition of Prior Learning (RPL), and employment.",
  keywords: [
    "TVET Nigeria",
    "Technical and Vocational Education and Training",
    "National Skills Qualification",
    "NSQ",
    "Recognition of Prior Learning",
    "RPL Nigeria",
    "NABTEB Modular Certifications",
    "NBTE TVET",
    "Vocational Training Nigeria",
    "Skills Certification Nigeria",
    "Assessment Centre Nigeria",
    "Trade Skills Assessment",
    "Skilled Trades Certification",
  ],
  authors: [{ name: "ELIMI Africa", url: "https://cap.e-limi.africa" }],
  creator: "ELIMI Africa",
  publisher: "ELIMI Africa",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
      "https://cap.e-limi.africa",
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ELIMI — Nigeria's Unified TVET Platform",
    description:
      "Nigeria's nationwide TVET platform for getting trained, certified, and hired in the skilled trades, all in one place.",
    url:
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "https://cap.e-limi.africa",
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
      "Nigeria's nationwide TVET platform for getting trained, certified, and hired in the skilled trades, all in one place.",
    images: ["/landing-img-1.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://cap.e-limi.africa/#organization",
      name: "ELIMI",
      url: "https://cap.e-limi.africa",
      logo: "https://cap.e-limi.africa/icon.png",
      description:
        "Nigeria's Unified Technical and Vocational Education and Training (TVET) Platform for training, certification, and employment.",
    },
    {
      "@type": "WebSite",
      "@id": "https://cap.e-limi.africa/#website",
      url: "https://cap.e-limi.africa",
      name: "ELIMI TVET Platform",
      publisher: {
        "@id": "https://cap.e-limi.africa/#organization",
      },
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
