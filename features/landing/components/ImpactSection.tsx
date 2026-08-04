"use client";

import { useState } from "react";

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
];

export function ImpactSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

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

        {/* Testimonials Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={idx}
              data-aos="fade-up"
              data-aos-delay={(idx + 1) * 150}
              className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-slate-50/60 p-8 shadow-sm transition-all hover:bg-slate-50"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-secondary">
                  {[...Array(item.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-gray-700 italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 border-t border-gray-200/60 pt-4">
                <h4 className="text-base font-bold text-text-dark">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500">{item.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots & Arrows */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={handlePrev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition-all hover:bg-gray-100"
            aria-label="Previous testimonial"
          >
            &#8592;
          </button>
          <button
            onClick={handleNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition-all hover:bg-gray-100"
            aria-label="Next testimonial"
          >
            &#8594;
          </button>
        </div>
      </div>
    </section>
  );
}
