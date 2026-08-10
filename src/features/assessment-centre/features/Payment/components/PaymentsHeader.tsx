"use client";

import React from "react";
import { FiDollarSign } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";

interface PaymentsHeaderProps {
  onWithdrawFunds: () => void;
}

export const PaymentsHeader: React.FC<PaymentsHeaderProps> = ({
  onWithdrawFunds,
}) => {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Payments
        </h1>

        <Button
          type="button"
          onClick={onWithdrawFunds}
          variant="amber"
          size="md"
          rightIcon={<FiDollarSign className="w-4.5 h-4.5" />}
          className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
        >
          Withdraw Funds
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Total Revenue
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                ₦3,125,000
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiDollarSign className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Completed Transactions
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                50
              </span>
              <span className="text-xs font-normal text-white/70">
                transactions
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiDollarSign className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Pending Transactions
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                6
              </span>
              <span className="text-xs font-normal text-white/70">
                transactions
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiDollarSign className="w-5 h-5 text-white/90" />
          </div>
        </div>
      </div>
    </div>
  );
};
