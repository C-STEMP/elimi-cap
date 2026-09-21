"use client";

import React from "react";
import { FiDollarSign, FiCheckCircle, FiClock } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import {
  useGetCentreWallet,
  useGetCentrePaymentsSummary,
} from "@/src/features/shared/centre/hooks";
import { formatCurrency } from "@/src/utils/currency";

interface PaymentsHeaderProps {
  onWithdrawFunds?: () => void;
  activeStatusFilter?: string;
  onSelectStatusFilter?: (status: string) => void;
}

export const PaymentsHeader: React.FC<PaymentsHeaderProps> = ({
  onWithdrawFunds,
  activeStatusFilter,
  onSelectStatusFilter,
}) => {
  const { data: wallet } = useGetCentreWallet();
  const { data: paymentsSummary } = useGetCentrePaymentsSummary();

  const rawRevenue = paymentsSummary?.totalRevenue || wallet?.balance;
  const formattedRevenue = rawRevenue?.amountMinorUnits
    ? formatCurrency(rawRevenue.amountMinorUnits, rawRevenue.currency || "NGN")
    : "₦0";

  const completedCount = paymentsSummary?.completedCount ?? 0;
  const pendingCount = paymentsSummary?.pendingCount ?? 0;

  const cards = [
    {
      label: "Total Revenue",
      value: formattedRevenue,
      unit: null,
      icon: <FiDollarSign className="w-5 h-5 text-white/90" />,
      filter: null,
    },
    {
      label: "Completed Transactions",
      value: completedCount.toLocaleString(),
      unit: "transactions",
      icon: <FiCheckCircle className="w-5 h-5 text-white/90" />,
      filter: "completed",
    },
    {
      label: "Pending Transactions",
      value: pendingCount.toLocaleString(),
      unit: "transactions",
      icon: <FiClock className="w-5 h-5 text-white/90" />,
      filter: "pending",
    },
  ];

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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((card) => {
          const isActive =
            card.filter !== null && activeStatusFilter === card.filter;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() =>
                card.filter !== null && onSelectStatusFilter?.(card.filter)
              }
              className={[
                "bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border transition-all shadow-xs text-left",
                card.filter !== null
                  ? "cursor-pointer hover:bg-white/15 active:scale-[0.98]"
                  : "cursor-default",
                isActive
                  ? "ring-2 ring-white/60 bg-white/20 border-white/40"
                  : "border-white/15",
              ].join(" ")}
            >
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  {card.label}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {card.value}
                  </span>
                  {card.unit && (
                    <span className="text-xs font-normal text-white/70">
                      {card.unit}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                {card.icon}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
