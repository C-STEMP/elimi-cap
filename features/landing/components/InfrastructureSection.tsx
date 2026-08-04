import Image from "next/image";
import { landingImg1 } from "@/assets";

const STATS = [
  { value: "14,800+", label: "Accredited Centers" },
  { value: "280+", label: "Certification Rate" },
  { value: "45+", label: "Trade Curriculums" },
  { value: "100%", label: "Credential Safety" },
];

export function InfrastructureSection() {
  return (
    <section className="bg-white py-16 lg:py-24" id="about">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Column Image */}
          <div
            data-aos="fade-right"
            className="relative h-95 sm:h-120 lg:col-span-5 lg:h-130 overflow-hidden rounded-2xl shadow-xl"
          >
            <Image
              src={landingImg1}
              alt="Craftsman artisan working"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>

          {/* Right Column Content */}
          <div data-aos="fade-left" className="lg:col-span-7">
            <h2 className="text-2xl font-extrabold tracking-tight text-dark lg:text-[44px]">
              One <span className="text-secondary">Unified</span> Infrastructure
            </h2>

            <p className="mt-4 text-base leading-relaxed text-black sm:text-lg lg:pr-4">
              ELIMI is Nigeria's unified skilled-trades ecosystem that
              consolidates training, regulatory qualification, and placement
              into a single platform. We believe the skilled-trades sector needs
              absolute trust. By integrating online standard training with
              rigorous physical evaluations under accredited Awarding Bodies, we
              guarantee that an ELIMI credential represents real, fraud-free
              competent ability.
            </p>

            {/* 2x2 Metric Cards Grid */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              {STATS.map((stat, idx) => (
                <div
                  key={idx}
                  data-aos="zoom-in"
                  data-aos-delay={(idx + 1) * 100}
                  className="rounded-[10px] bg-input-bg p-5 text-center transition-all hover:bg-slate-100/80"
                >
                  <span className="block text-2xl font-semibold text-black sm:text-3xl lg:text-[44px]">
                    {stat.value}
                  </span>
                  <span className="mt-1 block text-xs lg:text-base font-semibold text-black tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
