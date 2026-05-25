import React, { useEffect, useMemo, useState } from "react";
import { CircularProgress, Typography } from "@mui/material";
import {
  ReceiptLong,
  MenuBook,
  AccessAlarm,
  AssignmentReturn,
  PeopleAlt,
} from "@mui/icons-material";
import LoanCard from "./LoanCard.jsx";
import {
  checkinBook,
  getActiveSubscription,
  getAuthUser,
  getMyBookLoans,
  searchBookLoans,
  renewBook,
} from "../../api/libraryApi";

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
    label: "Pending",
    value: "PENDING",
    icon: <MenuBook sx={{ fontSize: 13 }} />,
  },
  {
    label: "Active",
    value: "ACTIVE",
    icon: <AccessAlarm sx={{ fontSize: 13 }} />,
  },
  {
    label: "Completed",
    value: "COMPLETED",
    icon: <AssignmentReturn sx={{ fontSize: 13 }} />,
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
    label: "Pending",
    statusKey: "PENDING",
    gradient: "linear-gradient(135deg,#059669,#0d9488)",
    icon: <MenuBook sx={{ fontSize: 20, color: "#fff" }} />,
  },
  {
    label: "Active",
    statusKey: "ACTIVE",
    gradient: "linear-gradient(135deg,#dc2626,#e11d48)",
    icon: <AccessAlarm sx={{ fontSize: 20, color: "#fff" }} />,
  },
  {
    label: "Completed",
    statusKey: "COMPLETED",
    gradient: "linear-gradient(135deg,#0369a1,#0284c7)",
    icon: <AssignmentReturn sx={{ fontSize: 20, color: "#fff" }} />,
  },
];

const STATUS_GROUPS = {
  PENDING: ["CHECKED_OUT", "CURRENT"],
  ACTIVE: ["ACTIVE", "OVERDUE"],
  COMPLETED: ["RETURNED"],
};

const STATUS_LABELS = {
  CHECKED_OUT: "Pending",
  CURRENT: "Pending",
  ACTIVE: "Active",
  OVERDUE: "Active",
  RETURNED: "Completed",
  LOST: "Lost",
  DAMAGED: "Damaged",
};

const matchesLoanGroup = (loan, group) => {
  if (!group) {
    return true;
  }
  const statuses = STATUS_GROUPS[group] || [group];
  return statuses.includes(String(loan.status || "").toUpperCase());
};

const getStatusLabel = (status) =>
  STATUS_LABELS[String(status || "").toUpperCase()] ||
  String(status || "Unknown");

const getStatusTone = (status) => {
  const normalized = String(status || "").toUpperCase();
  if (["CHECKED_OUT", "CURRENT"].includes(normalized)) return "amber";
  if (["ACTIVE", "OVERDUE"].includes(normalized)) return "red";
  if (normalized === "RETURNED") return "green";
  return "slate";
};

const FREE_SUBSCRIPTION = {
  planCode: "FREE",
  maxRenewalsPerBook: 0,
};

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

const RecordList = ({ title, items, renderItem, emptyText }) => (
  <div
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: 16,
      background: T.white,
    }}
  >
    <p
      style={{
        fontSize: 14,
        fontWeight: 800,
        color: "#0f172a",
        margin: "0 0 12px",
      }}
    >
      {title}
    </p>
    {items.length === 0 ? (
      <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
        {emptyText || "No records found."}
      </p>
    ) : (
      <div style={{ display: "grid", gap: 10 }}>
        {items.slice(0, 5).map((item, index) => (
          <div
            key={item.id || `${title}-${index}`}
            style={{
              border: "1px solid #f1f5f9",
              borderRadius: 10,
              padding: 12,
              background: index === 0 ? "#f8fafc" : "#fff",
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    )}
  </div>
);

const MyLoans = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loans, setLoans] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [gridKey, setGridKey] = useState(0);
  const [activeSub, setActiveSub] = useState(null);
  const subscriptionSnapshot = activeSub || FREE_SUBSCRIPTION;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const currentUser = getAuthUser();
      const admin =
        String(currentUser?.role || "").toUpperCase() === "ROLE_ADMIN";
      setIsAdmin(admin);

      const data = admin
        ? await searchBookLoans({ page: 0, size: 1000 })
        : await getMyBookLoans({ page: 0, size: 50 });
      setLoans(data?.content || []);
      setGridKey((k) => k + 1);
    } catch (err) {
      setError(err.message || "Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const user = getAuthUser();
    if (!user?.id) {
      return;
    }
    if (String(user.role || "").toUpperCase() === "ROLE_ADMIN") {
      return;
    }
    getActiveSubscription(user.id)
      .then((sub) => setActiveSub(sub || null))
      .catch(() => setActiveSub(null));
  }, []);

  const handleRenew = async (loan) => {
    try {
      const res = await renewBook({
        bookLoanId: loan.id,
        extensionDays: 14,
        notes: "Renewed from My Loans",
      });
      setMessage(res?.message || "Loan renewed successfully");
      load();
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
      load();
    } catch (err) {
      setError(err.message || "Could not check in book");
    }
  };

  const getStatVal = (key) =>
    key === null
      ? loans.length
      : loans.filter((loan) => matchesLoanGroup(loan, key)).length;

  const tabCounts = TABS.map((t) =>
    t.value === null
      ? loans.length
      : loans.filter((loan) => matchesLoanGroup(loan, t.value)).length,
  );

  const activeGroup = TABS[activeTab]?.value;
  const visibleLoans = loans.filter((loan) =>
    matchesLoanGroup(loan, activeGroup),
  );

  const adminUsersWithLoans = useMemo(() => {
    const userMap = new Map();

    loans.forEach((loan) => {
      const userId = loan.userId;
      if (userId == null) return;
      const key = String(userId);
      if (!userMap.has(key)) {
        userMap.set(key, {
          id: userId,
          fullName: loan.userName || `User ${userId}`,
          email: loan.userEmail || `User #${userId}`,
          loans: [],
          pendingLoans: 0,
          activeLoans: 0,
          completedLoans: 0,
          totalLoans: 0,
        });
      }

      const row = userMap.get(key);
      row.loans.push(loan);
      row.totalLoans += 1;
      if (matchesLoanGroup(loan, "PENDING")) row.pendingLoans += 1;
      if (matchesLoanGroup(loan, "ACTIVE")) row.activeLoans += 1;
      if (matchesLoanGroup(loan, "COMPLETED")) row.completedLoans += 1;
    });

    return Array.from(userMap.values()).sort((left, right) =>
      (left.fullName || "").localeCompare(right.fullName || ""),
    );
  }, [loans]);

  const adminVisibleUsers = useMemo(() => {
    return adminUsersWithLoans.filter((user) => {
      if (!activeGroup) return true;
      return user.loans.some((loan) => matchesLoanGroup(loan, activeGroup));
    });
  }, [adminUsersWithLoans, activeGroup]);

  useEffect(() => {
    if (!isAdmin || adminVisibleUsers.length === 0) return;
    if (!selectedUserId) {
      setSelectedUserId(String(adminVisibleUsers[0].id));
      return;
    }
    const stillVisible = adminVisibleUsers.some(
      (user) => String(user.id) === String(selectedUserId),
    );
    if (!stillVisible) {
      setSelectedUserId(String(adminVisibleUsers[0].id));
    }
  }, [isAdmin, adminVisibleUsers, selectedUserId]);

  const adminSelectedUser = useMemo(() => {
    if (!isAdmin) return null;
    return (
      adminVisibleUsers.find(
        (user) => String(user.id) === String(selectedUserId),
      ) ||
      adminVisibleUsers[0] ||
      null
    );
  }, [adminVisibleUsers, selectedUserId, isAdmin]);

  const adminSelectedLoans = useMemo(() => {
    if (!adminSelectedUser) return [];
    return adminSelectedUser.loans.filter((loan) =>
      matchesLoanGroup(loan, activeGroup),
    );
  }, [adminSelectedUser, activeGroup]);

  /* overdue alert */
  const overdueLoans = loans.filter((l) => l.isOverdue);

  return isAdmin ? (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "28px 28px 56px",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
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
              All Loans
            </h1>
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            Review every user with pending, active, and completed loans.
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
            Loading all loans…
          </p>
        </div>
      ) : adminVisibleUsers.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 380px) minmax(0, 1fr)",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: 18,
              padding: 16,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <PeopleAlt sx={{ fontSize: 20, color: "#334155" }} />
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Users with loans
                </p>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                  Click a user to inspect their loan history.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 8,
                maxHeight: "64vh",
                overflowY: "auto",
              }}
            >
              {adminVisibleUsers.map((user, idx) => {
                const selected = String(selectedUserId) === String(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserId(String(user.id))}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: `1px solid ${selected ? "#1e293b" : T.border}`,
                      background: selected ? "#f8fafc" : T.white,
                      borderRadius: 14,
                      padding: 14,
                      cursor: "pointer",
                      boxShadow: selected
                        ? "0 10px 28px rgba(15,23,42,0.08)"
                        : "none",
                      animation: `lcFadeUp 0.3s ease ${Math.min(idx * 0.04, 0.24)}s both`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: "#111827" }}>
                          {user.fullName || "Unknown user"}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {user.email || `User #${user.id}`}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        {user.totalLoans} loan{user.totalLoans !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          padding: "3px 9px",
                          borderRadius: 999,
                          background: "#d1fae5",
                          color: "#065f46",
                          fontWeight: 700,
                        }}
                      >
                        Pending {user.pendingLoans}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "3px 9px",
                          borderRadius: 999,
                          background: "#fee2e2",
                          color: "#b91c1c",
                          fontWeight: 700,
                        }}
                      >
                        Active {user.activeLoans}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "3px 9px",
                          borderRadius: 999,
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          fontWeight: 700,
                        }}
                      >
                        Completed {user.completedLoans}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div
              style={{
                background: T.white,
                border: `1px solid ${T.border}`,
                borderRadius: 18,
                padding: 18,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#94a3b8",
                      margin: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Selected user
                  </p>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: 22,
                      fontWeight: 600,
                      color: "#0f172a",
                      margin: "4px 0 0",
                    }}
                  >
                    {adminSelectedUser?.fullName || "No user selected"}
                  </h2>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#94a3b8",
                      margin: "4px 0 0",
                    }}
                  >
                    {adminSelectedUser?.email ||
                      "Users with loans appear here."}
                  </p>
                </div>
                {adminSelectedUser && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "3px 9px",
                        borderRadius: 999,
                        background: "#d1fae5",
                        color: "#065f46",
                        fontWeight: 700,
                      }}
                    >
                      Pending {adminSelectedUser.pendingLoans}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "3px 9px",
                        borderRadius: 999,
                        background: "#fee2e2",
                        color: "#b91c1c",
                        fontWeight: 700,
                      }}
                    >
                      Active {adminSelectedUser.activeLoans}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "3px 9px",
                        borderRadius: 999,
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        fontWeight: 700,
                      }}
                    >
                      Completed {adminSelectedUser.completedLoans}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <RecordList
              title="Loans"
              items={adminSelectedLoans}
              emptyText="No loans found for this user in the selected view."
              renderItem={(loan) => (
                <div style={{ display: "grid", gap: 6 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {loan.bookTitle || "Untitled book"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        {loan.bookAuthor || "Unknown author"}
                      </Typography>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: T.light,
                        color: "#334155",
                      }}
                    >
                      {getStatusLabel(loan.status)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    <span>Checked out: {loan.checkoutDate || "—"}</span>
                    <span>Due: {loan.dueDate || "—"}</span>
                    {loan.returnDate && (
                      <span>Returned: {loan.returnDate}</span>
                    )}
                  </div>
                </div>
              )}
            />
          </div>
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
            Try a different filter.
          </p>
        </div>
      )}
    </div>
  ) : (
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
      ) : visibleLoans.length > 0 ? (
        <div
          key={gridKey}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {visibleLoans.map((loan, idx) => (
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
                activeSub={subscriptionSnapshot}
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
