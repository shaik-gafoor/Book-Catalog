import React from "react";
import {
  AccessAlarm,
  CalendarMonth,
  CheckCircle,
  Close,
  HourglassBottom,
  MenuBook,
} from "@mui/icons-material";
import { getStatusColor } from "./Getstatuscard";
import { formatDateTime } from "../../utils/format";

const getStatusIcon = (status) => {
  const sx = { fontSize: 14 };
  const icons = {
    PENDING: <HourglassBottom sx={sx} />,
    AVAILABLE: <CalendarMonth sx={sx} />,
    FULFILLED: <CheckCircle sx={sx} />,
    CANCELLED: <Close sx={sx} />,
    EXPIRED: <AccessAlarm sx={sx} />,
  };

  return icons[status] || <AccessAlarm sx={sx} />;
};

const TimelineRow = ({
  icon,
  label,
  value,
  labelColor = "#9ca3af",
  valueColor = "#374151",
}) => (
  <div className="flex items-start gap-2">
    <span style={{ color: "#9ca3af", marginTop: 2, flexShrink: 0 }}>
      {icon}
    </span>
    <div>
      <p
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: labelColor }}
      >
        {label}
      </p>
      <p className="text-sm font-semibold" style={{ color: valueColor }}>
        {value}
      </p>
    </div>
  </div>
);

const MyReservationCard = ({ reservation, onCancel, onFulfill }) => {
  const statusColors = getStatusColor(reservation.status);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{
          background: statusColors.bg,
          borderBottom: `1px solid ${statusColors.border}`,
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: statusColors.text }}>
            {getStatusIcon(reservation.status)}
          </span>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: statusColors.text }}
          >
            {statusColors.label}
          </span>
        </div>
        {reservation.queuePosition > 0 && (
          <span className="text-xs text-gray-400 font-medium">
            Queue #{reservation.queuePosition}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-gray-100 flex-shrink-0">
            <MenuBook sx={{ fontSize: 22, color: "#374151" }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium mb-0.5">
              Book #{reservation.bookId}
            </p>
            <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
              {reservation.bookTitle}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {reservation.bookAuthor}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 mb-4" />

        <div className="space-y-2.5">
          <TimelineRow
            icon={<AccessAlarm sx={{ fontSize: 14 }} />}
            label="Reserved"
            value={formatDateTime(reservation.reservedAt)}
          />
          {reservation.availableAt && (
            <TimelineRow
              icon={<CalendarMonth sx={{ fontSize: 14 }} />}
              label="Available"
              value={formatDateTime(reservation.availableAt)}
              labelColor="#374151"
              valueColor="#111827"
            />
          )}
          {reservation.fulfilledAt && (
            <TimelineRow
              icon={<CheckCircle sx={{ fontSize: 14 }} />}
              label="Fulfilled"
              value={formatDateTime(reservation.fulfilledAt)}
              labelColor="#374151"
              valueColor="#111827"
            />
          )}
          {reservation.cancelledAt && (
            <TimelineRow
              icon={<Close sx={{ fontSize: 14 }} />}
              label="Cancelled"
              value={formatDateTime(reservation.cancelledAt)}
            />
          )}
        </div>

        {reservation.notes && (
          <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 italic line-clamp-2">
            "{reservation.notes}"
          </p>
        )}

        <div className="mt-4 flex gap-2">
          {reservation.canBeCancelled && onCancel && (
            <button
              onClick={() => onCancel(reservation)}
              className="w-full text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg py-2 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200"
            >
              Cancel Reservation
            </button>
          )}
          {reservation.status === "AVAILABLE" && onFulfill && (
            <button
              onClick={() => onFulfill(reservation)}
              className="w-full text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg py-2 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200"
            >
              Fulfill
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReservationCard;
