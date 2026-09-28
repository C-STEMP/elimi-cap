"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "What is NSQ, and why does it matter?",
    a: "NSQ (National Skills Qualification) is Nigeria's official, NBTE-issued standard for trade competence. An NSQ certificate from ELIMI proves your skills are independently verified, not just claimed. It's the first framework ELIMI is built on, with more countries to follow.",
  },
  {
    q: "Do I need to attend a physical class to get certified?",
    a: "No. If you already work in your trade, Recognition of Prior Learning (RPL) assesses the skills you have — no classroom needed. New to the trade? ELIMI Learn prepares you first.",
  },
  {
    q: "How long does certification take?",
    a: "Your assessment centre reviews your application and evidence within 7 days, then schedules a panel interview within 3 days after.",
  },
  {
    q: "What happens if I don't pass my assessment?",
    a: "You won't be certified until you meet the standard, but you'll get clear feedback and can retrain to close the gap before reapplying.",
  },
  {
    q: "Is my certificate really recognised?",
    a: "Yes. Every ELIMI certificate is issued under an accredited body, currently NBTE and NSQ in Nigeria, and passes an internal and external quality check.",
  },
  {
    q: "How do employers find and verify me on Workmaster?",
    a: "Your certificate lives on a public, verifiable profile. Employers confirm it's real without contacting you directly.",
  },
  {
    q: "Can institutions register a whole workforce at once?",
    a: "Yes — ELIMI supports bulk enrollment for organisations certifying multiple staff across regions.",
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
            Everything you need to know about training, certification, and getting hired.
          </p>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQS.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.a,
                },
              })),
            }),
          }}
        />

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                data-aos="fade-up"
                data-aos-delay={(idx % 5) * 80 + 50}
                className="overflow-hidden rounded-xl border border-gray-200/80 bg-white transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
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

                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-header-${idx}`}
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="border-t border-gray-100 px-6 py-4 text-sm leading-relaxed text-gray-600 bg-slate-50/40">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
