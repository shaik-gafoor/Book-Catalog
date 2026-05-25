import React, { useEffect, useState } from "react";
import {
  CardMembership,
  CheckCircle,
  OpenInNew,
  Close,
  StarOutlined,
  Diamond,
  WorkspacePremium,
  AutoAwesome,
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
import { STATIC_PLANS } from "./subscriptionPlans";

/* ─────────────────────────────────────────────
   Keyframes — injected once into <head>
───────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("sub-kf")) {
  const s = document.createElement("style");
  s.id = "sub-kf";
  s.textContent = `
    @keyframes subFadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes subSpin     { to{transform:rotate(360deg)} }
    @keyframes subPulse    { 0%,100%{opacity:1} 50%{opacity:.55} }
    @keyframes subShimmer  { 0%,100%{opacity:.7} 50%{opacity:1} }
    @keyframes subSlideIn  { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
    @keyframes subGlow     { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.0)} 50%{box-shadow:0 0 0 6px rgba(99,102,241,.12)} }

    .sub-plan-card {
      transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease;
    }
    .sub-plan-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 16px 48px rgba(0,0,0,.13) !important;
    }
    .sub-action-btn {
      transition: background .15s, transform .14s cubic-bezier(.34,1.56,.64,1), box-shadow .15s;
    }
    .sub-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,.15);
    }
    .sub-action-btn:active { transform: translateY(0); }

    .sub-ghost-btn {
      transition: background .15s, color .15s, border-color .15s;
    }
    .sub-ghost-btn:hover { background: rgba(255,255,255,.18) !important; }

    .sub-cancel-btn {
      transition: background .15s, border-color .15s;
    }
    .sub-cancel-btn:hover { background: rgba(255,80,80,.18) !important; }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────
   Design tokens
───────────────────────────────────────────── */
const T = {
  white: "#ffffff",
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  border2: "#cbd5e1",
  text: "#0f172a",
  text2: "#334155",
  muted: "#64748b",
  faint: "#94a3b8",
  light: "#f1f5f9",
  radius: "16px",
  radiusSm: "10px",
  radiusXs: "7px",
};

/* ─────────────────────────────────────────────
   Plan visual config  (icon · gradient · accent · popular flag)
───────────────────────────────────────────── */
const PLAN_VISUALS = [
  {
    gradient: "linear-gradient(145deg,#1e293b 0%,#334155 100%)",
    headerText: "rgba(255,255,255,.5)",
    icon: <StarOutlined sx={{ fontSize: 20, color: "#fff" }} />,
    accent: "#475569",
    btnBg: "#1e293b",
    popular: false,
  },
  {
    gradient: "linear-gradient(145deg,#1d4ed8 0%,#2563eb 100%)",
    headerText: "rgba(255,255,255,.55)",
    icon: <Diamond sx={{ fontSize: 20, color: "#fff" }} />,
    accent: "#2563eb",
    btnBg: "#1d4ed8",
    popular: false,
  },
  {
    gradient: "linear-gradient(145deg,#4f46e5 0%,#6d28d9 100%)",
    headerText: "rgba(255,255,255,.55)",
    icon: <AutoAwesome sx={{ fontSize: 20, color: "#fff" }} />,
    accent: "#6d28d9",
    btnBg: "#4f46e5",
    popular: true,
  },
  {
    gradient: "linear-gradient(145deg,#059669 0%,#0d9488 100%)",
    headerText: "rgba(255,255,255,.55)",
    icon: <WorkspacePremium sx={{ fontSize: 20, color: "#fff" }} />,
    accent: "#059669",
    btnBg: "#059669",
    popular: false,
  },
];

const FREE_SUBSCRIPTION = {
  planCode: "FREE",
  planName: "Free",
  price: 0,
  maxBooksPerMonth: 3,
  maxConcurrentCheckouts: 1,
  maxDaysPerBook: 7,
  maxRenewalsPerBook: 0,
  priorityReservation: false,
  booksCheckedOutThisMonth: 0,
  currentConcurrentCheckouts: 0,
  monthlyQuotaResetDate: null,
  daysRemaining: 36500,
};

const getDaysUntilReset = (dateValue) => {
  if (!dateValue) return null;
  const target = new Date(dateValue);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(
    0,
    Math.ceil((target.getTime() - today.getTime()) / 86400000),
  );
};

/* ─────────────────────────────────────────────
   Small reusable components
───────────────────────────────────────────── */

const Banner = ({ type, message, onClose }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "11px 16px",
      marginBottom: 16,
      borderRadius: T.radiusSm,
      border: `1px solid ${type === "error" ? "#fecaca" : "#a7f3d0"}`,
      background: type === "error" ? "#fef2f2" : "#f0fdf4",
      color: type === "error" ? "#b91c1c" : "#065f46",
      fontSize: "0.82rem",
      fontWeight: 500,
      animation: "subFadeUp .22s ease both",
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

const Feature = ({ label, included = true }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 0" }}
  >
    {included ? (
      <CheckCircle sx={{ fontSize: 14, color: "#10b981", flexShrink: 0 }} />
    ) : (
      <Close sx={{ fontSize: 14, color: "#cbd5e1", flexShrink: 0 }} />
    )}
    <span
      style={{
        fontSize: 12.5,
        color: included ? T.text2 : T.faint,
        lineHeight: 1.4,
      }}
    >
      {label}
    </span>
  </div>
);

const Spinner = () => (
  <div
    style={{
      width: 34,
      height: 34,
      border: "3px solid #e2e8f0",
      borderTop: "3px solid #4f46e5",
      borderRadius: "50%",
      animation: "subSpin .7s linear infinite",
    }}
  />
);

/* ─────────────────────────────────────────────
   PlanCard — extracted so hooks are at top level
───────────────────────────────────────────── */
const PlanCard = ({ plan, index, activePlanId, notes, onSubscribe }) => {
  const [hov, setHov] = useState(false);
  const vis = PLAN_VISUALS[index % PLAN_VISUALS.length];
  const isActive = activePlanId && String(activePlanId) === String(plan.id);

  return (
    <div
      className="sub-plan-card"
      style={{
        background: T.surface,
        border: isActive
          ? `2px solid ${vis.accent}`
          : vis.popular
            ? `2px solid ${vis.accent}`
            : `1px solid ${T.border}`,
        borderRadius: T.radius,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: vis.popular
          ? `0 8px 30px ${vis.accent}28`
          : "0 1px 4px rgba(0,0,0,.05)",
        animation: `subFadeUp .42s ease ${Math.min(index * 0.1, 0.4)}s both`,
      }}
    >
      {/* Popular badge */}
      {vis.popular && !isActive && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 2,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            background: "#ede9fe",
            color: "#4f46e5",
            border: "1px solid #c4b5fd",
            borderRadius: 20,
            padding: "3px 11px",
            animation: "subShimmer 2.8s ease infinite",
          }}
        >
          ✦ Most popular
        </div>
      )}

      {/* Current badge */}
      {isActive && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 2,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            background: "#d1fae5",
            color: "#065f46",
            border: "1px solid #a7f3d0",
            borderRadius: 20,
            padding: "3px 11px",
            animation: "subPulse 2.5s ease infinite",
          }}
        >
          ● Current
        </div>
      )}

      {plan.badgeText && !isActive && (
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            zIndex: 2,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            background: "#ffffff",
            color: vis.accent,
            border: `1px solid ${vis.accent}33`,
            borderRadius: 20,
            padding: "3px 11px",
          }}
        >
          {plan.badgeText}
        </div>
      )}

      {/* Gradient header */}
      <div
        style={{
          background: vis.gradient,
          padding: "22px 22px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            right: -20,
            top: -20,
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "rgba(255,255,255,.06)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 30,
            bottom: -35,
            width: 65,
            height: 65,
            borderRadius: "50%",
            background: "rgba(255,255,255,.04)",
            pointerEvents: "none",
          }}
        />

        {/* Icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: T.radiusSm,
            background: "rgba(255,255,255,.16)",
            border: "1px solid rgba(255,255,255,.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          {vis.icon}
        </div>

        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 2px",
            lineHeight: 1.1,
          }}
        >
          {plan.name}
        </h3>
        <p
          style={{
            fontSize: 10,
            color: vis.headerText,
            letterSpacing: ".1em",
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
          padding: "20px 22px",
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
            gap: 5,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 32,
              fontWeight: 700,
              color: T.text,
              lineHeight: 1,
            }}
          >
            {plan.price === 0 ? "Free" : formatCurrency(plan.price)}
          </span>
          {plan.price > 0 && (
            <span style={{ fontSize: 12, color: T.faint }}>
              / {plan.durationDays} days
            </span>
          )}
        </div>

        {plan.description && (
          <p
            style={{
              fontSize: 12.5,
              color: T.muted,
              lineHeight: 1.65,
              marginBottom: 16,
            }}
          >
            {plan.description}
          </p>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: T.border, marginBottom: 14 }} />

        {/* Features */}
        <div style={{ flex: 1, marginBottom: 20 }}>
          <Feature
            label={`${plan.maxBooksPerMonth === -1 ? "Unlimited" : plan.maxBooksPerMonth} book${plan.maxBooksPerMonth === 1 ? "" : "s"} per month`}
          />
          <Feature
            label={`${plan.maxConcurrentCheckouts} book${plan.maxConcurrentCheckouts === 1 ? "" : "s"} at a time`}
          />
          <Feature label={`${plan.maxDaysPerBook}-day loan period`} />
          <Feature
            label={
              plan.maxRenewalsPerBook === 0
                ? "No renewals"
                : `${plan.maxRenewalsPerBook} renewal${plan.maxRenewalsPerBook > 1 ? "s" : ""} per book`
            }
          />
          <Feature
            label="Reserve & wishlist access"
            included={plan.planCode !== "FREE"}
          />
          <Feature
            label="Priority reservations"
            included={Boolean(plan.priorityReservation)}
          />
          <Feature label="Full catalog access" />
        </div>

        {/* CTA button */}
        <button
          className="sub-action-btn"
          onClick={() => onSubscribe(plan)}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            width: "100%",
            fontFamily: "inherit",
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: ".04em",
            padding: "12px",
            borderRadius: T.radiusSm,
            cursor: "pointer",
            border: "none",
            background: isActive ? T.light : hov ? vis.gradient : vis.btnBg,
            color: isActive ? T.text2 : "#fff",
          }}
        >
          {isActive
            ? "Manage Plan"
            : plan.price === 0
              ? "Get started — free"
              : `Subscribe to ${plan.name} →`}
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   SUBSCRIPTION PAGE
═══════════════════════════════════════════════════════ */
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

  /* ── data fetching ── */
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [planData, subData] = await Promise.all([
        getSubscriptionPlans(),
        getActiveSubscription(userId),
      ]);

      // Prefer API data; fall back to static plans when API returns nothing
      const fetched = Array.isArray(planData)
        ? planData
        : planData?.content || [];
      setPlans(fetched.length > 0 ? fetched : STATIC_PLANS);
      setActiveSub(subData || null);
    } catch (err) {
      setError(err.message || "Failed to load subscription data");
      setPlans(STATIC_PLANS); // always show plans even on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activePlanId = activeSub?.planId;
  const effectiveSub = activeSub || FREE_SUBSCRIPTION;
  const isFree = !activeSub || effectiveSub.planCode === "FREE";
  const isBasic = activeSub?.planCode === "BASIC";
  const isPremium = activeSub?.planCode === "PREMIUM";
  const canReserve = !isFree;
  const canWishlist = !isFree;
  const canRenew = !isFree;
  const atConcurrentLimit =
    (effectiveSub.currentConcurrentCheckouts ?? 0) >=
    (effectiveSub.maxConcurrentCheckouts ?? 1);
  const atMonthlyLimit =
    (effectiveSub.maxBooksPerMonth ?? 3) !== -1 &&
    (effectiveSub.booksCheckedOutThisMonth ?? 0) >=
      (effectiveSub.maxBooksPerMonth ?? 3);
  const canCheckout = !atConcurrentLimit && !atMonthlyLimit;

  /* ── actions ── */
  const handleSubscribe = async (plan) => {
    setError("");
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
    setError("");
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
    setError("");
    try {
      if (!activeSub?.id) return;
      const res = await cancelSubscription(activeSub.id, reason || undefined);
      setMessage(res?.message || "Subscription cancelled");
      setCancelConfirm(false);
      setReason("");
      await load();
    } catch (err) {
      setError(err.message || "Could not cancel subscription");
    }
  };

  const quotaUsed = effectiveSub.booksCheckedOutThisMonth ?? 0;
  const quotaLimit = effectiveSub.maxBooksPerMonth ?? 3;
  const quotaPercent =
    quotaLimit === -1 ? 0 : Math.min(100, (quotaUsed / quotaLimit) * 100);
  const quotaResetDays = getDaysUntilReset(effectiveSub.monthlyQuotaResetDate);

  const inputStyle = (focused) => ({
    fontFamily: "inherit",
    fontSize: 13,
    color: T.text,
    background: focused ? T.white : "#f8fafc",
    border: `1px solid ${focused ? "#6366f1" : T.border}`,
    borderRadius: T.radiusXs,
    padding: "10px 13px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    boxShadow: focused ? "0 0 0 3px rgba(99,102,241,.12)" : "none",
    transition: "border-color .18s, box-shadow .18s, background .18s",
  });

  /* ─────────────────────────────────
     RENDER
  ───────────────────────────────── */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        padding: "32px 28px 72px",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Page header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
          animation: "subFadeUp .3s ease both",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 5,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: T.radiusXs,
                background: "linear-gradient(145deg,#4f46e5,#6d28d9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CardMembership sx={{ fontSize: 19, color: "#fff" }} />
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 26,
                fontWeight: 700,
                color: T.text,
                letterSpacing: "-.3px",
                margin: 0,
              }}
            >
              Subscription
            </h1>
          </div>
          <p
            style={{ fontSize: 13, color: T.faint, margin: 0, paddingLeft: 46 }}
          >
            Choose a plan, manage your membership, and track usage.
          </p>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            padding: "5px 16px",
            borderRadius: 20,
            background: isFree ? "#e2e8f0" : "#d1fae5",
            color: isFree ? "#334155" : "#065f46",
            border: `1px solid ${isFree ? "#cbd5e1" : "#a7f3d0"}`,
            animation: "subPulse 2.5s ease infinite",
          }}
        >
          {isFree ? "● Default" : "● Active"}
        </span>
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
      {effectiveSub && (
        <div
          style={{
            background: "linear-gradient(145deg,#1e293b 0%,#0f172a 100%)",
            borderRadius: T.radius,
            padding: "26px 30px",
            marginBottom: 32,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0,0,0,.2)",
            animation: "subFadeUp .38s ease .05s both",
          }}
        >
          {/* Decorative blobs */}
          {[
            { right: -40, top: -40, size: 160, opacity: 0.05 },
            { right: 50, bottom: -50, size: 110, opacity: 0.04 },
            { left: -20, bottom: 20, size: 80, opacity: 0.03 },
          ].map((blob, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                right: blob.right,
                left: blob.left,
                top: blob.top,
                bottom: blob.bottom,
                width: blob.size,
                height: blob.size,
                borderRadius: "50%",
                background: `rgba(255,255,255,${blob.opacity})`,
                pointerEvents: "none",
              }}
            />
          ))}

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            style={{ position: "relative" }}
          >
            {/* Left — info */}
            <div>
              <p
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.45)",
                  margin: "0 0 6px",
                }}
              >
                Current Plan
              </p>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 0 3px",
                  lineHeight: 1.1,
                }}
              >
                {effectiveSub.planName || "Active Plan"}
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,.45)",
                  margin: "0 0 20px",
                }}
              >
                {effectiveSub.userEmail ||
                  user?.email ||
                  "Your active subscription"}
              </p>

              {/* Usage meter */}
              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 7,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,.45)",
                      fontWeight: 600,
                    }}
                  >
                    Monthly quota
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,.8)",
                      fontWeight: 700,
                    }}
                  >
                    {quotaUsed} / {quotaLimit === -1 ? "∞" : quotaLimit} books
                    used this month
                  </span>
                </div>
                <div
                  style={{
                    height: 7,
                    background: "rgba(255,255,255,.1)",
                    borderRadius: 7,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${quotaPercent}%`,
                      background: "linear-gradient(90deg,#34d399,#10b981)",
                      borderRadius: 7,
                      transition: "width .6s ease",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 7,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,.45)",
                      fontWeight: 600,
                    }}
                  >
                    Concurrent checkouts
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,.8)",
                      fontWeight: 700,
                    }}
                  >
                    {effectiveSub.currentConcurrentCheckouts ?? 0} /{" "}
                    {effectiveSub.maxConcurrentCheckouts ?? 1} books currently
                    out
                  </span>
                </div>
                <div
                  style={{
                    height: 7,
                    background: "rgba(255,255,255,.1)",
                    borderRadius: 7,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(
                        100,
                        ((effectiveSub.currentConcurrentCheckouts ?? 0) /
                          (effectiveSub.maxConcurrentCheckouts ?? 1)) *
                          100,
                      )}%`,
                      background: "linear-gradient(90deg,#60a5fa,#3b82f6)",
                      borderRadius: 7,
                      transition: "width .6s ease",
                    }}
                  />
                </div>
              </div>

              {/* Meta tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {[
                  quotaResetDays != null
                    ? `Quota resets in ${quotaResetDays} day${quotaResetDays === 1 ? "" : "s"}`
                    : `Quota resets in 30 days`,
                  `Loan period ${effectiveSub.maxDaysPerBook ?? "—"} days`,
                  effectiveSub.startDate && `From ${effectiveSub.startDate}`,
                  effectiveSub.endDate && `Until ${effectiveSub.endDate}`,
                ]
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "rgba(255,255,255,.6)",
                        background: "rgba(255,255,255,.08)",
                        border: "1px solid rgba(255,255,255,.12)",
                        borderRadius: 20,
                        padding: "3px 11px",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              {isFree && (
                <p
                  style={{
                    marginTop: 14,
                    fontSize: 12,
                    color: "rgba(255,255,255,.8)",
                    fontWeight: 600,
                  }}
                >
                  Upgrade to get more books per month.
                </p>
              )}
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
                  className="sub-ghost-btn"
                  onClick={handleActivate}
                  style={{
                    fontFamily: "inherit",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "9px 17px",
                    borderRadius: T.radiusXs,
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,.22)",
                    background: "rgba(255,255,255,.1)",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <OpenInNew sx={{ fontSize: 13 }} /> Manage
                </button>
                <button
                  className="sub-cancel-btn"
                  onClick={() => setCancelConfirm(true)}
                  style={{
                    fontFamily: "inherit",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "9px 17px",
                    borderRadius: T.radiusXs,
                    cursor: "pointer",
                    border: "1px solid rgba(255,107,107,.4)",
                    background: "rgba(255,80,80,.1)",
                    color: "#fca5a5",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Close sx={{ fontSize: 13 }} /> Cancel Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* ── Notes input (only when no active sub) ── */}
      {!activeSub && (
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
            padding: "18px 22px",
            marginBottom: 28,
            animation: "subFadeUp .35s ease .1s both",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: T.text2,
              marginBottom: 10,
            }}
          >
            Subscription note
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

      {/* ── Section heading ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
          animation: "subFadeUp .35s ease .15s both",
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            fontWeight: 700,
            color: T.text,
            margin: 0,
            letterSpacing: "-.2px",
          }}
        >
          {activeSub ? "Upgrade Your Plan" : "Choose a Plan"}
        </h2>
        <span style={{ fontSize: 12, color: T.faint }}>
          All plans include catalog access
        </span>
      </div>

      {/* ── Plan grid ── */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 72,
            gap: 14,
          }}
        >
          <Spinner />
          <p style={{ color: T.faint, fontSize: ".82rem", margin: 0 }}>
            Loading plans…
          </p>
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={i}
              activePlanId={activePlanId}
              notes={notes}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div
          style={{
            background: T.surface,
            border: "1.5px dashed #e2e8f0",
            borderRadius: T.radius,
            padding: "80px 24px",
            textAlign: "center",
            animation: "subFadeUp .35s ease both",
          }}
        >
          <CardMembership
            sx={{
              fontSize: 40,
              color: "#cbd5e1",
              display: "block",
              margin: "0 auto 16px",
            }}
          />
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: T.text2,
              margin: "0 0 6px",
            }}
          >
            No plans available
          </p>
          <p style={{ fontSize: ".82rem", color: T.faint, margin: 0 }}>
            Check back later for subscription plans.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
