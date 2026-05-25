// subscriptionPlans.js
// Static fallback plans shown when the API returns no data.
// Import this wherever you need plan definitions.

export const STATIC_PLANS = [
  {
    id: "free",
    name: "Free",
    planCode: "FREE",
    price: 0,
    durationDays: 36500,
    maxBooksAllowed: 1,
    maxBooksPerMonth: 3,
    maxConcurrentCheckouts: 1,
    maxDaysPerBook: 7,
    maxRenewalsPerBook: 0,
    priorityReservation: false,
    description: "3 books per month, one at a time, with a 7-day loan period.",
    badgeText: "Default",
  },
  {
    id: "basic",
    name: "Basic",
    planCode: "BASIC",
    price: 99,
    durationDays: 30,
    maxBooksAllowed: 5,
    maxBooksPerMonth: 15,
    maxConcurrentCheckouts: 5,
    maxDaysPerBook: 14,
    maxRenewalsPerBook: 1,
    priorityReservation: false,
    description:
      "15 books per month, up to 5 at a time, with reservations and wishlist access.",
    badgeText: "Most Popular",
  },
  {
    id: "premium",
    name: "Premium",
    planCode: "PREMIUM",
    price: 499,
    durationDays: 30,
    maxBooksAllowed: 10,
    maxBooksPerMonth: -1,
    maxConcurrentCheckouts: 10,
    maxDaysPerBook: 30,
    maxRenewalsPerBook: 3,
    priorityReservation: true,
    description:
      "Unlimited monthly borrowing, priority reservations, and early access.",
    badgeText: "Best Value",
  },
];
