import React from "react";
import CurrentLoanCard from "./CurrentLoanCard";

function CurrentLoans({ currentLoansData = [] }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-base font-normal text-gray-900"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Books you're currently reading
        </h3>
        <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
          {currentLoansData.length} active
        </span>
      </div>

      {currentLoansData.length > 0 ? (
        <div className="space-y-2.5">
          {currentLoansData.map((item) => (
            <CurrentLoanCard
              key={item.id}
              title={item.title}
              author={item.author}
              dueDate={item.dueDate}
              daysLeft={item.daysLeft}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400 font-light">
          No current loans to show.
        </div>
      )}
    </div>
  );
}

export default CurrentLoans;
