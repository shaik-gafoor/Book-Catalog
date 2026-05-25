import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { ReceiptLong, Paid, Gavel } from "@mui/icons-material";
import {
  getAuthUser,
  getMyFines,
  payFine,
  waiveFine,
} from "../../api/libraryApi";
import { formatDateTime, formatCurrency } from "../../utils/format";

const statusOptions = ["", "PENDING", "PARTIALLY_PAID", "PAID", "WAIVED"];
const typeOptions = ["", "OVERDUE", "DAMAGE", "LOSS", "PROCESSING"];

const MyFines = () => {
  const currentUser = getAuthUser();
  const isAdmin = currentUser?.role === "ROLE_ADMIN";
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadFines = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyFines({
          status: status || undefined,
          type: type || undefined,
        });
        setFines(Array.isArray(data) ? data : data?.content || []);
      } catch (err) {
        setError(err.message || "Failed to load fines");
      } finally {
        setLoading(false);
      }
    };

    loadFines();
  }, [status, type]);

  const totals = useMemo(() => {
    return fines.reduce(
      (acc, fine) => {
        acc.total += Number(fine.amount || 0);
        acc.outstanding += Number(fine.amountOutstanding || 0);
        acc.paid += Number(fine.amountPaid || 0);
        return acc;
      },
      { total: 0, outstanding: 0, paid: 0 },
    );
  }, [fines]);

  const refresh = async () => {
    const data = await getMyFines({
      status: status || undefined,
      type: type || undefined,
    });
    setFines(Array.isArray(data) ? data : data?.content || []);
  };

  const handlePay = async (fine) => {
    try {
      const res = await payFine(fine.id, transactionId || undefined);
      setMessage(res?.message || "Fine payment started");
      await refresh();
    } catch (err) {
      setError(err.message || "Could not start fine payment");
    }
  };

  const handleWaive = async (fine) => {
    const reason = window.prompt("Waiver reason:");
    if (!reason) return;
    try {
      const res = await waiveFine({ fineId: fine.id, reason });
      setMessage(res?.message || "Fine waived");
      await refresh();
    } catch (err) {
      setError(err.message || "Could not waive fine");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ReceiptLong sx={{ fontSize: 22, color: "#374151" }} />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            My Fines
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Review outstanding fines and start payment or waiver actions.
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card
          elevation={0}
          sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 3 }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#6b7280", fontWeight: 700 }}
          >
            Total
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {formatCurrency(totals.total)}
          </Typography>
        </Card>
        <Card
          elevation={0}
          sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 3 }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#6b7280", fontWeight: 700 }}
          >
            Outstanding
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {formatCurrency(totals.outstanding)}
          </Typography>
        </Card>
        <Card
          elevation={0}
          sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 3 }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#6b7280", fontWeight: 700 }}
          >
            Paid
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {formatCurrency(totals.paid)}
          </Typography>
        </Card>
        <TextField
          label="Transaction Id"
          size="small"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormControl size="small" fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option || "ALL"} value={option}>
                {option || "All statuses"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            label="Type"
            onChange={(e) => setType(e.target.value)}
          >
            {typeOptions.map((option) => (
              <MenuItem key={option || "ALL"} value={option}>
                {option || "All types"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {loading ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={28} />
        </Box>
      ) : fines.length > 0 ? (
        <div className="space-y-4">
          {fines.map((fine) => (
            <Card
              key={fine.id}
              elevation={0}
              sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 3 }}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {fine.bookTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    {fine.type} · {fine.status}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Reason: {fine.reason || "-"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                    Created {formatDateTime(fine.createdAt)}
                  </Typography>
                </div>
                <div className="text-right space-y-1">
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {formatCurrency(fine.amountOutstanding ?? fine.amount)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Paid {formatCurrency(fine.amountPaid || 0)}
                  </Typography>
                  <div className="flex gap-2 justify-end pt-2">
                    {fine.amountOutstanding > 0 && (
                      <button
                        onClick={() => handlePay(fine)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900"
                      >
                        <Paid sx={{ fontSize: 14 }} /> Pay
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleWaive(fine)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900"
                      >
                        <Gavel sx={{ fontSize: 14 }} /> Waive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Typography sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
            No fines found.
          </Typography>
        </div>
      )}
    </div>
  );
};

export default MyFines;
