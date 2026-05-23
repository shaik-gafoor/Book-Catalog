import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { CardMembership, OpenInNew, Close } from "@mui/icons-material";
import {
  activateSubscription,
  cancelSubscription,
  getActiveSubscription,
  getAuthUser,
  getSubscriptionPlans,
  subscribe,
} from "../../api/libraryApi";
import { formatDateTime, formatCurrency } from "../../utils/format";

const SubscriptionPage = () => {
  const user = getAuthUser();
  const userId = user?.id;
  const [plans, setPlans] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [notes, setNotes] = useState("Annual membership");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [planData, subscriptionData] = await Promise.all([
        getSubscriptionPlans(),
        getActiveSubscription(userId),
      ]);
      setPlans(Array.isArray(planData) ? planData : planData?.content || []);
      setActiveSubscription(subscriptionData || null);
    } catch (err) {
      setError(err.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activePlanIds = useMemo(
    () =>
      new Set(activeSubscription?.planId ? [activeSubscription.planId] : []),
    [activeSubscription],
  );

  const handleSubscribe = async (plan) => {
    try {
      const payload = { userId, planId: plan.id, notes };
      const res = await subscribe(payload);
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
      const subscriptionId = activeSubscription?.id;
      if (!subscriptionId) return;
      const res = await activateSubscription(
        subscriptionId,
        activeSubscription?.lastPaymentId ||
          activeSubscription?.paymentId ||
          "",
      );
      setMessage(res?.message || "Subscription activated");
      await load();
    } catch (err) {
      setError(err.message || "Could not activate subscription");
    }
  };

  const handleCancel = async () => {
    try {
      if (!activeSubscription?.id) return;
      const res = await cancelSubscription(
        activeSubscription.id,
        reason || undefined,
      );
      setMessage(res?.message || "Subscription cancelled");
      await load();
    } catch (err) {
      setError(err.message || "Could not cancel subscription");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <CardMembership sx={{ fontSize: 22, color: "#374151" }} />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Subscription
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Choose a plan, view your active membership, and manage cancellations.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <TextField
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label="Cancel reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          size="small"
        />
        <Card
          elevation={0}
          sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 3 }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#6b7280", fontWeight: 700 }}
          >
            Active plan
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {activeSubscription?.planName || "None"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            {activeSubscription
              ? `${activeSubscription.daysRemaining ?? 0} days remaining`
              : "No active subscription"}
          </Typography>
        </Card>
      </div>

      {activeSubscription && (
        <Card
          elevation={0}
          sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 3, mb: 6 }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Typography
                variant="overline"
                sx={{ color: "#6b7280", letterSpacing: 1.2 }}
              >
                Current Subscription
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {activeSubscription.planName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                {activeSubscription.userEmail}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Starts {activeSubscription.startDate} ends{" "}
                {activeSubscription.endDate}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Books allowed {activeSubscription.maxBooksAllowed} · Days per
                book {activeSubscription.maxDaysPerBook}
              </Typography>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleActivate}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900"
              >
                <OpenInNew sx={{ fontSize: 14 }} /> Activate
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900"
              >
                <Close sx={{ fontSize: 14 }} /> Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              elevation={0}
              sx={{
                p: 3,
                border: activePlanIds.has(plan.id)
                  ? "1px solid #111827"
                  : "1px solid #e5e7eb",
                borderRadius: 3,
                height: "100%",
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    {plan.planCode}
                  </Typography>
                </div>
                {plan.badgeText && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                    {plan.badgeText}
                  </span>
                )}
              </div>
              <Typography
                variant="body2"
                sx={{ color: "#6b7280", minHeight: 48 }}
              >
                {plan.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <div className="space-y-1 text-sm text-gray-600">
                <p>Duration: {plan.durationDays} days</p>
                <p>Price: {formatCurrency(plan.price)}</p>
                <p>Books allowed: {plan.maxBooksAllowed}</p>
                <p>Days per book: {plan.maxDaysPerBook}</p>
              </div>
              <button
                onClick={() => handleSubscribe(plan)}
                className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-700"
              >
                Subscribe
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
