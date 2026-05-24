import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, CircularProgress } from "@mui/material";
import {
  CameraAlt,
  CheckCircle,
  Close,
  Edit,
  Email,
  Lock,
  Person,
  Phone,
  Shield,
  Star,
} from "@mui/icons-material";
import { getProfile, updateProfile } from "../../api/libraryApi";

/* ── tiny helpers ── */
const getInitials = (name = "") => {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

const fmt = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

/* ── field row used in view mode ── */
const InfoRow = ({ icon, label, value }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "13px 0",
      borderBottom: "1px solid #f1f5f9",
    }}
  >
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 9,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 1,
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 16, color: "#64748b" } })}
    </div>
    <div style={{ minWidth: 0 }}>
      <p
        style={{
          margin: 0,
          fontSize: "0.62rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.09em",
          color: "#94a3b8",
          marginBottom: 2,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "0.86rem",
          fontWeight: 600,
          color: "#1e293b",
          wordBreak: "break-all",
        }}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

/* ── input used in edit mode ── */
const EditField = ({
  label,
  icon,
  value,
  onChange,
  type = "text",
  disabled,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label
      style={{
        fontSize: "0.62rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.09em",
        color: "#64748b",
      }}
    >
      {label}
    </label>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        background: disabled ? "#f8fafc" : "#fff",
        border: "1.5px solid #e2e8f0",
        borderRadius: 10,
        padding: "9px 12px",
        transition: "border-color 0.15s",
      }}
      onFocus={(e) =>
        !disabled && (e.currentTarget.style.borderColor = "#1e293b")
      }
      onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
    >
      {React.cloneElement(icon, {
        sx: { fontSize: 16, color: "#94a3b8", flexShrink: 0 },
      })}
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          fontSize: "0.84rem",
          fontWeight: 500,
          color: disabled ? "#94a3b8" : "#1e293b",
          background: "transparent",
          fontFamily: "inherit",
        }}
      />
    </div>
  </div>
);

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef();

  /* form state */
  const [form, setForm] = useState({ fullName: "", phone: "", email: "" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getProfile();
        const value = Array.isArray(data) ? data[0] : data;
        setProfile(value || null);
        if (value)
          setForm({
            fullName: value.fullName || "",
            phone: value.phone || "",
            email: value.email || "",
          });
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = { ...form };
      if (avatarFile) payload.avatarFile = avatarFile;
      const updated = await updateProfile(payload);
      const value = Array.isArray(updated) ? updated[0] : updated;
      // Merge API response with local form + avatar preview so UI stays fresh
      setProfile((prev) => ({
        ...prev,
        ...form,
        ...(value || {}),
        ...(avatarPreview ? { profilePicture: avatarPreview } : {}),
      }));
      setEditing(false);
      setAvatarFile(null);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile)
      setForm({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        email: profile.email || "",
      });
    setAvatarPreview(null);
    setAvatarFile(null);
    setEditing(false);
    setError("");
  };

  const avatarSrc =
    avatarPreview ||
    profile?.profilePicture ||
    profile?.avatarUrl ||
    profile?.photoUrl;
  const displayName =
    profile?.fullName || profile?.name || profile?.username || "User";
  const role = profile?.role || profile?.userType || "Member";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "28px 28px 56px",
      }}
    >
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .avatar-ring:hover .avatar-overlay { opacity: 1 !important; }
      `}</style>

      {/* ── HERO BANNER ── */}
      <div
        style={{
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 20,
          animation: "fadeUp 0.3s ease both",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        {/* gradient strip */}
        <div
          style={{
            height: 110,
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(99,179,237,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(139,92,246,0.1) 0%, transparent 60%)",
            }}
          />
          {/* subtle dot grid */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0.08,
            }}
          >
            <defs>
              <pattern
                id="dots"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.2" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* white card below banner */}
        <div
          style={{
            background: "#fff",
            padding: "0 28px 24px",
            borderTop: "none",
          }}
        >
          {/* Avatar row — overlaps banner */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginTop: -44,
            }}
          >
            {/* Avatar */}
            <div
              className="avatar-ring"
              style={{
                position: "relative",
                width: 88,
                height: 88,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  border: "4px solid #fff",
                  overflow: "hidden",
                  background: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                  cursor: editing ? "pointer" : "default",
                }}
                onClick={() => editing && fileRef.current?.click()}
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {getInitials(displayName)}
                  </span>
                )}
                {/* overlay on hover in edit mode */}
                {editing && (
                  <div
                    className="avatar-overlay"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.5)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s",
                      gap: 3,
                    }}
                  >
                    <CameraAlt sx={{ fontSize: 20, color: "#fff" }} />
                    <span
                      style={{
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        color: "#fff",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Change
                    </span>
                  </div>
                )}
              </div>
              {editing && (
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#1e293b",
                    border: "2px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <CameraAlt sx={{ fontSize: 12, color: "#fff" }} />
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </div>

            {/* Edit / Save buttons */}
            <div style={{ display: "flex", gap: 8, paddingTop: 52 }}>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    color: "#1e293b",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.borderColor = "#1e293b";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  <Edit sx={{ fontSize: 14 }} /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: "1.5px solid #e2e8f0",
                      background: "#fff",
                      color: "#64748b",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <Close sx={{ fontSize: 13 }} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg,#1e293b,#334155)",
                      color: "#fff",
                      cursor: saving ? "default" : "pointer",
                      opacity: saving ? 0.7 : 1,
                      transition: "all 0.15s",
                      boxShadow: "0 3px 10px rgba(15,23,42,0.25)",
                    }}
                  >
                    {saving ? (
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTop: "2px solid #fff",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
                    ) : (
                      <CheckCircle sx={{ fontSize: 14 }} />
                    )}
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name + role */}
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  letterSpacing: "-0.025em",
                }}
              >
                {displayName}
              </h2>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: 999,
                  padding: "2px 10px",
                }}
              >
                <Shield sx={{ fontSize: 11, color: "#64748b" }} />
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {role}
                </span>
              </span>
            </div>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: "0.8rem",
                color: "#94a3b8",
                fontWeight: 400,
              }}
            >
              {profile?.email}
            </p>
          </div>
        </div>
      </div>

      {/* banners */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            borderRadius: 10,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "0.82rem",
            fontWeight: 500,
            marginBottom: 16,
            animation: "fadeUp 0.2s ease both",
          }}
        >
          <Close sx={{ fontSize: 14 }} />
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            borderRadius: 10,
            background: "#f0fdf4",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            fontSize: "0.82rem",
            fontWeight: 500,
            marginBottom: 16,
            animation: "fadeUp 0.2s ease both",
          }}
        >
          <CheckCircle sx={{ fontSize: 14 }} />
          {success}
        </div>
      )}

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              border: "3px solid #e2e8f0",
              borderTop: "3px solid #1e293b",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
        </div>
      ) : profile ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* ── LEFT: info / edit form ── */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              animation: "fadeUp 0.35s ease both",
              animationDelay: "0.05s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Person sx={{ fontSize: 16, color: "#64748b" }} />
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                {editing ? "Edit Information" : "Personal Information"}
              </span>
            </div>

            <div style={{ padding: "4px 20px 20px" }}>
              {!editing ? (
                <>
                  <InfoRow
                    icon={<Person />}
                    label="Full Name"
                    value={profile.fullName}
                  />
                  <InfoRow
                    icon={<Email />}
                    label="Email Address"
                    value={profile.email}
                  />
                  <InfoRow
                    icon={<Phone />}
                    label="Phone Number"
                    value={profile.phone}
                  />
                  <InfoRow
                    icon={<Shield />}
                    label="Role"
                    value={profile.role}
                  />
                  <InfoRow
                    icon={<Lock />}
                    label="Auth Provider"
                    value={profile.authProvider}
                  />
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    paddingTop: 16,
                  }}
                >
                  <EditField
                    label="Full Name"
                    icon={<Person />}
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                  />
                  <EditField
                    label="Email Address"
                    icon={<Email />}
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    type="email"
                  />
                  <EditField
                    label="Phone Number"
                    icon={<Phone />}
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    type="tel"
                  />
                  <EditField
                    label="Role"
                    icon={<Shield />}
                    value={profile.role || "—"}
                    onChange={() => {}}
                    disabled
                  />
                  <EditField
                    label="Auth Provider"
                    icon={<Lock />}
                    value={profile.authProvider || "—"}
                    onChange={() => {}}
                    disabled
                  />
                  {editing && (
                    <div
                      style={{
                        marginTop: 4,
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <CameraAlt sx={{ fontSize: 15, color: "#64748b" }} />
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          Profile Photo
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.66rem",
                            color: "#94a3b8",
                          }}
                        >
                          {avatarFile
                            ? `Selected: ${avatarFile.name}`
                            : "Click your avatar above to upload a new photo"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: account meta ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Account dates */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                animation: "fadeUp 0.35s ease both",
                animationDelay: "0.1s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#374151",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Account Activity
                </span>
              </div>
              <div style={{ padding: "6px 18px 16px" }}>
                {[
                  { label: "Member Since", value: fmt(profile.createdAt) },
                  { label: "Last Updated", value: fmt(profile.updatedAt) },
                  {
                    label: "Account ID",
                    value: profile.id ? `#${profile.id}` : "—",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid #f8fafc",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#94a3b8",
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "#1e293b",
                        fontWeight: 700,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status badge */}
            <div
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
                borderRadius: 16,
                padding: "18px",
                animation: "fadeUp 0.35s ease both",
                animationDelay: "0.15s",
                boxShadow: "0 4px 16px rgba(15,23,42,0.2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Star sx={{ fontSize: 18, color: "#fbbf24" }} />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.55)",
                      textTransform: "uppercase",
                      letterSpacing: "0.09em",
                    }}
                  >
                    Account Status
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    Active Member
                  </p>
                </div>
              </div>
              <div
                style={{
                  marginTop: 12,
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                }}
              />
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.5,
                }}
              >
                Your account is in good standing. Keep exploring the catalog!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1.5px dashed #e2e8f0",
            borderRadius: 16,
            padding: "64px 24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#334155",
              margin: "0 0 4px",
            }}
          >
            No profile data available
          </p>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>
            Try refreshing the page.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
