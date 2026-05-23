import React, { useEffect, useState } from "react";
import { EventAvailable } from "@mui/icons-material";
import { getMyReservations } from "../../api/libraryApi";

const statusConfig = {
  ACTIVE: {
    label: "Active",
    classes: "bg-green-50 text-green-800 border border-green-200",
  },
  OVERDUE: {
    label: "Overdue",
    classes: "bg-red-50 text-red-800 border border-red-200",
  },
  PENDING: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-800 border border-amber-200",
  },
  READY: {
    label: "Ready for pickup",
    classes: "bg-blue-50 text-blue-800 border border-blue-200",
  },
};

function Reservation() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyReservations({ page, size: pageSize });
        setReservations(data?.content || []);
        setTotalPages(data?.totalPages || 1);
      } catch (err) {
        setError(err.message || "Failed to load reservations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return (
    <div className="min-h-screen bg-[#f8f8f6] px-6 py-8">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h1
          className="text-3xl font-normal tracking-tight text-gray-900"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          My Reservations
        </h1>
        <p className="mt-1 text-sm text-gray-400 font-light">
          Books you have on hold
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reservations.length > 0 ? (
        <>
          <div className="space-y-2.5">
            {reservations.map((reservation) => (
              <ReservationRow key={reservation.id} reservation={reservation} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-gray-400">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-white">
          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-3">
            <EventAvailable sx={{ fontSize: 22, color: "#9ca3af" }} />
          </div>
          <p className="text-sm text-gray-400 font-light">
            No reservations found.
          </p>
        </div>
      )}
    </div>
  );
}

const ReservationRow = ({ reservation }) => {
  const { title, author, status, reservationDate } = reservation;
  const config = statusConfig[status] || {
    label: status,
    classes: "bg-gray-100 text-gray-600 border border-gray-200",
  };

  return (
    <div className="group flex items-center gap-3.5 px-4 py-3.5 bg-white border border-gray-200 rounded-xl transition-all duration-200 hover:border-gray-300 hover:translate-x-0.5 cursor-default">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
        <EventAvailable sx={{ fontSize: 18, color: "#6b7280" }} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">{title}</h4>
        <p className="text-xs text-gray-400 font-light">
          {author}
          {reservationDate && ` · ${reservationDate}`}
        </p>
      </div>
      <span
        className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${config.classes}`}
      >
        {config.label}
      </span>
    </div>
  );
};

export default Reservation;
