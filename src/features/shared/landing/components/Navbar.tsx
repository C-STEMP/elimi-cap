"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoIcon } from "@/assets";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { resetOnboarding } from "@/store/slices/onboardingSlice";
import { clearTokens } from "@/src/lib/auth-storage";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "About Us", href: "#about" },
  { label: "FAQs", href: "#faqs" },
  { label: "Portal", href: "#pipeline" },
  { label: "Workforce Hub", href: "#pillars" },
  { label: "Contact Us", href: "#contact" },
];

export function Navbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clearTokens();
    dispatch(logout());
    dispatch(resetOnboarding());
    setMobileMenuOpen(false);
    router.push("/signup");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentHash = window.location.hash || "#";
      setActiveLink(currentHash);

      const handleHashChange = () => {
        setActiveLink(window.location.hash || "#");
      };

      const handleScroll = () => {
        setScrolled(window.scrollY > 10);
      };

      window.addEventListener("hashchange", handleHashChange);
      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("hashchange", handleHashChange);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 h-20 bg-[#661126] text-white flex items-center shrink-0 transition-all duration-300 ${
        scrolled ? "shadow-lg bg-[#661126]/95 backdrop-blur-md" : ""
      }`}
    >
      <div className="mx-auto flex w-full items-center justify-between px-4 lg:px-8 xl:px-16">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <Image
            src={logoIcon}
            alt="Elimi Logo"
            width={109}
            height={39}
            className="h-8 w-27 object-cover"
            priority
            loading="eager"
          />
        </Link>

        <nav className="hidden items-center gap-2 md:gap-3 lg:gap-6 xl:gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeLink === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setActiveLink(link.href)}
                className={`whitespace-nowrap text-xs lg:text-sm xl:text-base transition-colors ${
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

        <div className="hidden items-center gap-2 md:gap-3 lg:gap-6 xl:gap-10 md:flex">
          <Link
            href="/signin"
            className="whitespace-nowrap text-xs lg:text-sm xl:text-base font-bold text-white transition-colors hover:text-secondary"
          >
            Login
          </Link>
          <Link
            href="/signup"
            onClick={handleRegisterClick}
            className="whitespace-nowrap rounded-[10px] bg-secondary px-3 md:px-4 lg:px-6 xl:px-10 py-2 lg:py-2.5 text-xs lg:text-sm font-semibold text-white transition-all hover:bg-secondary-hover"
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
        <div className="absolute top-20 left-0 right-0 border-t border-white/10 bg-[#540C1D] px-4 pt-4 pb-8 md:hidden shadow-2xl">
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
                onClick={handleRegisterClick}
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
