import Image from "next/image";
import Link from "next/link";
import { heroImg1, heroImg2, heroImg3, heroImg4 } from "@/assets";

export function HeroSection() {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden bg-[#661126] text-white pt-4 lg:pt-10 pb-10">
      <div className="mx-auto flex flex-col justify-between h-full w-full  px-4 text-center sm:px-6 lg:px-8 xl:px-16">
        <div className="flex flex-col items-center justify-center my-auto py-2 mb-4">
          <div
            data-aos="fade-down"
            className="inline-flex items-center rounded-full bg-secondary/10 px-3.5 lg:px-5 py-1 text-[11px] lg:text-base font-semibold tracking-wider text-secondary uppercase"
          >
            NIGERIA&apos;S FIRST NATIONWIDE TVET SYSTEM PLATFORM
          </div>

          <h1
            data-aos="fade-up"
            data-aos-delay="100"
            className="mt-3 max-w-5xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-[44px]"
          >
            Nigeria&apos;s platform for getting{" "}
            <span className="text-secondary italic">trained</span>,{" "}
            <span className="text-[#CB7288] italic">certified</span>, and{" "}
            <span className="text-[#FBCB7C] italic">hired</span> in the skilled
            trades, all in one place.
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mt-4 max-w-5xl font-medium text-sm text-white sm:text-sm lg:text-2xl"
          >
            One-stop platform for non-formal TVET (Technical &amp; Vocational
            Education &amp; Training), NBTE TVET National Qualifications
            Framework, and NABTEB Modular Certifications (under 100 million
            tradesmen)
          </p>

          <div
            data-aos="fade-up"
            data-aos-delay="300"
            className="mt-4 lg:mt-6 flex flex-wrap items-center justify-center gap-3 lg:gap-5"
          >
            <Link
              href="/signup"
              className="rounded-[10px] bg-secondary px-5 lg:px-16 py-2.5 text-sm font-semibold text-white transition-all hover:bg-secondary-hover"
            >
              Get Started
            </Link>
            <Link
              href="#about"
              className="rounded-[10px] bg-inherit px-5 lg:px-16 py-2.5 text-sm font-semibold text-white transition-all border border-white hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="mt-6 lg:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 h-80 lg:h-84 w-full shrink-0">
          {/* Column 1: Graffiti Artist Top + 99% Certification Rate Bottom */}
          <div data-aos="fade-up" data-aos-delay="200" className="flex flex-col gap-3 lg:gap-4 h-full">
            <div className="relative flex-2 overflow-hidden rounded-xl lg:rounded-2xl group">
              <Image
                src={heroImg4}
                alt="Artisan spray painting mural"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
                priority
              />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl lg:rounded-2xl bg-[#FBB040] text-center text-black shadow-sm">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-none tracking-tight">
                99%
              </span>
              <span className="mt-1.5 text-xs sm:text-sm font-bold leading-tight">
                Certification Rate
              </span>
            </div>
          </div>

          {/* Column 2: Full height Builder with Timber */}
          <div data-aos="fade-up" data-aos-delay="300" className="relative h-full overflow-hidden rounded-xl lg:rounded-2xl group">
            <Image
              src={heroImg2}
              alt="Technical builder constructing timber structure"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          </div>

          {/* Column 3: 80% Course Completion Rate Top + Electronics Tech Bottom */}
          <div data-aos="fade-up" data-aos-delay="400" className="flex flex-col gap-3 lg:gap-4 h-full">
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl lg:rounded-2xl bg-[#FDF0D5] text-center text-black shadow-sm">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-none tracking-tight">
                80%
              </span>
              <span className="mt-1.5 text-xs sm:text-sm font-bold leading-tight">
                Course Completion Rate
              </span>
            </div>
            <div className="relative flex-2 overflow-hidden rounded-xl lg:rounded-2xl group">
              <Image
                src={heroImg1}
                alt="Technician working on electronics"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </div>
          </div>

          {/* Column 4: Full height Tradesman with Equipment */}
          <div data-aos="fade-up" data-aos-delay="500" className="relative h-full overflow-hidden rounded-xl lg:rounded-2xl group">
            <Image
              src={heroImg3}
              alt="Verified tradesman with equipment"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
