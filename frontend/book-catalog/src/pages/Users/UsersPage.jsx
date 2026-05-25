import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  PeopleAlt,
  Email,
  Phone,
  Badge,
  Login,
  Update,
  CalendarMonth,
  Shield,
  Person,
} from "@mui/icons-material";
import { getAuthUser, getUsers } from "../../api/libraryApi";

const fmt = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

const fmtDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const statTone = {
  slate: { bg: "#e2e8f0", fg: "#334155" },
  green: { bg: "#dcfce7", fg: "#166534" },
  amber: { bg: "#fef3c7", fg: "#92400e" },
  blue: { bg: "#dbeafe", fg: "#1d4ed8" },
  violet: { bg: "#ede9fe", fg: "#6d28d9" },
};

const Pill = ({ children, tone = "slate" }) => {
  const colors = statTone[tone] || statTone.slate;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3px 10px",
        borderRadius: 999,
        background: colors.bg,
        color: colors.fg,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};

const StatCard = ({ label, value, helper, icon }) => (
  <Card
    elevation={0}
    sx={{
      p: 2.5,
      border: "1px solid #e5e7eb",
      borderRadius: 3,
      background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: "#111827",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
          {value}
        </Typography>
        {helper && (
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            {helper}
          </Typography>
        )}
      </Box>
    </Box>
  </Card>
);

const DetailRow = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 1.5,
      py: 1.25,
      borderBottom: "1px solid #f1f5f9",
    }}
  >
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: 2,
        bgcolor: "#f8fafc",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "#64748b",
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "#94a3b8",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: "#111827", fontWeight: 600 }}>
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);

const UsersPage = () => {
  const authUser = getAuthUser();
  const isAdmin = String(authUser?.role || "").toUpperCase() === "ROLE_ADMIN";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getUsers();
        setUsers(Array.isArray(data) ? data : data?.content || []);
      } catch (err) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users
      .filter((user) => {
        const role = String(user.role || "").toUpperCase();
        if (roleFilter !== "ALL" && role !== roleFilter) return false;
        if (!query) return true;
        const haystack = [
          user.fullName,
          user.email,
          user.username,
          user.phone,
          user.role,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
      .sort((left, right) =>
        (left.fullName || left.email || "").localeCompare(
          right.fullName || right.email || "",
        ),
      );
  }, [users, search, roleFilter]);

  useEffect(() => {
    if (!selectedUserId && filteredUsers.length > 0) {
      setSelectedUserId(String(filteredUsers[0].id));
    }
  }, [filteredUsers, selectedUserId]);

  const selectedUser = useMemo(
    () =>
      filteredUsers.find(
        (user) => String(user.id) === String(selectedUserId),
      ) ||
      filteredUsers[0] ||
      null,
    [filteredUsers, selectedUserId],
  );

  const stats = useMemo(() => {
    const now = Date.now();
    const recentWindow = 1000 * 60 * 60 * 24 * 30;
    return {
      total: users.length,
      admins: users.filter((user) =>
        String(user.role || "")
          .toUpperCase()
          .includes("ADMIN"),
      ).length,
      recentLogin: users.filter((user) => {
        if (!user.lastLogin) return false;
        const time = new Date(user.lastLogin).getTime();
        return Number.isFinite(time) && now - time <= recentWindow;
      }).length,
      registeredRecent: users.filter((user) => {
        if (!user.createdAt) return false;
        const time = new Date(user.createdAt).getTime();
        return Number.isFinite(time) && now - time <= recentWindow;
      }).length,
    };
  }, [users]);

  if (!isAdmin) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        Only admin users can view the users directory.
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}
          >
            Users Directory
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Browse all registered users and inspect their account details.
          </Typography>
        </div>

        {error && (
          <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>
            {error}
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Registered users"
            value={stats.total}
            helper="All user accounts"
            icon={<PeopleAlt fontSize="small" />}
          />
          <StatCard
            label="Admins"
            value={stats.admins}
            helper="Admin accounts"
            icon={<Shield fontSize="small" />}
          />
          <StatCard
            label="Recent logins"
            value={stats.recentLogin}
            helper="Logged in within 30 days"
            icon={<Login fontSize="small" />}
          />
          <StatCard
            label="Recently registered"
            value={stats.registeredRecent}
            helper="Created within 30 days"
            icon={<CalendarMonth fontSize="small" />}
          />
        </div>

        <Card
          elevation={0}
          sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 3 }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "grid", gap: 0.4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Account Filters
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Search by name, email, username, phone, or role.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <TextField
                size="small"
                label="Search users"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: { xs: "100%", sm: 280 } }}
              />
              <TextField
                select
                size="small"
                label="Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="ALL">All roles</MenuItem>
                <MenuItem value="ROLE_USER">Users</MenuItem>
                <MenuItem value="ROLE_ADMIN">Admins</MenuItem>
              </TextField>
            </Box>
          </Box>
        </Card>

        {loading ? (
          <Card
            elevation={0}
            sx={{
              p: 6,
              border: "1px solid #e5e7eb",
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress size={26} />
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Loading users...
            </Typography>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
            <Card
              elevation={0}
              sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 3 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    All Users
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Click any user to inspect their account information.
                  </Typography>
                </Box>
                <Pill tone="slate">{filteredUsers.length} shown</Pill>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {filteredUsers.length === 0 ? (
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  No users match your filters.
                </Typography>
              ) : (
                <Box sx={{ display: "grid", gap: 1.25 }}>
                  {filteredUsers.map((user) => {
                    const isSelected =
                      String(user.id) === String(selectedUserId);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setSelectedUserId(String(user.id))}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "minmax(220px,1.2fr) repeat(3, minmax(120px, 0.8fr))",
                          gap: 12,
                          alignItems: "center",
                          textAlign: "left",
                          padding: "14px 16px",
                          borderRadius: 14,
                          border: `1px solid ${isSelected ? "#0f172a" : "#e5e7eb"}`,
                          background: isSelected ? "#f8fafc" : "#ffffff",
                          cursor: "pointer",
                          boxShadow: isSelected
                            ? "0 10px 28px rgba(15, 23, 42, 0.08)"
                            : "none",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              bgcolor: "#111827",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(user.fullName || user.email)}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 800 }}
                              noWrap
                            >
                              {user.fullName || "Unnamed user"}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#64748b" }}
                              noWrap
                            >
                              {user.email || "No email"}
                            </Typography>
                          </Box>
                        </Box>
                        <Pill
                          tone={
                            String(user.role || "").includes("ADMIN")
                              ? "violet"
                              : "blue"
                          }
                        >
                          {user.role || "ROLE_USER"}
                        </Pill>
                        <Typography
                          variant="body2"
                          sx={{ color: "#475569" }}
                          noWrap
                        >
                          {user.username || "—"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#475569" }}
                          noWrap
                        >
                          {fmtDate(user.createdAt)}
                        </Typography>
                      </button>
                    );
                  })}
                </Box>
              )}
            </Card>

            <Card
              elevation={0}
              sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 3 }}
            >
              <Box sx={{ display: "grid", gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {selectedUser
                      ? selectedUser.fullName || "Selected user"
                      : "Select a user"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    {selectedUser
                      ? selectedUser.email
                      : "User profile details will appear here."}
                  </Typography>
                </Box>

                {selectedUser ? (
                  <>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      <Pill
                        tone={
                          String(selectedUser.role || "").includes("ADMIN")
                            ? "violet"
                            : "blue"
                        }
                      >
                        {selectedUser.role || "ROLE_USER"}
                      </Pill>
                      <Pill tone="slate">ID #{selectedUser.id}</Pill>
                      <Pill tone="green">
                        Member since {fmtDate(selectedUser.createdAt)}
                      </Pill>
                    </Box>

                    <Divider />

                    <Box sx={{ display: "grid" }}>
                      <DetailRow
                        icon={<Person sx={{ fontSize: 16 }} />}
                        label="Full Name"
                        value={selectedUser.fullName}
                      />
                      <DetailRow
                        icon={<Email sx={{ fontSize: 16 }} />}
                        label="Email"
                        value={selectedUser.email}
                      />
                      <DetailRow
                        icon={<Phone sx={{ fontSize: 16 }} />}
                        label="Phone"
                        value={selectedUser.phone}
                      />
                      <DetailRow
                        icon={<Badge sx={{ fontSize: 16 }} />}
                        label="Username"
                        value={selectedUser.username}
                      />
                      <DetailRow
                        icon={<Shield sx={{ fontSize: 16 }} />}
                        label="Role"
                        value={selectedUser.role}
                      />
                      <DetailRow
                        icon={<CalendarMonth sx={{ fontSize: 16 }} />}
                        label="Registered At"
                        value={fmt(selectedUser.createdAt)}
                      />
                      <DetailRow
                        icon={<Update sx={{ fontSize: 16 }} />}
                        label="Last Updated"
                        value={fmt(selectedUser.updatedAt)}
                      />
                      <DetailRow
                        icon={<Login sx={{ fontSize: 16 }} />}
                        label="Last Login"
                        value={fmt(selectedUser.lastLogin)}
                      />
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Choose a user from the list to inspect their registered
                    data.
                  </Typography>
                )}
              </Box>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
