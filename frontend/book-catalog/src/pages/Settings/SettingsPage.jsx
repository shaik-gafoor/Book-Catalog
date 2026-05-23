import React from "react";
import { Alert, Card, Typography } from "@mui/material";
import { Logout, Settings } from "@mui/icons-material";
import { clearAuthSession, getAuthUser } from "../../api/libraryApi";

const SettingsPage = () => {
  const user = getAuthUser();

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings sx={{ fontSize: 22, color: "#374151" }} />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Settings
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Session controls and lightweight app preferences.
        </p>
      </div>

      <Alert severity="info" sx={{ mb: 2 }}>
        This screen is intentionally minimal. Backend preferences endpoints are
        not exposed in the current API set.
      </Alert>

      <Card
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid #e5e7eb",
          borderRadius: 3,
          maxWidth: 720,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ color: "#6b7280", fontWeight: 700, mb: 1 }}
        >
          Signed in as
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {user?.fullName || user?.email || "Unknown user"}
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 3 }}>
          {user?.email || "No session data"}
        </Typography>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-700"
        >
          <Logout sx={{ fontSize: 14 }} /> Logout
        </button>
      </Card>
    </div>
  );
};

export default SettingsPage;
