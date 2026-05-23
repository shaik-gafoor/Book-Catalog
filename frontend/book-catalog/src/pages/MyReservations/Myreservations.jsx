import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  BookmarkBorder,
  AccessAlarm,
  CalendarToday,
  MenuBook,
} from "@mui/icons-material";
import MyReservationCard from "./Myreservationcard.jsx";
import {
  cancelReservation,
  fulfillReservation,
  getMyReservations,
} from "../../api/libraryApi";

const tabs = [
  { label: "All", value: null, icon: <MenuBook sx={{ fontSize: 15 }} /> },
  {
    label: "Active",
    value: "PENDING",
    icon: <AccessAlarm sx={{ fontSize: 15 }} />,
  },
  {
    label: "Available",
    value: "AVAILABLE",
    icon: <CalendarToday sx={{ fontSize: 15 }} />,
  },
  {
    label: "Completed",
    value: "FULFILLED",
    icon: <MenuBook sx={{ fontSize: 15 }} />,
  },
  {
    label: "Cancelled",
    value: "CANCELLED",
    icon: <AccessAlarm sx={{ fontSize: 15 }} />,
  },
  {
    label: "Expired",
    value: "EXPIRED",
    icon: <AccessAlarm sx={{ fontSize: 15 }} />,
  },
];

const MyReservations = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadReservations = async () => {
      setLoading(true);
      setError("");
      try {
        const status = tabs[activeTab]?.value;
        const data = await getMyReservations({
          status: status || undefined,
          page: 0,
          size: 50,
        });
        setReservations(data?.content || []);
      } catch (err) {
        setError(err.message || "Failed to load reservations");
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, [activeTab]);

  const handleCancel = async (reservation) => {
    try {
      const res = await cancelReservation(reservation.id);
      setMessage(res?.message || "Reservation cancelled");
      const data = await getMyReservations({
        status: tabs[activeTab]?.value || undefined,
        page: 0,
        size: 50,
      });
      setReservations(data?.content || []);
    } catch (err) {
      setError(err.message || "Could not cancel reservation");
    }
  };

  const handleFulfill = async (reservation) => {
    try {
      const res = await fulfillReservation(reservation.id);
      setMessage(res?.message || "Reservation fulfilled");
      const data = await getMyReservations({
        status: tabs[activeTab]?.value || undefined,
        page: 0,
        size: 50,
      });
      setReservations(data?.content || []);
    } catch (err) {
      setError(err.message || "Could not fulfill reservation");
    }
  };

  const state = {
    total: reservations.length,
    active: reservations.filter((r) => r.status === "PENDING").length,
    available: reservations.filter((r) => r.status === "AVAILABLE").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BookmarkBorder sx={{ fontSize: 22, color: "#374151" }} />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            My Reservations
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Track reservations, pickup windows, and queue positions.
        </p>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Reservations",
            value: state.total,
            icon: <MenuBook sx={{ fontSize: 22, color: "#374151" }} />,
          },
          {
            label: "Active Reservations",
            value: state.active,
            icon: <AccessAlarm sx={{ fontSize: 22, color: "#374151" }} />,
          },
          {
            label: "Ready to Pickup",
            value: state.available,
            icon: <CalendarToday sx={{ fontSize: 22, color: "#374151" }} />,
          },
        ].map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-sm transition-shadow duration-200"
          >
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                {card.label}
              </p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">{card.icon}</div>
          </div>
        ))}
      </div>

      <Card
        elevation={0}
        sx={{
          mb: 4,
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "#f3f4f6", px: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            sx={{
              "& .MuiTab-root": {
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#6b7280",
                textTransform: "none",
                minHeight: 44,
                px: 2,
              },
              "& .MuiTab-root.Mui-selected": {
                color: "#111827",
                fontWeight: 600,
              },
              "& .MuiTabs-indicator": { backgroundColor: "#1a1a1a", height: 2 },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.label}
                label={tab.label}
                iconPosition="start"
                icon={tab.icon}
              />
            ))}
          </Tabs>
        </Box>
      </Card>

      {loading ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={28} />
        </Box>
      ) : reservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservations.map((reservation) => (
            <MyReservationCard
              key={reservation.id}
              reservation={reservation}
              onCancel={handleCancel}
              onFulfill={handleFulfill}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Typography sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
            No reservations found for this filter.
          </Typography>
        </div>
      )}
    </div>
  );
};

export default MyReservations;
