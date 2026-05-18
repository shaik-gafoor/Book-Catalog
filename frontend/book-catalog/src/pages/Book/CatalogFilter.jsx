import React from "react";
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from "@mui/material";
import { TuneOutlined } from "@mui/icons-material";

const CatalogFilter = ({ genres = [], selectedGenreId, onGenreSelect }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <TuneOutlined sx={{ fontSize: 18, color: "#374151" }} />
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#111827",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Filter by Catalog
        </Typography>
      </div>

      {/* All Genres Option */}
      <div
        className={`flex items-center gap-2 py-2 px-3 mb-1 rounded-lg cursor-pointer transition-all duration-150 ${
          !selectedGenreId
            ? "bg-gray-900 text-white"
            : "hover:bg-gray-50 text-gray-700"
        }`}
        onClick={() => onGenreSelect(null)}
      >
        <span className="text-sm font-medium">All Catalogs</span>
      </div>

      {/* Genre Radio List */}
      <div className="max-h-96 overflow-y-auto">
        <FormControl sx={{ width: "100%" }}>
          <RadioGroup
            value={selectedGenreId ?? ""}
            onChange={(e) => onGenreSelect(Number(e.target.value))}
          >
            {genres.map((genre) => (
              <FormControlLabel
                key={genre.id}
                value={genre.id}
                control={
                  <Radio
                    size="small"
                    sx={{
                      color: "#d1d5db",
                      "&.Mui-checked": { color: "#1a1a1a" },
                      p: 0.8,
                    }}
                  />
                }
                label={
                  <span
                    style={{
                      fontSize: "0.83rem",
                      color:
                        selectedGenreId === genre.id ? "#111827" : "#6b7280",
                      fontWeight: selectedGenreId === genre.id ? 600 : 400,
                    }}
                  >
                    {genre.name}
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: "0.7rem",
                        color: "#9ca3af",
                      }}
                    >
                      ({genre.bookCount})
                    </span>
                  </span>
                }
                sx={{
                  mx: 0,
                  px: 1,
                  py: 0.3,
                  borderRadius: "8px",
                  transition: "background 0.15s",
                  "&:hover": { bgcolor: "#f9fafb" },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </div>
    </div>
  );
};

export default CatalogFilter;
