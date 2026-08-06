"use client";

import { useState, FormEvent } from "react";
import { useToast } from "@/components/ui/toast";

export function ContactSection() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        organization: "",
        message: "",
      });

      toast({
        type: "success",
        title: "Enquiry Sent!",
        description: "Thank you for reaching out. Our team will get back to you shortly.",
      });

      setTimeout(() => setSubmitted(false), 4000);
    }, 600);
  };

  const update = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section
      className="bg-[#661126] py-16 text-white lg:py-24 px-4 sm:px-6 lg:px-8"
      id="contact"
    >
      <div className="mx-auto max-w-4xl">
        <div className="text-center" data-aos="fade-up">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Contact Us
          </h2>
          <p className="mt-3 text-base text-white/80">
            Reach out to our team for inquiries and support.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          data-aos="fade-up"
          data-aos-delay="150"
          className="mt-12 space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.phone}
                onChange={(e) => update("phone", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Enter your phone number"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                Organization
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => update("organization", e.target.value)}
                placeholder="Enter organization name"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
              Message
            </label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="How can we help you?"
              className="w-full rounded-lg border resize-none border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-secondary focus:outline-none"
            />
          </div>

          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-full sm:w-auto rounded-md bg-secondary px-10 py-3.5 text-sm font-bold text-text-dark transition-all hover:bg-secondary-hover disabled:opacity-50 select-none"
            >
              {isSubmitting
                ? "Sending..."
                : submitted
                ? "Message Sent!"
                : "Send Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
