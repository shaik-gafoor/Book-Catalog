import React, { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Delete,
  MenuBook,
  PersonOutlined,
  CalendarToday,
  LocalOffer,
  Tag,
  PeopleAlt,
} from "@mui/icons-material";
import {
  getAllWishlists,
  getAuthUser,
  getWishlist,
  removeFromWishlist,
} from "../../api/libraryApi";
import { formatDateTime, formatCurrency } from "../../utils/format";

/* ── tokens ── */
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

const STATUS_TONES = {
  ACTIVE: {
    bg: "#d1fae5",
    fg: "#065f46",
  },
  PENDING: {
    bg: "#fef3c7",
    fg: "#92400e",
  },
};

const getWishlistStatus = (entry) => {
  const book = entry?.book || {};
  const activeBook =
    book.active !== false && Number(book.availableCopies || 0) > 0;
  return activeBook ? "ACTIVE" : "PENDING";
};

const GroupPill = ({ children, status = "ACTIVE" }) => {
  const tone = STATUS_TONES[status] || STATUS_TONES.PENDING;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 10px",
        borderRadius: 999,
        background: tone.bg,
        color: tone.fg,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};

/* ── keyframe injected once ── */
const KEYFRAMES = `
  @keyframes wlFadeUp {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  @keyframes wlPulse {
    0%,100% { transform: scale(1);    }
    50%      { transform: scale(1.18); }
  }
  @keyframes wlSlideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`;
if (typeof document !== "undefined" && !document.getElementById("wl-kf")) {
  const s = document.createElement("style");
  s.id = "wl-kf";
  s.textContent = KEYFRAMES;
  document.head.appendChild(s);
}

/* ── WishlistCard ── */
const WishlistCard = ({ entry, onRemove, index }) => {
  const [hovered, setHovered] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [hearted, setHearted] = useState(true);

  const book = entry.book || {};
  const coverUrl = book.coverImagesUrl || book.coverImageUrl;
  const catalogName = book.catalogName || book.genreName || "General";
  const isAvailable = (book.availableCopies ?? 0) > 0;

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(book.id);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.white,
        border: `1px solid ${hovered ? T.border2 : T.border}`,
        borderRadius: T.radius,
        overflow: "hidden",
        display: "flex",
        boxShadow: hovered
          ? "0 12px 40px rgba(0,0,0,0.10)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition:
          "box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease, opacity 0.3s ease",
        opacity: removing ? 0 : 1,
        animation: `wlFadeUp 0.38s ease ${Math.min(index * 0.06, 0.5)}s both`,
      }}
    >
      {/* ── Left: cover strip ── */}
      <div
        style={{
          width: 96,
          flexShrink: 0,
          background: coverUrl
            ? "transparent"
            : `linear-gradient(160deg, #f0eeeb 0%, #e8e4df 100%)`,
          position: "relative",
          overflow: "hidden",
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
              transform: hovered ? "scale(1.06)" : "scale(1)",
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
              padding: 12,
            }}
          >
            <MenuBook sx={{ fontSize: 28, color: "#c4bfb8" }} />
            <span
              style={{
                fontSize: 9,
                color: T.faint,
                textAlign: "center",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                lineHeight: 1.3,
              }}
            >
              {catalogName}
            </span>
          </div>
        )}
        {/* Catalog label at bottom of cover */}
        {coverUrl && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.45), transparent)",
              padding: "16px 8px 6px",
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {catalogName}
            </span>
          </div>
        )}
      </div>

      {/* ── Middle: content ── */}
      <div
        style={{
          flex: 1,
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            {!coverUrl && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: T.indigo,
                  marginBottom: 4,
                  display: "block",
                }}
              >
                {catalogName}
              </span>
            )}
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 16,
                fontWeight: 600,
                color: T.text,
                lineHeight: 1.3,
                marginBottom: 4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {book.title || "Untitled"}
            </h3>
            <p
              style={{
                fontSize: 12,
                color: T.faint,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <PersonOutlined sx={{ fontSize: 13, color: T.faint }} />
              {book.author || "Unknown author"}
            </p>
          </div>

          {/* Availability badge */}
          <span
            style={{
              flexShrink: 0,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: 20,
              background: isAvailable ? "#d1fae5" : "#fef3c7",
              color: isAvailable ? "#065f46" : "#92400e",
              border: `1px solid ${isAvailable ? "#a7f3d0" : "#fde68a"}`,
            }}
          >
            {isAvailable ? "Available" : "On Hold"}
          </span>
        </div>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            marginTop: "auto",
            paddingTop: 10,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          {book.isbn && (
            <span
              style={{
                fontSize: 11,
                color: T.faint,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Tag sx={{ fontSize: 12, color: T.faint }} />
              {book.isbn}
            </span>
          )}
          {book.price != null && (
            <span
              style={{
                fontSize: 11,
                color: T.faint,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <LocalOffer sx={{ fontSize: 12, color: T.faint }} />
              {formatCurrency(book.price)}
            </span>
          )}
          {entry.addedAt && (
            <span
              style={{
                fontSize: 11,
                color: T.faint,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <CalendarToday sx={{ fontSize: 11, color: T.faint }} />
              Added {formatDateTime(entry.addedAt)}
            </span>
          )}
        </div>

        {/* Notes */}
        {entry.notes && (
          <p
            style={{
              marginTop: 8,
              fontSize: 11,
              color: T.muted,
              fontStyle: "italic",
              lineHeight: 1.55,
              background: T.sand,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusSm,
              padding: "6px 10px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            "{entry.notes}"
          </p>
        )}
      </div>

      {/* ── Right: actions ── */}
      <div
        style={{
          flexShrink: 0,
          width: 56,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "16px 0",
          borderLeft: `1px solid ${T.border}`,
          background: hovered ? T.sand : T.white,
          transition: "background 0.2s",
        }}
      >
        {/* Heart toggle */}
        <button
          onClick={() => setHearted((v) => !v)}
          title="Toggle wishlist"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: hearted ? "#fee2e2" : T.light,
            border: `1px solid ${hearted ? "#fca5a5" : T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            animation: hearted ? "wlPulse 0.35s ease" : "none",
            transition: "background 0.15s, border-color 0.15s",
          }}
        >
          {hearted ? (
            <Favorite sx={{ fontSize: 15, color: "#ef4444" }} />
          ) : (
            <FavoriteBorder sx={{ fontSize: 15, color: T.faint }} />
          )}
        </button>

        {/* Remove */}
        <button
          onClick={handleRemove}
          disabled={removing}
          title="Remove from wishlist"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: T.light,
            border: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: removing ? "not-allowed" : "pointer",
            opacity: removing ? 0.4 : 1,
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fee2e2";
            e.currentTarget.style.borderColor = "#fca5a5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = T.light;
            e.currentTarget.style.borderColor = T.border;
          }}
        >
          <Delete sx={{ fontSize: 15, color: "#ef4444" }} />
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   WISHLIST PAGE
══════════════════════════════════════════════════ */
const WishlistPage = () => {
  const currentUser = getAuthUser();
  const isAdmin =
    String(currentUser?.role || "").toUpperCase() === "ROLE_ADMIN";
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const adminWishlistUsers = useMemo(() => {
    if (!isAdmin) return [];

    const userMap = new Map();
    wishlist.forEach((entry) => {
      if (!entry?.userId) return;
      const key = String(entry.userId);
      if (!userMap.has(key)) {
        userMap.set(key, {
          id: entry.userId,
          fullName:
            entry.userFullName || entry.userName || `User #${entry.userId}`,
          email: entry.userEmail || entry.email || `User #${entry.userId}`,
          entries: [],
        });
      }
      userMap.get(key).entries.push(entry);
    });

    return Array.from(userMap.values())
      .map((user) => {
        const activeEntries = user.entries.filter(
          (entry) => getWishlistStatus(entry) === "ACTIVE",
        );
        const pendingEntries = user.entries.filter(
          (entry) => getWishlistStatus(entry) === "PENDING",
        );

        return {
          ...user,
          activeCount: activeEntries.length,
          pendingCount: pendingEntries.length,
          totalCount: user.entries.length,
          latestEntry: [...user.entries].sort(
            (left, right) =>
              new Date(right.addedAt || 0).getTime() -
              new Date(left.addedAt || 0).getTime(),
          )[0],
        };
      })
      .sort((left, right) =>
        (left.fullName || "").localeCompare(right.fullName || ""),
      );
  }, [isAdmin, wishlist]);

  const selectedAdminUser = useMemo(() => {
    if (!isAdmin) return null;
    return (
      adminWishlistUsers.find(
        (user) => String(user.id) === String(selectedUserId),
      ) ||
      adminWishlistUsers[0] ||
      null
    );
  }, [adminWishlistUsers, isAdmin, selectedUserId]);

  const loadWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const data = isAdmin
        ? await getAllWishlists({ page: 0, size: 200 })
        : await getWishlist({ page: 0, size: 20 });
      setWishlist(data?.content || []);
    } catch (err) {
      setError(err.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && !selectedUserId && adminWishlistUsers.length > 0) {
      setSelectedUserId(String(adminWishlistUsers[0].id));
    }
  }, [adminWishlistUsers, isAdmin, selectedUserId]);

  const handleRemove = async (bookId) => {
    try {
      const res = await removeFromWishlist(bookId);
      setMessage(res?.message || "Removed from wishlist");
      await loadWishlist();
    } catch (err) {
      setError(err.message || "Could not remove from wishlist");
    }
  };

  const statCards = [
    {
      label: "Saved Books",
      value: wishlist.length,
      icon: <Favorite sx={{ fontSize: 18, color: "#ef4444" }} />,
      accent: "#fee2e2",
      accentBorder: "#fca5a5",
    },
    {
      label: "Available Now",
      value: wishlist.filter((e) => getWishlistStatus(e) === "ACTIVE").length,
      icon: <MenuBook sx={{ fontSize: 18, color: "#065f46" }} />,
      accent: "#d1fae5",
      accentBorder: "#a7f3d0",
    },
    {
      label: "On Hold",
      value: wishlist.filter((e) => getWishlistStatus(e) === "PENDING").length,
      icon: <MenuBook sx={{ fontSize: 18, color: "#92400e" }} />,
      accent: "#fef3c7",
      accentBorder: "#fde68a",
    },
  ];

  if (isAdmin) {
    const activeUsers = adminWishlistUsers.filter(
      (user) => user.activeCount > 0,
    );
    const pendingUsers = adminWishlistUsers.filter(
      (user) => user.pendingCount > 0,
    );

    return (
      <div
        style={{
          minHeight: "100vh",
          background: T.sand,
          fontFamily: "'DM Sans', sans-serif",
          padding: "32px 36px 56px",
        }}
      >
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
              <Favorite sx={{ fontSize: 22, color: "#ef4444" }} />
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 26,
                  fontWeight: 600,
                  color: T.text,
                  letterSpacing: "-0.3px",
                }}
              >
                Wishlist Users
              </h1>
            </div>
            <p style={{ fontSize: 12, color: T.faint }}>
              Users with wishlist items grouped by Active and Pending status.
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
            {wishlist.length} saved
          </span>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: T.radiusSm,
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              padding: "18px 20px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: T.faint,
                marginBottom: 6,
              }}
            >
              Wishlist users
            </p>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 34,
                fontWeight: 600,
                color: T.text,
                lineHeight: 1,
              }}
            >
              {adminWishlistUsers.length}
            </p>
          </div>
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              padding: "18px 20px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: T.faint,
                marginBottom: 6,
              }}
            >
              Active users
            </p>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 34,
                fontWeight: 600,
                color: T.text,
                lineHeight: 1,
              }}
            >
              {activeUsers.length}
            </p>
          </div>
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              padding: "18px 20px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: T.faint,
                marginBottom: 6,
              }}
            >
              Pending users
            </p>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 34,
                fontWeight: 600,
                color: T.text,
                lineHeight: 1,
              }}
            >
              {pendingUsers.length}
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                background: T.white,
                border: `1px solid ${T.border}`,
                borderRadius: T.radius,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                <GroupPill status="ACTIVE">
                  Active {activeUsers.length}
                </GroupPill>
                <GroupPill status="PENDING">
                  Pending {pendingUsers.length}
                </GroupPill>
              </div>
              {adminWishlistUsers.length > 0 ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {adminWishlistUsers.map((user, index) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUserId(String(user.id))}
                      style={{
                        textAlign: "left",
                        border: `1px solid ${String(selectedUserId) === String(user.id) ? "#cbd5e1" : T.border}`,
                        borderRadius: T.radiusSm,
                        background:
                          String(selectedUserId) === String(user.id)
                            ? "#fafaf9"
                            : T.white,
                        padding: "14px 16px",
                        display: "grid",
                        gap: 8,
                        animation: `wlFadeUp 0.3s ease ${Math.min(index * 0.04, 0.3)}s both`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: T.text }}>
                            {user.fullName}
                          </div>
                          <div style={{ fontSize: 12, color: T.faint }}>
                            {user.email}
                          </div>
                        </div>
                        <PeopleAlt sx={{ fontSize: 18, color: T.faint }} />
                      </div>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                      >
                        <GroupPill status="ACTIVE">
                          Active {user.activeCount}
                        </GroupPill>
                        <GroupPill status="PENDING">
                          Pending {user.pendingCount}
                        </GroupPill>
                        <GroupPill status="ACTIVE">
                          Total {user.totalCount}
                        </GroupPill>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: T.faint }}>
                  No wishlist entries found.
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              padding: 18,
            }}
          >
            {selectedAdminUser ? (
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.faint,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Selected user
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: T.text }}>
                    {selectedAdminUser.fullName}
                  </div>
                  <div style={{ fontSize: 12, color: T.faint }}>
                    {selectedAdminUser.email}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <GroupPill status="ACTIVE">
                    Active {selectedAdminUser.activeCount}
                  </GroupPill>
                  <GroupPill status="PENDING">
                    Pending {selectedAdminUser.pendingCount}
                  </GroupPill>
                  <GroupPill status="ACTIVE">
                    Total {selectedAdminUser.totalCount}
                  </GroupPill>
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {selectedAdminUser.entries.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        border: `1px solid ${T.border}`,
                        borderRadius: T.radiusSm,
                        padding: 12,
                        display: "grid",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div style={{ fontWeight: 700, color: T.text }}>
                          {entry.book?.title || "Untitled book"}
                        </div>
                        <GroupPill status={getWishlistStatus(entry)}>
                          {getWishlistStatus(entry)}
                        </GroupPill>
                      </div>
                      <div style={{ fontSize: 12, color: T.faint }}>
                        {entry.book?.author || "Unknown author"}
                      </div>
                      <div style={{ fontSize: 11, color: T.muted }}>
                        Added{" "}
                        {entry.addedAt ? formatDateTime(entry.addedAt) : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ color: T.faint, fontSize: 12 }}>
                Select a user to inspect their wishlist items.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.sand,
        fontFamily: "'DM Sans', sans-serif",
        padding: "32px 36px 56px",
      }}
    >
      {/* ── Header ── */}
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
            <Favorite sx={{ fontSize: 22, color: "#ef4444" }} />
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 600,
                color: T.text,
                letterSpacing: "-0.3px",
              }}
            >
              My Wishlist
            </h1>
          </div>
          <p style={{ fontSize: 12, color: T.faint }}>
            Books you've saved to borrow later.
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
          {wishlist.length} saved
        </span>
      </div>

      {/* ── Toasts ── */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: T.radiusSm,
            padding: "10px 16px",
            fontSize: 12,
            color: "#dc2626",
            marginBottom: 20,
            fontWeight: 500,
            animation: "wlSlideIn 0.25s ease",
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
            color: "#166534",
            marginBottom: 20,
            fontWeight: 500,
            animation: "wlSlideIn 0.25s ease",
          }}
        >
          {message}
        </div>
      )}

      {/* ── Stat row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        {statCards.map(({ label, value, icon, accent, accentBorder }, i) => (
          <div
            key={label}
            style={{
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              animation: `wlFadeUp 0.35s ease ${i * 0.06}s both`,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: T.faint,
                  marginBottom: 6,
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 34,
                  fontWeight: 600,
                  color: T.text,
                  lineHeight: 1,
                }}
              >
                {value}
              </p>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: accent,
                border: `1px solid ${accentBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
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
            Loading wishlist…
          </span>
        </div>
      ) : wishlist.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {wishlist.map((entry, i) => (
            <WishlistCard
              key={entry.id}
              entry={entry}
              index={i}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
            padding: "72px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 8,
            animation: "wlFadeUp 0.35s ease both",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <FavoriteBorder sx={{ fontSize: 26, color: "#ef4444" }} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: T.muted }}>
            Your wishlist is empty
          </p>
          <p style={{ fontSize: 12, color: T.faint, maxWidth: 280 }}>
            Browse the catalog and click the bookmark icon on any book to save
            it here.
          </p>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
