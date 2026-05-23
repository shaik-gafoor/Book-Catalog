import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LibraryAdd, UploadFile } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createBook, getAuthUser, getCatalogs } from "../../api/libraryApi";

const cardSx = {
  border: "1px solid #e5e7eb",
  borderRadius: 4,
  boxShadow: "0 16px 48px rgba(15, 23, 42, 0.06)",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
  },
};

const fallbackCatalogs = [
  { id: "technology", name: "Technology" },
  { id: "fiction", name: "Fiction" },
  { id: "business", name: "Business" },
  { id: "education", name: "Education" },
  { id: "general", name: "General" },
];

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

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const data = await getCatalogs();
        if (Array.isArray(data) && data.length > 0) {
          setCatalogs(data);
          setForm((current) => ({
            ...current,
            catalogId: current.catalogId || data[0].id,
          }));
        }
      } catch {
        setCatalogs(fallbackCatalogs);
      }
    };

    loadCatalogs();
  }, []);

  const selectedCatalog = useMemo(
    () =>
      catalogs.find((catalog) => String(catalog.id) === String(form.catalogId)) ||
      catalogs[0],
    [catalogs, form.catalogId],
  );

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setCoverFile(file);

    if (!file) {
      setCoverPreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverPreview(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!form.title.trim() || !form.author.trim() || !form.description.trim()) {
        throw new Error("Title, author, and description are required.");
      }

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
      };

      if (coverPreview) {
        payload.coverImagesUrl = coverPreview;
      }

      const createdBook = await createBook(payload);
      setSuccess(
        `${createdBook?.title || payload.title} was added to ${selectedCatalog?.name || "the catalog"}.`,
      );
      navigate("/books", {
        state: {
          message: `${createdBook?.title || payload.title} was added by ${uploaderName}.`,
        },
      });
    } catch (err) {
      setError(err.message || "Could not add book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6 flex items-center gap-2">
        <LibraryAdd sx={{ fontSize: 24, color: "#374151" }} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Add Book
          </h1>
          <p className="text-sm text-gray-500">
            Create a new book entry and place it into a category.
          </p>
        </div>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card elevation={0} sx={cardSx}>
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Stack spacing={2}>
              <TextField
                label="Book title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                fullWidth
                required
                sx={fieldSx}
              />
              <TextField
                label="Author"
                value={form.author}
                onChange={(e) =>
                  setForm({ ...form, author: e.target.value })
                }
                fullWidth
                required
                sx={fieldSx}
              />
              <FormControl fullWidth required>
                <InputLabel>Book category</InputLabel>
                <Select
                  label="Book category"
                  value={form.catalogId}
                  onChange={(e) =>
                    setForm({ ...form, catalogId: e.target.value })
                  }
                  sx={fieldSx}
                >
                  {catalogs.map((catalog) => (
                    <MenuItem key={catalog.id} value={catalog.id}>
                      {catalog.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                fullWidth
                required
                multiline
                minRows={5}
                sx={fieldSx}
              />
            </Stack>

            <Stack spacing={2}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderColor: "#e5e7eb",
                  p: 2.5,
                  minHeight: 260,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: "#6b7280", letterSpacing: 1.2 }}
                >
                  Optional upload
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280", mb: 2 }}>
                  Upload a cover image if you have one. This field is not required.
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFile />}
                  sx={{ textTransform: "none", mb: 2 }}
                >
                  Choose file
                  <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                </Button>
                {coverFile && (
                  <Typography variant="body2" sx={{ color: "#374151", mb: 2 }}>
                    Selected: {coverFile.name}
                  </Typography>
                )}
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 min-h-[180px] flex items-center justify-center overflow-hidden">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="max-h-44 object-contain rounded-lg"
                    />
                  ) : (
                    <Typography sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                      No cover selected.
                    </Typography>
                  )}
                </div>
              </Card>

              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderColor: "#e5e7eb",
                  p: 2.5,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: "#6b7280", letterSpacing: 1.2 }}
                >
                  Preview
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {form.title || "Book title"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  {form.author || "Author"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280", mt: 1 }}>
                  Category: {selectedCatalog?.name || "General"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280", mt: 1 }}>
                  Added by: {uploaderName}
                </Typography>
              </Card>
            </Stack>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="text"
              onClick={() => navigate("/books")}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ textTransform: "none" }}
            >
              {loading ? "Saving..." : "Add Book"}
            </Button>
          </div>
        </Box>
      </Card>
    </div>
  );
};

export default AddBookPage;
