import React from "react";

const statusConfig = {
  ACTIVE: {
    label: "Active",
    classes: "bg-green-50 text-green-800 border border-green-200",
  },
  OVERDUE: {
    label: "Overdue",
    classes: "bg-red-50 text-red-800 border border-red-200",
  },
  PENDING: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-800 border border-amber-200",
  },
  READY: {
    label: "Ready for Pickup",
    classes: "bg-blue-50 text-blue-800 border border-blue-200",
  },
};

const GetStatusChip = ({ status }) => {
  const config = statusConfig[status] || {
    label: status,
    classes: "bg-gray-100 text-gray-600 border border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${config.classes}`}
    >
      {config.label}
    </span>
  );
};

export default GetStatusChip;
