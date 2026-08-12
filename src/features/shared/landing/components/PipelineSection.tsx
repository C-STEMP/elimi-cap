import Image from "next/image";
import Link from "next/link";
import { bookOpenIcon, quizIcon, briefcaseIcon } from "@/assets";

const STEPS = [
  {
    id: "learn",
    title: "Learn",
    titleColor: "text-[#A91D3A]",
    subtitle: "NSQ-aligned skilled trade e-learning",
    bullets: [
      "National Occupational Standards aligned video lessons & manuals",
      "Practical pre-requisite prep for carpentry, plumbing, electrical installation",
      "Quizzes and peer discussions with real-time feedback",
      "Generates an academic certificate of course completion",
    ],
    ctaText: "Get Started",
    ctaLink: "/signup",
    btnStyle: "bg-[#A91D3A] text-white hover:bg-[#8A162D]",
    iconSrc: bookOpenIcon,
    iconAlt: "Book open icon",
  },
  {
    id: "assessed",
    title: "Get Assessed",
    titleColor: "text-[#E58E00]",
    subtitle: "Competency Assessment Portal",
    bullets: [
      "Physical test coordination at GIZ & NBTE-approved trade labs",
      "Robust assessment chain: QAA → IQA → EQA internal & external verification",
      "Direct connection to recognized National Skills Qualifications Board",
      "Recognition of Prior Learning (RPL) for seasoned artisans",
    ],
    ctaText: "Get Assessed",
    ctaLink: "/onboarding/role-selection",
    btnStyle: "bg-[#E58E00] text-white hover:bg-[#C97C00]",
    iconSrc: quizIcon,
    iconAlt: "Quiz assessment icon",
  },
  {
    id: "hired",
    title: "Get Hired",
    titleColor: "text-black",
    subtitle: "WorkMaster Portal",
    bullets: [
      "Immutable public profile carrying certified digital trade badges",
      "Employers search, verify, and source talent with 100% credential certainty",
      "Direct connection with multi-housing developers and corporate sponsors",
      "Ecosystem tracking showing ongoing professional development",
    ],
    ctaText: "Join Network",
    ctaLink: "/signup",
    btnStyle: "bg-black text-white hover:bg-slate-800",
    iconSrc: briefcaseIcon,
    iconAlt: "Briefcase icon",
  },
];

export function PipelineSection() {
  return (
    <section className="bg-[#f4f5f8] py-16 lg:py-24" id="pipeline">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="text-center" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-black">
            The <span className="text-[#A91D3A]">Unified</span> Interactive
            Pipeline
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base lg:text-lg text-black leading-relaxed">
            Lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum
            <br className="hidden sm:inline" /> dolor lorem ipsum dolor
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:gap-4 lg:gap-6 md:grid-cols-3 items-stretch">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              data-aos="fade-up"
              data-aos-delay={(idx + 1) * 150}
              className="flex flex-col justify-between rounded-3xl bg-white overflow-hidden transition-all"
            >
              <div className="p-4 sm:p-5 md:p-4 lg:p-7 xl:p-8 pb-4">
                {/* Icon */}
                <div className="mb-3 md:mb-4 lg:mb-5">
                  <Image
                    src={step.iconSrc}
                    alt={step.iconAlt}
                    width={28}
                    height={28}
                    className="w-7 h-7"
                    loading="eager"
                  />
                </div>

                <h3
                  className={`text-lg sm:text-xl md:text-lg lg:text-2xl xl:text-[26px] font-extrabold tracking-tight whitespace-nowrap ${step.titleColor}`}
                >
                  {step.title}
                </h3>

                <p className="mt-1.5 text-xs sm:text-sm md:text-xs lg:text-base xl:text-xl text-black font-semibold leading-snug">
                  {step.subtitle}
                </p>

                <ul className="mt-3 md:mt-4 space-y-1 list-disc pl-4 md:pl-4 lg:pl-5 text-xs lg:text-sm text-black leading-relaxed font-normal">
                  {step.bullets.map((bullet, idx) => (
                    <li key={idx}>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-start pt-3 md:pt-4">
                <div className="inline-flex rounded-tr-2xl rounded-bl-3xl bg-[#f0f1f5] p-2.5 md:p-3">
                  <Link
                    href={step.ctaLink}
                    className={`whitespace-nowrap rounded-xl px-4 sm:px-5 md:px-4 lg:px-8 xl:px-12 py-2 md:py-2.5 lg:py-3 text-xs lg:text-sm font-bold transition-all shadow-sm ${step.btnStyle}`}
                  >
                    {step.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
