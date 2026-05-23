import React from "react";
import {
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  LibraryAdd as LibraryAddIcon,
  EventNote as EventNoteIcon,
  CardMembership as CardMembershipIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";

export const navigationItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: <DashboardIcon fontSize="small" />,
    description: "Overview & Stats",
  },
  {
    title: "Browse Books",
    path: "/books",
    icon: <MenuBookIcon fontSize="small" />,
    description: "Explore Library",
  },
  {
    title: "Add Book",
    path: "/add-book",
    icon: <LibraryAddIcon fontSize="small" />,
    description: "Upload a new title",
  },
  {
    title: "My Loans",
    path: "/my-loans",
    icon: <EventNoteIcon fontSize="small" />,
    description: "Active & History",
    badge: "loans",
  },
  {
    title: "My Reservations",
    path: "/my-reservations",
    icon: <EventNoteIcon fontSize="small" />,
    description: "Upcoming Reservations",
    badge: "reservations",
  },
  {
    title: "My Fines",
    path: "/my-fines",
    icon: <ReceiptIcon fontSize="small" />,
    description: "Pending & Paid",
    badge: "fines",
  },
  {
    title: "Subscription",
    path: "/subscriptions",
    icon: <CardMembershipIcon fontSize="small" />,
    description: "Manage Plans",
    badge: "subscription",
  },
  {
    title: "Wishlist",
    path: "/wishlist",
    icon: <FavoriteIcon fontSize="small" />,
    description: "Saved Books",
  },
];

export const secondaryItems = [
  {
    title: "Profile",
    path: "/profile",
    icon: <PersonIcon fontSize="small" />,
    description: "Your Account",
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <SettingsIcon fontSize="small" />,
    description: "Preferences",
  },
];
