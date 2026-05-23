import React from "react";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { LibraryBooks } from "@mui/icons-material";

export const statsConfig = ({ myLoans, reservations, stats }) => [
  {
    id: "loans",
    title: "Current Loans",
    subtitle: "Books you're reading",
    value: myLoans.length,
    icon: <LibraryBooks sx={{ fontSize: 20, color: "#374151" }} />,
    bgColor: "bg-gray-100",
    textColor: "text-gray-900",
    borderColor: "border-gray-200",
  },
  {
    id: "reservations",
    title: "Reservations",
    subtitle: "Books on hold",
    value: reservations?.length || 0,
    icon: <EventAvailableIcon sx={{ fontSize: 20, color: "#374151" }} />,
    bgColor: "bg-gray-100",
    textColor: "text-gray-900",
    borderColor: "border-gray-200",
  },
  {
    id: "read",
    title: "Books Read",
    subtitle: "This year",
    value: myLoans.length,
    icon: <HistoryIcon sx={{ fontSize: 20, color: "#374151" }} />,
    bgColor: "bg-gray-100",
    textColor: "text-gray-900",
    borderColor: "border-gray-200",
  },
  {
    id: "streak",
    title: "Day Streak",
    subtitle: "Keep it going!",
    value: stats.readingStreak,
    icon: <TrendingUpIcon sx={{ fontSize: 20, color: "#374151" }} />,
    bgColor: "bg-gray-100",
    textColor: "text-gray-900",
    borderColor: "border-gray-200",
  },
];
