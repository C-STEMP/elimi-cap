"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "What is Elimi and who is it for?",
    a: "Elimi is a comprehensive TVET (Technical and Vocational Education and Training) platform designed for learners, training centers, instructors, and employers across Nigeria.",
  },
  {
    q: "How do I enroll in a TVET training program?",
    a: "You can register an account on Elimi, select your preferred skilled trade, and choose an accredited training center nearby to begin your course.",
  },
  {
    q: "Are the certifications recognized nationwide?",
    a: "Yes, all certifications issued through Elimi align with the National Vocational Qualification Framework (NVQF), NBTE, and NABTEB standards.",
  },
  {
    q: "How long does training and certification take?",
    a: "Program durations vary based on the specific trade module, typically ranging from a few weeks of intensive training to several months of competency-based practice.",
  },
  {
    q: "Can employers verify credentials on the platform?",
    a: "Yes! Elimi features an instant online verification portal where corporate and public employers can verify student credentials using a unique registration code.",
  },
  {
    q: "Is Elimi accessible on mobile devices?",
    a: "Absolutely. Elimi is built mobile-first and optimized for low-bandwidth environments so students can learn and track progress anywhere.",
  },
  {
    q: "What support is available for training institutes?",
    a: "Training institutes get access to dedicated institutional management portals, standardized curricula, assessor tools, and compliance reporting support.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-slate-50/60 py-16 lg:py-24" id="faqs">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center" data-aos="fade-up">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-dark sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Find answers to common questions about our platform and services.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                data-aos="fade-up"
                data-aos-delay={(idx % 5) * 80 + 50}
                className="overflow-hidden rounded-xl border border-gray-200/80 bg-white transition-all shadow-lg"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className={`flex w-full items-center justify-between px-6 py-5 text-left text-base font-bold transition-colors cursor-pointer select-none ${
                    isOpen ? "text-primary" : "text-text-dark hover:text-primary"
                  }`}
                >
                  <span>{faq.q}</span>
                  <span
                    className={`ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isOpen
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 px-6 py-4 text-sm leading-relaxed text-gray-600 bg-slate-50/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
