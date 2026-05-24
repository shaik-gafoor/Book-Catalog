import React, { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import { LibraryAdd, UploadFile, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createBook, getAuthUser, getCatalogs } from "../../api/libraryApi";

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
  radius: "12px",
  radiusSm: "8px",
};

const fallbackCatalogs = [
  { id: "technology", name: "Technology" },
  { id: "fiction", name: "Fiction" },
  { id: "business", name: "Business" },
  { id: "education", name: "Education" },
  { id: "general", name: "General" },
];

/* ── Labelled input wrapper ── */
const Field = ({ label, required, children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 6,
      marginBottom: 14,
    }}
  >
    <label
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: T.text2,
      }}
    >
      {label}
      {required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
    </label>
    {children}
  </div>
);

const inputStyle = (focused) => ({
  fontFamily: "inherit",
  fontSize: 13,
  color: T.text,
  background: focused ? T.white : T.sand,
  border: `1px solid ${focused ? T.text : T.border}`,
  borderRadius: T.radiusSm,
  padding: "10px 13px",
  outline: "none",
  width: "100%",
  boxShadow: focused ? "0 0 0 3px rgba(28,25,23,0.06)" : "none",
  transition: "border-color 0.18s, box-shadow 0.18s, background 0.18s",
});

const AddBookPage = () => {
  const navigate = useNavigate();
  const user = getAuthUser();
  const uploaderName =
    user?.fullName || user?.name || user?.email || "Unknown user";

  const [catalogs, setCatalogs] = useState(fallbackCatalogs);
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    catalogId: fallbackCatalogs[0].id,
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* focus tracking per field */
  const [foc, setFoc] = useState({});
  const focus = (k) => setFoc((p) => ({ ...p, [k]: true }));
  const blur = (k) => setFoc((p) => ({ ...p, [k]: false }));

  useEffect(() => {
    getCatalogs()
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) {
          setCatalogs(d);
          setForm((f) => ({ ...f, catalogId: f.catalogId || d[0].id }));
        }
      })
      .catch(() => setCatalogs(fallbackCatalogs));
  }, []);

  const selectedCatalog = useMemo(
    () =>
      catalogs.find((c) => String(c.id) === String(form.catalogId)) ||
      catalogs[0],
    [catalogs, form.catalogId],
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (!file) {
      setCoverPreview("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!form.title.trim() || !form.author.trim() || !form.description.trim())
        throw new Error("Title, author, and description are required.");
      const payload = {
        isbn: `LOCAL-${Date.now()}`,
        title: form.title.trim(),
        author: form.author.trim(),
        description: form.description.trim(),
        catalogId: selectedCatalog?.id,
        catalogName: selectedCatalog?.name,
        catalogCode: selectedCatalog?.code,
        totalCopies: 1,
        availableCopies: 1,
        pages: 1,
        active: true,
        addedByName: uploaderName,
        ...(coverPreview ? { coverImagesUrl: coverPreview } : {}),
      };
      const created = await createBook(payload);
      setSuccess(
        `${created?.title || payload.title} was added to ${selectedCatalog?.name || "the catalog"}.`,
      );
      navigate("/books", {
        state: {
          message: `${created?.title || payload.title} was added by ${uploaderName}.`,
        },
      });
    } catch (err) {
      setError(err.message || "Could not add book");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    padding: "20px 22px",
  };
  const sectionLabel = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: T.text2,
    marginBottom: 16,
    display: "block",
  };
  const btnBase = {
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    padding: "10px 22px",
    borderRadius: T.radiusSm,
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "background 0.15s, transform 0.12s",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };

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
          alignItems: "center",
          gap: 14,
          marginBottom: 28,
        }}
      >
        <button
          onClick={() => navigate("/books")}
          style={{
            width: 34,
            height: 34,
            flexShrink: 0,
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusSm,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: T.text2,
            cursor: "pointer",
          }}
        >
          <ArrowBack sx={{ fontSize: 16 }} />
        </button>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 2,
            }}
          >
            <LibraryAdd sx={{ fontSize: 20, color: T.text2 }} />
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 24,
                fontWeight: 600,
                color: T.text,
                letterSpacing: "-0.3px",
              }}
            >
              Add New Book
            </h1>
          </div>
          <p style={{ fontSize: 12, color: T.faint }}>
            Create a new entry and place it into a catalog category.
          </p>
        </div>
      </div>

      {/* Toasts */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 12,
            color: "#dc2626",
            marginBottom: 20,
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 12,
            color: "#166534",
            marginBottom: 20,
            fontWeight: 500,
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left — fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={cardStyle}>
              <span style={sectionLabel}>Book Information</span>

              <Field label="Book Title" required>
                <input
                  style={inputStyle(foc.title)}
                  placeholder="e.g. The Great Gatsby"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  onFocus={() => focus("title")}
                  onBlur={() => blur("title")}
                  required
                />
              </Field>

              <Field label="Author" required>
                <input
                  style={inputStyle(foc.author)}
                  placeholder="e.g. F. Scott Fitzgerald"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  onFocus={() => focus("author")}
                  onBlur={() => blur("author")}
                  required
                />
              </Field>

              <Field label="Catalog Category" required>
                <select
                  style={inputStyle(foc.catalog)}
                  value={form.catalogId}
                  onChange={(e) =>
                    setForm({ ...form, catalogId: e.target.value })
                  }
                  onFocus={() => focus("catalog")}
                  onBlur={() => blur("catalog")}
                >
                  {catalogs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Description" required>
                <textarea
                  style={{
                    ...inputStyle(foc.desc),
                    resize: "vertical",
                    minHeight: 110,
                  }}
                  placeholder="Write a short description of the book…"
                  value={form.description}
                  rows={5}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  onFocus={() => focus("desc")}
                  onBlur={() => blur("desc")}
                  required
                />
              </Field>
            </div>
          </div>

          {/* Right — cover + preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Cover upload */}
            <div style={cardStyle}>
              <span style={sectionLabel}>
                Cover Image{" "}
                <span
                  style={{
                    fontWeight: 400,
                    color: T.faint,
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  · Optional
                </span>
              </span>
              <p
                style={{
                  fontSize: 12,
                  color: T.faint,
                  marginBottom: 14,
                  marginTop: -10,
                }}
              >
                Upload a cover image for the book listing.
              </p>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: T.white,
                  border: `1px solid ${T.border2}`,
                  borderRadius: T.radiusSm,
                  padding: "8px 16px",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.text2,
                  cursor: "pointer",
                  marginBottom: 12,
                }}
              >
                <UploadFile sx={{ fontSize: 15 }} />
                {coverFile ? coverFile.name : "Choose file"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </label>

              <div
                style={{
                  border: `1px dashed ${T.border2}`,
                  borderRadius: 10,
                  background: T.sand,
                  minHeight: 160,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    style={{
                      maxHeight: 160,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      color: T.faint,
                      fontSize: 11,
                    }}
                  >
                    <LibraryAdd sx={{ fontSize: 28, color: "#d4cfc8" }} />
                    <span>No cover selected</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live preview */}
            <div style={cardStyle}>
              <span style={sectionLabel}>Preview</span>
              <h3
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: T.text,
                  marginBottom: 4,
                }}
              >
                {form.title || "Book Title"}
              </h3>
              <p style={{ fontSize: 13, color: T.faint, marginBottom: 10 }}>
                {form.author || "Author name"}
              </p>
              <div
                style={{
                  fontSize: 12,
                  color: T.muted,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  marginBottom: 10,
                }}
              >
                <span>
                  Category:{" "}
                  <strong>{selectedCatalog?.name || "General"}</strong>
                </span>
                <span>
                  Added by: <strong>{uploaderName}</strong>
                </span>
              </div>
              {form.description && (
                <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.6 }}>
                  {form.description.slice(0, 120)}
                  {form.description.length > 120 ? "…" : ""}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 20,
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/books")}
            style={{
              ...btnBase,
              background: T.white,
              borderColor: T.border,
              color: T.text2,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...btnBase,
              background: T.text,
              color: T.white,
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={14} sx={{ color: "#fff" }} />
                Saving…
              </>
            ) : (
              <>
                <LibraryAdd sx={{ fontSize: 15 }} />
                Add Book
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBookPage;
