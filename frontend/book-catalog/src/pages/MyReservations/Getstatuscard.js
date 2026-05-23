export const getStatusColor = (status) => {
  const colors = {
    PENDING: {
      bg: "#fafafa",
      text: "#374151",
      border: "#e5e7eb",
      label: "Pending",
    },
    AVAILABLE: {
      bg: "#f9fafb",
      text: "#111827",
      border: "#d1d5db",
      label: "Available",
    },
    FULFILLED: {
      bg: "#f3f4f6",
      text: "#374151",
      border: "#e5e7eb",
      label: "Fulfilled",
    },
    CANCELLED: {
      bg: "#f9fafb",
      text: "#6b7280",
      border: "#e5e7eb",
      label: "Cancelled",
    },
    EXPIRED: {
      bg: "#f9fafb",
      text: "#9ca3af",
      border: "#e5e7eb",
      label: "Expired",
    },
  };
  return colors[status] || colors.EXPIRED;
};
