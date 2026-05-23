import React, { useEffect, useState } from "react";
import { MenuBook } from "@mui/icons-material";
import { getMyBookLoans } from "../../api/libraryApi";

function ReadingHistory() {
  const [history, setHistory] = useState([]);
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
        const data = await getMyBookLoans({ page, size: pageSize });
        setHistory(data?.content || []);
        setTotalPages(data?.totalPages || 1);
      } catch (err) {
        setError(err.message || "Failed to load reading history");
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
          Reading History
        </h1>
        <p className="mt-1 text-sm text-gray-400 font-light">
          Every book you've borrowed
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
      ) : history.length > 0 ? (
        <>
          <div className="space-y-2.5">
            {history.map((loan) => (
              <HistoryRow key={loan.id} loan={loan} />
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
            <MenuBook sx={{ fontSize: 22, color: "#9ca3af" }} />
          </div>
          <p className="text-sm text-gray-400 font-light">
            No reading history yet.
          </p>
        </div>
      )}
    </div>
  );
}

const HistoryRow = ({ loan }) => {
  const { title, author, borrowDate, returnDate, status } = loan;

  return (
    <div className="group flex items-center gap-3.5 px-4 py-3.5 bg-white border border-gray-200 rounded-xl transition-all duration-200 hover:border-gray-300 hover:translate-x-0.5 cursor-default">
      <div className="relative flex-shrink-0 w-10 h-14 rounded-sm bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900 opacity-10" />
        <MenuBook sx={{ fontSize: 18, color: "#9ca3af" }} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">{title}</h4>
        <p className="text-xs text-gray-400 font-light">{author}</p>
      </div>

      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        {borrowDate && (
          <span className="text-xs text-gray-400 font-light">
            Borrowed: {borrowDate}
          </span>
        )}
        {returnDate && (
          <span className="text-xs text-gray-400 font-light">
            Returned: {returnDate}
          </span>
        )}
        {status && (
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
            {status}
          </span>
        )}
      </div>
    </div>
  );
};

export default ReadingHistory;
