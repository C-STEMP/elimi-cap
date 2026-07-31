import * as React from "react";

export default function SelfAssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen w-full flex flex-col lg:flex-row bg-[#75152B] lg:bg-gray-50/50 font-sans antialiased overflow-y-auto lg:overflow-hidden"
    >
      <div
        suppressHydrationWarning
        className="flex-1 w-full bg-white rounded-t-4xl lg:rounded-none lg:mt-0 flex flex-col items-center justify-start relative min-h-screen lg:min-h-screen lg:h-screen lg:overflow-y-auto"
      >
        <div
          suppressHydrationWarning
          className="w-full flex flex-col items-center my-auto py-6 sm:py-8 shrink-0"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
