import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import {
  MenuBook,
  PersonOutlined as PersonIcon,
  Numbers,
  CalendarToday,
  AssignmentReturn,
  WarningAmberOutlined,
} from "@mui/icons-material";

const statusConfig = {
  ACTIVE: {
    label: "Active",
    bg: "#f9fafb",
    color: "#374151",
    border: "#e5e7eb",
  },
  CURRENT: {
    label: "Current",
    bg: "#f9fafb",
    color: "#374151",
    border: "#e5e7eb",
  },
  OVERDUE: {
    label: "Overdue",
    bg: "#fafafa",
    color: "#111827",
    border: "#d1d5db",
  },
  RETURNED: {
    label: "Returned",
    bg: "#f9fafb",
    color: "#6b7280",
    border: "#e5e7eb",
  },
  LOST: { label: "Lost", bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" },
  DAMAGED: {
    label: "Damaged",
    bg: "#f9fafb",
    color: "#6b7280",
    border: "#e5e7eb",
  },
};

const InfoRow = ({ icon, label, value }) => (
  <Box>
    <Typography
      variant="caption"
      sx={{
        color: "#9ca3af",
        display: "block",
        mb: 0.3,
        fontSize: "0.68rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {icon}
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: "#111827", fontSize: "0.83rem" }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

const LoanCard = ({ loan }) => {
  const status = statusConfig[loan.status] || statusConfig.ACTIVE;
  const iconColor = "#9ca3af";

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: loan.isOverdue ? "#d1d5db" : "#e5e7eb",
        borderRadius: "14px",
        bgcolor: "#ffffff",
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Book Cover */}
          <Box
            sx={{
              width: 76,
              height: 110,
              borderRadius: "10px",
              bgcolor: "#f3f4f6",
              border: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.03)" },
            }}
          >
            {loan.bookCoverImage ? (
              <img
                src={loan.bookCoverImage}
                alt={loan.bookTitle}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <MenuBook sx={{ fontSize: 32, color: "#d1d5db" }} />
            )}
          </Box>

          {/* Book Details */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1,
                mb: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#111827",
                  lineHeight: 1.3,
                }}
              >
                {loan.bookTitle}
              </Typography>
              {/* Status chip */}
              <Chip
                label={status.label}
                size="small"
                sx={{
                  bgcolor: status.bg,
                  color: status.color,
                  border: `1px solid ${status.border}`,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  height: 22,
                  flexShrink: 0,
                }}
              />
            </Box>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
            >
              <PersonIcon sx={{ fontSize: 14, color: iconColor }} />
              <Typography
                variant="body2"
                sx={{ color: "#6b7280", fontSize: "0.8rem" }}
              >
                {loan.bookAuthor}
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}
            >
              <Numbers sx={{ fontSize: 14, color: iconColor }} />
              <Typography
                variant="caption"
                sx={{ color: "#9ca3af", fontSize: "0.75rem" }}
              >
                ISBN: {loan.bookIsbn}
              </Typography>
            </Box>

            {/* Date grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: 2,
              }}
            >
              <InfoRow
                icon={<CalendarToday sx={{ fontSize: 13, color: iconColor }} />}
                label="Checkout"
                value={loan.checkoutDate}
              />
              <InfoRow
                icon={
                  <CalendarToday
                    sx={{
                      fontSize: 13,
                      color: loan.isOverdue ? "#6b7280" : iconColor,
                    }}
                  />
                }
                label="Due Date"
                value={loan.dueDate}
              />
              {loan.returnDate && (
                <InfoRow
                  icon={
                    <AssignmentReturn sx={{ fontSize: 13, color: iconColor }} />
                  }
                  label="Returned"
                  value={loan.returnDate}
                />
              )}
              {loan.isOverdue && (
                <InfoRow
                  icon={
                    <WarningAmberOutlined
                      sx={{ fontSize: 13, color: "#6b7280" }}
                    />
                  }
                  label="Overdue"
                  value={`${loan.overdueDays} day${loan.overdueDays !== 1 ? "s" : ""}`}
                />
              )}
            </Box>
          </Box>

          {/* Vertical divider on md+ */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              display: { xs: "none", md: "block" },
              borderColor: "#f3f4f6",
            }}
          />

          {/* Loan Meta */}
          <Box
            sx={{
              minWidth: 140,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <InfoRow
              label="Renewals"
              value={`${loan.renewalCount} / ${loan.maxRenewals}`}
              icon={<CalendarToday sx={{ fontSize: 13, color: iconColor }} />}
            />
            {loan.fineAmount > 0 && (
              <InfoRow
                label="Fine"
                value={`₹${loan.fineAmount} ${loan.finePaid ? "(Paid)" : "(Unpaid)"}`}
                icon={
                  <WarningAmberOutlined
                    sx={{ fontSize: 13, color: iconColor }}
                  />
                }
              />
            )}
          </Box>
        </Box>

        {/* Note */}
        {loan.notes && (
          <>
            <Divider sx={{ my: 2, borderColor: "#f3f4f6" }} />
            <Typography
              variant="body2"
              sx={{ color: "#9ca3af", fontStyle: "italic", fontSize: "0.8rem" }}
            >
              <strong style={{ color: "#6b7280" }}>Note:</strong> {loan.notes}
            </Typography>
          </>
        )}

        <Divider sx={{ my: 2, borderColor: "#f3f4f6" }} />

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            size="small"
            sx={{
              textTransform: "none",
              fontSize: "0.78rem",
              fontWeight: 600,
              borderRadius: "8px",
              borderColor: "#e5e7eb",
              color: "#374151",
              px: 2,
              "&:hover": {
                borderColor: "#1a1a1a",
                bgcolor: "#1a1a1a",
                color: "#ffffff",
              },
              transition: "all 0.2s ease",
            }}
          >
            View Details
          </Button>

          {(loan.status === "ACTIVE" || loan.status === "CURRENT") &&
            !loan.returnDate && (
              <Button
                variant="contained"
                size="small"
                sx={{
                  textTransform: "none",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  bgcolor: "#1a1a1a",
                  color: "#ffffff",
                  px: 2,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#374151", boxShadow: "none" },
                  transition: "all 0.2s ease",
                }}
              >
                Return Book
              </Button>
            )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoanCard;
