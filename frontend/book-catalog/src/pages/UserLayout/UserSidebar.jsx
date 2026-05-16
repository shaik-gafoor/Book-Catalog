import React from "react";
import { Box, Drawer } from "@mui/material";
import SidebarDrawer from "./SidebarDrawer";

const drawerWidth = 240;

const UserSidebar = () => {
  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: "none",
            boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
          },
        }}
        open
      >
        <SidebarDrawer />
      </Drawer>
    </Box>
  );
};

export default UserSidebar;
