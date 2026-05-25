import React, { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import {
  MenuBook,
  Search as SearchIcon,
  TuneOutlined,
  Sort as SortIcon,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import BookCard from "./BookCard";
import {
  addToWishlist,
  deleteBook,
  checkoutBook,
  createReservation,
  getActiveSubscription,
  getBooks,
  getCatalogs,
  getAuthUser,
} from "../../api/libraryApi";

const T = {
  sand: "#f7f6f3",
  white: "#ffffff",
  border: "#ece9e3",
  border2: "#e2ddd8",
  text: "#1c1917",
  text2: "#44403c",
  muted: "#78716c",
  faint: "#a8a29e",
  light: "#f5f4f1",
  indigo: "#6366f1",
  radius: "14px",
  radiusSm: "8px",
};

/* ── Filter sidebar item ── */
const FilterItem = ({ active, onClick, children }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        textAlign: "left",
        padding: "9px 14px",
        fontFamily: "inherit",
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        color: active ? T.white : hov ? T.text2 : T.muted,
        background: active ? T.text : hov ? T.light : "transparent",
        border: "none",
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {children}
    </button>
  );
};

/* ── Filter card wrapper ── */
const FilterCard = ({ icon, title, children }) => (
  <div
    style={{
      background: T.white,
      border: `1px solid ${T.border}`,
      borderRadius: T.radius,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "11px 14px",
        borderBottom: `1px solid ${T.border}`,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: T.text2,
      }}
    >
      {icon}
      {title}
    </div>
    {children}
  </div>
);

const FREE_SUBSCRIPTION = {
  planCode: "FREE",
  maxBooksPerMonth: 3,
  maxConcurrentCheckouts: 1,
  maxDaysPerBook: 7,
  maxRenewalsPerBook: 0,
  booksCheckedOutThisMonth: 0,
  currentConcurrentCheckouts: 0,
  monthlyQuotaResetDate: null,
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeSub, setActiveSub] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const subscriptionSnapshot = activeSub || FREE_SUBSCRIPTION;

  useEffect(() => {
    if (location.state?.message) setMessage(location.state.message);
  }, [location.state]);

  useEffect(() => {
    const user = getAuthUser();
    if (!user?.id) {
      return;
    }
    setIsAdmin(String(user.role || "").toUpperCase() === "ROLE_ADMIN");
    getActiveSubscription(user.id)
      .then((sub) => setActiveSub(sub || null))
      .catch(() => setActiveSub(null));
  }, []);

  useEffect(() => {
    getCatalogs()
      .then((d) => setCatalogs(Array.isArray(d) ? d : d?.content || []))
      .catch((e) => setError(e.message || "Failed to load catalogs"));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        let page = 0,
          collected = [],
          last = false;
        while (!last) {
          const data = await getBooks({
            page,
            size: 10,
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
          collected = collected.concat(content);
          last = Boolean(data?.last);
          page++;
          if (!content.length) break;
        }
        setBooks(collected);
      } catch (e) {
        setError(e.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCatalogId, availabilityFilter, sortBy, sortDirection]);

  const filteredBooks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) =>
      [b.title, b.author, b.description, b.catalogName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [books, searchTerm]);

  const handleWishlist = async (b) => {
    try {
      const r = await addToWishlist(b.id);
      setMessage(r?.message || "Added to wishlist");
    } catch (e) {
      setError(e.message);
    }
  };
  const handleReserve = async (b) => {
    try {
      const r = await createReservation({
        bookId: b.id,
        notes: "Reserved from catalog",
      });
      setMessage(r?.message || "Reservation created");
    } catch (e) {
      setError(e.message);
    }
  };
  const handleCheckout = async (b) => {
    try {
      const r = await checkoutBook({
        bookId: b.id,
        checkoutDays: 14,
        notes: "Checkout from catalog",
      });
      setMessage(r?.message || "Checkout created");
    } catch (e) {
      setError(e.message);
    }
  };
  const handleBookUpdated = (u) => {
    if (!u?.id) return;
    setBooks((bs) => bs.map((b) => (String(b.id) === String(u.id) ? u : b)));
    setMessage(`Updated ${u.title || "book"}`);
  };

  const handleDeleteBook = async (book) => {
    try {
      await deleteBook(book.id);
      setBooks((bs) => bs.filter((b) => String(b.id) !== String(book.id)));
      setMessage(`Deleted ${book.title || "book"}`);
    } catch (e) {
      setError(e.message || "Failed to delete book");
    }
  };

  const selectedCatalog = catalogs.find(
    (c) => String(c.id) === String(selectedCatalogId),
  );

  const SORT_OPTIONS = [
    { val: "createdAt-DESC", label: "Newest First" },
    { val: "createdAt-ASC", label: "Oldest First" },
    { val: "title-ASC", label: "Title A → Z" },
    { val: "title-DESC", label: "Title Z → A" },
    { val: "author-ASC", label: "Author A → Z" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.sand,
        fontFamily: "'DM Sans',sans-serif",
        padding: "32px 36px 56px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <MenuBook sx={{ fontSize: 22, color: T.text2 }} />
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 26,
                fontWeight: 600,
                color: T.text,
                letterSpacing: "-0.3px",
              }}
            >
              Browse Books
            </h1>
          </div>
          <p style={{ fontSize: 12, color: T.faint }}>
            {selectedCatalog
              ? `Showing books in ${selectedCatalog.name}`
              : "Explore the complete catalog"}
          </p>
        </div>
        <span
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 11,
            fontWeight: 600,
            color: T.muted,
          }}
        >
          {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Toasts */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: T.radiusSm,
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: 500,
            color: "#dc2626",
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}
      {message && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: T.radiusSm,
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: 500,
            color: "#166534",
            marginBottom: 20,
          }}
        >
          {message}
        </div>
      )}

      {/* Layout — sidebar + grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
        {/* ── Sidebar ── */}
        <aside className="flex flex-col gap-3">
          {/* Search */}
          <div style={{ position: "relative" }}>
            <SearchIcon
              sx={{
                fontSize: 16,
                color: T.faint,
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              placeholder="Search title or author…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: "100%",
                fontFamily: "inherit",
                fontSize: 13,
                color: T.text,
                background: T.white,
                outline: "none",
                border: `1px solid ${searchFocused ? T.text : T.border}`,
                borderRadius: T.radiusSm,
                padding: "10px 12px 10px 36px",
                boxShadow: searchFocused
                  ? "0 0 0 3px rgba(28,25,23,0.06)"
                  : "none",
                transition: "border-color 0.18s, box-shadow 0.18s",
              }}
            />
          </div>

          {/* Catalog */}
          <FilterCard
            icon={<TuneOutlined sx={{ fontSize: 14, color: T.text2 }} />}
            title="Catalog"
          >
            {[{ id: "", name: "All Catalogs" }, ...catalogs].map((c) => (
              <FilterItem
                key={c.id}
                active={String(selectedCatalogId) === String(c.id)}
                onClick={() => setSelectedCatalogId(c.id)}
              >
                <span>{c.name}</span>
                {c.bookCount !== undefined && (
                  <span
                    style={{
                      fontSize: 10,
                      borderRadius: 10,
                      padding: "1px 7px",
                      fontWeight: 500,
                      background:
                        String(selectedCatalogId) === String(c.id)
                          ? "rgba(255,255,255,0.2)"
                          : T.light,
                      color:
                        String(selectedCatalogId) === String(c.id)
                          ? T.white
                          : T.faint,
                    }}
                  >
                    {c.bookCount}
                  </span>
                )}
              </FilterItem>
            ))}
          </FilterCard>

          {/* Availability */}
          <FilterCard
            icon={<MenuBook sx={{ fontSize: 14, color: T.text2 }} />}
            title="Availability"
          >
            {[
              { val: "ALL", label: "All Books" },
              { val: "AVAILABLE", label: "Available Only" },
              { val: "CHECKED_OUT", label: "Checked Out" },
            ].map(({ val, label }) => (
              <FilterItem
                key={val}
                active={availabilityFilter === val}
                onClick={() => setAvailabilityFilter(val)}
              >
                {label}
              </FilterItem>
            ))}
          </FilterCard>

          {/* Sort */}
          <FilterCard
            icon={<SortIcon sx={{ fontSize: 14, color: T.text2 }} />}
            title="Sort By"
          >
            {SORT_OPTIONS.map(({ val, label }) => {
              const [field, dir] = val.split("-");
              return (
                <FilterItem
                  key={val}
                  active={sortBy === field && sortDirection === dir}
                  onClick={() => {
                    setSortBy(field);
                    setSortDirection(dir);
                  }}
                >
                  {label}
                </FilterItem>
              );
            })}
          </FilterCard>
        </aside>

        {/* ── Book grid ── */}
        <main>
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "80px 24px",
              }}
            >
              <CircularProgress size={24} sx={{ color: T.faint }} />
              <span
                style={{
                  fontSize: 11,
                  color: T.faint,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Loading books…
              </span>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredBooks.map((book, i) => (
                <BookCard
                  key={book.id}
                  book={book}
                  animIndex={i}
                  onWishlist={handleWishlist}
                  onReserve={handleReserve}
                  onCheckout={handleCheckout}
                  onDelete={isAdmin ? handleDeleteBook : undefined}
                  onBookUpdated={handleBookUpdated}
                  activeSub={subscriptionSnapshot}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                background: T.white,
                border: `1px solid ${T.border}`,
                borderRadius: T.radius,
                padding: "64px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  background: T.light,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radius,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <MenuBook sx={{ fontSize: 24, color: "#c4bfb8" }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.muted }}>
                No books found
              </p>
              <p style={{ fontSize: 12, color: T.faint }}>
                Try adjusting the filters or search term
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BookPage;
