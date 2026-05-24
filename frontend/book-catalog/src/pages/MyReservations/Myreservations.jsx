import React, { useEffect, useState } from "react";
import {
  AccessAlarm,
  BookmarkBorder,
  CalendarToday,
  CheckCircle,
  MenuBook,
} from "@mui/icons-material";
// BookmarkBorder kept for empty-state icon below
import MyReservationCard from "./MyReservationCard.jsx";
import {
  cancelReservation,
  fulfillReservation,
  getMyReservations,
} from "../../api/libraryApi";

const TABS = [
  { label: "All", value: null, icon: <MenuBook sx={{ fontSize: 13 }} /> },
  {
    label: "Active",
    value: "PENDING",
    icon: <AccessAlarm sx={{ fontSize: 13 }} />,
  },
  {
    label: "Available",
    value: "AVAILABLE",
    icon: <CalendarToday sx={{ fontSize: 13 }} />,
  },
  {
    label: "Completed",
    value: "FULFILLED",
    icon: <CheckCircle sx={{ fontSize: 13 }} />,
  },
  {
    label: "Cancelled",
    value: "CANCELLED",
    icon: <AccessAlarm sx={{ fontSize: 13 }} />,
  },
  {
    label: "Expired",
    value: "EXPIRED",
    icon: <AccessAlarm sx={{ fontSize: 13 }} />,
  },
];

const STAT_CONFIGS = [
  {
    label: "Total Reservations",
    statusKey: null,
    gradient: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    iconBg: "rgba(255,255,255,0.12)",
    icon: <MenuBook sx={{ fontSize: 20, color: "#fff" }} />,
  },
  {
    label: "Active",
    statusKey: "PENDING",
    gradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    iconBg: "rgba(255,255,255,0.15)",
    icon: <AccessAlarm sx={{ fontSize: 20, color: "#fff" }} />,
  },
  {
    label: "Ready for Pickup",
    statusKey: "AVAILABLE",
    gradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
    iconBg: "rgba(255,255,255,0.15)",
    icon: <CalendarToday sx={{ fontSize: 20, color: "#fff" }} />,
  },
];

const TabBtn = ({ tab, active, count, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        borderRadius: 10,
        border: active ? "1.5px solid #1e293b" : "1.5px solid transparent",
        background: active ? "#1e293b" : hov ? "#f8fafc" : "transparent",
        color: active ? "#ffffff" : hov ? "#334155" : "#94a3b8",
        fontSize: "0.78rem",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.18s ease",
        whiteSpace: "nowrap",
        letterSpacing: "0.01em",
      }}
    >
      <span style={{ display: "flex", opacity: active ? 1 : 0.7 }}>
        {tab.icon}
      </span>
      {tab.label}
      {count > 0 && (
        <span
          style={{
            background: active ? "rgba(255,255,255,0.18)" : "#e2e8f0",
            color: active ? "#fff" : "#475569",
            borderRadius: 999,
            padding: "1px 7px",
            fontSize: "0.65rem",
            fontWeight: 800,
            letterSpacing: "0.02em",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
};

const Banner = ({ type, message, onClose }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "11px 16px",
      marginBottom: 16,
      borderRadius: 12,
      border: `1px solid ${type === "error" ? "#fecaca" : "#a7f3d0"}`,
      background: type === "error" ? "#fef2f2" : "#f0fdf4",
      color: type === "error" ? "#b91c1c" : "#065f46",
      fontSize: "0.82rem",
      fontWeight: 500,
      animation: "fadeUp 0.22s ease both",
    }}
  >
    <span>{message}</span>
    <button
      onClick={onClose}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "inherit",
        fontSize: 15,
        lineHeight: 1,
        flexShrink: 0,
        opacity: 0.7,
      }}
    >
      ✕
    </button>
  </div>
);

const MyReservations = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [gridKey, setGridKey] = useState(0);

  const load = async (tabIdx) => {
    setLoading(true);
    setError("");
    try {
      const status = TABS[tabIdx]?.value;
      const data = await getMyReservations({
        status: status || undefined,
        page: 0,
        size: 50,
      });
      setReservations(data?.content || []);
      setGridKey((k) => k + 1);
    } catch (err) {
      setError(err.message || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(activeTab);
  }, [activeTab]);

  const handleCancel = async (r) => {
    try {
      const res = await cancelReservation(r.id);
      setMessage(res?.message || "Reservation cancelled successfully");
      load(activeTab);
    } catch (err) {
      setError(err.message || "Could not cancel reservation");
    }
  };

  const handleFulfill = async (r) => {
    try {
      const res = await fulfillReservation(r.id);
      setMessage(res?.message || "Reservation fulfilled successfully");
      load(activeTab);
    } catch (err) {
      setError(err.message || "Could not fulfill reservation");
    }
  };

  const tabCounts = TABS.map((t) =>
    t.value === null
      ? reservations.length
      : reservations.filter((r) => r.status === t.value).length,
  );

  const getStatValue = (statusKey) =>
    statusKey === null
      ? reservations.length
      : reservations.filter((r) => r.status === statusKey).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "28px 28px 56px",
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Banners */}
      {error && (
        <Banner type="error" message={error} onClose={() => setError("")} />
      )}
      {message && (
        <Banner
          type="success"
          message={message}
          onClose={() => setMessage("")}
        />
      )}

      {/* ── STAT CARDS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        {STAT_CONFIGS.map((s, i) => (
          <div
            key={i}
            style={{
              background: s.gradient,
              borderRadius: 16,
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              animation: "fadeUp 0.35s ease both",
              animationDelay: `${i * 0.06}s`,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Decorative circle */}
            <div
              style={{
                position: "absolute",
                right: -16,
                top: -16,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <div style={{ position: "relative" }}>
              <p
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.65)",
                  margin: "0 0 5px",
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 900,
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                {getStatValue(s.statusKey)}
              </p>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: s.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── TAB BAR ── */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          padding: "8px 10px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexWrap: "wrap",
          animation: "fadeUp 0.4s ease both",
          animationDelay: "0.18s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {TABS.map((tab, i) => (
          <TabBtn
            key={tab.label}
            tab={tab}
            active={activeTab === i}
            count={tabCounts[i]}
            onClick={() => setActiveTab(i)}
          />
        ))}
      </div>

      {/* Result count pill */}
      {!loading && reservations.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: "0.76rem",
              color: "#64748b",
              fontWeight: 600,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 999,
              padding: "4px 14px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {reservations.length} reservation
            {reservations.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* ── CONTENT ── */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 80,
            gap: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid #e2e8f0",
              borderTop: "3px solid #1e293b",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.82rem",
              fontWeight: 500,
              margin: 0,
            }}
          >
            Loading your reservations…
          </p>
        </div>
      ) : reservations.length > 0 ? (
        <div
          key={gridKey}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 18,
            alignItems: "start",
          }}
        >
          {reservations.map((reservation, idx) => (
            <div
              key={reservation.id}
              style={{
                animation: "fadeUp 0.35s ease both",
                animationDelay: `${Math.min(idx * 0.055, 0.38)}s`,
              }}
            >
              <MyReservationCard
                reservation={reservation}
                onCancel={handleCancel}
                onFulfill={handleFulfill}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            background: "#ffffff",
            border: "1.5px dashed #e2e8f0",
            borderRadius: 18,
            padding: "72px 24px",
            textAlign: "center",
            animation: "fadeUp 0.3s ease both",
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <BookmarkBorder sx={{ fontSize: 30, color: "#cbd5e1" }} />
          </div>
          <p
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#334155",
              margin: "0 0 6px",
              letterSpacing: "-0.01em",
            }}
          >
            No reservations found
          </p>
          <p
            style={{
              fontSize: "0.82rem",
              color: "#94a3b8",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Try a different filter, or browse books to make a reservation.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyReservations;
