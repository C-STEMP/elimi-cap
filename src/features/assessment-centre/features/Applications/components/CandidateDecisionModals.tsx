"use client";

import React from "react";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";
import { Button } from "@/src/components/ui/button";

interface Props {
  isConfirmAcceptOpen: boolean;
  onCloseAccept: () => void;
  onAccept: () => void;
  isConfirmRejectOpen: boolean;
  onCloseReject: () => void;
  onReject: () => void;
  rejectReason: string;
  setRejectReason: (val: string) => void;
  isAcceptSuccessOpen: boolean;
  onCloseSuccess: () => void;
  isReviewPending: boolean;
}

export const CandidateDecisionModals: React.FC<Props> = ({
  isConfirmAcceptOpen,
  onCloseAccept,
  onAccept,
  isConfirmRejectOpen,
  onCloseReject,
  onReject,
  rejectReason,
  setRejectReason,
  isAcceptSuccessOpen,
  onCloseSuccess,
  isReviewPending,
}) => {
  return (
    <>
      {isConfirmAcceptOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
            <div className="w-25 h-25 mb-4 flex items-center justify-center">
              <Image src={ASSETS_URL.validationWarningIcon} alt="Warning" width={100} height={100} className="w-25 h-25 object-contain" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-1">Are You sure?</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-normal mb-6">Confirm you want to accept this application</p>
            <div className="flex flex-col gap-3 w-full">
              <Button type="button" onClick={onAccept} variant="amber" fullWidth disabled={isReviewPending} className="h-12 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-base rounded-xl shadow-md cursor-pointer">
                {isReviewPending ? "Accepting..." : "Yes, Accept"}
              </Button>
              <button type="button" onClick={onCloseAccept} className="h-12 w-full border border-[#fbab2a] text-[#fbab2a] hover:bg-orange-50 font-bold text-base rounded-xl transition-colors cursor-pointer">
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {isConfirmRejectOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
            <div className="w-25 h-25 mb-4 flex items-center justify-center">
              <Image src={ASSETS_URL.validationWarningIcon} alt="Reject Warning" width={100} height={100} className="w-25 h-25 object-contain" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-1">Reject Application?</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-normal mb-4">Please provide a reason for rejecting this candidate application</p>
            <div className="w-full mb-4">
              <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Specify rejection reason..." className="w-full bg-[#F4F5F7] border border-gray-200 rounded-xl p-3 text-xs text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none text-left" />
            </div>
            <div className="flex flex-col gap-3 w-full">
              <Button type="button" onClick={onReject} variant="outline" fullWidth disabled={isReviewPending} className="h-12 bg-red-600 hover:bg-red-700 text-white border-none font-bold text-base rounded-xl shadow-md cursor-pointer">
                {isReviewPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
              <button type="button" onClick={onCloseReject} className="h-12 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-base rounded-xl transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isAcceptSuccessOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
            <div className="w-25 h-25 mb-4 flex items-center justify-center">
              <Image src={ASSETS_URL.successCheckmarkImg} alt="Accepted" width={100} height={100} className="w-25 h-25 object-contain" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-1">Accepted Successfully</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-normal mb-6">Candidate Application was accepted successfully</p>
            <Button type="button" onClick={onCloseSuccess} variant="amber" fullWidth className="h-12 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-base rounded-xl shadow-md cursor-pointer">
              Continue
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
