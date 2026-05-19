import React, { useState } from "react";
import { Box, Card, Tab, Tabs, Typography } from "@mui/material";
import { ReceiptLong } from "@mui/icons-material";
import { tabs } from "./tabs.js";
import { loans } from "./loans.js";
import LoanCard from "./LoanCard.jsx";

const MyLoans = () => {
  const [activeTab, setActiveTab] = useState(0);

  const activeTabValue = tabs[activeTab]?.value;

  const filteredLoans =
    activeTabValue === null
      ? loans
      : loans.filter((loan) => loan.status === activeTabValue);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ReceiptLong sx={{ fontSize: 22, color: "#374151" }} />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            My Loans
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Manage your book loans, track due dates, and return books
        </p>
      </div>

      {/* Tabs */}
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
              "& .MuiTabs-indicator": {
                backgroundColor: "#1a1a1a",
                height: 2,
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.label} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      </Card>

      {/* Loan List */}
      {filteredLoans.length > 0 ? (
        <div className="space-y-4">
          {filteredLoans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
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
