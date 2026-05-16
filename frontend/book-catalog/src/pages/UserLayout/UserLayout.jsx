import React from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";

const drawerWidth = 240;

const UserLayout = () => {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f9fafb",
      }}
    >
      {/* Sidebar */}
      <UserSidebar />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          p: 3,
          bgcolor: "#f9fafb",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default UserLayout;
