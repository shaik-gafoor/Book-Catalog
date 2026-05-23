import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { MenuBook } from "@mui/icons-material";
import StatesCard from "./StatesCard";
import LoanCard from "../MyLoans/LoanCard";
import MyReservationCard from "../MyReservations/Myreservationcard";
import {
  getBookStatus,
  getMyBookLoans,
  getMyReservations,
  getWishlist,
} from "../../api/libraryApi";

const Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState({
    totalActiveBooks: 0,
    totalAvailableBooks: 0,
  });
  const [counts, setCounts] = useState({
    loans: 0,
    reservations: 0,
    wishlist: 0,
  });
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [bookStatus, loanData, reservationData, wishlistData] =
          await Promise.all([
            getBookStatus(),
            getMyBookLoans({ page: 0, size: 5 }),
            getMyReservations({ page: 0, size: 5 }),
            getWishlist({ page: 0, size: 5 }),
          ]);
        setStatus(
          bookStatus || { totalActiveBooks: 0, totalAvailableBooks: 0 },
        );
        setCounts({
          loans: loanData?.totalElements ?? loanData?.content?.length ?? 0,
          reservations:
            reservationData?.totalElements ??
            reservationData?.content?.length ??
            0,
          wishlist:
            wishlistData?.totalElements ?? wishlistData?.content?.length ?? 0,
        });
        setLoans(loanData?.content || []);
        setReservations(reservationData?.content || []);
        setWishlist(wishlistData?.content || []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = [
    {
      id: "active-books",
      title: "Active Books",
      subtitle: "Available in catalog",
      value: status.totalActiveBooks || 0,
      icon: <MenuBook sx={{ fontSize: 26, color: "#374151" }} />,
      bgColor: "bg-gray-100",
      textColor: "text-gray-900",
      borderColor: "border-gray-200",
    },
    {
      id: "available-books",
      title: "Available Books",
      subtitle: "Ready to borrow",
      value: status.totalAvailableBooks || 0,
      icon: <MenuBook sx={{ fontSize: 26, color: "#374151" }} />,
      bgColor: "bg-gray-100",
      textColor: "text-gray-900",
      borderColor: "border-gray-200",
    },
    {
      id: "loans",
      title: "My Loans",
      subtitle: "Current checkouts",
      value: counts.loans,
      icon: <MenuBook sx={{ fontSize: 26, color: "#374151" }} />,
      bgColor: "bg-gray-100",
      textColor: "text-gray-900",
      borderColor: "border-gray-200",
    },
    {
      id: "wishlist",
      title: "Wishlist",
      subtitle: "Saved titles",
      value: counts.wishlist,
      icon: <MenuBook sx={{ fontSize: 26, color: "#374151" }} />,
      bgColor: "bg-gray-100",
      textColor: "text-gray-900",
      borderColor: "border-gray-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 max-w-lg">
          Live library overview pulled from the backend.
        </p>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((item) => (
          <StatesCard key={item.id} {...item} />
        ))}
      </div>

      {loading ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mt-6">
          <Box sx={{ borderBottom: 1, borderColor: "#f3f4f6", px: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{
                "& .MuiTab-root": {
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "#6b7280",
                  textTransform: "none",
                  minHeight: 44,
                  px: 1.5,
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
              <Tab label="Current Loans" />
              <Tab label="Reservations" />
            </Tabs>
          </Box>

          <div className="p-6 space-y-4">
            {tabValue === 0 && (
              <>
                {loans.length > 0 ? (
                  loans.map((loan) => <LoanCard key={loan.id} loan={loan} />)
                ) : (
                  <Typography sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                    No active loans found.
                  </Typography>
                )}
              </>
            )}
            {tabValue === 1 && (
              <>
                {reservations.length > 0 ? (
                  reservations.map((reservation) => (
                    <MyReservationCard
                      key={reservation.id}
                      reservation={reservation}
                    />
                  ))
                ) : (
                  <Typography sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                    No reservations found.
                  </Typography>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
