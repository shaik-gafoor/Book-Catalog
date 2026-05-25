import React, { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import {
  CardMembership,
  CheckCircle,
  OpenInNew,
  Close,
  StarOutlined,
  Diamond,
  WorkspacePremium,
} from "@mui/icons-material";
import {
  activateSubscription,
  cancelSubscription,
  getActiveSubscription,
  getAuthUser,
  getSubscriptionPlans,
  subscribe,
} from "../../api/libraryApi";
import { formatDateTime, formatCurrency } from "../../utils/format";

/* ── keyframes ── */
if (typeof document !== "undefined" && !document.getElementById("sub-kf")) {
  const s = document.createElement("style");
  s.id = "sub-kf";
  s.textContent = `
    @keyframes subFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes subSpin   { to{transform:rotate(360deg)} }
    @keyframes subPulse  { 0%,100%{opacity:1} 50%{opacity:0.6} }
  `;
  document.head.appendChild(s);
}

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

/* Pick icon + gradient by plan index */
const PLAN_STYLES = [
  {
    gradient: "linear-gradient(135deg,#1e293b,#334155)",
    icon: <StarOutlined sx={{ fontSize: 22, color: "#fff" }} />,
    accent: "#64748b",
  },
  {
    gradient: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    icon: <Diamond sx={{ fontSize: 22, color: "#fff" }} />,
    accent: "#6366f1",
  },
  {
    gradient: "linear-gradient(135deg,#059669,#0d9488)",
    icon: <WorkspacePremium sx={{ fontSize: 22, color: "#fff" }} />,
    accent: "#059669",
  },
  {
    gradient: "linear-gradient(135deg,#b45309,#d97706)",
    icon: <WorkspacePremium sx={{ fontSize: 22, color: "#fff" }} />,
    accent: "#d97706",
  },
];

/* ── small action button ── */
const Btn = ({ variant = "outline", onClick, disabled, children }) => {
  const [hov, setHov] = useState(false);
  const base = {
    fontFamily: "inherit",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.05em",
    padding: "8px 16px",
    borderRadius: T.radiusSm,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    opacity: disabled ? 0.4 : 1,
    transition: "background 0.15s, transform 0.12s",
    transform: hov && !disabled ? "translateY(-1px)" : "none",
  };
  const styles = {
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
      style={styles[variant]}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
};

/* ── Toast ── */
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
      animation: "subFadeUp 0.22s ease both",
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
        flexShrink: 0,
      }}
    >
      <Close sx={{ fontSize: 15 }} />
    </button>
  </div>
);

/* ── Feature check row ── */
const Feature = ({ label }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}
  >
    <CheckCircle sx={{ fontSize: 14, color: "#059669" }} />
    <span style={{ fontSize: 12, color: T.text2 }}>{label}</span>
  </div>
);

/* ══════════════════════════════════════════════════
   SUBSCRIPTION PAGE
══════════════════════════════════════════════════ */
const SubscriptionPage = () => {
  const user = getAuthUser();
  const userId = user?.id;

  const [plans, setPlans] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [notes, setNotes] = useState("Annual membership");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [notesFocused, setNotesFocused] = useState(false);
  const [reasonFocused, setReasonFocused] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [planData, subData] = await Promise.all([
        getSubscriptionPlans(),
        getActiveSubscription(userId),
      ]);
      setPlans(Array.isArray(planData) ? planData : planData?.content || []);
      setActiveSub(subData || null);
    } catch (err) {
      setError(err.message || "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activePlanId = activeSub?.planId;

  const handleSubscribe = async (plan) => {
    try {
      const res = await subscribe({ userId, planId: plan.id, notes });
      setMessage(res?.message || "Subscription checkout initiated");
      if (res?.checkoutUrl)
        window.open(res.checkoutUrl, "_blank", "noopener,noreferrer");
      await load();
    } catch (err) {
      setError(err.message || "Could not start subscription checkout");
    }
  };

  const handleActivate = async () => {
    try {
      if (!activeSub?.id) return;
      const res = await activateSubscription(
        activeSub.id,
        activeSub?.lastPaymentId || activeSub?.paymentId || "",
      );
      setMessage(res?.message || "Subscription activated");
      await load();
    } catch (err) {
      setError(err.message || "Could not activate subscription");
    }
  };

  const handleCancel = async () => {
    try {
      if (!activeSub?.id) return;
      const res = await cancelSubscription(activeSub.id, reason || undefined);
      setMessage(res?.message || "Subscription cancelled");
      setCancelConfirm(false);
      await load();
    } catch (err) {
      setError(err.message || "Could not cancel subscription");
    }
  };

  /* Usage meter */
  const usagePercent = activeSub
    ? Math.min(
        100,
        ((activeSub.booksCheckedOut || 0) / (activeSub.maxBooksAllowed || 1)) *
          100,
      )
    : 0;

  const inputStyle = (focused) => ({
    fontFamily: "inherit",
    fontSize: 13,
    color: T.text,
    background: focused ? T.white : T.sand,
    border: `1px solid ${focused ? T.text : T.border}`,
    borderRadius: T.radiusSm,
    padding: "10px 13px",
    outline: "none",
    width: "100%",
    boxShadow: focused ? "0 0 0 3px rgba(28,25,23,0.06)" : "none",
    transition: "border-color 0.18s, box-shadow 0.18s, background 0.18s",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "28px 28px 64px",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      {/* ── Heading ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
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
            <CardMembership sx={{ fontSize: 22, color: "#334155" }} />
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
              Subscription
            </h1>
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            Choose a plan, manage your membership, and track usage.
          </p>
        </div>
        {activeSub && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 14px",
              borderRadius: 20,
              background: "#d1fae5",
              color: "#065f46",
              border: "1px solid #a7f3d0",
              animation: "subPulse 2.5s ease infinite",
            }}
          >
            ● Active
          </span>
        )}
      </div>

      {/* ── Toasts ── */}
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

      {/* ── Active subscription card ── */}
      {activeSub && (
        <div
          style={{
            background: "linear-gradient(135deg,#1e293b,#334155)",
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 28,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            animation: "subFadeUp 0.35s ease both",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              right: -30,
              top: -30,
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 40,
              bottom: -40,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.03)",
              pointerEvents: "none",
            }}
          />

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            style={{ position: "relative" }}
          >
            {/* Left */}
            <div>
              <p
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  margin: "0 0 6px",
                }}
              >
                Current Plan
              </p>
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 0 4px",
                  lineHeight: 1.1,
                }}
              >
                {activeSub.planName || "Active Plan"}
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.55)",
                  margin: "0 0 18px",
                }}
              >
                {activeSub.userEmail}
              </p>

              {/* Usage meter */}
              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.5)",
                      fontWeight: 600,
                    }}
                  >
                    Books borrowed
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.8)",
                      fontWeight: 700,
                    }}
                  >
                    {activeSub.booksCheckedOut || 0} /{" "}
                    {activeSub.maxBooksAllowed || "∞"}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${usagePercent}%`,
                      background: "linear-gradient(90deg,#34d399,#059669)",
                      borderRadius: 6,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>

              {/* Meta info */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  `${activeSub.daysRemaining ?? 0} days remaining`,
                  `Max ${activeSub.maxDaysPerBook ?? "—"} days/book`,
                  activeSub.startDate && `From ${activeSub.startDate}`,
                  activeSub.endDate && `Until ${activeSub.endDate}`,
                ]
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.65)",
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 20,
                        padding: "3px 10px",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>

            {/* Right — actions */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handleActivate}
                  style={{
                    fontFamily: "inherit",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "8px 16px",
                    borderRadius: T.radiusSm,
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.12)",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "background 0.15s",
                  }}
                >
                  <OpenInNew sx={{ fontSize: 13 }} />
                  Activate
                </button>
                <button
                  onClick={() => setCancelConfirm(true)}
                  style={{
                    fontFamily: "inherit",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "8px 16px",
                    borderRadius: T.radiusSm,
                    cursor: "pointer",
                    border: "1px solid rgba(255,107,107,0.4)",
                    background: "rgba(255,80,80,0.1)",
                    color: "#fca5a5",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "background 0.15s",
                  }}
                >
                  <Close sx={{ fontSize: 13 }} />
                  Cancel Plan
                </button>
              </div>

              {/* Cancel confirm */}
              {cancelConfirm && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,107,107,0.3)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    width: "100%",
                    animation: "subFadeUp 0.2s ease",
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      color: "#fca5a5",
                      fontWeight: 600,
                      marginBottom: 10,
                    }}
                  >
                    Confirm cancellation?
                  </p>
                  <input
                    placeholder="Reason (optional)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{
                      width: "100%",
                      fontFamily: "inherit",
                      fontSize: 12,
                      color: "#fff",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      borderRadius: 6,
                      padding: "7px 10px",
                      outline: "none",
                      marginBottom: 10,
                    }}
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={handleCancel}
                      style={{
                        flex: 1,
                        fontFamily: "inherit",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "7px",
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Yes, Cancel
                    </button>
                    <button
                      onClick={() => setCancelConfirm(false)}
                      style={{
                        flex: 1,
                        fontFamily: "inherit",
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "7px",
                        background: "rgba(255,255,255,0.1)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Keep Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Notes input ── */}
      {!activeSub && (
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
            padding: "16px 20px",
            marginBottom: 24,
            animation: "subFadeUp 0.35s ease 0.1s both",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: T.text2,
              marginBottom: 10,
            }}
          >
            Subscription Note
          </p>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Annual membership"
            onFocus={() => setNotesFocused(true)}
            onBlur={() => setNotesFocused(false)}
            style={inputStyle(notesFocused)}
          />
        </div>
      )}

      {/* ── Section title ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 20,
            fontWeight: 600,
            color: "#0f172a",
            margin: 0,
          }}
        >
          {activeSub ? "Upgrade Your Plan" : "Choose a Plan"}
        </h2>
        <span style={{ fontSize: 11, color: T.faint }}>
          All plans include catalog access
        </span>
      </div>

      {/* ── Plan cards ── */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 60,
            gap: 14,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid #e2e8f0",
              borderTop: "3px solid #1e293b",
              borderRadius: "50%",
              animation: "subSpin 0.7s linear infinite",
            }}
          />
          <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: 0 }}>
            Loading plans…
          </p>
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((plan, i) => {
            const ps = PLAN_STYLES[i % PLAN_STYLES.length];
            const isActive =
              activePlanId && String(activePlanId) === String(plan.id);
            const [subHov, setSubHov] = useState(false);

            return (
              <div
                key={plan.id}
                style={{
                  background: T.white,
                  border: `1.5px solid ${isActive ? ps.accent : T.border}`,
                  borderRadius: T.radius,
                  overflow: "hidden",
                  boxShadow: isActive
                    ? `0 8px 32px ${ps.accent}22`
                    : "0 1px 4px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  animation: `subFadeUp 0.38s ease ${Math.min(i * 0.07, 0.4)}s both`,
                  position: "relative",
                }}
              >
                {/* Current badge */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      background: "#d1fae5",
                      color: "#065f46",
                      border: "1px solid #a7f3d0",
                      borderRadius: 20,
                      padding: "2px 10px",
                    }}
                  >
                    Current
                  </div>
                )}

                {/* Plan gradient header */}
                <div
                  style={{
                    background: ps.gradient,
                    padding: "20px 20px 18px",
                    position: "relative",
                    overflow: "hidden",
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
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.18)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                    }}
                  >
                    {ps.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fff",
                      margin: "0 0 2px",
                    }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.55)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {plan.planCode}
                  </p>
                </div>

                {/* Body */}
                <div
                  style={{
                    padding: "18px 20px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Price */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 4,
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 30,
                        fontWeight: 700,
                        color: T.text,
                      }}
                    >
                      {formatCurrency(plan.price)}
                    </span>
                    <span style={{ fontSize: 12, color: T.faint }}>
                      / {plan.durationDays} days
                    </span>
                  </div>

                  {plan.description && (
                    <p
                      style={{
                        fontSize: 12,
                        color: T.muted,
                        marginBottom: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      {plan.description}
                    </p>
                  )}

                  {/* Feature list */}
                  <div style={{ marginBottom: 20, flex: 1 }}>
                    <Feature
                      label={`${plan.maxBooksAllowed} book${plan.maxBooksAllowed > 1 ? "s" : ""} at a time`}
                    />
                    <Feature label={`${plan.maxDaysPerBook} days per book`} />
                    <Feature label={`${plan.durationDays}-day membership`} />
                    {plan.badgeText && <Feature label={plan.badgeText} />}
                    <Feature label="Full catalog access" />
                    <Feature label="Reserve & wishlist" />
                  </div>

                  {/* Subscribe button */}
                  <button
                    onClick={() => handleSubscribe(plan)}
                    onMouseEnter={() => setSubHov(true)}
                    onMouseLeave={() => setSubHov(false)}
                    style={{
                      width: "100%",
                      fontFamily: "inherit",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "11px",
                      borderRadius: T.radiusSm,
                      cursor: "pointer",
                      border: "none",
                      background: subHov
                        ? ps.gradient
                        : isActive
                          ? T.light
                          : T.text,
                      color: isActive && !subHov ? T.text2 : "#fff",
                      transition: "background 0.2s, transform 0.12s",
                      transform: subHov ? "translateY(-1px)" : "none",
                      boxShadow: subHov ? `0 6px 20px ${ps.accent}40` : "none",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {isActive ? "Manage Plan" : "Subscribe →"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            background: T.white,
            border: "1.5px dashed #e2e8f0",
            borderRadius: 18,
            padding: "72px 24px",
            textAlign: "center",
          }}
        >
          <CardMembership
            sx={{
              fontSize: 36,
              color: "#cbd5e1",
              display: "block",
              margin: "0 auto 14px",
            }}
          />
          <p
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#334155",
              margin: "0 0 6px",
            }}
          >
            No plans available
          </p>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>
            Check back later for subscription plans.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
