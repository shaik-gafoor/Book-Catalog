import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import {
  AccountBalanceWallet,
  BookmarkBorder,
  EventNote,
  MenuBook,
  PeopleAlt,
  ReceiptLong,
} from "@mui/icons-material";
import {
  deleteBook,
  getAllFines,
  getAllSubscriptions,
  getAllWishlists,
  getBooks,
  getUsers,
  searchBookLoans,
  searchReservations,
} from "../../api/libraryApi";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/format";

const extractContent = (data) =>
  Array.isArray(data) ? data : data?.content || [];

const isLoanCurrent = (status) =>
  ["CHECKED_OUT", "OVERDUE"].includes(String(status || "").toUpperCase());
const isLoanCompleted = (status) =>
  String(status || "").toUpperCase() === "RETURNED";
const isReservationActive = (status) =>
  ["PENDING", "AVAILABLE"].includes(String(status || "").toUpperCase());
const isReservationComplete = (status) =>
  ["FULFILLED", "CANCELLED", "EXPIRED"].includes(
    String(status || "").toUpperCase(),
  );

const latestRecord = (items) =>
  [...items].sort((left, right) => {
    const leftTime = new Date(
      left?.updatedAt ||
        left?.createdAt ||
        left?.reservedAt ||
        left?.addedAt ||
        0,
    ).getTime();
    const rightTime = new Date(
      right?.updatedAt ||
        right?.createdAt ||
        right?.reservedAt ||
        right?.addedAt ||
        0,
    ).getTime();
    return rightTime - leftTime;
  })[0];

const Tone = {
  slate: { bg: "#e2e8f0", fg: "#334155" },
  green: { bg: "#dcfce7", fg: "#166534" },
  amber: { bg: "#fef3c7", fg: "#92400e" },
  red: { bg: "#fee2e2", fg: "#b91c1c" },
  blue: { bg: "#dbeafe", fg: "#1d4ed8" },
  violet: { bg: "#ede9fe", fg: "#6d28d9" },
};

const Pill = ({ children, tone = "slate" }) => {
  const colors = Tone[tone] || Tone.slate;
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

const Section = ({ title, description, icon, children, action }) => (
  <Card
    elevation={0}
    sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 3 }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#334155",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
            {description}
          </Typography>
        </Box>
      </Box>
      {action}
    </Box>
    <Divider sx={{ my: 2 }} />
    {children}
  </Card>
);

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

const UserTable = ({
  title,
  description,
  icon,
  rows,
  columns,
  selectedUserId,
  onSelectUser,
  emptyText,
}) => (
  <Section title={title} description={description} icon={icon}>
    {rows.length === 0 ? (
      <Typography variant="body2" sx={{ color: "#6b7280" }}>
        {emptyText || "No records found."}
      </Typography>
    ) : (
      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: 760 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `minmax(220px, 1.2fr) repeat(${columns.length}, minmax(110px, 0.8fr))`,
              gap: 1,
              px: 1,
              pb: 1,
              color: "#64748b",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <div>User</div>
            {columns.map((column) => (
              <div key={column.key}>{column.label}</div>
            ))}
          </Box>
          <Box sx={{ display: "grid", gap: 1 }}>
            {rows.map((row) => {
              const isSelected = String(selectedUserId) === String(row.id);
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => onSelectUser(row)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `minmax(220px, 1.2fr) repeat(${columns.length}, minmax(110px, 0.8fr))`,
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
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: "#111827" }}>
                      {row.fullName || row.userName || "Unknown user"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {row.email || row.userEmail || `User #${row.id}`}
                    </div>
                    {row.subscriptionLabel && (
                      <div style={{ marginTop: 6 }}>
                        <Pill tone={row.subscriptionTone || "blue"}>
                          {row.subscriptionLabel}
                        </Pill>
                      </div>
                    )}
                  </div>
                  {columns.map((column) => (
                    <div key={column.key} style={{ minWidth: 0 }}>
                      {typeof column.render === "function"
                        ? column.render(row)
                        : row[column.key]}
                    </div>
                  ))}
                </button>
              );
            })}
          </Box>
        </Box>
      </Box>
    )}
  </Section>
);

const RecordList = ({ title, items, renderItem, emptyText }) => (
  <Box
    sx={{
      border: "1px solid #e5e7eb",
      borderRadius: 2.5,
      p: 2,
      bgcolor: "#fff",
    }}
  >
    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
      {title}
    </Typography>
    {items.length === 0 ? (
      <Typography variant="body2" sx={{ color: "#6b7280" }}>
        {emptyText || "No records for this user."}
      </Typography>
    ) : (
      <Box sx={{ display: "grid", gap: 1 }}>
        {items.slice(0, 5).map((item, index) => (
          <Box
            key={item.id || `${title}-${index}`}
            sx={{
              border: "1px solid #f1f5f9",
              borderRadius: 2,
              p: 1.5,
              bgcolor: index === 0 ? "#f8fafc" : "#fff",
            }}
          >
            {renderItem(item)}
          </Box>
        ))}
      </Box>
    )}
  </Box>
);

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [fines, setFines] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loans, setLoans] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingBooks, setRefreshingBooks] = useState(false);
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [
          usersData,
          subscriptionsData,
          finesData,
          reservationsData,
          loansData,
          wishlistsData,
          booksData,
        ] = await Promise.all([
          getUsers(),
          getAllSubscriptions({ page: 0, size: 100 }),
          getAllFines({ page: 0, size: 200 }),
          searchReservations({ page: 0, size: 200 }),
          searchBookLoans({ page: 0, size: 200 }),
          getAllWishlists({ page: 0, size: 200 }),
          getBooks({
            page: 0,
            size: 100,
            sortBy: "createdAt",
            sortDirection: "DESC",
          }),
        ]);

        setUsers(extractContent(usersData));
        setSubscriptions(extractContent(subscriptionsData));
        setFines(extractContent(finesData));
        setReservations(extractContent(reservationsData));
        setLoans(extractContent(loansData));
        setWishlists(extractContent(wishlistsData));
        setBooks(extractContent(booksData));
      } catch (err) {
        setError(err.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const subscriptionByUserId = useMemo(() => {
    const map = new Map();
    subscriptions.forEach((subscription) => {
      if (!subscription?.userId) return;
      const current = map.get(String(subscription.userId));
      if (!current) {
        map.set(String(subscription.userId), subscription);
        return;
      }

      const currentTime = new Date(
        current.updatedAt || current.createdAt || current.startDate || 0,
      ).getTime();
      const nextTime = new Date(
        subscription.updatedAt ||
          subscription.createdAt ||
          subscription.startDate ||
          0,
      ).getTime();

      if (
        (subscription.isActive && !current.isActive) ||
        nextTime >= currentTime
      ) {
        map.set(String(subscription.userId), subscription);
      }
    });
    return map;
  }, [subscriptions]);

  const usersWithMetrics = useMemo(() => {
    return users
      .map((user) => {
        const userId = String(user.id);
        const userLoans = loans.filter(
          (loan) => String(loan.userId) === userId,
        );
        const userReservations = reservations.filter(
          (reservation) => String(reservation.userId) === userId,
        );
        const userFines = fines.filter(
          (fine) => String(fine.userId) === userId,
        );
        const userWishlists = wishlists.filter(
          (entry) => String(entry.userId) === userId,
        );
        const subscription = subscriptionByUserId.get(userId);

        return {
          ...user,
          userName: user.fullName,
          userEmail: user.email,
          subscriptionLabel: subscription
            ? `${subscription.planName || subscription.planCode || "Subscription"}${subscription.isActive ? " · Active" : ""}`
            : "Free · No active plan",
          subscriptionTone: subscription?.isActive ? "green" : "slate",
          currentLoans: userLoans.filter((loan) => isLoanCurrent(loan.status))
            .length,
          completedLoans: userLoans.filter((loan) =>
            isLoanCompleted(loan.status),
          ).length,
          pendingLoans: userLoans.filter(
            (loan) =>
              !isLoanCurrent(loan.status) && !isLoanCompleted(loan.status),
          ).length,
          activeReservations: userReservations.filter((reservation) =>
            isReservationActive(reservation.status),
          ).length,
          completedReservations: userReservations.filter((reservation) =>
            isReservationComplete(reservation.status),
          ).length,
          fineCount: userFines.length,
          fineOutstanding: userFines.reduce(
            (sum, fine) =>
              sum + Number(fine.amountOutstanding ?? fine.amount ?? 0),
            0,
          ),
          wishlistCount: userWishlists.length,
          latestLoan: latestRecord(userLoans),
          latestReservation: latestRecord(userReservations),
          latestFine: latestRecord(userFines),
          latestWishlist: latestRecord(userWishlists),
        };
      })
      .sort((left, right) =>
        (left.fullName || "").localeCompare(right.fullName || ""),
      );
  }, [
    users,
    subscriptions,
    loans,
    reservations,
    fines,
    wishlists,
    subscriptionByUserId,
  ]);

  useEffect(() => {
    if (!selectedUserId && usersWithMetrics.length > 0) {
      setSelectedUserId(String(usersWithMetrics[0].id));
    }
  }, [selectedUserId, usersWithMetrics]);

  const selectedUser = useMemo(
    () =>
      usersWithMetrics.find(
        (user) => String(user.id) === String(selectedUserId),
      ) ||
      usersWithMetrics[0] ||
      null,
    [usersWithMetrics, selectedUserId],
  );

  const selectedLoans = useMemo(
    () =>
      loans.filter((loan) => String(loan.userId) === String(selectedUser?.id)),
    [loans, selectedUser],
  );
  const selectedReservations = useMemo(
    () =>
      reservations.filter(
        (reservation) =>
          String(reservation.userId) === String(selectedUser?.id),
      ),
    [reservations, selectedUser],
  );
  const selectedFines = useMemo(
    () =>
      fines.filter((fine) => String(fine.userId) === String(selectedUser?.id)),
    [fines, selectedUser],
  );
  const selectedWishlists = useMemo(
    () =>
      wishlists.filter(
        (entry) => String(entry.userId) === String(selectedUser?.id),
      ),
    [wishlists, selectedUser],
  );

  const handleDeleteBook = async (book) => {
    try {
      setRefreshingBooks(true);
      await deleteBook(book.id);
      setBooks((current) =>
        current.filter((item) => String(item.id) !== String(book.id)),
      );
    } catch (err) {
      setError(err.message || "Failed to delete book");
    } finally {
      setRefreshingBooks(false);
    }
  };

  const userColumns = [
    {
      key: "subscription",
      label: "Subscription",
      render: (row) => (
        <Pill tone={row.subscriptionTone}>{row.subscriptionLabel}</Pill>
      ),
    },
    {
      key: "loans",
      label: "Loans",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          <Pill tone="blue">Current {row.currentLoans}</Pill>
          <Pill tone="green">Completed {row.completedLoans}</Pill>
          <Pill tone="amber">Pending {row.pendingLoans}</Pill>
        </Box>
      ),
    },
    {
      key: "fines",
      label: "Fines",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          <Pill tone={row.fineCount > 0 ? "red" : "slate"}>
            {row.fineCount} fines
          </Pill>
          <Pill tone={row.fineOutstanding > 0 ? "amber" : "green"}>
            {formatCurrency(row.fineOutstanding)}
          </Pill>
        </Box>
      ),
    },
    {
      key: "wishlist",
      label: "Wishlist",
      render: (row) => (
        <Pill tone={row.wishlistCount > 0 ? "violet" : "slate"}>
          {row.wishlistCount} items
        </Pill>
      ),
    },
  ];

  const reservationColumns = [
    {
      key: "activeReservations",
      label: "Active",
      render: (row) => <Pill tone="blue">{row.activeReservations}</Pill>,
    },
    {
      key: "completedReservations",
      label: "Completed",
      render: (row) => <Pill tone="green">{row.completedReservations}</Pill>,
    },
    {
      key: "latestReservation",
      label: "Latest",
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#475569" }}>
          {row.latestReservation
            ? formatDateTime(row.latestReservation.reservedAt)
            : "—"}
        </Typography>
      ),
    },
  ];

  const fineColumns = [
    {
      key: "fineCount",
      label: "Count",
      render: (row) => (
        <Pill tone={row.fineCount > 0 ? "red" : "slate"}>{row.fineCount}</Pill>
      ),
    },
    {
      key: "fineOutstanding",
      label: "Outstanding",
      render: (row) => (
        <Pill tone={row.fineOutstanding > 0 ? "amber" : "green"}>
          {formatCurrency(row.fineOutstanding)}
        </Pill>
      ),
    },
    {
      key: "latestFine",
      label: "Latest",
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#475569" }}>
          {row.latestFine ? formatDateTime(row.latestFine.createdAt) : "—"}
        </Typography>
      ),
    },
  ];

  const wishlistColumns = [
    {
      key: "wishlistCount",
      label: "Items",
      render: (row) => (
        <Pill tone={row.wishlistCount > 0 ? "violet" : "slate"}>
          {row.wishlistCount}
        </Pill>
      ),
    },
    {
      key: "latestWishlist",
      label: "Latest",
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#475569" }}>
          {row.latestWishlist
            ? formatDateTime(row.latestWishlist.addedAt)
            : "—"}
        </Typography>
      ),
    },
    {
      key: "subscriptionLabel",
      label: "Subscription",
      render: (row) => (
        <Pill tone={row.subscriptionTone}>{row.subscriptionLabel}</Pill>
      ),
    },
  ];

  const bookCounts = {
    total: books.length,
    available: books.filter((book) => Number(book.availableCopies || 0) > 0)
      .length,
  };

  const subscriptionCount = subscriptions.filter(
    (subscription) => subscription?.isActive,
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            User-driven overview for subscriptions, loans, reservations, fines,
            wishlists, and book management.
          </Typography>
        </div>

        {error && (
          <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>
            {error}
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Users"
            value={users.length}
            helper="Total registered users"
            icon={<PeopleAlt fontSize="small" />}
          />
          <StatCard
            label="Active subscriptions"
            value={subscriptionCount}
            helper="Users with a live plan"
            icon={<AccountBalanceWallet fontSize="small" />}
          />
          <StatCard
            label="Open fines"
            value={
              fines.filter((fine) =>
                ["PENDING", "PARTIALLY_PAID"].includes(
                  String(fine.status || "").toUpperCase(),
                ),
              ).length
            }
            helper="Pending or partial payments"
            icon={<ReceiptLong fontSize="small" />}
          />
          <StatCard
            label="Wishlist users"
            value={new Set(wishlists.map((entry) => String(entry.userId))).size}
            helper="Users saving books"
            icon={<BookmarkBorder fontSize="small" />}
          />
          <StatCard
            label="Books"
            value={bookCounts.total}
            helper={`${bookCounts.available} available now`}
            icon={<MenuBook fontSize="small" />}
          />
        </div>

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
              Loading admin data...
            </Typography>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              <UserTable
                title="Users and subscriptions"
                description="Click a user to inspect their loans, reservations, fines, and wishlist items."
                icon={<PeopleAlt fontSize="small" />}
                rows={usersWithMetrics}
                columns={userColumns}
                selectedUserId={selectedUserId}
                onSelectUser={(user) => setSelectedUserId(String(user.id))}
                emptyText="No users available."
              />
              <UserTable
                title="Loans"
                description="Current, completed, and pending loan activity grouped by user."
                icon={<EventNote fontSize="small" />}
                rows={usersWithMetrics}
                columns={[
                  {
                    key: "currentLoans",
                    label: "Current",
                    render: (row) => (
                      <Pill tone="blue">{row.currentLoans}</Pill>
                    ),
                  },
                  {
                    key: "completedLoans",
                    label: "Completed",
                    render: (row) => (
                      <Pill tone="green">{row.completedLoans}</Pill>
                    ),
                  },
                  {
                    key: "pendingLoans",
                    label: "Pending",
                    render: (row) => (
                      <Pill tone="amber">{row.pendingLoans}</Pill>
                    ),
                  },
                ]}
                selectedUserId={selectedUserId}
                onSelectUser={(user) => setSelectedUserId(String(user.id))}
                emptyText="No loans found."
              />
              <UserTable
                title="Reservations"
                description="Users who made reservations, grouped by active and completed states."
                icon={<MenuBook fontSize="small" />}
                rows={usersWithMetrics}
                columns={reservationColumns}
                selectedUserId={selectedUserId}
                onSelectUser={(user) => setSelectedUserId(String(user.id))}
                emptyText="No reservations found."
              />
              <UserTable
                title="Fines"
                description="Users with fines, including the outstanding amount."
                icon={<ReceiptLong fontSize="small" />}
                rows={usersWithMetrics}
                columns={fineColumns}
                selectedUserId={selectedUserId}
                onSelectUser={(user) => setSelectedUserId(String(user.id))}
                emptyText="No fines found."
              />
              <UserTable
                title="Wishlist"
                description="Users who have wishlist items saved."
                icon={<BookmarkBorder fontSize="small" />}
                rows={usersWithMetrics.filter((user) => user.wishlistCount > 0)}
                columns={wishlistColumns}
                selectedUserId={selectedUserId}
                onSelectUser={(user) => setSelectedUserId(String(user.id))}
                emptyText="No wishlist entries found."
              />
            </div>

            <div className="space-y-4">
              <Section
                title={selectedUser ? selectedUser.fullName : "Select a user"}
                description={
                  selectedUser
                    ? selectedUser.userEmail
                    : "User details will appear here."
                }
                icon={<PeopleAlt fontSize="small" />}
              >
                {selectedUser ? (
                  <Box sx={{ display: "grid", gap: 2.5 }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      <Pill tone={selectedUser.subscriptionTone}>
                        {selectedUser.subscriptionLabel}
                      </Pill>
                      <Pill tone="blue">
                        Current {selectedUser.currentLoans}
                      </Pill>
                      <Pill tone="green">
                        Completed {selectedUser.completedLoans}
                      </Pill>
                      <Pill tone="amber">
                        Pending {selectedUser.pendingLoans}
                      </Pill>
                      <Pill tone="red">Fines {selectedUser.fineCount}</Pill>
                      <Pill tone="violet">
                        Wishlist {selectedUser.wishlistCount}
                      </Pill>
                    </Box>

                    <Box sx={{ display: "grid", gap: 2 }}>
                      <RecordList
                        title="Loans"
                        items={selectedLoans}
                        renderItem={(loan) => (
                          <Box sx={{ display: "grid", gap: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 800 }}
                            >
                              {loan.bookTitle || "Untitled book"}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#64748b" }}
                            >
                              {loan.userName || selectedUser.fullName} ·{" "}
                              {loan.status || "—"} · {loan.type || "—"}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#94a3b8" }}
                            >
                              Checkout {formatDate(loan.checkoutDate)} · Due{" "}
                              {formatDate(loan.dueDate)}
                            </Typography>
                          </Box>
                        )}
                        emptyText="This user has no loan history."
                      />

                      <RecordList
                        title="Reservations"
                        items={selectedReservations}
                        renderItem={(reservation) => (
                          <Box sx={{ display: "grid", gap: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 800 }}
                            >
                              {reservation.bookTitle || "Untitled book"}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#64748b" }}
                            >
                              {reservation.status || "—"} · Queue #
                              {reservation.queuePosition ?? "—"}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#94a3b8" }}
                            >
                              Reserved {formatDateTime(reservation.reservedAt)}
                            </Typography>
                          </Box>
                        )}
                        emptyText="This user has no reservations."
                      />

                      <RecordList
                        title="Fines"
                        items={selectedFines}
                        renderItem={(fine) => (
                          <Box sx={{ display: "grid", gap: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 800 }}
                            >
                              {fine.bookTitle || `Fine #${fine.id}`}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#64748b" }}
                            >
                              {fine.status || "—"} · {fine.type || "—"} ·{" "}
                              {formatCurrency(
                                fine.amountOutstanding ?? fine.amount,
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#94a3b8" }}
                            >
                              Created {formatDateTime(fine.createdAt)}
                            </Typography>
                          </Box>
                        )}
                        emptyText="This user has no fines."
                      />

                      <RecordList
                        title="Wishlist"
                        items={selectedWishlists}
                        renderItem={(entry) => (
                          <Box sx={{ display: "grid", gap: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 800 }}
                            >
                              {entry.book?.title || "Untitled book"}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#64748b" }}
                            >
                              {entry.book?.author || "Unknown author"}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#94a3b8" }}
                            >
                              Added {formatDateTime(entry.addedAt)}
                            </Typography>
                          </Box>
                        )}
                        emptyText="This user has no wishlist items."
                      />
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Select a user from the tables on the left to inspect their
                    records.
                  </Typography>
                )}
              </Section>

              <Section
                title="Book management"
                description="Admin browsing with delete support."
                icon={<MenuBook fontSize="small" />}
                action={refreshingBooks ? <CircularProgress size={18} /> : null}
              >
                <Box sx={{ display: "grid", gap: 1.5 }}>
                  {books.slice(0, 8).map((book) => (
                    <Box
                      key={book.id}
                      sx={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800 }}
                          noWrap
                        >
                          {book.title || "Untitled book"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#64748b" }}
                          noWrap
                        >
                          {book.author || "Unknown author"} ·{" "}
                          {book.availableCopies ?? 0}/{book.totalCopies ?? 0}{" "}
                          copies
                        </Typography>
                      </Box>
                      <button
                        type="button"
                        onClick={() => handleDeleteBook(book)}
                        style={{
                          border: "1px solid #fecaca",
                          background: "#fff1f2",
                          color: "#b91c1c",
                          borderRadius: 999,
                          padding: "7px 14px",
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </Box>
                  ))}
                  {books.length === 0 && (
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      No books found.
                    </Typography>
                  )}
                </Box>
              </Section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
