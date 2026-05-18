import React, { useState } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  NotificationsNone as NotificationsIcon,
  PersonOutlined as PersonIcon,
  SettingsOutlined as SettingsIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { navigationItems } from "./navigationItems";

const drawerWidth = 240;

const user = {
  fullName: "John Doe",
  profilePicture: null,
};

const isActive = (path, location) => {
  if (path === "/") return location?.pathname === "/";
  return location?.pathname.startsWith(path);
};

const Navbar = ({ handleDrawerToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const currentPage =
    navigationItems.find((item) => isActive(item.path, location))?.title ||
    "Dashboard";

  const notifications = [
    {
      id: 1,
      text: "Your loan for 'Atomic Habits' is due in 2 days",
      time: "2h ago",
      unread: true,
    },
    {
      id: 2,
      text: "Reservation for 'Deep Work' is ready for pickup",
      time: "5h ago",
      unread: true,
    },
    {
      id: 3,
      text: "New books added to your wishlist category",
      time: "1d ago",
      unread: false,
    },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        bgcolor: "#ffffff",
        color: "#111827",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Toolbar
        sx={{ px: { xs: 2, md: 3 }, gap: 1, minHeight: "60px !important" }}
      >
        {/* Mobile menu toggle */}
        <IconButton
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            display: { md: "none" },
            color: "#374151",
            bgcolor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            p: 0.8,
            mr: 1,
            "&:hover": { bgcolor: "#f3f4f6" },
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>

        {/* Page title */}
        {!searchOpen && (
          <Typography
            variant="subtitle1"
            noWrap
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              fontSize: "1rem",
              color: "#111827",
              letterSpacing: "-0.01em",
            }}
          >
            {currentPage}
          </Typography>
        )}

        {/* Inline search bar */}
        {searchOpen && (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              bgcolor: "#f9fafb",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              px: 1.5,
              py: 0.4,
              mr: 1,
            }}
          >
            <SearchIcon sx={{ color: "#9ca3af", fontSize: 18, mr: 1 }} />
            <InputBase
              autoFocus
              placeholder="Search books, authors..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{ flex: 1, fontSize: "0.875rem", color: "#111827" }}
            />
            <IconButton
              size="small"
              onClick={() => {
                setSearchOpen(false);
                setSearchValue("");
              }}
              sx={{ color: "#9ca3af", p: 0.3 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* Search toggle */}
        {!searchOpen && (
          <Tooltip title="Search">
            <IconButton
              onClick={() => setSearchOpen(true)}
              sx={{
                color: "#6b7280",
                bgcolor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                p: 0.8,
                "&:hover": { bgcolor: "#f3f4f6", color: "#111827" },
              }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            onClick={(e) => setNotifAnchor(e.currentTarget)}
            sx={{
              color: "#6b7280",
              bgcolor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              p: 0.8,
              "&:hover": { bgcolor: "#f3f4f6", color: "#111827" },
            }}
          >
            <Badge
              badgeContent={unreadCount}
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: "#1a1a1a",
                  color: "#fff",
                  fontSize: "0.6rem",
                  minWidth: 16,
                  height: 16,
                },
              }}
            >
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Notifications dropdown */}
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={() => setNotifAnchor(null)}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1.5,
              width: 320,
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              overflow: "hidden",
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #f3f4f6" }}>
            <Typography
              sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}
            >
              Notifications
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af" }}>
              {unreadCount} unread
            </Typography>
          </Box>
          {notifications.map((n) => (
            <Box
              key={n.id}
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
                bgcolor: n.unread ? "#fafafa" : "#fff",
                borderBottom: "1px solid #f9fafb",
                cursor: "pointer",
                "&:hover": { bgcolor: "#f3f4f6" },
              }}
            >
              {n.unread && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#1a1a1a",
                    mt: 0.7,
                    flexShrink: 0,
                  }}
                />
              )}
              {!n.unread && <Box sx={{ width: 6, flexShrink: 0 }} />}
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    color: "#374151",
                    lineHeight: 1.4,
                  }}
                >
                  {n.text}
                </Typography>
                <Typography
                  sx={{ fontSize: "0.68rem", color: "#9ca3af", mt: 0.3 }}
                >
                  {n.time}
                </Typography>
              </Box>
            </Box>
          ))}
          <Box sx={{ px: 2, py: 1.2, textAlign: "center" }}>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#6b7280",
                cursor: "pointer",
                fontWeight: 500,
                "&:hover": { color: "#111827" },
              }}
            >
              View all notifications
            </Typography>
          </Box>
        </Menu>

        {/* Avatar */}
        <Tooltip title="Account">
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ ml: 0.5, p: 0.5 }}
          >
            <Avatar
              src={user?.profilePicture}
              sx={{
                width: 34,
                height: 34,
                bgcolor: "#1a1a1a",
                fontSize: "0.8rem",
                fontWeight: 600,
                border: "2px solid #e5e7eb",
              }}
            >
              {user?.fullName?.charAt(0)}
            </Avatar>
          </IconButton>
        </Tooltip>

        {/* Profile dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1.5,
              width: 200,
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              overflow: "hidden",
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #f3f4f6" }}>
            <Typography
              sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}
            >
              {user.fullName}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af" }}>
              Member
            </Typography>
          </Box>
          <MenuItem
            onClick={() => {
              navigate("/profile");
              setAnchorEl(null);
            }}
            sx={{
              py: 1.2,
              px: 2,
              fontSize: "0.82rem",
              color: "#374151",
              "&:hover": { bgcolor: "#f9fafb" },
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" sx={{ color: "#6b7280" }} />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate("/settings");
              setAnchorEl(null);
            }}
            sx={{
              py: 1.2,
              px: 2,
              fontSize: "0.82rem",
              color: "#374151",
              "&:hover": { bgcolor: "#f9fafb" },
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: "#6b7280" }} />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider sx={{ borderColor: "#f3f4f6" }} />
          <MenuItem
            onClick={() => {
              console.log("logout");
              setAnchorEl(null);
            }}
            sx={{
              py: 1.2,
              px: 2,
              fontSize: "0.82rem",
              color: "#374151",
              "&:hover": { bgcolor: "#f9fafb" },
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: "#6b7280" }} />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
