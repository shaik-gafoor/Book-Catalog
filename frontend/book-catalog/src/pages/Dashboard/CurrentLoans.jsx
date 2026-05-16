import React from "react";
import CurrentLoanCard from "./CurrentLoanCard";

const currentLoansData = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    dueDate: "May 20, 2025",
    daysLeft: 5,
  },
  {
    id: 2,
    title: "The Alchemist",
    author: "Paulo Coelho",
    dueDate: "May 25, 2025",
    daysLeft: 10,
  },
  {
    id: 3,
    title: "Deep Work",
    author: "Cal Newport",
    dueDate: "May 18, 2025",
    daysLeft: 3,
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    dueDate: "June 1, 2025",
    daysLeft: 17,
  },
];

function CurrentLoans() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Books you're currently reading
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
          {currentLoansData.length} active
        </span>
      </div>

      <div className="space-y-3">
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
    </div>
  );
}

export default CurrentLoans;
