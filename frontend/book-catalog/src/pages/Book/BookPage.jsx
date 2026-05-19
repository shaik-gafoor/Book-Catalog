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
import BookCard from "./BookCard";

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

const books = [
  {
    active: true,
    author: "Robert C. Martin",
    availableCopies: 5,
    coverImageUrl: null,
    createdAt: "2026-05-18T10:15:20.000Z",
    description:
      "A complete guide to writing clean, maintainable, and professional code.",
    genreCode: "PROGRAMMING",
    genreId: 100,
    genreName: "Programming",
    id: 1,
    isbn: "978-0-13-235088-4",
    language: "English",
    pages: 464,
    price: 599,
    publicationDate: "2024-01-10",
    publisher: "Prentice Hall",
    title: "Clean Code",
    totalCopies: 10,
  },
  {
    active: true,
    author: "Joshua Bloch",
    availableCopies: 3,
    coverImageUrl: null,
    createdAt: "2026-05-18T10:20:00.000Z",
    description: "Best practices and advanced techniques for Java programming.",
    genreCode: "PROGRAMMING",
    genreId: 100,
    genreName: "Programming",
    id: 2,
    isbn: "978-0-13-468599-1",
    language: "English",
    pages: 416,
    price: 699,
    publicationDate: "2023-08-15",
    publisher: "Addison-Wesley",
    title: "Effective Java",
    totalCopies: 8,
  },
  {
    active: true,
    author: "Andrew Hunt",
    availableCopies: 4,
    coverImageUrl: null,
    createdAt: "2026-05-18T10:25:30.000Z",
    description: "A practical handbook for modern software developers.",
    genreCode: "PROGRAMMING",
    genreId: 100,
    genreName: "Programming",
    id: 3,
    isbn: "978-0-13-595705-9",
    language: "English",
    pages: 352,
    price: 549,
    publicationDate: "2022-11-05",
    publisher: "Addison-Wesley",
    title: "The Pragmatic Programmer",
    totalCopies: 7,
  },
  {
    active: true,
    author: "Eric Evans",
    availableCopies: 0,
    coverImageUrl: null,
    createdAt: "2026-05-18T10:30:00.000Z",
    description: "A detailed guide to domain-driven software design concepts.",
    genreCode: "PROGRAMMING",
    genreId: 100,
    genreName: "Programming",
    id: 4,
    isbn: "978-0-32-112521-7",
    language: "English",
    pages: 560,
    price: 799,
    publicationDate: "2021-06-20",
    publisher: "Pearson",
    title: "Domain-Driven Design",
    totalCopies: 5,
  },
  {
    active: true,
    author: "Martin Fowler",
    availableCopies: 6,
    coverImageUrl: null,
    createdAt: "2026-05-18T10:35:45.000Z",
    description:
      "Techniques and principles for improving existing code structure.",
    genreCode: "PROGRAMMING",
    genreId: 100,
    genreName: "Programming",
    id: 5,
    isbn: "978-0-13-475759-9",
    language: "English",
    pages: 448,
    price: 649,
    publicationDate: "2020-09-12",
    publisher: "Addison-Wesley",
    title: "Refactoring",
    totalCopies: 12,
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

  // Filter books client-side
  const filteredBooks = books
    .filter((book) => {
      const matchesSearch =
        !searchTerm ||
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAvailability =
        availabilityFilter === "All" ||
        (availabilityFilter === "AVAILABLE" && book.availableCopies > 0) ||
        (availabilityFilter === "CHECKED_OUT" && book.availableCopies === 0);
      return matchesSearch && matchesAvailability;
    })
    .sort((a, b) => {
      const dir = sortDirection === "ASC" ? 1 : -1;
      if (sortBy === "title") return a.title.localeCompare(b.title) * dir;
      if (sortBy === "author") return a.author.localeCompare(b.author) * dir;
      return (new Date(a.createdAt) - new Date(b.createdAt)) * dir;
    });

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

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}{" "}
              found
            </p>
          </div>

          {/* Book Grid */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-sm">
                No books match your filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setAvailabilityFilter("All");
                  setSelectedGenreId(null);
                }}
                className="mt-3 text-xs text-gray-500 underline hover:text-gray-800"
              >
                Clear filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BookPage;
