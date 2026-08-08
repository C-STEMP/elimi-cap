"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiX, FiPlus, FiCalendar } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { DatePicker } from "@/src/components/ui/date-picker";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { ASSETS_URL } from "@/assets";

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobPosted?: (job: {
    title: string;
    trade: string;
    slots: number;
    deadline: string;
    description: string;
    requirements: string[];
  }) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  onJobPosted,
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [trade, setTrade] = useState("");
  const [durationValue, setDurationValue] = useState("1");
  const [durationUnit, setDurationUnit] = useState("Weeks");
  const [slots, setSlots] = useState("2");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [requirements, setRequirements] = useState<string[]>([
    "Minimum 5 years industry experience",
  ]);
  const [step, setStep] = useState<"form" | "success">("form");

  if (!isOpen) return null;

  const handleAddRequirement = () => {
    if (!reqInput.trim()) return;
    setRequirements((prev) => [...prev, reqInput.trim()]);
    setReqInput("");
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        type: "error",
        title: "Title Required",
        description: "Please enter request title.",
      });
      return;
    }
    if (!trade) {
      toast({
        type: "error",
        title: "Trade Required",
        description: "Please select a trade.",
      });
      return;
    }

    setStep("success");
    onJobPosted?.({
      title,
      trade,
      slots: Number(slots) || 1,
      deadline: deadline || "07/24/2026",
      description,
      requirements,
    });
  };

  const handleReset = () => {
    setTitle("");
    setTrade("");
    setDescription("");
    setRequirements(["Minimum 5 years industry experience"]);
    setStep("form");
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed overflow-hidden inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-300 select-none overflow-y-auto"
        onClick={handleReset}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative flex flex-col items-center my-8 max-h-[90vh] overflow-y-auto scrollbar-thin"
        >
          {/* Close Button */}
          {step === "form" && (
            <button
              type="button"
              onClick={handleReset}
              className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
              aria-label="Close modal"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}

          {step === "form" ? (
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col items-center gap-4"
            >
              <div className="flex flex-col items-center text-center gap-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Post A Job
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 font-normal">
                  Create a new request
                </p>
              </div>

              <div className="w-full flex flex-col gap-3.5 mt-2">
                <Input
                  label="Title"
                  type="text"
                  placeholder="Type Here"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Trade"
                    placeholder="Select"
                    options={[
                      "Carpentry",
                      "Plumbing",
                      "Masonry",
                      "Painting",
                      "Electrical Installation",
                    ]}
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                      Duration
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min="1"
                        value={durationValue}
                        onChange={(e) => setDurationValue(e.target.value)}
                        containerClassName="w-16"
                        className="!h-11 !text-center !font-semibold"
                      />
                      <Select
                        containerClassName="flex-1"
                        size="sm"
                        showPlaceholderOption={false}
                        value={durationUnit}
                        onChange={(e) => setDurationUnit(e.target.value)}
                        options={["Days", "Weeks", "Months"]}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Slot"
                    type="number"
                    min="1"
                    value={slots}
                    onChange={(e) => setSlots(e.target.value)}
                  />

                  <DatePicker
                    label="Deadline"
                    placeholder="MM/DD/YYYY"
                    value={deadline}
                    onChange={(val) => setDeadline(val)}
                    align="right"
                  />
                </div>

                <Input
                  label="Description"
                  textarea
                  rows={3}
                  placeholder="Type Here"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex flex-col gap-2 w-full">
                  <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                    Requirements
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Type Here"
                      value={reqInput}
                      onChange={(e) => setReqInput(e.target.value)}
                      containerClassName="flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddRequirement}
                      className="w-11 h-11 bg-amber-50 hover:bg-amber-100 text-[#fbab2a] rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <FiPlus className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Requirements Pills */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    {requirements.map((req, idx) => (
                      <div
                        key={idx}
                        className="bg-red-50/80 text-[#991B1B] text-xs font-semibold px-3 py-2 rounded-xl flex items-center justify-between gap-2 border border-red-100"
                      >
                        <span className="truncate">{req}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(idx)}
                          className="text-red-500 hover:text-red-700 transition-colors cursor-pointer shrink-0"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="amber"
                size="lg"
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] mt-3 transition-all shadow-lg cursor-pointer rounded-xl"
              >
                Post Request
              </Button>
            </form>
          ) : (
            <div className="w-full flex flex-col items-center text-center">
              <div className="mt-2 mb-4 relative flex items-center justify-center">
                <Image
                  src={ASSETS_URL.successCheckmarkImg}
                  alt="Request Posted Successfully"
                  width={160}
                  height={160}
                  className="w-36 h-36 object-contain"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>

              <h3 className="text-neutral-primary font-extrabold text-xl sm:text-2xl mb-2 tracking-tight">
                Request Posted Successfully
              </h3>

              <p className="text-neutral-secondary text-xs sm:text-sm mb-8 leading-relaxed font-normal">
                You have successfully posted a request
              </p>

              <Button
                type="button"
                onClick={handleReset}
                variant="amber"
                size="lg"
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-lg cursor-pointer rounded-xl"
              >
                Continue
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
