"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoIcon } from "@/assets";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "About Us", href: "#about" },
  { label: "FAQs", href: "#faqs" },
  { label: "Portal", href: "#pipeline" },
  { label: "Workforce Hub", href: "#pillars" },
  { label: "Contact Us", href: "#contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#");
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentHash = window.location.hash || "#";
      setActiveLink(currentHash);

      const handleHashChange = () => {
        setActiveLink(window.location.hash || "#");
      };

      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 h-20 bg-[#661126] text-white flex items-center shrink-0">
      <div className="mx-auto flex w-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-16">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logoIcon}
            alt="Elimi Logo"
            width={109}
            height={39}
            className="h-8 w-27 object-cover"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeLink === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setActiveLink(link.href)}
                className={`text-sm lg:text-base transition-colors ${
                  isActive
                    ? "text-secondary font-bold"
                    : "text-white/90 font-medium hover:text-secondary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:gap-10 md:flex">
          <Link
            href="/signin"
            className="text-sm lg:text-base font-bold text-white transition-colors hover:text-secondary"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-[10px] bg-secondary px-5 lg:px-10 py-2.5 text-sm font-semibold text-white transition-all hover:bg-secondary-hover"
          >
            Register
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md p-2 text-white hover:bg-white/10 md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 border-t border-white/10 bg-[#540C1D] px-4 pt-3 pb-6 md:hidden shadow-2xl">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => {
              const isActive = activeLink === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => {
                    setActiveLink(link.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1 text-base transition-colors ${
                    isActive
                      ? "text-secondary font-bold"
                      : "text-white/90 font-medium hover:text-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-base font-medium text-white hover:text-secondary"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full bg-secondary py-2 text-center text-base font-semibold text-text-dark"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
