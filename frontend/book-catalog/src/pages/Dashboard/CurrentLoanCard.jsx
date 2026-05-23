import React from "react";
import { MenuBook } from "@mui/icons-material";

const CurrentLoanCard = ({ title, author, dueDate, daysLeft }) => {
  const isOverdue = daysLeft <= 2;
  const isUrgent = daysLeft <= 5;

  const chipStyle = isOverdue
    ? "bg-red-50 text-red-800 border border-red-200"
    : isUrgent
      ? "bg-amber-50 text-amber-800 border border-amber-200"
      : "bg-gray-100 text-gray-500 border border-gray-200";

  const chipLabel = isOverdue ? `⚑ ${daysLeft}d left` : `Due ${daysLeft}d`;

  return (
    <div className="group flex items-center gap-3.5 bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200 hover:border-gray-300 hover:translate-x-0.5 cursor-default">
      <div className="relative flex-shrink-0 w-10 h-14 rounded-sm bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900 opacity-10" />
        <MenuBook sx={{ fontSize: 20, color: "#6b7280" }} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 truncate">
          {title}
        </h4>
        <p className="text-xs text-gray-400 font-light">{author}</p>
      </div>

      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${chipStyle}`}
        >
          {chipLabel}
        </span>
        <p className="text-xs text-gray-400 font-light">{dueDate}</p>
        <button className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-150">
          View
        </button>
      </div>
    </div>
  );
};

export default CurrentLoanCard;
