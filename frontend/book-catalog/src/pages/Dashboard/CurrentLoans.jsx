import React from "react";

const currentLoansData = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    cover: "📘",
    dueDate: "May 20, 2025",
    progress: 65,
    daysLeft: 5,
  },
  {
    id: 2,
    title: "The Alchemist",
    author: "Paulo Coelho",
    cover: "📙",
    dueDate: "May 25, 2025",
    progress: 30,
    daysLeft: 10,
  },
  {
    id: 3,
    title: "Deep Work",
    author: "Cal Newport",
    cover: "📗",
    dueDate: "May 18, 2025",
    progress: 90,
    daysLeft: 3,
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    cover: "📕",
    dueDate: "June 1, 2025",
    progress: 15,
    daysLeft: 17,
  },
];

const CurrentLoanCard = ({
  title,
  author,
  cover,
  dueDate,
  progress,
  daysLeft,
}) => {
  const isUrgent = daysLeft <= 5;

  return (
    <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
      {/* Book Cover */}
      <div
        className="w-12 h-16 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #EAF3DE, #C0DD97)" }}
      >
        {cover}
      </div>

      {/* Book Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 truncate">
          {title}
        </h4>
        <p className="text-xs text-gray-500 mb-2">{author}</p>

        {/* Progress Bar */}
        <div className="relative h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #639922, #97C459)",
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{progress}% read</p>
      </div>

      {/* Due Date Badge */}
      <div className="flex-shrink-0 text-right">
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{
            background: isUrgent ? "#FEF3C7" : "#EAF3DE",
            color: isUrgent ? "#92400E" : "#3B6D11",
          }}
        >
          {isUrgent ? "⚠️ " : ""}Due {daysLeft}d
        </span>
        <p className="text-xs text-gray-400 mt-1">{dueDate}</p>
      </div>
    </div>
  );
};

function CurrentLoans() {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Books You're Currently Reading
      </h3>

      <div className="space-y-3">
        {currentLoansData.map((item) => (
          <CurrentLoanCard
            key={item.id}
            title={item.title}
            author={item.author}
            cover={item.cover}
            dueDate={item.dueDate}
            progress={item.progress}
            daysLeft={item.daysLeft}
          />
        ))}
      </div>
    </div>
  );
}

export default CurrentLoans;
