import React, { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import StatesCard from "./StatesCard";
import {
  getBookStatus,
  getMyBookLoans,
  getWishlist,
} from "../../api/libraryApi";
import {
  LibraryBooks,
  BookmarkBorder,
  Favorite,
  MenuBook,
} from "@mui/icons-material";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState({
    totalActiveBooks: 0,
    totalAvailableBooks: 0,
  });
  const [counts, setCounts] = useState({ loans: 0, wishlist: 0 });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [bookStatus, loanData, wishlistData] = await Promise.all([
          getBookStatus(),
          getMyBookLoans({ page: 0, size: 5 }),
          getWishlist({ page: 0, size: 5 }),
        ]);
        setStatus(
          bookStatus || { totalActiveBooks: 0, totalAvailableBooks: 0 },
        );
        setCounts({
          loans: loanData?.totalElements ?? loanData?.content?.length ?? 0,
          wishlist:
            wishlistData?.totalElements ?? wishlistData?.content?.length ?? 0,
        });
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
      icon: <LibraryBooks sx={{ fontSize: 22, color: "#5F5E5A" }} />,
    },
    {
      id: "available-books",
      title: "Available Now",
      subtitle: "Ready to borrow",
      value: status.totalAvailableBooks || 0,
      icon: <MenuBook sx={{ fontSize: 22, color: "#5F5E5A" }} />,
    },
    {
      id: "loans",
      title: "My Loans",
      subtitle: "Current checkouts",
      value: counts.loans,
      icon: <BookmarkBorder sx={{ fontSize: 22, color: "#5F5E5A" }} />,
    },
    {
      id: "wishlist",
      title: "Wishlist",
      subtitle: "Saved titles",
      value: counts.wishlist,
      icon: <Favorite sx={{ fontSize: 22, color: "#5F5E5A" }} />,
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#faf9f6",
        overflow: "hidden",
      }}
    >
      {/* ── Expanded Hero Image (45% Height) ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "65%",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <img
          src="/dashoardimage.jpg"
          alt="Library shelves"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            display: "block",
          }}
        />
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10,10,8,0.52)",
          }}
        />
        {/* Text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 40px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.48)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "8px",
              fontWeight: 400,
            }}
          >
            {formattedDate}
          </p>
          <h1
            style={{
              fontFamily:
                "'Playfair Display', 'DM Serif Display', Georgia, serif",
              fontSize: "clamp(18px, 2.2vw, 32px)",
              fontWeight: 400,
              color: "#ffffff",
              lineHeight: 1.3,
              maxWidth: "560px",
              margin: "0 0 8px",
            }}
          >
            "A reader lives a thousand lives before he dies."
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.45)",
              fontStyle: "italic",
              fontWeight: 300,
              marginBottom: "14px",
            }}
          >
            — George R.R. Martin
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: "rgba(255,255,255,0.1)",
              border: "0.5px solid rgba(255,255,255,0.2)",
              borderRadius: "999px",
              padding: "5px 18px",
              fontSize: "11px",
              color: "rgba(255,255,255,0.72)",
              fontWeight: 300,
            }}
          >
            {greeting},{" "}
            <em
              style={{
                fontStyle: "italic",
                color: "#fff",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Reader
            </em>
          </div>
        </div>
      </div>

      {/* ── Cards Area (Flushed Top Alignment) ── */}
      <div
        style={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent:
            "flex-start" /* Pulls cards right up against the image boundary */,
          padding: "24px 28px",
          background: "#faf9f6",
          overflow: "hidden",
        }}
      >
        {error && (
          <div
            style={{
              marginBottom: "12px",
              padding: "10px 16px",
              borderRadius: "12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              fontSize: "13px",
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <CircularProgress size={24} sx={{ color: "#2d5a3d" }} />
          </Box>
        ) : (
          <>
            <p
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.13em",
                color: "#aaa9a2",
                fontWeight: 500,
                marginBottom: "14px",
                marginTop: "4px",
              }}
            >
              Your library at a glance
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "16px",
              }}
            >
              {stats.map((item) => (
                <StatesCard key={item.id} {...item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
