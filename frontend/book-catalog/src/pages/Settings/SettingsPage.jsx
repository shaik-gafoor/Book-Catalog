import React, { useState } from "react";
import { Box, Card, Divider, Switch, Typography } from "@mui/material";
import {
  Settings,
  Logout,
  PersonOutlined,
  NotificationsNone,
  LockOutlined,
  ChevronRight,
  EmailOutlined,
  CalendarTodayOutlined,
  NotificationAddOutlined,
} from "@mui/icons-material";
import { clearAuthSession, getAuthUser } from "../../api/libraryApi";

const SettingsPage = () => {
  const user = getAuthUser();
  const [emailNotif, setEmailNotif] = useState(true);
  const [dueDateReminder, setDueDateReminder] = useState(true);
  const [reservationAlerts, setReservationAlerts] = useState(false);

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/auth";
  };

  const initial = (user?.fullName || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  const ToggleSwitch = ({ checked, onChange }) => (
    <Switch
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      size="small"
      sx={{
        "& .MuiSwitch-switchBase.Mui-checked": { color: "#1a1a1a" },
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
          bgcolor: "#1a1a1a",
        },
        "& .MuiSwitch-track": { bgcolor: "#e5e7eb", opacity: "1 !important" },
      }}
    />
  );

  const SectionLabel = ({ icon, title }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
      <Box sx={{ color: "#9ca3af", display: "flex" }}>{icon}</Box>
      <Typography
        sx={{
          fontSize: "0.68rem",
          fontWeight: 700,
          color: "#9ca3af",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  const RowItem = ({ icon, label, description, action, last = false }) => (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          px: 0.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography
              sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}
            >
              {label}
            </Typography>
            {description && (
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  mt: 0.3,
                  lineHeight: 1.4,
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ flexShrink: 0, ml: 3 }}>{action}</Box>
      </Box>
      {!last && <Divider sx={{ borderColor: "#f5f5f5" }} />}
    </>
  );

  const cardSx = {
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    p: "28px 32px",
    mb: 3,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
    transition: "box-shadow 0.25s ease",
    "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.07)" },
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 960, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <Settings sx={{ fontSize: 24, color: "#374151" }} />
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            Settings
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "0.875rem", color: "#9ca3af" }}>
          Manage your account, notifications, and session preferences.
        </Typography>
      </Box>

      {/* ACCOUNT CARD */}
      <Card elevation={0} sx={cardSx}>
        <SectionLabel
          icon={<PersonOutlined sx={{ fontSize: 15 }} />}
          title="Account"
        />

        {/* Profile Hero */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            p: "20px 24px",
            bgcolor: "#f9fafb",
            borderRadius: "14px",
            border: "1px solid #f3f4f6",
            mb: 3,
          }}
        >
          {/* Avatar */}
          <Box sx={{ position: "relative", flexShrink: 0 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: "#111827",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
              }}
            >
              <Typography
                sx={{ color: "#fff", fontWeight: 800, fontSize: "1.5rem" }}
              >
                {initial}
              </Typography>
            </Box>
            {/* Online dot */}
            <Box
              sx={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 14,
                height: 14,
                borderRadius: "50%",
                bgcolor: "#22c55e",
                border: "2.5px solid #f9fafb",
              }}
            />
          </Box>

          {/* User info */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              {user?.fullName || "Unknown User"}
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#9ca3af", mt: 0.4 }}>
              {user?.email || "No session data"}
            </Typography>
            <Box
              sx={{
                display: "inline-block",
                mt: 1.2,
                px: 1.5,
                py: 0.3,
                bgcolor: "#111827",
                borderRadius: "20px",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "0.06em",
                }}
              >
                {(user?.role || "MEMBER").replace("ROLE_", "")}
              </Typography>
            </Box>
          </Box>

          {/* Quick stats */}
          <Box
            sx={{ display: { xs: "none", sm: "flex" }, gap: 3, flexShrink: 0 }}
          >
            {[
              { label: "Loans", value: "3" },
              { label: "Reserved", value: "2" },
            ].map((s) => (
              <Box key={s.label} sx={{ textAlign: "center" }}>
                <Typography
                  sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#111827" }}
                >
                  {s.value}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.68rem",
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#f5f5f5", mb: 0.5 }} />

        <RowItem
          icon={<PersonOutlined sx={{ fontSize: 17, color: "#6b7280" }} />}
          label="Full Name"
          description={user?.fullName || "—"}
          action={<ChevronRight sx={{ fontSize: 20, color: "#d1d5db" }} />}
        />
        <RowItem
          icon={<EmailOutlined sx={{ fontSize: 17, color: "#6b7280" }} />}
          label="Email Address"
          description={user?.email || "—"}
          action={<ChevronRight sx={{ fontSize: 20, color: "#d1d5db" }} />}
          last
        />
      </Card>

      {/* NOTIFICATIONS CARD */}
      <Card elevation={0} sx={cardSx}>
        <SectionLabel
          icon={<NotificationsNone sx={{ fontSize: 15 }} />}
          title="Notifications"
        />

        <RowItem
          icon={<EmailOutlined sx={{ fontSize: 17, color: "#6b7280" }} />}
          label="Email Notifications"
          description="Receive loan updates and alerts via email"
          action={
            <ToggleSwitch checked={emailNotif} onChange={setEmailNotif} />
          }
        />
        <RowItem
          icon={
            <CalendarTodayOutlined sx={{ fontSize: 17, color: "#6b7280" }} />
          }
          label="Due Date Reminders"
          description="Get reminded 2 days before a book is due"
          action={
            <ToggleSwitch
              checked={dueDateReminder}
              onChange={setDueDateReminder}
            />
          }
        />
        <RowItem
          icon={
            <NotificationAddOutlined sx={{ fontSize: 17, color: "#6b7280" }} />
          }
          label="Reservation Alerts"
          description="Notify when a reserved book becomes available"
          action={
            <ToggleSwitch
              checked={reservationAlerts}
              onChange={setReservationAlerts}
            />
          }
          last
        />
      </Card>

      {/* SECURITY CARD */}
      <Card elevation={0} sx={cardSx}>
        <SectionLabel
          icon={<LockOutlined sx={{ fontSize: 15 }} />}
          title="Security"
        />

        <RowItem
          icon={<LockOutlined sx={{ fontSize: 17, color: "#6b7280" }} />}
          label="Active Session"
          description="You are currently signed in to BookCatalog"
          action={
            <button
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 10,
                background: "#111827",
                padding: "8px 16px",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s, transform 0.1s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#374151")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#111827")}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.96)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Logout sx={{ fontSize: 14 }} />
              Sign Out
            </button>
          }
          last
        />
      </Card>

      {/* Footer */}
      <Box sx={{ textAlign: "center", pb: 5 }}>
        <Typography sx={{ fontSize: "0.68rem", color: "#d1d5db" }}>
          © 2026 BookCatalog · All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default SettingsPage;
