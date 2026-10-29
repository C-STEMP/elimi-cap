"use client";

import { landingImg1 } from "@/assets";
import { useCapPublicStats } from "@/src/features/shared/public-stats";
import Image from "next/image";
import CountUp from "react-countup";

export function InfrastructureSection() {
  const { data: stats } = useCapPublicStats();

  const metrics = [
    {
      end: stats ? stats.centres.byStatus.approved : null,
      label: "Accredited Centres",
    },
    {
      end: stats ? stats.catalogue.qualificationLevels : null,
      label: "Certification Programmes",
    },
    {
      end: stats ? stats.catalogue.trades.active : null,
      label: "Trade Curriculums",
    },
    {
      end: stats ? stats.catalogue.units : null,
      label: "NOS Competency Units",
    },
  ];

  return (
    <section className="bg-white py-16 lg:py-24" id="about">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Column Image */}
          <div
            data-aos="fade-right"
            className="relative h-95 sm:h-120 lg:col-span-5 lg:h-130 overflow-hidden rounded-2xl shadow-md"
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
              ELIMI is Africa&apos;s unified skilled-trades ecosystem that
              consolidates training, regulatory qualification, and placement
              into a single platform. We believe the skilled-trades sector needs
              absolute trust. By pairing structured online training with
              rigorous physical evaluation under accredited Awarding Bodies, we
              guarantee that an ELIMI credential represents real, fraud-free
              competence.
            </p>

            {/* 2x2 Metric Cards Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
              {metrics.map((stat, idx) => (
                <div
                  key={idx}
                  data-aos="zoom-in"
                  data-aos-delay={(idx + 1) * 100}
                  className="rounded-[10px] bg-input-bg p-3.5 sm:p-4 md:p-4 lg:p-5 text-center transition-all hover:bg-slate-100/80"
                >
                  <span className="block text-xl sm:text-2xl md:text-2xl lg:text-[44px] font-bold text-black leading-tight">
                    {stat.end !== null ? (
                      <CountUp
                        end={stat.end}
                        duration={2.5}
                        separator=","
                        enableScrollSpy
                        scrollSpyOnce
                      />
                    ) : (
                      <span
                        className="mx-auto block h-7 sm:h-8 lg:h-11 w-16 sm:w-24 rounded-md bg-gray-200 animate-pulse"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <span className="mt-1 block text-[11px] sm:text-xs md:text-xs lg:text-base font-semibold text-black tracking-wider">
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
