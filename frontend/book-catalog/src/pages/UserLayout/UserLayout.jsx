import React, { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import Navbar from "./Navbar";

const drawerWidth = 240;

const UserLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        bgcolor: "#f9fafb",
      }}
    >
      {/* Navbar */}
      <Navbar handleDrawerToggle={handleDrawerToggle} />

      {/* Sidebar */}
      <UserSidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Main content wrapper */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f9fafb",
          overflow: "hidden",
        }}
      >
        {/* Offset for fixed AppBar */}
        <Toolbar sx={{ minHeight: "60px !important", flexShrink: 0 }} />

        {/* Strictly confined content viewport */}
        <Box sx={{ flexGrow: 1, height: "calc(100vh - 60px)", width: "100%" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default UserLayout;
