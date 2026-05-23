import React from "react";
import { MenuBook, AccessAlarm, CheckCircle } from "@mui/icons-material";

export const tabs = [
  {
    label: "All Reservations",
    value: null,
    icon: <MenuBook sx={{ fontSize: 15 }} />,
  },
  {
    label: "Active",
    value: "PENDING",
    icon: <AccessAlarm sx={{ fontSize: 15 }} />,
  },
  {
    label: "Completed",
    value: "FULFILLED",
    icon: <CheckCircle sx={{ fontSize: 15 }} />,
  },
];
