import Image from "next/image";
import Link from "next/link";
import { logoIcon } from "@/assets";

export function Footer() {
  return (
    <footer className="relative bg-[#110306] text-white/80 pt-16 pb-12 border-t-2 border-[#8A162D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Logo & Description */}
          <div className="md:col-span-5">
            <Link href="/">
              <Image
                src={logoIcon}
                alt="Elimi Logo"
                width={130}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm text-white/70 leading-relaxed font-normal">
              Nigeria&apos;s leading platform for TVET training, certification,
              and trade job placements. Built on a unified identity model for
              seamless skills progression.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-3 gap-6 md:col-span-7">
            {/* Quick Links */}
            <div>
              <h4 className="text-base lg:text-lg font-bold text-white tracking-wide">
                Quick Links
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li>
                  <Link href="#about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#pipeline" className="hover:text-white transition-colors">
                    CAP
                  </Link>
                </li>
                <li>
                  <Link href="#pipeline" className="hover:text-white transition-colors">
                    Learn
                  </Link>
                </li>
                <li>
                  <Link href="#pipeline" className="hover:text-white transition-colors">
                    WorkMasters
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Who it's for */}
            <div>
              <h4 className="text-base lg:text-lg font-bold text-white tracking-wide">
                Who it&apos;s for
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li>
                  <Link href="#pillars" className="hover:text-white transition-colors">
                    Institutions
                  </Link>
                </li>
                <li>
                  <Link href="#pillars" className="hover:text-white transition-colors">
                    Government
                  </Link>
                </li>
                <li>
                  <Link href="#pillars" className="hover:text-white transition-colors">
                    Programme partners
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-base lg:text-lg font-bold text-white tracking-wide">
                Legal
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li>
                  <Link href="#contact" className="hover:text-white transition-colors">
                    Terms Of Use
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white transition-colors">
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-14 border-t border-white/10 pt-8 text-center text-sm font-medium tracking-wider text-white/60">
          ELIMI 2026
        </div>
      </div>
    </footer>
  );
}
