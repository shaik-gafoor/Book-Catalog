import React, { useState } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  InputLabel,
} from "@mui/material";
import { Search as SearchIcon, Sort as SortIcon } from "@mui/icons-material";
import CatalogFilter from "./CatalogFilter";

const genres = [
  {
    active: true,
    bookCount: 45,
    code: "FANTASY",
    displayOrder: 1,
    id: 1,
    name: "Fantasy",
    description:
      "Genre that features magical elements, mythical creatures, and imaginary worlds.",
  },
  {
    active: true,
    bookCount: 38,
    code: "SCI_FI",
    displayOrder: 2,
    id: 2,
    name: "Science Fiction",
    description:
      "Genre focused on futuristic technology, space exploration, and scientific concepts.",
  },
  {
    active: true,
    bookCount: 52,
    code: "MYSTERY",
    displayOrder: 3,
    id: 3,
    name: "Mystery",
    description:
      "Genre involving suspenseful events, crime solving, and investigations.",
  },
  {
    active: true,
    bookCount: 29,
    code: "ROMANCE",
    displayOrder: 4,
    id: 4,
    name: "Romance",
    description:
      "Genre centered around love stories, emotional relationships, and romance.",
  },
  {
    active: true,
    bookCount: 41,
    code: "HORROR",
    displayOrder: 5,
    id: 5,
    name: "Horror",
    description:
      "Genre designed to create fear, suspense, and psychological tension.",
  },
];

const inputSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: "0.875rem",
    borderRadius: "10px",
    color: "#374151",
    bgcolor: "#ffffff",
    "& fieldset": { borderColor: "#e5e7eb" },
    "&:hover fieldset": { borderColor: "#d1d5db" },
    "&.Mui-focused fieldset": { borderColor: "#1a1a1a", borderWidth: 1 },
  },
  "& .MuiInputLabel-root": { fontSize: "0.875rem", color: "#9ca3af" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#1a1a1a" },
};

const selectSx = {
  fontSize: "0.83rem",
  borderRadius: "10px",
  color: "#374151",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d1d5db" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#1a1a1a",
    borderWidth: 1,
  },
};

const BookPage = () => {
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("DESC");

  const selectedGenre = genres.find((g) => g.id === selectedGenreId);

  const handleGenreSelect = (genreId) => setSelectedGenreId(genreId);

  const handleSortChange = (value) => {
    const [field, direction] = value.split("-");
    setSortBy(field);
    setSortDirection(direction.toUpperCase());
  };

  const getCurrentSortValue = () => `${sortBy}-${sortDirection.toLowerCase()}`;

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

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0 space-y-4">
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
                sx={selectSx}
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

        {/* Main */}
        <main className="flex-1 space-y-4">
          {/* Search + Sort */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <TextField
                fullWidth
                size="small"
                placeholder="Search by title, author, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={inputSx}
              />
            </div>

            {/* Sort */}
            <div className="md:w-56">
              <FormControl fullWidth size="small" sx={inputSx}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={getCurrentSortValue()}
                  onChange={(e) => handleSortChange(e.target.value)}
                  label="Sort By"
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
                    </InputAdornment>
                  }
                  sx={selectSx}
                >
                  <MenuItem value="title-asc" sx={{ fontSize: "0.83rem" }}>
                    Title (A–Z)
                  </MenuItem>
                  <MenuItem value="title-desc" sx={{ fontSize: "0.83rem" }}>
                    Title (Z–A)
                  </MenuItem>
                  <MenuItem value="author-asc" sx={{ fontSize: "0.83rem" }}>
                    Author (A–Z)
                  </MenuItem>
                  <MenuItem value="author-desc" sx={{ fontSize: "0.83rem" }}>
                    Author (Z–A)
                  </MenuItem>
                  <MenuItem value="createdAt-desc" sx={{ fontSize: "0.83rem" }}>
                    Newest First
                  </MenuItem>
                  <MenuItem value="createdAt-asc" sx={{ fontSize: "0.83rem" }}>
                    Oldest First
                  </MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          {/* Book Grid placeholder */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            Book grid will appear here
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookPage;
