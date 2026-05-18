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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f9fafb" }}>
      {/* Navbar */}
      <Navbar handleDrawerToggle={handleDrawerToggle} />

      {/* Sidebar */}
      <UserSidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          bgcolor: "#f9fafb",
        }}
      >
        {/* Offset for fixed AppBar */}
        <Toolbar sx={{ minHeight: "60px !important" }} />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default UserLayout;
