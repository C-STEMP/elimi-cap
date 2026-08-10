"use client";

import React from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF9] p-6 text-center">
          <h1 className="text-4xl font-extrabold text-[#A31D38] mb-2">500</h1>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mb-6 font-work">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#A31D38] hover:bg-[#8D1830] text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
