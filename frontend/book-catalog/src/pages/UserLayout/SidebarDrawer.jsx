import React from "react";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Avatar,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { MenuBook, Logout } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { navigationItems, secondaryItems } from "./navigationItems";

const SidebarDrawer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleChangePath = (path) => navigate(path);

  const handleLogout = () => console.log("logout");

  const NavButton = ({ item }) => {
    const active = isActive(item.path);
    return (
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <Tooltip title={item.description || ""} placement="right" arrow>
          <ListItemButton
            onClick={() => handleChangePath(item.path)}
            sx={{
              borderRadius: "10px",
              py: 1.2,
              px: 2,
              mx: 1,
              transition: "all 0.2s ease",
              position: "relative",
              bgcolor: active ? "#1a1a1a" : "transparent",
              border: active
                ? "1px solid rgba(0,0,0,0.08)"
                : "1px solid transparent",
              "&:hover": {
                bgcolor: active ? "#1a1a1a" : alpha("#000000", 0.05),
                transform: "translateX(3px)",
              },
              "&::before": active
                ? {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: "55%",
                    borderRadius: "0 3px 3px 0",
                    background: "#1a1a1a",
                  }
                : {},
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 36,
                color: active ? "#ffffff" : "#6b7280",
                transition: "color 0.2s ease",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              sx={{
                "& .MuiListItemText-primary": {
                  fontSize: "0.85rem",
                  fontWeight: active ? 600 : 500,
                  color: active ? "#ffffff" : "#374151",
                  letterSpacing: "0.01em",
                },
              }}
            />
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        color: "#1a1a1a",
        position: "relative",
        borderRight: "1px solid #e5e7eb",
      }}
    >
      {/* Logo / Brand */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: "#1a1a1a",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          }}
        >
          <MenuBook sx={{ fontSize: 20, color: "#ffffff" }} />
        </Avatar>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "#111827",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            BookCatalog
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#9ca3af",
              fontWeight: 500,
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Library Hub
          </Typography>
        </Box>
      </Box>

      {/* Main Nav */}
      <Box sx={{ flex: 1, overflowY: "auto", pt: 1.5 }}>
        <Typography
          variant="caption"
          sx={{
            px: 3,
            pb: 0.5,
            display: "block",
            color: "#d1d5db",
            fontWeight: 600,
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Main Menu
        </Typography>

        <List disablePadding>
          {navigationItems.map((item, index) => (
            <NavButton key={index} item={item} />
          ))}
        </List>

        <Divider sx={{ my: 2, mx: 2, borderColor: "#f3f4f6" }} />

        <Typography
          variant="caption"
          sx={{
            px: 3,
            pb: 0.5,
            display: "block",
            color: "#d1d5db",
            fontWeight: 600,
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Account
        </Typography>

        <List disablePadding>
          {secondaryItems.map((item, index) => (
            <NavButton key={index} item={item} />
          ))}
        </List>
      </Box>

      {/* Logout + Footer */}
      <Box sx={{ px: 2, py: 2, borderTop: "1px solid #f3f4f6" }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: "10px",
            py: 1.2,
            px: 2,
            bgcolor: "#fafafa",
            border: "1px solid #e5e7eb",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: "#1a1a1a",
              borderColor: "#1a1a1a",
              "& .MuiListItemIcon-root": { color: "#ffffff" },
              "& .MuiListItemText-primary": { color: "#ffffff" },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: "#6b7280",
              transition: "color 0.2s ease",
            }}
          >
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            sx={{
              "& .MuiListItemText-primary": {
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "#374151",
                transition: "color 0.2s ease",
              },
            }}
          />
        </ListItemButton>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color: "#d1d5db",
            fontSize: "0.65rem",
            mt: 1.5,
            letterSpacing: "0.02em",
          }}
        >
          © 2026 BookCatalog. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default SidebarDrawer;
