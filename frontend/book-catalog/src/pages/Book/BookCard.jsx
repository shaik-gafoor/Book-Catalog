import React, { useState } from "react";
import {
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Stack,
} from "@mui/material";
import {
  MenuBook as BookIcon,
  PersonOutlined as PersonIcon,
  CopyAll as CopiesIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { updateBook } from "../../api/libraryApi";

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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState(buildEditState(book));
  const isAvailable = (book.availableCopies ?? 0) > 0;
  const coverUrl = book.coverImagesUrl || book.coverImageUrl;
  const catalogName =
    book.catalogName || book.genreName || book.catalogCode || "Catalog";

  const openDetails = () => {
    setEditForm(buildEditState(book));
    setIsEditing(false);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsEditing(false);
    setDetailsOpen(false);
  };

  const handleEditChange = (field) => (event) => {
    const value = event.target.value;
    setEditForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "totalCopies" && Number.isFinite(Number(value))
        ? {
            availableCopies: Math.min(
              Number(current.availableCopies || 0),
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

      const updatedBook = await updateBook(book.id, payload);
      if (onBookUpdated) {
        onBookUpdated(updatedBook || { ...book, ...payload });
      }
      setIsEditing(false);
      setDetailsOpen(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer hover:-translate-y-0.5"
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetails();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="relative h-36 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <BookIcon sx={{ fontSize: 44, color: "#d1d5db" }} />
            <span className="text-xs text-gray-400 font-medium">
              {catalogName}
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: isAvailable ? "#f9fafb" : "#f3f4f6",
              color: isAvailable ? "#111827" : "#6b7280",
              border: "1px solid #e5e7eb",
            }}
          >
            {isAvailable ? "Available" : "Checked Out"}
          </span>
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-gray-700 transition-colors leading-snug">
          {book.title}
        </h3>

        <div className="flex items-center gap-1.5 text-gray-500 mb-2">
          <PersonIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
          <span className="text-xs line-clamp-1">{book.author}</span>
        </div>

        {book.addedByName && (
          <p className="text-[11px] font-medium text-gray-500 mb-2">
            Added by {book.addedByName}
          </p>
        )}

        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-3 pb-2 border-b border-gray-100">
          <span>{catalogName}</span>
          <span>{isAvailable ? "Ready to borrow" : "Checked out"}</span>
        </div>

        <Stack spacing={1}>
          {(onWishlist || onReserve || onCheckout) && (
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              onClick={(event) => event.stopPropagation()}
            >
              {onWishlist && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onWishlist(book)}
                  sx={{ textTransform: "none" }}
                >
                  Wishlist
                </Button>
              )}
              {onReserve && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onReserve(book)}
                  sx={{ textTransform: "none" }}
                >
                  Reserve
                </Button>
              )}
              {onCheckout && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onCheckout(book)}
                  sx={{ textTransform: "none" }}
                >
                  Checkout
                </Button>
              )}
            </div>
          )}
        </Stack>
      </div>

      <Dialog
        open={detailsOpen}
        onClose={closeDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pr: 6 }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-1">
                {isEditing ? "Edit Book" : "Book Details"}
              </p>
              <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                {book.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{book.author}</p>
            </div>
          </div>

          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              closeDetails();
            }}
            aria-label="Close book details"
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              color: "#9ca3af",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              bgcolor: "#ffffff",
              "&:hover": { bgcolor: "#f9fafb" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: "#fafafa" }}>
          <div className="space-y-4">
            <div className="relative h-56 rounded-2xl overflow-hidden bg-white border border-gray-200">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <BookIcon sx={{ fontSize: 56, color: "#d1d5db" }} />
                  <span className="text-xs text-gray-400 font-medium">
                    {catalogName}
                  </span>
                </div>
              )}
            </div>

            {!isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white border border-gray-200 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                      Available copies
                    </p>
                    <p className="font-semibold text-gray-800">
                      {book.availableCopies ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-gray-200 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                      Total copies
                    </p>
                    <p className="font-semibold text-gray-800">
                      {book.totalCopies ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-gray-200 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                      Pages
                    </p>
                    <p className="font-semibold text-gray-800">
                      {book.pages || "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-gray-200 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                      Catalog
                    </p>
                    <p className="font-semibold text-gray-800">{catalogName}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-gray-200 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {book.description || "No description available."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  {book.addedByName && (
                    <span className="rounded-full bg-white border border-gray-200 px-3 py-1">
                      Added by {book.addedByName}
                    </span>
                  )}
                  <span className="rounded-full bg-white border border-gray-200 px-3 py-1">
                    {isAvailable ? "Available now" : "Currently checked out"}
                  </span>
                  {book.price ? (
                    <span className="rounded-full bg-white border border-gray-200 px-3 py-1">
                      Price ₹{book.price}
                    </span>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label="Title"
                  value={editForm.title}
                  onChange={handleEditChange("title")}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Author"
                  value={editForm.author}
                  onChange={handleEditChange("author")}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Pages"
                  type="number"
                  value={editForm.pages}
                  onChange={handleEditChange("pages")}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Total Copies"
                  type="number"
                  value={editForm.totalCopies}
                  onChange={handleEditChange("totalCopies")}
                  fullWidth
                  size="small"
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Available Copies"
                  type="number"
                  value={editForm.availableCopies}
                  onChange={handleEditChange("availableCopies")}
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, max: editForm.totalCopies || 0 }}
                />
                <TextField
                  label="Publisher"
                  value={editForm.publisher}
                  onChange={handleEditChange("publisher")}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Price"
                  type="number"
                  value={editForm.price}
                  onChange={handleEditChange("price")}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Cover Image URL"
                  value={editForm.coverImagesUrl}
                  onChange={handleEditChange("coverImagesUrl")}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Description"
                  value={editForm.description}
                  onChange={handleEditChange("description")}
                  fullWidth
                  multiline
                  minRows={4}
                  sx={{ gridColumn: "1 / -1" }}
                />
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
          <Button
            onClick={closeDetails}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            {isEditing ? "Cancel" : "Close"}
          </Button>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="contained"
                sx={{ textTransform: "none" }}
              >
                Edit
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={saving}
                sx={{ textTransform: "none" }}
              >
                {saving ? "Saving..." : "Submit"}
              </Button>
            )}

            {onWishlist && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => onWishlist(book)}
                sx={{ textTransform: "none" }}
              >
                Wishlist
              </Button>
            )}
            {onReserve && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => onReserve(book)}
                sx={{ textTransform: "none" }}
              >
                Reserve
              </Button>
            )}
            {onCheckout && (
              <Button
                size="small"
                variant="contained"
                onClick={() => onCheckout(book)}
                sx={{ textTransform: "none" }}
              >
                Checkout
              </Button>
            )}
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BookCard;
