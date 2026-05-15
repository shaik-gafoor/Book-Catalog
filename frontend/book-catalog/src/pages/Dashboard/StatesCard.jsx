import React from "react";

function StatesCard({
  bgColor = "bg-gray-100",
  textColor = "text-gray-700",
  borderColor = "border-gray-200",
  icon,
  value,
  title,
  subtitle,
}) {
  return (
    <div
      className={`bg-white rounded-xl border ${borderColor} p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-lg ${bgColor}`}>{icon}</div>
        <span className={`text-2xl font-bold tabular-nums ${textColor}`}>
          {value}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default StatesCard;
