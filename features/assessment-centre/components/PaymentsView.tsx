"use client";

import React, { useState } from "react";
import { FiSearch, FiList, FiGrid, FiDollarSign } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { MOCK_PAYMENT_TRANSACTIONS } from "../utils/constants";
import { PaymentTransaction } from "../types";

interface PaymentsViewProps {
  onWithdrawFunds: () => void;
  onSelectReceipt: (transaction: PaymentTransaction) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onWithdrawFunds,
  onSelectReceipt,
}) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(
    MOCK_PAYMENT_TRANSACTIONS
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.assessmentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Header Banner */}
      <div className="w-full bg-[#a31d38] text-white rounded-3xl p-6 sm:p-8 xl:p-10 flex flex-col gap-6 shadow-md">
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
            className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
          >
            Withdraw Funds
          </Button>
        </div>

        {/* 3 Revenue Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">Total Revenue</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  ₦3,125,000
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-white/90" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">Completed Transactions</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">50</span>
                <span className="text-xs font-normal text-white/70">transactions</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-white/90" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">Pending Transactions</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">6</span>
                <span className="text-xs font-normal text-white/70">transactions</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-white/90" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Transaction History Table Container */}
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

          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-primary bg-white outline-none cursor-pointer hover:border-gray-300 transition-colors"
            >
              <option value="All">Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>

            <div className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-xl border border-gray-200/80">
              <button
                type="button"
                className="p-1.5 rounded-lg bg-white text-neutral-primary shadow-xs font-bold"
                title="List View"
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg text-gray-400 hover:text-neutral-primary"
                title="Grid View"
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History Table */}
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
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-neutral-primary">
                    {tx.candidateName}
                  </td>
                  <td className="p-3.5 text-neutral-secondary">{tx.assessmentType}</td>
                  <td className="p-3.5 font-bold text-neutral-primary">{tx.amountPaid}</td>
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
      </div>
    </div>
  );
};
