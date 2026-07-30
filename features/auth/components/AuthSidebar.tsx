"use client";

import * as React from "react";
import { Logo } from "@/components/ui/logo";
import { FloatingCircles } from "./FloatingCircles";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { FiCheck } from "react-icons/fi";
import { HiOutlineArrowRight } from "react-icons/hi";
import Link from "next/link";

const RPL_STEPS = [
  { id: 1, label: "Personal Information" },
  { id: 2, label: "Experience & Trade" },
  { id: 3, label: "Verify Identity" },
  { id: 4, label: "Review And Submit" },
];

export const AuthSidebar: React.FC = () => {
  const pathname = usePathname();
  const sidebarVariant = useAppSelector((state) => state.auth.sidebarVariant);
  const rplStep = useAppSelector((state) => state.auth.rplStep);

  const nonRplRoutes = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/change-password",
    "/verify",
    "/welcome",
    "/onboarding",
  ];

  const isExplicitNonRplRoute = nonRplRoutes.some((route) =>
    pathname?.startsWith(route),
  );

  const isRplRoute =
    sidebarVariant === "rpl-form" || pathname?.includes("/rpl");

  return (
    <div
      suppressHydrationWarning
      className="hidden lg:flex lg:w-[40%] h-screen sticky top-0 shrink-0 bg-primary-solid flex-col justify-between p-12 xl:p-16 overflow-hidden select-none"
    >
      <FloatingCircles />

      <div
        suppressHydrationWarning
        className="relative z-10 flex flex-col h-full justify-between"
      >
        {isRplRoute ? (
          <div suppressHydrationWarning className="flex flex-col gap-8">
            <div suppressHydrationWarning>
              <Logo theme="light" />
            </div>

            <div suppressHydrationWarning className="flex flex-col gap-6 mt-4">
              <h2 className="text-neutral-burgundy text-2xl xl:text-[34px] font-extrabold tracking-tight">
                Complete RPL Form
              </h2>

              <div
                suppressHydrationWarning
                className="flex flex-col gap-0 mt-4"
              >
                {RPL_STEPS.map((step, idx) => {
                  const isActive = rplStep === step.id;
                  const isPast = rplStep > step.id;
                  const isLast = idx === RPL_STEPS.length - 1;

                  return (
                    <div key={step.id} className="flex flex-col gap-5">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <div
                          className={`w-8 h-8 rounded-full border flex items-center justify-center font-semibold text-xs transition-all ${
                            isPast
                              ? "border-white bg-white text-primary font-bold"
                              : isActive
                                ? "border-white bg-transparent text-white font-bold"
                                : "border-white/40 text-white/50"
                          }`}
                        >
                          {isPast ? (
                            <FiCheck className="w-4 h-4 text-primary stroke-3" />
                          ) : (
                            step.id
                          )}
                        </div>

                        <span
                          className={`text-base xl:text-2xl font-medium transition-colors ${
                            isActive || isPast
                              ? "text-neutral-burgundy font-semibold"
                              : "text-neutral-burgundy"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>

                      {!isLast && (
                        <div
                          className={`w-1.25 h-8 rounded-[10px] border border-white ml-3.5 mb-5 ${isPast ? "bg-white" : "bg-inherit"}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div suppressHydrationWarning className="flex flex-col gap-7">
              <div suppressHydrationWarning>
                <Logo theme="light" />
              </div>

              <div suppressHydrationWarning className="flex flex-col gap-6">
                <h2 className="text-neutral-burgundy text-3xl xl:text-[34px] font-bold leading-tight tracking-tight max-w-sm">
                  Build a verified <br /> career in your trade.
                </h2>
                <p className="text-neutral-burgundy text-sm xl:text-base leading-tight max-w-lg font-normal font-work">
                  Learn, get NSQ-certified, and get discovered by employers, all
                  from one ELIMI account.
                </p>

                <div suppressHydrationWarning className="pt-1">
                  <Link
                    href="#"
                    className="inline-flex items-center gap-2 text-white text-sm font-semibold hover:opacity-80 transition-opacity"
                  >
                    <span className="underline underline-offset-4">
                      Learn More
                    </span>
                    <HiOutlineArrowRight className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            </div>

            <div suppressHydrationWarning className="w-full">
              <div
                suppressHydrationWarning
                className="w-full h-px bg-white/20 mb-5"
              />
              <blockquote className="text-neutral-burgundy text-sm xl:text-[15px] leading-relaxed mb-3 font-medium max-w-lg">
                &ldquo;ELIMI helped me get NSQ Level 3 certified as a carpenter
                after 9 years on the job — no classroom needed.&rdquo;
              </blockquote>
              <cite className="text-neutral-burgundy text-xs font-semibold tracking-wide not-italic">
                Tunde Balogun · Carpenter, Ibadan
              </cite>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
