import React from "react";
import { MenuBook } from "@mui/icons-material";

const CurrentLoanCard = ({ title, author, dueDate, daysLeft }) => {
  const isUrgent = daysLeft <= 5;

  return (
    <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
      {/* Book Icon */}
      <div
        className="flex items-center justify-center flex-shrink-0 rounded-lg bg-gray-100"
        style={{ minHeight: "52px", minWidth: "44px" }}
      >
        <MenuBook sx={{ fontSize: 24, color: "#374151" }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 truncate">
          {title}
        </h4>
        <p className="text-xs text-gray-500">{author}</p>
      </div>

      {/* Due / Actions */}
      <div className="flex-shrink-0 flex flex-col items-end gap-2">
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{
            background: isUrgent ? "#f3f4f6" : "#f9fafb",
            color: isUrgent ? "#111827" : "#6b7280",
            border: isUrgent ? "1px solid #d1d5db" : "1px solid #f3f4f6",
            fontWeight: isUrgent ? 600 : 500,
          }}
        >
          {isUrgent ? "⚠ " : ""}Due {daysLeft}d
        </span>
        <p className="text-xs text-gray-400">{dueDate}</p>
        <button className="text-xs text-gray-600 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1 hover:bg-gray-200 transition-colors font-medium">
          View
        </button>
      </div>
    </div>
  );
};

export default CurrentLoanCard;
