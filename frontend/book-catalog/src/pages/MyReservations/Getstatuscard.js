export const getStatusColor = (status) => {
  const colors = {
    PENDING: {
      bg: "#eff6ff",
      text: "#3730a3",
      border: "#c7d2fe",
      label: "Pending",
      badgeBg: "#e0e7ff",
    },
    AVAILABLE: {
      bg: "#f0fdf4",
      text: "#15803d",
      border: "#bbf7d0",
      label: "Available",
      badgeBg: "#dcfce7",
    },
    FULFILLED: {
      bg: "#f0f9ff",
      text: "#0369a1",
      border: "#bae6fd",
      label: "Fulfilled",
      badgeBg: "#e0f2fe",
    },
    CANCELLED: {
      bg: "#fafafa",
      text: "#6b7280",
      border: "#e5e7eb",
      label: "Cancelled",
      badgeBg: "#f3f4f6",
    },
    EXPIRED: {
      bg: "#fff7ed",
      text: "#c2410c",
      border: "#fed7aa",
      label: "Expired",
      badgeBg: "#ffedd5",
    },
  };
  return colors[status] || colors.EXPIRED;
};
