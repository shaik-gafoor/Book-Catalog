import React, { useState } from "react";
import {
  MenuBook,
  PersonOutlined,
  Numbers,
  CalendarToday,
  AssignmentReturn,
  WarningAmberOutlined,
  Refresh,
  KeyboardReturn,
} from "@mui/icons-material";
import { formatDate } from "../../utils/format";

const T = {
  sand: "#f7f6f3",
  white: "#ffffff",
  border: "#ece9e3",
  border2: "#e2ddd8",
  text: "#1c1917",
  text2: "#44403c",
  muted: "#78716c",
  faint: "#a8a29e",
  light: "#f5f4f1",
  radius: "14px",
  radiusSm: "8px",
};

const STATUS_CFG = {
  CHECKED_OUT: {
    label: "Checked Out",
    gradient: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    bg: "#eff6ff",
    border: "#c7d2fe",
    text: "#3730a3",
    dot: "#818cf8",
  },
  ACTIVE: {
    label: "Active",
    gradient: "linear-gradient(135deg,#059669,#0d9488)",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    text: "#15803d",
    dot: "#34d399",
  },
  CURRENT: {
    label: "Active",
    gradient: "linear-gradient(135deg,#059669,#0d9488)",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    text: "#15803d",
    dot: "#34d399",
  },
  OVERDUE: {
    label: "Overdue",
    gradient: "linear-gradient(135deg,#dc2626,#e11d48)",
    bg: "#fff1f2",
    border: "#fecaca",
    text: "#b91c1c",
    dot: "#f87171",
  },
  RETURNED: {
    label: "Returned",
    gradient: "linear-gradient(135deg,#0369a1,#0284c7)",
    bg: "#f0f9ff",
    border: "#bae6fd",
    text: "#0369a1",
    dot: "#38bdf8",
  },
  LOST: {
    label: "Lost",
    gradient: "linear-gradient(135deg,#92400e,#b45309)",
    bg: "#fff7ed",
    border: "#fed7aa",
    text: "#c2410c",
    dot: "#fb923c",
  },
  DAMAGED: {
    label: "Damaged",
    gradient: "linear-gradient(135deg,#64748b,#94a3b8)",
    bg: "#f8fafc",
    border: "#e2e8f0",
    text: "#64748b",
    dot: "#94a3b8",
  },
};

/* ── small action button ── */
const Btn = ({ variant = "outline", onClick, disabled, children }) => {
  const [hov, setHov] = useState(false);
  const base = {
    fontFamily: "inherit",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.05em",
    padding: "7px 14px",
    borderRadius: T.radiusSm,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    opacity: disabled ? 0.4 : 1,
    transition: "background 0.15s, transform 0.12s",
    transform: hov && !disabled ? "translateY(-1px)" : "none",
  };
  const v = {
    outline: {
      ...base,
      background: hov ? T.light : "transparent",
      color: T.text2,
      borderColor: T.border2,
    },
    solid: {
      ...base,
      background: hov ? "#2d2926" : T.text,
      color: T.white,
      borderColor: T.text,
    },
    danger: {
      ...base,
      background: hov ? "#fee2e2" : "transparent",
      color: "#dc2626",
      borderColor: "#fca5a5",
    },
  };
  return (
    <button
      style={v[variant]}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
};

/* ── info box ── */
const InfoBox = ({ label, value, sub }) => (
  <div
    style={{
      background: T.sand,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusSm,
      padding: "10px 12px",
    }}
  >
    <p
      style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: T.faint,
        marginBottom: 4,
      }}
    >
      {label}
    </p>
    <p style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{value}</p>
    {sub && <p style={{ fontSize: 10, color: T.faint, marginTop: 1 }}>{sub}</p>}
  </div>
);

const LoanCard = ({ loan, onRenew, onCheckin, animIndex = 0 }) => {
  const [hov, setHov] = useState(false);
  const cfg = STATUS_CFG[loan.status] || STATUS_CFG.CHECKED_OUT;
  const coverImage = loan.bookCoverImage || loan.coverImageUrl;
  const canAct =
    (loan.status === "CHECKED_OUT" ||
      loan.status === "ACTIVE" ||
      loan.status === "CURRENT" ||
      loan.status === "OVERDUE") &&
    !loan.returnDate;
  const canRenew = canAct && loan.renewalCount < loan.maxRenewals;

  /* Due countdown label */
  const dueBadge = loan.isOverdue
    ? {
        label: `${loan.overdueDays}d overdue`,
        bg: "#fee2e2",
        color: "#b91c1c",
        border: "#fca5a5",
      }
    : loan.remainingDays <= 3 && loan.remainingDays > 0
      ? {
          label: `${loan.remainingDays}d left`,
          bg: "#fff7ed",
          color: "#c2410c",
          border: "#fed7aa",
        }
      : loan.remainingDays > 0
        ? {
            label: `${loan.remainingDays}d left`,
            bg: "#f0fdf4",
            color: "#15803d",
            border: "#bbf7d0",
          }
        : null;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.white,
        border: `1px solid ${hov ? T.border2 : T.border}`,
        borderRadius: T.radius,
        overflow: "hidden",
        boxShadow: hov
          ? "0 10px 36px rgba(0,0,0,0.09)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.22s ease",
        animation: `lcFadeUp 0.38s ease ${Math.min(animIndex * 0.06, 0.5)}s both`,
      }}
    >
      {/* ── Gradient header bar ── */}
      <div
        style={{
          background: cfg.gradient,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            right: -18,
            top: -18,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            pointerEvents: "none",
          }}
        />

        {/* Status pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 999,
            padding: "3px 11px",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#fff",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Due badge */}
        {dueBadge && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.05em",
              padding: "3px 10px",
              borderRadius: 20,
              background: dueBadge.bg,
              color: dueBadge.color,
              border: `1px solid ${dueBadge.border}`,
            }}
          >
            {dueBadge.label}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div
        style={{ padding: "16px", display: "flex", gap: 14 }}
        className="flex-col md:flex-row"
      >
        {/* Cover */}
        <div
          style={{
            width: 72,
            height: 100,
            flexShrink: 0,
            background: T.light,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s",
            transform: hov ? "scale(1.03)" : "scale(1)",
          }}
        >
          {coverImage ? (
            <img
              src={coverImage}
              alt={loan.bookTitle}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <MenuBook sx={{ fontSize: 30, color: "#c4bfb8" }} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + author */}
          <h3
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 16,
              fontWeight: 700,
              color: T.text,
              lineHeight: 1.3,
              marginBottom: 4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {loan.bookTitle}
          </h3>
          <p
            style={{
              fontSize: 12,
              color: T.faint,
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 2,
            }}
          >
            <PersonOutlined sx={{ fontSize: 13, color: T.faint }} />
            {loan.bookAuthor}
          </p>
          {loan.bookIsbn && (
            <p
              style={{
                fontSize: 11,
                color: T.faint,
                display: "flex",
                alignItems: "center",
                gap: 3,
                marginBottom: 12,
              }}
            >
              <Numbers sx={{ fontSize: 12, color: T.faint }} />
              ISBN: {loan.bookIsbn}
            </p>
          )}

          {/* Date info grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            style={{ marginBottom: 14 }}
          >
            <InfoBox
              label="Checked Out"
              value={formatDate(loan.checkoutDate)}
            />
            <InfoBox
              label="Due Date"
              value={formatDate(loan.dueDate)}
              sub={loan.isOverdue ? `${loan.overdueDays}d overdue` : undefined}
            />
            <InfoBox
              label="Renewals"
              value={`${loan.renewalCount} / ${loan.maxRenewals}`}
              sub={canRenew ? "Eligible" : "Max reached"}
            />
            {loan.returnDate ? (
              <InfoBox label="Returned" value={formatDate(loan.returnDate)} />
            ) : loan.fineAmount > 0 ? (
              <InfoBox
                label="Fine"
                value={`₹${loan.fineAmount}`}
                sub={loan.finePaid ? "Paid ✓" : "Unpaid"}
              />
            ) : (
              <InfoBox
                label="Status"
                value={
                  loan.isOverdue
                    ? `${loan.overdueDays}d overdue`
                    : `${loan.remainingDays}d remaining`
                }
              />
            )}
          </div>

          {/* Notes */}
          {loan.notes && (
            <div
              style={{
                background: T.sand,
                border: `1px solid ${T.border}`,
                borderLeft: `3px solid ${cfg.dot}`,
                borderRadius: T.radiusSm,
                padding: "7px 12px",
                marginBottom: 14,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: T.muted,
                  fontStyle: "italic",
                  lineHeight: 1.5,
                }}
              >
                "{loan.notes}"
              </p>
            </div>
          )}

          {/* Overdue fine warning */}
          {loan.isOverdue && loan.fineAmount > 0 && !loan.finePaid && (
            <div
              style={{
                background: "#fff1f2",
                border: "1px solid #fecaca",
                borderRadius: T.radiusSm,
                padding: "8px 12px",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <WarningAmberOutlined sx={{ fontSize: 15, color: "#dc2626" }} />
              <span style={{ fontSize: 12, color: "#b91c1c", fontWeight: 600 }}>
                Outstanding fine: ₹{loan.fineAmount} · Please return the book to
                avoid further charges.
              </span>
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              paddingTop: 12,
              borderTop: `1px solid ${T.border}`,
              justifyContent: "flex-end",
            }}
          >
            {canRenew && onRenew && (
              <Btn variant="outline" onClick={() => onRenew(loan)}>
                <Refresh sx={{ fontSize: 14 }} />
                Renew
              </Btn>
            )}
            {canAct && onCheckin && (
              <Btn variant="solid" onClick={() => onCheckin(loan)}>
                <KeyboardReturn sx={{ fontSize: 14 }} />
                Check In
              </Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCard;
