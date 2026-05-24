import React, { useState } from "react";
import { TuneOutlined } from "@mui/icons-material";

const T = {
  white: "#ffffff",
  border: "#ece9e3",
  text: "#1c1917",
  text2: "#44403c",
  muted: "#78716c",
  faint: "#a8a29e",
  light: "#f5f4f1",
  radius: "12px",
};

const CatalogFilter = ({ genres = [], selectedGenreId, onGenreSelect }) => {
  const [hov, setHov] = useState(null);

  const itemStyle = (id) => {
    const active = selectedGenreId === id || (id === null && !selectedGenreId);
    const isHov = hov === id;
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      textAlign: "left",
      padding: "9px 14px",
      fontFamily: "inherit",
      fontSize: 12,
      fontWeight: active ? 600 : 500,
      color: active ? T.white : isHov ? T.text2 : T.muted,
      background: active ? T.text : isHov ? T.light : "transparent",
      border: "none",
      cursor: "pointer",
      transition: "background 0.15s, color 0.15s",
    };
  };

  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: T.radius,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "11px 14px 10px",
          borderBottom: `1px solid ${T.border}`,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.text2,
        }}
      >
        <TuneOutlined sx={{ fontSize: 14, color: T.text2 }} />
        Filter by Catalog
      </div>

      {/* All option */}
      <button
        style={itemStyle(null)}
        onClick={() => onGenreSelect(null)}
        onMouseEnter={() => setHov(null)}
        onMouseLeave={() => setHov(-1)}
      >
        All Catalogs
      </button>

      {/* Genre list */}
      <div style={{ maxHeight: 320, overflowY: "auto" }}>
        {genres.map((genre) => (
          <button
            key={genre.id}
            style={itemStyle(genre.id)}
            onClick={() => onGenreSelect(genre.id)}
            onMouseEnter={() => setHov(genre.id)}
            onMouseLeave={() => setHov(null)}
          >
            <span>{genre.name}</span>
            {genre.bookCount !== undefined && (
              <span
                style={{
                  fontSize: 10,
                  borderRadius: 10,
                  padding: "1px 7px",
                  fontWeight: 500,
                  background:
                    selectedGenreId === genre.id
                      ? "rgba(255,255,255,0.2)"
                      : T.light,
                  color: selectedGenreId === genre.id ? T.white : T.faint,
                }}
              >
                {genre.bookCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CatalogFilter;
