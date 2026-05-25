import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import {
  ReceiptLong,
  MenuBook,
  AccessAlarm,
  AssignmentReturn,
  ReportProblemOutlined,
  BookmarkBorder,
} from "@mui/icons-material";
import LoanCard from "./LoanCard.jsx";
import { checkinBook, getMyBookLoans, renewBook } from "../../api/libraryApi";

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

/* keyframes */
if (typeof document !== "undefined" && !document.getElementById("loans-kf")) {
  const s = document.createElement("style");
  s.id = "loans-kf";
  s.textContent = `
    @keyframes lcFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes lcSpin    { to{transform:rotate(360deg)} }
  `;
  document.head.appendChild(s);
}

const TABS = [
  { label: "All", value: null, icon: <MenuBook sx={{ fontSize: 13 }} /> },
  {
    label: "Active",
    value: "ACTIVE",
    icon: <MenuBook sx={{ fontSize: 13 }} />,
  },
  {
    label: "Overdue",
    value: "OVERDUE",
    icon: <AccessAlarm sx={{ fontSize: 13 }} />,
  },
  {
    label: "Returned",
    value: "RETURNED",
    icon: <AssignmentReturn sx={{ fontSize: 13 }} />,
  },
  {
    label: "Lost",
    value: "LOST",
    icon: <ReportProblemOutlined sx={{ fontSize: 13 }} />,
  },
  {
    label: "Damaged",
    value: "DAMAGED",
    icon: <BookmarkBorder sx={{ fontSize: 13 }} />,
  },
];

const STAT_CFGS = [
  {
    label: "Total Loans",
    statusKey: null,
    gradient: "linear-gradient(135deg,#1e293b,#334155)",
    icon: <MenuBook sx={{ fontSize: 20, color: "#fff" }} />,
  },
  {
    label: "Active",
    statusKey: "ACTIVE",
    gradient: "linear-gradient(135deg,#059669,#0d9488)",
    icon: <MenuBook sx={{ fontSize: 20, color: "#fff" }} />,
  },
  {
    label: "Overdue",
    statusKey: "OVERDUE",
    gradient: "linear-gradient(135deg,#dc2626,#e11d48)",
    icon: <AccessAlarm sx={{ fontSize: 20, color: "#fff" }} />,
  },
  {
    label: "Returned",
    statusKey: "RETURNED",
    gradient: "linear-gradient(135deg,#0369a1,#0284c7)",
    icon: <AssignmentReturn sx={{ fontSize: 20, color: "#fff" }} />,
  },
];

/* Tab button */
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
        whiteSpace: "nowrap",
        transition: "all 0.18s ease",
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
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
};

/* Toast banner */
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
        opacity: 0.7,
      }}
    >
      ✕
    </button>
  </div>
);

const MyLoans = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [gridKey, setGridKey] = useState(0);

  const load = async (tabIdx) => {
    setLoading(true);
    setError("");
    try {
      const status = TABS[tabIdx]?.value;
      const data = await getMyBookLoans({
        status: status || undefined,
        page: 0,
        size: 50,
      });
      setLoans(data?.content || []);
      setGridKey((k) => k + 1);
    } catch (err) {
      setError(err.message || "Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(activeTab);
  }, [activeTab]);

  const handleRenew = async (loan) => {
    try {
      const res = await renewBook({
        bookLoanId: loan.id,
        extensionDays: 14,
        notes: "Renewed from My Loans",
      });
      setMessage(res?.message || "Loan renewed successfully");
      load(activeTab);
    } catch (err) {
      setError(err.message || "Could not renew loan");
    }
  };

  const handleCheckin = async (loan) => {
    try {
      const res = await checkinBook({
        bookLoanId: loan.id,
        condition: "RETURNED",
        notes: "Checked in from My Loans",
      });
      setMessage(res?.message || "Book checked in successfully");
      load(activeTab);
    } catch (err) {
      setError(err.message || "Could not check in book");
    }
  };

  const getStatVal = (key) =>
    key === null ? loans.length : loans.filter((l) => l.status === key).length;

  const tabCounts = TABS.map((t) =>
    t.value === null
      ? loans.length
      : loans.filter((l) => l.status === t.value).length,
  );

  /* overdue alert */
  const overdueLoans = loans.filter((l) => l.isOverdue);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "28px 28px 56px",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      {/* ── Page heading ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 22,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 4,
            }}
          >
            <ReceiptLong sx={{ fontSize: 22, color: "#334155" }} />
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 26,
                fontWeight: 600,
                color: "#0f172a",
                letterSpacing: "-0.3px",
                margin: 0,
              }}
            >
              My Loans
            </h1>
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            Track checkouts, renew books, and check items back in.
          </p>
        </div>
        {!loading && loans.length > 0 && (
          <span
            style={{
              fontSize: "0.76rem",
              color: "#64748b",
              fontWeight: 600,
              background: T.white,
              border: "1px solid #e2e8f0",
              borderRadius: 999,
              padding: "4px 14px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {loans.length} loan{loans.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Banners ── */}
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

      {/* ── Overdue global alert ── */}
      {overdueLoans.length > 0 && (
        <div
          style={{
            background: "#fff1f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <AccessAlarm sx={{ fontSize: 18, color: "#dc2626" }} />
          <p
            style={{
              fontSize: 12,
              color: "#b91c1c",
              fontWeight: 600,
              margin: 0,
            }}
          >
            You have <strong>{overdueLoans.length}</strong> overdue loan
            {overdueLoans.length > 1 ? "s" : ""}. Please return the books to
            avoid additional fines.
          </p>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        {STAT_CFGS.map((s, i) => (
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
              position: "relative",
              overflow: "hidden",
              animation: `lcFadeUp 0.35s ease ${i * 0.06}s both`,
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -16,
                top: -16,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                pointerEvents: "none",
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
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "2.1rem",
                  fontWeight: 900,
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                {getStatVal(s.statusKey)}
              </p>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                flexShrink: 0,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab bar ── */}
      <div
        style={{
          background: T.white,
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          padding: "8px 10px",
          marginBottom: 22,
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexWrap: "wrap",
          animation: `lcFadeUp 0.4s ease 0.18s both`,
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

      {/* ── Content ── */}
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
              animation: "lcSpin 0.7s linear infinite",
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
            Loading your loans…
          </p>
        </div>
      ) : loans.length > 0 ? (
        <div
          key={gridKey}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {loans.map((loan, idx) => (
            <div
              key={loan.id}
              style={{
                animation: `lcFadeUp 0.35s ease ${Math.min(idx * 0.06, 0.4)}s both`,
              }}
            >
              <LoanCard
                loan={loan}
                animIndex={idx}
                onRenew={handleRenew}
                onCheckin={handleCheckin}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            background: T.white,
            border: "1.5px dashed #e2e8f0",
            borderRadius: 18,
            padding: "72px 24px",
            textAlign: "center",
            animation: `lcFadeUp 0.3s ease both`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg,#f8fafc,#f1f5f9)",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <ReceiptLong sx={{ fontSize: 30, color: "#cbd5e1" }} />
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
            No loans found
          </p>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>
            Try a different filter, or browse books to checkout.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyLoans;
