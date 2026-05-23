import React, { useEffect, useState } from "react";
import { Alert, Box, Card, CircularProgress, Typography } from "@mui/material";
import { Person } from "@mui/icons-material";
import { getProfile } from "../../api/libraryApi";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getProfile();
        const value = Array.isArray(data) ? data[0] : data;
        setProfile(value || null);
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Person sx={{ fontSize: 22, color: "#374151" }} />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Profile
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Your account details from the backend profile API.
        </p>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={28} />
        </Box>
      ) : profile ? (
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
            variant="overline"
            sx={{ color: "#6b7280", letterSpacing: 1.2 }}
          >
            Account
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            {profile.fullName}
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <p>Email: {profile.email}</p>
            <p>Role: {profile.role}</p>
            <p>Phone: {profile.phone || "-"}</p>
            <p>Provider: {profile.authProvider}</p>
            <p>Created: {profile.createdAt || "-"}</p>
            <p>Updated: {profile.updatedAt || "-"}</p>
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Typography sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
            No profile data available.
          </Typography>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
