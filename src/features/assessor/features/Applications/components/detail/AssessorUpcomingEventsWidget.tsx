"use client";

import React from "react";
import { FiCalendar } from "react-icons/fi";

export interface AssessorUpcomingEvent {
  title: string;
  time: string;
  date: string;
  address: string;
}

interface AssessorUpcomingEventsWidgetProps {
  event?: AssessorUpcomingEvent | null;
}

export const AssessorUpcomingEventsWidget: React.FC<
  AssessorUpcomingEventsWidgetProps
> = ({ event }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4 w-full">
      <h4 className="text-base font-bold text-neutral-primary">
        Upcoming Events
      </h4>

      {event ? (
        <div className="bg-[#F8F9FA] rounded-2xl p-4 flex items-stretch gap-3.5 border border-gray-100 w-full">
          {/* Inside Vertical Maroon Line Bar */}
          <span className="w-1 bg-[#A31D38] rounded-full shrink-0 my-0.5" />

          <div className="flex flex-col flex-1 w-full gap-2.5">
            <h5 className="text-sm sm:text-base font-bold text-neutral-primary leading-tight">
              {event.title}
            </h5>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-neutral-secondary uppercase tracking-wider">
                  TIME
                </span>
                <span className="font-bold text-neutral-primary mt-0.5">
                  {event.time}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-neutral-secondary uppercase tracking-wider">
                  DATE
                </span>
                <span className="font-bold text-neutral-primary mt-0.5">
                  {event.date}
                </span>
              </div>
            </div>

            <div className="flex flex-col text-xs pt-0.5">
              <span className="text-[10px] font-medium text-neutral-secondary">
                Address
              </span>
              <span className="font-bold text-neutral-primary mt-0.5">
                {event.address}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-6">
          <div className="w-14 h-14 rounded-full border border-rose-100 bg-[#FFF5F6] text-[#A31D38] flex items-center justify-center mb-3">
            <FiCalendar className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h5 className="text-sm font-bold text-neutral-primary">
            No upcoming events
          </h5>
          <p className="text-xs text-neutral-secondary mt-1 max-w-[200px] leading-relaxed">
            Your scheduled events will appear here
          </p>
        </div>
      )}
    </div>
  );
};
