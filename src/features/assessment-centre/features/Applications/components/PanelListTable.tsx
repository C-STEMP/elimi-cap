"use client";

import React from "react";
import { FiUsers, FiUser } from "react-icons/fi";
import type { PanelRowData } from "../utils/appViewHelpers";

interface Props {
  filteredPanels: PanelRowData[];
  isLoadingPanels: boolean;
  viewMode: "list" | "grid";
  selectedPanelIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onSetViewing: (item: PanelRowData) => void;
}

export const PanelListTable: React.FC<Props> = ({
  filteredPanels,
  isLoadingPanels,
  viewMode,
  selectedPanelIds,
  onToggleSelectAll,
  onToggleSelect,
  onSetViewing,
}) => {
  const handleView = (item: PanelRowData) => {
    onSetViewing(item);
  };

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoadingPanels
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs flex flex-col gap-3 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="h-3 bg-gray-100 rounded w-40" />
                <div className="h-3 bg-gray-100 rounded w-32" />
              </div>
            ))
          : filteredPanels.length > 0
          ? filteredPanels.map((item) => (
              <div
                key={item.id}
                onClick={() => handleView(item)}
                className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <input
                    type="checkbox"
                    checked={selectedPanelIds.includes(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onToggleSelect(item.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#a31d38] cursor-pointer"
                  />
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                    <FiUsers className="w-3 h-3" />
                    <span>{item.assessorsCount} Assessors</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-sm text-black group-hover:text-primary transition-colors">
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-600">Lead:</span> {item.leadAssessor}
                  </span>
                  <span className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-600">Member:</span> {item.panelMembers}
                  </span>
                  <span className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-600">IV:</span> {item.internalVerifier}
                  </span>
                  <span className="text-xs text-gray-400">Created: {item.createdAt}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(item);
                  }}
                  className="text-xs text-black font-bold underline hover:text-[#a31d38] cursor-pointer mt-auto self-start"
                >
                  View
                </button>
              </div>
            ))
          : (
            <div className="col-span-full p-8 text-center text-gray-400">
              No panels found.
            </div>
          )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto no-scrollbar border border-gray-100 rounded-2xl">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-[#F8F9FA] text-gray-600 font-bold border-b border-gray-100 whitespace-nowrap">
          <tr>
            <th className="p-4 w-10">
              <input
                type="checkbox"
                checked={
                  filteredPanels.length > 0 &&
                  selectedPanelIds.length === filteredPanels.length
                }
                onChange={onToggleSelectAll}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </th>
            <th className="p-4 whitespace-nowrap">Panel Name</th>
            <th className="p-4 whitespace-nowrap">Lead Panelist</th>
            <th className="p-4 whitespace-nowrap">Panel Member(s)</th>
            <th className="p-4 whitespace-nowrap">Internal Verifier</th>
            <th className="p-4 whitespace-nowrap">Created At</th>
            <th className="p-4 whitespace-nowrap text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoadingPanels
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="p-4">
                      <div className="h-3.5 bg-gray-200 rounded w-24" />
                    </td>
                  ))}
                </tr>
              ))
            : filteredPanels.length > 0
            ? filteredPanels.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleView(item)}
                  className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedPanelIds.includes(item.id)}
                      onChange={() => onToggleSelect(item.id)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-semibold text-black group-hover:text-primary transition-colors">
                    {item.name}
                  </td>
                  <td className="p-4 text-gray-600">{item.leadAssessor}</td>
                  <td className="p-4 text-gray-600">{item.panelMembers}</td>
                  <td className="p-4 text-gray-600">{item.internalVerifier}</td>
                  <td className="p-4 text-gray-600">{item.createdAt}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(item);
                      }}
                      className="font-semibold text-black underline underline-offset-2 hover:text-primary cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  No panels found.
                </td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  );
};
