import React, { useState } from "react";
import { MenuBook } from "@mui/icons-material";
import { getStatusColor } from "./Getstatuscard";
import { formatDateTime } from "../../utils/format";

const STATUS_CFG = {
  PENDING: {
    label: "Pending",
    color: "#4f46e5",
    gradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    lightBg: "#f5f3ff",
    border: "#ddd6fe",
    softColor: "#ede9fe",
    icon: "⏳",
    dot: "#a78bfa",
  },
  AVAILABLE: {
    label: "Available",
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
    lightBg: "#f0fdf4",
    border: "#a7f3d0",
    softColor: "#d1fae5",
    icon: "📗",
    dot: "#34d399",
  },
  FULFILLED: {
    label: "Fulfilled",
    color: "#0369a1",
    gradient: "linear-gradient(135deg, #0369a1 0%, #0284c7 100%)",
    lightBg: "#f0f9ff",
    border: "#bae6fd",
    softColor: "#e0f2fe",
    icon: "✅",
    dot: "#38bdf8",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#64748b",
    gradient: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)",
    lightBg: "#f8fafc",
    border: "#e2e8f0",
    softColor: "#f1f5f9",
    icon: "✕",
    dot: "#94a3b8",
  },
  EXPIRED: {
    label: "Expired",
    color: "#dc2626",
    gradient: "linear-gradient(135deg, #dc2626 0%, #e11d48 100%)",
    lightBg: "#fff1f2",
    border: "#fecaca",
    softColor: "#fee2e2",
    icon: "⚠",
    dot: "#f87171",
  },
};

const Myreservationcard = ({ reservation, onCancel, onFulfill }) => {
  const cfg = STATUS_CFG[reservation.status] || STATUS_CFG.EXPIRED;
  const [hov, setHov] = useState(false);
  const [cancelHov, setCancelHov] = useState(false);
  const [fulfillHov, setFulfillHov] = useState(false);

  const timelineRows = [
    {
      label: "Reserved On",
      value: reservation.reservedAt,
      always: true,
      color: "#64748b",
      dot: "#94a3b8",
    },
    {
      label: "Available From",
      value: reservation.availableAt,
      always: false,
      color: STATUS_CFG.AVAILABLE.color,
      dot: STATUS_CFG.AVAILABLE.dot,
    },
    {
      label: "Fulfilled At",
      value: reservation.fulfilledAt,
      always: false,
      color: STATUS_CFG.FULFILLED.color,
      dot: STATUS_CFG.FULFILLED.dot,
    },
    {
      label: "Cancelled At",
      value: reservation.cancelledAt,
      always: false,
      color: STATUS_CFG.CANCELLED.color,
      dot: STATUS_CFG.CANCELLED.dot,
    },
  ].filter((r) => r.always || r.value);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        background: "#ffffff",
        border: `1px solid ${hov ? cfg.border : "#e8edf2"}`,
        boxShadow: hov
          ? `0 8px 24px rgba(0,0,0,0.09), 0 0 0 2px ${cfg.color}18`
          : "0 1px 3px rgba(0,0,0,0.06)",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.22s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          background: cfg.gradient,
          padding: "10px 14px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -14,
            top: -14,
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            pointerEvents: "none",
          }}
        />

        {/* Status pill + queue */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(255,255,255,0.2)",
              borderRadius: 999,
              padding: "2px 8px",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <span style={{ fontSize: 9 }}>{cfg.icon}</span>
            <span
              style={{
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: "#fff",
                textTransform: "uppercase",
              }}
            >
              {cfg.label}
            </span>
          </div>
          {reservation.queuePosition > 0 && (
            <span
              style={{
                fontSize: "0.58rem",
                fontWeight: 700,
                color: "#fff",
                background: "rgba(0,0,0,0.18)",
                borderRadius: 999,
                padding: "2px 8px",
              }}
            >
              Queue #{reservation.queuePosition}
            </span>
          )}
        </div>

        {/* Icon + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MenuBook sx={{ fontSize: 16, color: "#ffffff" }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: "0.55rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 1px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Book #{reservation.bookId}
            </p>
            <h3
              style={{
                fontSize: "0.86rem",
                fontWeight: 800,
                color: "#ffffff",
                margin: 0,
                lineHeight: 1.2,
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {reservation.bookTitle}
            </h3>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div
        style={{
          padding: "10px 14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Author chip */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: cfg.softColor,
            border: `1px solid ${cfg.border}`,
            borderRadius: 999,
            padding: "2px 9px",
            marginBottom: 8,
            alignSelf: "flex-start",
            maxWidth: "100%",
          }}
        >
          <span style={{ fontSize: 9, flexShrink: 0 }}>👤</span>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: cfg.color,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {reservation.bookAuthor}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#f1f5f9", marginBottom: 8 }} />

        {/* Timeline — compact inline rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {timelineRows.map((row) => (
            <div
              key={row.label}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              {/* Dot */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: row.dot,
                  flexShrink: 0,
                  boxShadow: `0 0 0 2px ${row.dot}2a`,
                }}
              />
              {/* Label + value inline */}
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: row.color,
                  flexShrink: 0,
                  minWidth: 76,
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  color: "#1e293b",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {formatDateTime(row.value)}
              </span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {reservation.notes && (
          <div
            style={{
              marginTop: 8,
              padding: "6px 10px",
              borderRadius: 7,
              background: cfg.lightBg,
              border: `1px solid ${cfg.border}`,
              borderLeft: `3px solid ${cfg.color}`,
            }}
          >
            <p
              style={{
                fontSize: "0.68rem",
                color: "#64748b",
                fontStyle: "italic",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              "{reservation.notes}"
            </p>
          </div>
        )}

        {/* Action buttons */}
        {(reservation.canBeCancelled || reservation.status === "AVAILABLE") && (
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {reservation.canBeCancelled && onCancel && (
              <button
                onClick={() => onCancel(reservation)}
                onMouseEnter={() => setCancelHov(true)}
                onMouseLeave={() => setCancelHov(false)}
                style={{
                  flex: 1,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "7px 0",
                  borderRadius: 8,
                  border: "1.5px solid #e2e8f0",
                  background: cancelHov ? "#f8fafc" : "#ffffff",
                  color: "#475569",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Cancel Reservation
              </button>
            )}
            {reservation.status === "AVAILABLE" && onFulfill && (
              <button
                onClick={() => onFulfill(reservation)}
                onMouseEnter={() => setFulfillHov(true)}
                onMouseLeave={() => setFulfillHov(false)}
                style={{
                  flex: 1,
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  padding: "7px 0",
                  borderRadius: 8,
                  border: "none",
                  background: cfg.gradient,
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: `0 3px 8px ${cfg.color}35`,
                }}
              >
                📦 Pickup Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Myreservationcard;
