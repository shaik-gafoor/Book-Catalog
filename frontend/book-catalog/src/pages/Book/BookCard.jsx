import React, { useState } from "react";
import { Dialog, DialogContent, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  MenuBook as BookIcon,
  PersonOutlined as PersonIcon,
  Close as CloseIcon,
  BookmarkBorder,
  Bookmark,
  AutoStories,
  Edit,
} from "@mui/icons-material";
import { updateBook } from "../../api/libraryApi";
import UpgradeAlert from "../../components/UpgradeAlert";

/* ── shared tokens ── */
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

/* ── keyframes (injected once) ── */
if (typeof document !== "undefined" && !document.getElementById("bc-kf")) {
  const s = document.createElement("style");
  s.id = "bc-kf";
  s.textContent = `
    @keyframes bcFadeUp {
      from { opacity:0; transform:translateY(14px) scale(0.97); }
      to   { opacity:1; transform:translateY(0)    scale(1);    }
    }
  `;
  document.head.appendChild(s);
}

const buildEditState = (book) => ({
  title: book.title || "",
  author: book.author || "",
  description: book.description || "",
  publisher: book.publisher || "",
  pages: book.pages ?? "",
  totalCopies: book.totalCopies ?? 0,
  availableCopies: book.availableCopies ?? 0,
  price: book.price ?? "",
  coverImagesUrl: book.coverImagesUrl || book.coverImageUrl || "",
});

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

/* ── status badge ── */
const AvailBadge = ({ available }) => (
  <span
    style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      padding: "3px 10px",
      borderRadius: 20,
      border: "1px solid transparent",
      background: available ? "#d1fae5" : "#fef3c7",
      color: available ? "#065f46" : "#92400e",
      borderColor: available ? "#a7f3d0" : "#fde68a",
    }}
  >
    {available ? "Available" : "Checked Out"}
  </span>
);

/* ── action button ── */
const Btn = ({
  variant = "outline",
  onClick,
  disabled,
  children,
  style: extra,
}) => {
  const [hov, setHov] = useState(false);
  const base = {
    fontFamily: "inherit",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.05em",
    padding: "7px 14px",
    borderRadius: T.radiusSm,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    opacity: disabled ? 0.4 : 1,
    transition: "background 0.15s, transform 0.12s",
    transform: hov && !disabled ? "translateY(-1px)" : "none",
  };
  const variants = {
    ghost: {
      ...base,
      background: hov ? T.border : T.light,
      color: T.text2,
      borderColor: T.border,
    },
    outline: {
      ...base,
      background: hov ? T.light : "transparent",
      color: T.text2,
      borderColor: T.border2,
    },
    solid: {
      ...base,
      background: hov ? "#2d2926" : T.text,
      color: T.white,
      borderColor: T.text,
    },
  };
  return (
    <button
      style={{ ...variants[variant], ...extra }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
};

/* ══════════════════════════════════════════════════
   BOOK CARD
══════════════════════════════════════════════════ */
const BookCard = ({
  book,
  onReserve,
  onWishlist,
  onCheckout,
  onBookUpdated,
  animIndex = 0,
  activeSub,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState(buildEditState(book));
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [upgradeAlertOpen, setUpgradeAlertOpen] = useState(false);

  const isAvailable = (book.availableCopies ?? 0) > 0;
  const subscription = activeSub || FREE_SUBSCRIPTION;
  const isFree =
    !activeSub ||
    String(subscription.planCode || "FREE")
      .trim()
      .toUpperCase() === "FREE";
  const atConcurrentLimit =
    (subscription.currentConcurrentCheckouts ?? 0) >=
    (subscription.maxConcurrentCheckouts ?? 1);
  const atMonthlyLimit =
    (subscription.maxBooksPerMonth ?? 3) !== -1 &&
    (subscription.booksCheckedOutThisMonth ?? 0) >=
      (subscription.maxBooksPerMonth ?? 3);
  const canCheckout = !atConcurrentLimit && !atMonthlyLimit;
  const coverUrl = book.coverImagesUrl || book.coverImageUrl;
  const catalogName =
    book.catalogName || book.genreName || book.catalogCode || "General";

  const checkoutWarning = atConcurrentLimit
    ? `You have ${subscription.currentConcurrentCheckouts ?? 0} book(s) checked out. Return a book first, or upgrade for a higher limit.`
    : atMonthlyLimit
      ? `Monthly limit reached (${subscription.booksCheckedOutThisMonth ?? 0}/${subscription.maxBooksPerMonth}). Resets on ${subscription.monthlyQuotaResetDate || "your reset date"}. Upgrade for more books.`
      : "";

  const goToSubscription = () => {
    navigate("/subscriptions");
  };

  const openDialog = () => {
    setEditForm(buildEditState(book));
    setIsEditing(false);
    setOpen(true);
  };
  const closeDialog = () => {
    setIsEditing(false);
    setOpen(false);
  };

  const handleEditChange = (field) => (e) => {
    const v = e.target.value;
    setEditForm((p) => ({
      ...p,
      [field]: v,
      ...(field === "totalCopies" && Number.isFinite(Number(v))
        ? {
            availableCopies: Math.min(
              Number(p.availableCopies || 0),
              Number(v),
            ),
          }
        : null),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        id: book.id,
        isbn: book.isbn,
        catalogId: book.catalogId ?? book.catalog?.id,
        catalogName: book.catalogName,
        catalogCode: book.catalogCode,
        title: editForm.title.trim(),
        author: editForm.author.trim(),
        publisher: editForm.publisher.trim(),
        publicationDate: book.publicationDate || null,
        language: book.language || null,
        pages: editForm.pages === "" ? null : Number(editForm.pages),
        description: editForm.description.trim(),
        totalCopies: Number(editForm.totalCopies),
        availableCopies: Number(editForm.availableCopies),
        price: editForm.price === "" ? null : Number(editForm.price),
        coverImagesUrl: editForm.coverImagesUrl.trim(),
        active: book.active ?? true,
      };
      const updated = await updateBook(book.id, payload);
      if (onBookUpdated) onBookUpdated(updated || { ...book, ...payload });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setWishlisted((v) => !v);
    onWishlist?.(book);
  };

  const handleReserveAction = (e) => {
    e.stopPropagation();
    if (isFree) {
      setUpgradeAlertOpen(true);
      return;
    }
    onReserve?.(book);
  };

  const handleWishlistAction = (e) => {
    e.stopPropagation();
    if (isFree) {
      setUpgradeAlertOpen(true);
      return;
    }
    handleWishlist(e);
  };

  const handleCheckoutAction = (e) => {
    e.stopPropagation();
    if (!isAvailable || !canCheckout) {
      return;
    }
    onCheckout?.(book);
  };

  /* ── stat box used in dialog ── */
  const StatBox = ({ label, val }) => (
    <div
      style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.faint,
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 18,
          fontWeight: 600,
          color: T.text,
        }}
      >
        {val}
      </p>
    </div>
  );

  return (
    <>
      {/* ════════════ CARD ════════════ */}
      <div
        role="button"
        tabIndex={0}
        onClick={openDialog}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDialog();
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: T.white,
          border: `1px solid ${hovered ? T.border2 : T.border}`,
          borderRadius: T.radius,
          overflow: "hidden",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
          boxShadow: hovered
            ? "0 10px 36px rgba(0,0,0,0.10)"
            : "0 1px 4px rgba(0,0,0,0.04)",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition:
            "box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease",
          animation: `bcFadeUp 0.38s ease ${Math.min(animIndex * 0.05, 0.45)}s both`,
        }}
      >
        {/* Cover */}
        <div
          style={{
            position: "relative",
            height: 164,
            background: "linear-gradient(135deg,#f0eeeb,#e8e4df)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={book.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.4s ease",
                transform: hovered ? "scale(1.05)" : "scale(1)",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              <BookIcon sx={{ fontSize: 42, color: "#c4bfb8" }} />
              <span
                style={{
                  fontSize: 10,
                  color: T.faint,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {catalogName}
              </span>
            </div>
          )}
          {/* Gradient overlay on cover */}
          {coverUrl && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.22) 0%, transparent 50%)",
              }}
            />
          )}
          {/* Availability */}
          <span style={{ position: "absolute", top: 10, left: 10 }}>
            <AvailBadge available={isAvailable} />
          </span>
          {/* Wishlist heart */}
          <button
            onClick={handleWishlistAction}
            aria-label="Wishlist"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: wishlisted ? "#fee2e2" : "rgba(255,255,255,0.92)",
              backdropFilter: "blur(4px)",
              border: `1px solid ${wishlisted ? "#fca5a5" : T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            {wishlisted ? (
              <Bookmark sx={{ fontSize: 15, color: "#ef4444" }} />
            ) : (
              <BookmarkBorder sx={{ fontSize: 15, color: T.muted }} />
            )}
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "14px 16px 16px",
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: T.indigo,
              marginBottom: 5,
            }}
          >
            {catalogName}
          </span>
          <h3
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 15,
              fontWeight: 600,
              color: T.text,
              lineHeight: 1.35,
              marginBottom: 6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {book.title}
          </h3>
          <p
            style={{
              fontSize: 12,
              color: T.faint,
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <PersonIcon sx={{ fontSize: 12, color: T.faint }} />
            {book.author}
          </p>
          {book.addedByName && (
            <p style={{ fontSize: 10, color: T.faint, marginBottom: 8 }}>
              Added by {book.addedByName}
            </p>
          )}

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: "auto",
              paddingTop: 12,
              borderTop: `1px solid ${T.border}`,
              flexWrap: "wrap",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {onWishlist && (
              <Btn variant="ghost" onClick={handleWishlistAction}>
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </Btn>
            )}
            {onReserve && (
              <Btn variant="outline" onClick={handleReserveAction}>
                Reserve
              </Btn>
            )}
            {onCheckout && (
              <Btn
                variant={isAvailable && canCheckout ? "solid" : "ghost"}
                disabled={!isAvailable || !canCheckout}
                onClick={handleCheckoutAction}
              >
                Checkout
              </Btn>
            )}
          </div>
          {checkoutWarning && onCheckout && (
            <p
              style={{
                marginTop: 10,
                fontSize: 11.5,
                lineHeight: 1.5,
                color: "#b45309",
              }}
            >
              {checkoutWarning}
            </p>
          )}
        </div>
      </div>

      {upgradeAlertOpen && (
        <UpgradeAlert
          title="Reservations and wishlist require an upgrade"
          message="A Basic or Premium plan unlocks reservations, wishlist saves, and loan renewals. Upgrade to keep these actions available."
          onClose={() => setUpgradeAlertOpen(false)}
          onUpgrade={goToSubscription}
        />
      )}

      {/* ════════════ DIALOG ════════════ */}
      <Dialog
        open={open}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          style: {
            borderRadius: 16,
            overflow: "hidden",
            border: `1px solid ${T.border}`,
            boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
          },
        }}
      >
        {/* Dialog cover */}
        <div
          style={{
            position: "relative",
            height: 200,
            background: "linear-gradient(135deg,#f0eeeb,#e8e4df)",
            flexShrink: 0,
          }}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={book.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookIcon sx={{ fontSize: 60, color: "#d1cfc8" }} />
            </div>
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.2), transparent 55%)",
              padding: 12,
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <AvailBadge available={isAvailable} />
          </div>
          <button
            onClick={closeDialog}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 34,
              height: 34,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(4px)",
              border: `1px solid ${T.border}`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: T.text2,
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        <DialogContent style={{ padding: "20px 22px", background: T.sand }}>
          {!isEditing ? (
            <>
              {/* Title block */}
              <div style={{ marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: T.indigo,
                  }}
                >
                  {catalogName}
                </span>
                <h2
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 21,
                    fontWeight: 600,
                    color: T.text,
                    margin: "4px 0 3px",
                  }}
                >
                  {book.title}
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: T.faint,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 13, color: T.faint }} />
                  {book.author}
                </p>
              </div>

              {/* Stats 2×2 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <StatBox
                  label="Available Copies"
                  val={book.availableCopies ?? 0}
                />
                <StatBox label="Total Copies" val={book.totalCopies ?? 0} />
                <StatBox label="Pages" val={book.pages || "—"} />
                <StatBox
                  label="Price"
                  val={book.price ? `₹${book.price}` : "—"}
                />
              </div>

              {/* Description */}
              <div
                style={{
                  background: T.white,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: T.faint,
                    marginBottom: 6,
                  }}
                >
                  Description
                </p>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65 }}>
                  {book.description || "No description available."}
                </p>
              </div>

              {/* Tags */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                {[
                  book.addedByName && `Added by ${book.addedByName}`,
                  book.publisher,
                  isAvailable ? "Available now" : "Checked out",
                ]
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        background: T.white,
                        border: `1px solid ${T.border}`,
                        borderRadius: 20,
                        padding: "3px 11px",
                        color: T.muted,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              {/* Dialog actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 14,
                  borderTop: `1px solid ${T.border}`,
                  gap: 8,
                }}
              >
                <Btn variant="ghost" onClick={() => setIsEditing(true)}>
                  <Edit sx={{ fontSize: 14 }} />
                  Edit
                </Btn>
                <div style={{ display: "flex", gap: 8 }}>
                  {onWishlist && (
                    <Btn variant="outline" onClick={handleWishlistAction}>
                      Wishlist
                    </Btn>
                  )}
                  {onReserve && (
                    <Btn variant="outline" onClick={handleReserveAction}>
                      Reserve
                    </Btn>
                  )}
                  {onCheckout && (
                    <Btn
                      variant={isAvailable && canCheckout ? "solid" : "ghost"}
                      disabled={!isAvailable || !canCheckout}
                      onClick={handleCheckoutAction}
                    >
                      <AutoStories sx={{ fontSize: 14 }} />
                      Checkout
                    </Btn>
                  )}
                </div>
              </div>
              {checkoutWarning && onCheckout && (
                <p
                  style={{
                    marginTop: 10,
                    fontSize: 11.5,
                    lineHeight: 1.5,
                    color: "#b45309",
                  }}
                >
                  {checkoutWarning}
                </p>
              )}
            </>
          ) : (
            <>
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: T.text,
                  marginBottom: 16,
                }}
              >
                Edit Book
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {[
                  { label: "Title", field: "title" },
                  { label: "Author", field: "author" },
                  { label: "Publisher", field: "publisher" },
                  { label: "Pages", field: "pages", type: "number" },
                  {
                    label: "Total Copies",
                    field: "totalCopies",
                    type: "number",
                  },
                  {
                    label: "Avail. Copies",
                    field: "availableCopies",
                    type: "number",
                  },
                  { label: "Price", field: "price", type: "number" },
                  { label: "Cover URL", field: "coverImagesUrl" },
                ].map(({ label, field, type = "text" }) => (
                  <TextField
                    key={field}
                    label={label}
                    size="small"
                    fullWidth
                    type={type}
                    value={editForm[field]}
                    onChange={handleEditChange(field)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        fontSize: 13,
                        background: T.white,
                      },
                    }}
                  />
                ))}
                <TextField
                  label="Description"
                  size="small"
                  fullWidth
                  multiline
                  minRows={3}
                  value={editForm.description}
                  onChange={handleEditChange("description")}
                  sx={{
                    gridColumn: "1 / -1",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      fontSize: 13,
                      background: T.white,
                    },
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  paddingTop: 14,
                  borderTop: `1px solid ${T.border}`,
                }}
              >
                <Btn variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Btn>
                <Btn variant="solid" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </Btn>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookCard;
