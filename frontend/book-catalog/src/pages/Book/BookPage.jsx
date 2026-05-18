import React, { useState } from "react";
import { FormControl, Select, MenuItem } from "@mui/material";
import CatalogFilter from "./CatalogFilter";

const genres = [
  {
    active: true,
    bookCount: 45,
    code: "FANTASY",
    createdAt: "2025-10-10T10:43:50.987654",
    description:
      "Genre that features magical elements, mythical creatures, and imaginary worlds.",
    displayOrder: 1,
    id: 1,
    name: "Fantasy",
    parentGenreId: null,
    parentGenreName: null,
    subGenres: null,
    updatedAt: "2025-10-10T10:43:50.987654",
  },
  {
    active: true,
    bookCount: 38,
    code: "SCI_FI",
    createdAt: "2025-10-10T10:43:50.987654",
    description:
      "Genre focused on futuristic technology, space exploration, and scientific concepts.",
    displayOrder: 2,
    id: 2,
    name: "Science Fiction",
    parentGenreId: null,
    parentGenreName: null,
    subGenres: null,
    updatedAt: "2025-10-10T10:43:50.987654",
  },
  {
    active: true,
    bookCount: 52,
    code: "MYSTERY",
    createdAt: "2025-10-10T10:43:50.987654",
    description:
      "Genre involving suspenseful events, crime solving, and investigations.",
    displayOrder: 3,
    id: 3,
    name: "Mystery",
    parentGenreId: null,
    parentGenreName: null,
    subGenres: null,
    updatedAt: "2025-10-10T10:43:50.987654",
  },
  {
    active: true,
    bookCount: 29,
    code: "ROMANCE",
    createdAt: "2025-10-10T10:43:50.987654",
    description:
      "Genre centered around love stories, emotional relationships, and romance.",
    displayOrder: 4,
    id: 4,
    name: "Romance",
    parentGenreId: null,
    parentGenreName: null,
    subGenres: null,
    updatedAt: "2025-10-10T10:43:50.987654",
  },
  {
    active: true,
    bookCount: 41,
    code: "HORROR",
    createdAt: "2025-10-10T10:43:50.987654",
    description:
      "Genre designed to create fear, suspense, and psychological tension.",
    displayOrder: 5,
    id: 5,
    name: "Horror",
    parentGenreId: null,
    parentGenreName: null,
    subGenres: null,
    updatedAt: "2025-10-10T10:43:50.987654",
  },
];

const BookPage = () => {
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [availabilityFilter, setAvailabilityFilter] = useState("All");

  // Fixed: derive selectedGenre from state
  const selectedGenre = genres.find((g) => g.id === selectedGenreId);

  const handleGenreSelect = (genreId) => {
    setSelectedGenreId(genreId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Browse Books
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {selectedGenre
            ? `Showing books in ${selectedGenre.name}`
            : "Explore our full library catalog"}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0 space-y-4">
          {/* Genre Filter */}
          <CatalogFilter
            genres={genres}
            selectedGenreId={selectedGenreId}
            onGenreSelect={handleGenreSelect}
          />

          {/* Availability Filter */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 pb-3 border-b border-gray-100">
              Availability
            </h3>
            <FormControl fullWidth size="small">
              <Select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                sx={{
                  fontSize: "0.83rem",
                  borderRadius: "8px",
                  color: "#374151",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e5e7eb",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d1d5db",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1a1a1a",
                    borderWidth: 1,
                  },
                }}
              >
                <MenuItem value="All" sx={{ fontSize: "0.83rem" }}>
                  All Books
                </MenuItem>
                <MenuItem value="AVAILABLE" sx={{ fontSize: "0.83rem" }}>
                  Available Only
                </MenuItem>
                <MenuItem value="CHECKED_OUT" sx={{ fontSize: "0.83rem" }}>
                  Checked Out
                </MenuItem>
              </Select>
            </FormControl>
          </div>
        </aside>

        {/* Book Grid */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            Book grid will appear here
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPage;
