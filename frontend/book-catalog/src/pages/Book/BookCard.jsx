import React from "react";
import { Button } from "@mui/material";
import {
  MenuBook as BookIcon,
  PersonOutlined as PersonIcon,
  CopyAll as CopiesIcon,
} from "@mui/icons-material";

const BookCard = ({ book }) => {
  const isAvailable = book.availableCopies > 0;

  const handleViewDetails = () => {
    // Implement navigation to book details page
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer hover:-translate-y-0.5">
      {/* Book Cover */}
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <BookIcon sx={{ fontSize: 44, color: "#d1d5db" }} />
            <span className="text-xs text-gray-400 font-medium">
              {book.genreName}
            </span>
          </div>
        )}

        {/* Availability badge */}
        <div className="absolute top-3 right-3">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: isAvailable ? "#f9fafb" : "#f3f4f6",
              color: isAvailable ? "#111827" : "#6b7280",
              border: isAvailable ? "1px solid #e5e7eb" : "1px solid #e5e7eb",
            }}
          >
            {isAvailable ? "Available" : "Checked Out"}
          </span>
        </div>
      </div>

      {/* Book Details */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-gray-700 transition-colors leading-snug">
          {book.title}
        </h3>

        {/* Author */}
        <div className="flex items-center gap-1.5 text-gray-500 mb-3">
          <PersonIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
          <span className="text-xs line-clamp-1">{book.author}</span>
        </div>

        {/* Copies + Pages */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <CopiesIcon sx={{ fontSize: 13, color: "#d1d5db" }} />
            <span>
              {book.availableCopies}/{book.totalCopies} copies
            </span>
          </div>
          <span>{book.pages} pages</span>
        </div>

        {/* Description */}
        {book.description && (
          <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        )}

        {/* Action Button */}
        <Button
          variant="outlined"
          fullWidth
          size="small"
          onClick={handleViewDetails}
          sx={{
            textTransform: "none",
            fontSize: "0.78rem",
            fontWeight: 600,
            borderRadius: "8px",
            borderColor: "#e5e7eb",
            color: "#374151",
            py: 0.8,
            "&:hover": {
              borderColor: "#1a1a1a",
              bgcolor: "#1a1a1a",
              color: "#ffffff",
            },
            transition: "all 0.2s ease",
          }}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default BookCard;
