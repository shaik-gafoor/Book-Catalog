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
import { ReceiptLong } from "@mui/icons-material";
import LoanCard from "./LoanCard.jsx";
import { checkinBook, getMyBookLoans, renewBook } from "../../api/libraryApi";

const tabs = [
  { label: "All", value: null },
  { label: "Checked Out", value: "CHECKED_OUT" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Returned", value: "RETURNED" },
  { label: "Lost", value: "LOST" },
  { label: "Damaged", value: "DAMAGED" },
];

const MyLoans = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadLoans = async () => {
      setLoading(true);
      setError("");
      try {
        const status = tabs[activeTab]?.value;
        const data = await getMyBookLoans({
          status: status || undefined,
          page: 0,
          size: 50,
        });
        setLoans(data?.content || []);
      } catch (err) {
        setError(err.message || "Failed to load loans");
      } finally {
        setLoading(false);
      }
    };

    loadLoans();
  }, [activeTab]);

  const handleRenew = async (loan) => {
    try {
      const res = await renewBook({
        bookLoanId: loan.id,
        extensionDays: 14,
        notes: "Renewed from My Loans",
      });
      setMessage(res?.message || "Loan renewed");
      const data = await getMyBookLoans({
        status: tabs[activeTab]?.value || undefined,
        page: 0,
        size: 50,
      });
      setLoans(data?.content || []);
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
      setMessage(res?.message || "Book checked in");
      const data = await getMyBookLoans({
        status: tabs[activeTab]?.value || undefined,
        page: 0,
        size: 50,
      });
      setLoans(data?.content || []);
    } catch (err) {
      setError(err.message || "Could not check in book");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ReceiptLong sx={{ fontSize: 22, color: "#374151" }} />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            My Loans
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Track checkout dates, renew books, and check items back in.
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
            onChange={(_, newValue) => setActiveTab(newValue)}
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
              <Tab key={tab.label} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      </Card>

      {loading ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={28} />
        </Box>
      ) : loans.length > 0 ? (
        <div className="space-y-4">
          {loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onRenew={handleRenew}
              onCheckin={handleCheckin}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Typography sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
            No loans found for this filter.
          </Typography>
        </div>
      )}
    </div>
  );
};

export default MyLoans;
