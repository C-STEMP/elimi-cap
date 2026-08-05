"use client";

import { useState, useEffect } from "react";

const TESTIMONIALS = [
  {
    rating: 5,
    quote:
      "The hands-on curriculum gave me real practical skills. I was certified within months and got hired immediately by a local construction firm.",
    name: "Grace Adams",
    role: "Graduate, Electrical Installation",
  },
  {
    rating: 5,
    quote:
      "This platform streamlined our entire assessment framework. We can now issue verifiable credentials with confidence to thousands of trainees.",
    name: "Marcus Reed",
    role: "Director, Technical Training Institute",
  },
  {
    rating: 5,
    quote:
      "Elimi has transformed how we source verified skilled trade talent. It's the most reliable platform in Nigeria for finding certified workers.",
    name: "Tunde Bello",
    role: "Operations Manager, BuildCorp",
  },
  {
    rating: 5,
    quote:
      "As a working mother, the flexible learning schedule allowed me to upskill without compromising my family responsibilities. Now I earn twice my previous salary.",
    name: "Amina Yusuf",
    role: "Certified Tailor & Entrepreneur",
  },
  {
    rating: 5,
    quote:
      "The mobile-first approach means my students in rural areas can access quality training materials even with limited internet connectivity.",
    name: "Dr. Chidi Okafor",
    role: "Regional Training Coordinator",
  },
  {
    rating: 5,
    quote:
      "We've reduced credential verification time from weeks to seconds. Elimi's instant verification portal is a game-changer for our hiring process.",
    name: "Funke Adeyemi",
    role: "HR Director, Industrial Solutions Ltd",
  },
];

export function ImpactSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = TESTIMONIALS.length - cardsPerView;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  useEffect(() => {
    if (activeIndex > maxIndex) {
      setActiveIndex(maxIndex);
    }
  }, [cardsPerView, maxIndex, activeIndex]);

  return (
    <section className="bg-white py-16 lg:py-24" id="impact">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-black">
            Our <span className="text-secondary">Positive</span> Social Impact
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base lg:text-lg text-black leading-relaxed">
            Hear from real students and partners who have experienced the
            difference.
          </p>
        </div>

        <div className="mt-12">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${activeIndex * (100 / cardsPerView)}%)`,
              }}
            >
              {TESTIMONIALS.map((item, idx) => (
                <div
                  key={idx}
                  className="shrink-0 px-3"
                  style={{ width: `${100 / cardsPerView}%` }}
                >
                  <div className="flex h-full flex-col justify-between rounded-2xl bg-slate-50/60 p-6 sm:p-8 transition-all hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-1 text-secondary">
                        {[...Array(item.rating)].map((_, i) => (
                          <svg
                            key={i}
                            className="h-4 w-4 sm:h-5 sm:w-5 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-gray-700 italic line-clamp-4 sm:line-clamp-none">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                    </div>

                    <div className="mt-6 pt-4">
                      <h4 className="text-base font-bold text-text-dark">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              onClick={handlePrev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-md transition-all hover:bg-secondary hover:text-white hover:border-secondary"
              aria-label="Previous testimonial"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-md transition-all hover:bg-secondary hover:text-white hover:border-secondary"
              aria-label="Next testimonial"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
