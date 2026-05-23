import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { Favorite, Delete } from "@mui/icons-material";
import { getWishlist, removeFromWishlist } from "../../api/libraryApi";
import { formatDateTime, formatCurrency } from "../../utils/format";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getWishlist({ page: 0, size: 20 });
      setWishlist(data?.content || []);
    } catch (err) {
      setError(err.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (bookId) => {
    try {
      const res = await removeFromWishlist(bookId);
      setMessage(res?.message || "Removed from wishlist");
      await loadWishlist();
    } catch (err) {
      setError(err.message || "Could not remove from wishlist");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Favorite sx={{ fontSize: 22, color: "#374151" }} />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Wishlist
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Saved books you may want to borrow later.
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

      {loading ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={28} />
        </Box>
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {wishlist.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                  {entry.book?.catalogName || "Wishlist item"}
                </p>
                <h3 className="text-lg font-bold text-gray-900">
                  {entry.book?.title}
                </h3>
                <p className="text-sm text-gray-500">{entry.book?.author}</p>
                <p className="text-sm text-gray-500 mt-2">
                  ISBN {entry.book?.isbn}
                </p>
                <p className="text-sm text-gray-500">
                  Price {formatCurrency(entry.book?.price)}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Added {formatDateTime(entry.addedAt)}
                </p>
                {entry.notes && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    {entry.notes}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemove(entry.book?.id)}
                className="inline-flex items-center gap-1 self-start rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900"
              >
                <Delete sx={{ fontSize: 14 }} /> Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Typography sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
            Your wishlist is empty.
          </Typography>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
