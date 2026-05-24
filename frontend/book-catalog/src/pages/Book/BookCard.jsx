import React, { useState } from "react";
import { Dialog, DialogContent, TextField } from "@mui/material";
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

/* ── shared token object so values stay DRY ── */
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
  radius: "12px",
  radiusSm: "8px",
};

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

const BookCard = ({
  book,
  onReserve,
  onWishlist,
  onCheckout,
  onBookUpdated,
}) => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState(buildEditState(book));
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isAvailable = (book.availableCopies ?? 0) > 0;
  const coverUrl = book.coverImagesUrl || book.coverImageUrl;
  const catalogName =
    book.catalogName || book.genreName || book.catalogCode || "General";

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
    const value = e.target.value;
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "totalCopies" && Number.isFinite(Number(value))
        ? {
            availableCopies: Math.min(
              Number(prev.availableCopies || 0),
              Number(value),
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
        price:
          editForm.price === "" || editForm.price === null
            ? null
            : Number(editForm.price),
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

  /* ── inline style helpers ── */
  const cardStyle = {
    background: T.white,
    border: `1px solid ${hovered ? T.border2 : T.border}`,
    borderRadius: T.radius,
    overflow: "hidden",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    transition:
      "box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease",
    boxShadow: hovered
      ? "0 8px 40px rgba(0,0,0,0.11)"
      : "0 2px 8px rgba(0,0,0,0.04)",
    transform: hovered ? "translateY(-4px)" : "translateY(0)",
  };
  const badgeStyle = (avail) => ({
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "3px 9px",
    borderRadius: 20,
    border: "1px solid transparent",
    background: avail ? "#d1fae5" : "#fef3c7",
    color: avail ? "#065f46" : "#92400e",
    borderColor: avail ? "#a7f3d0" : "#fde68a",
  });
  const btnStyle = (variant) => {
    const base = {
      fontFamily: "inherit",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.05em",
      padding: "6px 13px",
      borderRadius: T.radiusSm,
      cursor: "pointer",
      border: "1px solid transparent",
      whiteSpace: "nowrap",
      transition: "background 0.15s, transform 0.12s",
      display: "inline-flex",
      alignItems: "center",
    };
    if (variant === "ghost")
      return {
        ...base,
        background: T.light,
        color: T.text2,
        borderColor: T.border,
      };
    if (variant === "outline")
      return {
        ...base,
        background: "transparent",
        color: T.text2,
        borderColor: T.border2,
      };
    if (variant === "solid")
      return {
        ...base,
        background: T.text,
        color: T.white,
        borderColor: T.text,
      };
    if (variant === "disabled")
      return {
        ...base,
        background: T.light,
        color: T.faint,
        opacity: 0.5,
        cursor: "not-allowed",
      };
    return base;
  };
  const statBoxStyle = {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    padding: "12px 14px",
  };
  const labelStyle = {
    fontFamily: "inherit",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: T.faint,
    marginBottom: 4,
  };

  return (
    <>
      {/* ── Card ── */}
      <div
        style={cardStyle}
        onClick={openDialog}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDialog();
          }
        }}
      >
        {/* Cover */}
        <div
          style={{
            position: "relative",
            height: 160,
            background: "linear-gradient(135deg,#f7f6f3,#ece9e3)",
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
                transform: hovered ? "scale(1.04)" : "scale(1)",
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
                gap: 6,
              }}
            >
              <BookIcon sx={{ fontSize: 40, color: "#c4bfb8" }} />
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
          {/* Availability badge */}
          <span
            style={{
              ...badgeStyle(isAvailable),
              position: "absolute",
              top: 10,
              left: 10,
            }}
          >
            {isAvailable ? "Available" : "Checked Out"}
          </span>
          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            aria-label="Wishlist"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 30,
              height: 30,
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(4px)",
              border: `1px solid ${T.border}`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {wishlisted ? (
              <Bookmark sx={{ fontSize: 15, color: T.indigo }} />
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
              display: "block",
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
              marginBottom: 5,
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
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <PersonIcon
              sx={{
                fontSize: 12,
                color: T.faint,
                mr: "3px",
                verticalAlign: "middle",
              }}
            />
            {book.author}
          </p>
          {book.addedByName && (
            <p style={{ fontSize: 10, color: T.faint, marginBottom: 10 }}>
              Added by {book.addedByName}
            </p>
          )}

          {/* Actions */}
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
              <button style={btnStyle("ghost")} onClick={handleWishlist}>
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
            )}
            {onReserve && (
              <button
                style={btnStyle("outline")}
                onClick={(e) => {
                  e.stopPropagation();
                  onReserve(book);
                }}
              >
                Reserve
              </button>
            )}
            {onCheckout && (
              <button
                style={isAvailable ? btnStyle("solid") : btnStyle("disabled")}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAvailable) onCheckout(book);
                }}
                disabled={!isAvailable}
              >
                Checkout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Detail / Edit Dialog ── */}
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
            boxShadow: "0 8px 40px rgba(0,0,0,0.13)",
          },
        }}
      >
        {/* Dialog cover */}
        <div
          style={{
            position: "relative",
            height: 200,
            background: "linear-gradient(135deg,#f7f6f3,#ece9e3)",
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
              <BookIcon sx={{ fontSize: 56, color: "#d1cfc8" }} />
            </div>
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.18), transparent 50%)",
              padding: 12,
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span style={badgeStyle(isAvailable)}>
              {isAvailable ? "Available" : "Checked Out"}
            </span>
          </div>
          <button
            onClick={closeDialog}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 32,
              height: 32,
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
              {/* Header */}
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
                    fontSize: 20,
                    fontWeight: 600,
                    color: T.text,
                    margin: "4px 0",
                  }}
                >
                  {book.title}
                </h2>
                <p style={{ fontSize: 13, color: T.faint }}>
                  <PersonIcon
                    sx={{
                      fontSize: 13,
                      color: T.faint,
                      mr: "4px",
                      verticalAlign: "middle",
                    }}
                  />
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
                {[
                  { label: "Available Copies", val: book.availableCopies ?? 0 },
                  { label: "Total Copies", val: book.totalCopies ?? 0 },
                  { label: "Pages", val: book.pages || "—" },
                  { label: "Price", val: book.price ? `₹${book.price}` : "—" },
                ].map(({ label, val }) => (
                  <div key={label} style={statBoxStyle}>
                    <p style={labelStyle}>{label}</p>
                    <p
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 18,
                        fontWeight: 600,
                        color: T.text,
                      }}
                    >
                      {val}
                    </p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div style={{ ...statBoxStyle, marginBottom: 12 }}>
                <p style={labelStyle}>Description</p>
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
                  isAvailable ? "Available now" : "Currently checked out",
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

              {/* Actions */}
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
                <button
                  style={btnStyle("ghost")}
                  onClick={() => setIsEditing(true)}
                >
                  <Edit
                    sx={{ fontSize: 14, mr: "4px", verticalAlign: "middle" }}
                  />
                  Edit
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  {onWishlist && (
                    <button
                      style={btnStyle("outline")}
                      onClick={() => onWishlist(book)}
                    >
                      Wishlist
                    </button>
                  )}
                  {onReserve && (
                    <button
                      style={btnStyle("outline")}
                      onClick={() => onReserve(book)}
                    >
                      Reserve
                    </button>
                  )}
                  {onCheckout && (
                    <button
                      style={
                        isAvailable ? btnStyle("solid") : btnStyle("disabled")
                      }
                      onClick={() => {
                        if (isAvailable) onCheckout(book);
                      }}
                      disabled={!isAvailable}
                    >
                      <AutoStories
                        sx={{
                          fontSize: 14,
                          mr: "4px",
                          verticalAlign: "middle",
                        }}
                      />
                      Checkout
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <h2
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: T.text,
                  }}
                >
                  Edit Book
                </h2>
              </div>
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
                <button
                  style={btnStyle("ghost")}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  style={saving ? btnStyle("disabled") : btnStyle("solid")}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookCard;
