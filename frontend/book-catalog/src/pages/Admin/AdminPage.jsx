import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import {
  createBook,
  createBooksBulk,
  createCatalog,
  createFine,
  createReview,
  createSubscriptionPlan,
  deleteBook,
  deleteCatalog,
  deleteReview,
  deleteSubscriptionPlan,
  getAllFines,
  getAllSubscriptions,
  getBookById,
  getBookStatus,
  getBooks,
  getCatalogBookCount,
  getCatalogCount,
  getCatalogs,
  getPayments,
  getReviewsByBook,
  getSubscriptionPlans,
  getTopLevelCatalogs,
  getUsers,
  hardDeleteBook,
  hardDeleteCatalog,
  payFine,
  searchBookLoans,
  searchReservations,
  updateBook,
  updateCatalog,
  updateOverdueBookLoans,
  updateReview,
  updateSubscriptionPlan,
  verifyPayment,
  waiveFine,
  deactivateExpiredSubscriptions,
} from "../../api/libraryApi";

const initialPayload = `{
}`;

const Section = ({ title, description, children }) => (
  <Card
    elevation={0}
    sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 3, height: "100%" }}
  >
    <Typography variant="h6" sx={{ fontWeight: 800 }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: "#6b7280", mb: 2 }}>
      {description}
    </Typography>
    <Divider sx={{ mb: 2 }} />
    {children}
  </Card>
);

const AdminPage = () => {
  const [payload, setPayload] = useState(initialPayload);
  const [idValue, setIdValue] = useState("");
  const [secondaryId, setSecondaryId] = useState("");
  const [bookId, setBookId] = useState("");
  const [loanId, setLoanId] = useState("");
  const [fineId, setFineId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [userId, setUserId] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const parsedPayload = useMemo(() => {
    try {
      return payload.trim() ? JSON.parse(payload) : {};
    } catch {
      return null;
    }
  }, [payload]);

  const run = async (key, action) => {
    if (
      payload.trim() &&
      parsedPayload === null &&
      key !== "status" &&
      key !== "count" &&
      key !== "users" &&
      key !== "plans" &&
      key !== "catalogs" &&
      key !== "subscriptions" &&
      key !== "fines" &&
      key !== "payments" &&
      key !== "loans" &&
      key !== "reviews"
    ) {
      setError("Payload JSON is invalid.");
      return;
    }

    setLoading(key);
    setError("");
    try {
      const data = await action();
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading("");
    }
  };

  const canRunWithId = (value) => Boolean(String(value || "").trim());

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Admin Console
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Raw access to backend admin endpoints.
        </p>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {output && (
        <Alert severity="success" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
          <pre className="whitespace-pre-wrap text-xs">{output}</pre>
        </Alert>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Section
          title="Books"
          description="Create, update, delete, and inspect books."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <TextField
              label="Book Id"
              size="small"
              value={idValue}
              onChange={(e) => setIdValue(e.target.value)}
            />
            <TextField
              label="Search / Payload"
              size="small"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              multiline
              minRows={5}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                run("books", () => getBooks({ page: 0, size: 10 }))
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              List
            </button>
            <button
              onClick={() => run("book-status", () => getBookStatus())}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Status
            </button>
            <button
              onClick={() => run("book-get", () => getBookById(idValue))}
              disabled={!canRunWithId(idValue)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Get
            </button>
            <button
              onClick={() =>
                run("book-create", () => createBook(parsedPayload || {}))
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Create
            </button>
            <button
              onClick={() =>
                run("book-bulk", () => createBooksBulk(parsedPayload || {}))
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Bulk
            </button>
            <button
              onClick={() =>
                run("book-update", () =>
                  updateBook(idValue, parsedPayload || {}),
                )
              }
              disabled={!canRunWithId(idValue)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Update
            </button>
            <button
              onClick={() => run("book-delete", () => deleteBook(idValue))}
              disabled={!canRunWithId(idValue)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={() =>
                run("book-hard-delete", () => hardDeleteBook(idValue))
              }
              disabled={!canRunWithId(idValue)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Hard Delete
            </button>
          </div>
        </Section>

        <Section
          title="Catalogs"
          description="Manage catalog tree and counters."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <TextField
              label="Catalog Id"
              size="small"
              value={secondaryId}
              onChange={(e) => setSecondaryId(e.target.value)}
            />
            <TextField
              label="Payload"
              size="small"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              multiline
              minRows={5}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => run("catalogs", () => getCatalogs())}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              List
            </button>
            <button
              onClick={() => run("catalog-top", () => getTopLevelCatalogs())}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Top Level
            </button>
            <button
              onClick={() => run("catalog-count", () => getCatalogCount())}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Count
            </button>
            <button
              onClick={() =>
                run("catalog-book-count", () =>
                  getCatalogBookCount(secondaryId),
                )
              }
              disabled={!canRunWithId(secondaryId)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Book Count
            </button>
            <button
              onClick={() =>
                run("catalog-create", () => createCatalog(parsedPayload || {}))
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Create
            </button>
            <button
              onClick={() =>
                run("catalog-update", () =>
                  updateCatalog(secondaryId, parsedPayload || {}),
                )
              }
              disabled={!canRunWithId(secondaryId)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Update
            </button>
            <button
              onClick={() =>
                run("catalog-delete", () => deleteCatalog(secondaryId))
              }
              disabled={!canRunWithId(secondaryId)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={() =>
                run("catalog-hard-delete", () => hardDeleteCatalog(secondaryId))
              }
              disabled={!canRunWithId(secondaryId)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Hard Delete
            </button>
          </div>
        </Section>

        <Section
          title="Loans, Reviews, and Reservations"
          description="Search loan/reservation data and manage reviews."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <TextField
              label="Loan Id"
              size="small"
              value={loanId}
              onChange={(e) => setLoanId(e.target.value)}
            />
            <TextField
              label="Book Id"
              size="small"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
            />
            <TextField
              label="Payload"
              size="small"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              multiline
              minRows={5}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                run("loans", () => searchBookLoans(parsedPayload || {}))
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Search Loans
            </button>
            <button
              onClick={() =>
                run("loan-overdue", () => updateOverdueBookLoans())
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Update Overdue
            </button>
            <button
              onClick={() =>
                run("reviews-by-book", () =>
                  getReviewsByBook(bookId, parsedPayload || {}),
                )
              }
              disabled={!canRunWithId(bookId)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Reviews By Book
            </button>
            <button
              onClick={() =>
                run("review-create", () => createReview(parsedPayload || {}))
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Create Review
            </button>
            <button
              onClick={() =>
                run("review-update", () =>
                  updateReview(idValue, parsedPayload || {}),
                )
              }
              disabled={!canRunWithId(idValue)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Update Review
            </button>
            <button
              onClick={() => run("review-delete", () => deleteReview(idValue))}
              disabled={!canRunWithId(idValue)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Delete Review
            </button>
            <button
              onClick={() =>
                run("reservations", () =>
                  searchReservations(parsedPayload || {}),
                )
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Search Reservations
            </button>
          </div>
        </Section>

        <Section
          title="Fines and Payments"
          description="Create, pay, waive, and inspect payment data."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <TextField
              label="Fine Id"
              size="small"
              value={fineId}
              onChange={(e) => setFineId(e.target.value)}
            />
            <TextField
              label="Payment Id"
              size="small"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
            />
            <TextField
              label="Payload"
              size="small"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              multiline
              minRows={5}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                run("fines", () => getAllFines(parsedPayload || {}))
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              List Fines
            </button>
            <button
              onClick={() =>
                run("fine-create", () => createFine(parsedPayload || {}))
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Create Fine
            </button>
            <button
              onClick={() => run("fine-pay", () => payFine(fineId, paymentId))}
              disabled={!canRunWithId(fineId)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Pay Fine
            </button>
            <button
              onClick={() =>
                run("fine-waive", () => waiveFine(parsedPayload || {}))
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Waive Fine
            </button>
            <button
              onClick={() =>
                run("payments", () => getPayments(parsedPayload || {}))
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              List Payments
            </button>
            <button
              onClick={() =>
                run("payment-verify", () => verifyPayment(parsedPayload || {}))
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Verify Payment
            </button>
          </div>
        </Section>

        <Section
          title="Subscriptions, Plans, and Users"
          description="Manage plans, subscriptions, and user listings."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <TextField
              label="Subscription Id"
              size="small"
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
            />
            <TextField
              label="User Id"
              size="small"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <TextField
              label="Payload"
              size="small"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              multiline
              minRows={5}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => run("subscriptions", () => getAllSubscriptions())}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              List Subscriptions
            </button>
            <button
              onClick={() =>
                run("subscription-deactivate", () =>
                  deactivateExpiredSubscriptions(),
                )
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Deactivate Expired
            </button>
            <button
              onClick={() =>
                run("subscription-plans", () => getSubscriptionPlans())
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              List Plans
            </button>
            <button
              onClick={() =>
                run("plan-create", () =>
                  createSubscriptionPlan(parsedPayload || {}),
                )
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              Create Plan
            </button>
            <button
              onClick={() =>
                run("plan-update", () =>
                  updateSubscriptionPlan(idValue, parsedPayload || {}),
                )
              }
              disabled={!canRunWithId(idValue)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Update Plan
            </button>
            <button
              onClick={() =>
                run("plan-delete", () => deleteSubscriptionPlan(idValue))
              }
              disabled={!canRunWithId(idValue)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-50"
            >
              Delete Plan
            </button>
            <button
              onClick={() => run("subscriptions-users", () => getUsers())}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-900 hover:text-white"
            >
              List Users
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AdminPage;
