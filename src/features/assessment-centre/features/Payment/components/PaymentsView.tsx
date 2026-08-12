"use client";

import React, { useState } from "react";
import { FiSearch, FiList, FiGrid } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { PaymentTransaction } from "@/features/assessment-centre/types";

interface PaymentsViewProps {
  onWithdrawFunds: () => void;
  onSelectReceipt: (transaction: PaymentTransaction) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onWithdrawFunds,
  onSelectReceipt,
}) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.assessmentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6">
        <h2 className="text-xl font-extrabold text-neutral-primary tracking-tight">
          Transaction History
        </h2>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200/80 focus:border-gray-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-primary outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              size="sm"
              showPlaceholderOption={false}
              containerClassName="w-32"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "Status", value: "All" },
                { label: "Paid", value: "Paid" },
                { label: "Pending", value: "Pending" },
              ]}
            />

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List View"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-700 hover:text-neutral-primary"
                }`}
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid View"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-700 hover:text-neutral-primary"
                }`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 font-normal">No transactions found.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex items-start justify-between relative group"
              >
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-sm text-neutral-primary">
                    {tx.candidateName}
                  </span>
                  <span className="text-xs text-gray-500 font-normal">
                    Type: {tx.assessmentType}
                  </span>
                  <span className="text-xs text-neutral-primary font-bold">
                    Amount: {tx.amountPaid}
                  </span>
                </div>

                <div className="flex flex-col items-end justify-between h-full gap-4">
                  {tx.status === "Paid" ? (
                    <span className="bg-[#D1FAE5] text-[#065F46] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                      Paid
                    </span>
                  ) : (
                    <span className="bg-[#FEF3C7] text-[#D97706] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                      Pending
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectReceipt(tx)}
                    className="text-xs lg:text-sm text-neutral-primary font-bold underline hover:text-[#a31d38] transition-colors cursor-pointer mt-2"
                  >
                    Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F8F9FA] text-gray-500 text-xs font-semibold uppercase tracking-wider rounded-xl">
                  <th className="p-3.5 rounded-l-xl">Candidate Name</th>
                  <th className="p-3.5">Assessment Type</th>
                  <th className="p-3.5">Amount Paid</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-neutral-primary">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-3.5 font-bold text-neutral-primary">
                      {tx.candidateName}
                    </td>
                    <td className="p-3.5 text-neutral-secondary">
                      {tx.assessmentType}
                    </td>
                    <td className="p-3.5 font-bold text-neutral-primary">
                      {tx.amountPaid}
                    </td>
                    <td className="p-3.5">
                      {tx.status === "Paid" ? (
                        <span className="bg-[#D1FAE5] text-[#065F46] font-semibold px-3.5 py-1 rounded-full text-xs inline-block">
                          Paid
                        </span>
                      ) : (
                        <span className="bg-[#FEF3C7] text-[#D97706] font-semibold px-3.5 py-1 rounded-full text-xs inline-block">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectReceipt(tx)}
                        className="text-neutral-primary font-bold text-xs underline hover:text-[#a31d38] transition-colors cursor-pointer"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
