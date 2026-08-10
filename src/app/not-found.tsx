"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF9] p-6 text-center">
      <h1 className="text-4xl font-extrabold text-[#A31D38] mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-6 font-work">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-2.5 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-sm rounded-xl transition-all shadow-md"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
