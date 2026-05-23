import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  MenuBook,
  Search as SearchIcon,
  Sort as SortIcon,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import BookCard from "./BookCard";
import {
  addToWishlist,
  checkoutBook,
  createReservation,
  getBooks,
  getCatalogs,
} from "../../api/libraryApi";

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

const BookPage = () => {
  const location = useLocation();
  const [catalogs, setCatalogs] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("DESC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location.state]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const data = await getCatalogs();
        setCatalogs(Array.isArray(data) ? data : data?.content || []);
      } catch (err) {
        setError(err.message || "Failed to load catalogs");
      }
    };

    loadCatalogs();
  }, []);

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      setError("");
      try {
        const pageSize = 10;
        let page = 0;
        let collectedBooks = [];
        let lastPage = false;

        while (!lastPage) {
          const data = await getBooks({
            page,
            size: pageSize,
            catalogId: selectedCatalogId || undefined,
            availableOnly:
              availabilityFilter === "AVAILABLE"
                ? true
                : availabilityFilter === "CHECKED_OUT"
                  ? false
                  : undefined,
            sortBy,
            sortDirection,
          });

          const content = data?.content || data?.value || [];
          collectedBooks = collectedBooks.concat(content);
          lastPage = Boolean(data?.last);
          page += 1;

          if (!content.length) {
            break;
          }
        }

        setBooks(collectedBooks);
      } catch (err) {
        setError(err.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [selectedCatalogId, availabilityFilter, sortBy, sortDirection]);

  const filteredBooks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return books;

    return books.filter((book) => {
      return [book.title, book.author, book.description, book.catalogName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [books, searchTerm]);

  const handleWishlist = async (book) => {
    try {
      const res = await addToWishlist(book.id);
      setMessage(res?.message || "Added to wishlist");
    } catch (err) {
      setError(err.message || "Could not add to wishlist");
    }
  };

  const handleReserve = async (book) => {
    try {
      const res = await createReservation({
        bookId: book.id,
        notes: "Reserved from catalog",
      });
      setMessage(res?.message || "Reservation created");
    } catch (err) {
      setError(err.message || "Could not reserve book");
    }
  };

  const handleCheckout = async (book) => {
    try {
      const res = await checkoutBook({
        bookId: book.id,
        checkoutDays: 14,
        notes: "Checkout from catalog",
      });
      setMessage(res?.message || "Checkout created");
    } catch (err) {
      setError(err.message || "Could not checkout book");
    }
  };

  const handleBookUpdated = (updatedBook) => {
    if (!updatedBook?.id) return;

    setBooks((currentBooks) =>
      currentBooks.map((book) =>
        String(book.id) === String(updatedBook.id) ? updatedBook : book,
      ),
    );
    setMessage(`Updated ${updatedBook.title || "book"}`);
  };

  const selectedCatalog = catalogs.find(
    (catalog) => String(catalog.id) === String(selectedCatalogId),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <MenuBook sx={{ fontSize: 22, color: "#374151" }} />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Browse Books
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          {selectedCatalog
            ? `Showing books in ${selectedCatalog.name}`
            : "Explore the live catalog"}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by title or author"
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

        <FormControl fullWidth size="small">
          <InputLabel>Catalog</InputLabel>
          <Select
            value={selectedCatalogId}
            label="Catalog"
            onChange={(e) => setSelectedCatalogId(e.target.value)}
            sx={inputSx}
          >
            <MenuItem value="">All catalogs</MenuItem>
            {catalogs.map((catalog) => (
              <MenuItem key={catalog.id} value={catalog.id}>
                {catalog.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Availability</InputLabel>
          <Select
            value={availabilityFilter}
            label="Availability"
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            sx={inputSx}
          >
            <MenuItem value="ALL">All books</MenuItem>
            <MenuItem value="AVAILABLE">Available only</MenuItem>
            <MenuItem value="CHECKED_OUT">Checked out</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Sort By</InputLabel>
          <Select
            value={`${sortBy}-${sortDirection.toLowerCase()}`}
            label="Sort By"
            onChange={(e) => {
              const [field, direction] = e.target.value.split("-");
              setSortBy(field);
              setSortDirection(direction.toUpperCase());
            }}
            sx={inputSx}
            startAdornment={
              <InputAdornment position="start">
                <SortIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
              </InputAdornment>
            }
          >
            <MenuItem value="createdAt-desc">Newest</MenuItem>
            <MenuItem value="createdAt-asc">Oldest</MenuItem>
            <MenuItem value="title-asc">Title A-Z</MenuItem>
            <MenuItem value="title-desc">Title Z-A</MenuItem>
            <MenuItem value="author-asc">Author A-Z</MenuItem>
            <MenuItem value="author-desc">Author Z-A</MenuItem>
          </Select>
        </FormControl>
      </div>

      {loading ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onWishlist={handleWishlist}
              onReserve={handleReserve}
              onCheckout={handleCheckout}
              onBookUpdated={handleBookUpdated}
            />
          ))}
        </div>
      )}

      {!loading && filteredBooks.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center mt-6">
          <Typography sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
            No books matched the current filters.
          </Typography>
        </div>
      )}
    </div>
  );
};

export default BookPage;
