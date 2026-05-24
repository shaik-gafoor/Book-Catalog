const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const REMOTE_API_ENABLED = import.meta.env.VITE_ENABLE_REMOTE_API !== "false";
const TOKEN_KEY = "bookCatalogToken";
const USER_KEY = "bookCatalogUser";
const SESSION_STARTED_AT_KEY = "bookCatalogSessionStartedAt";
const NOTIFICATION_STATE_KEY = "bookCatalogNotificationState";
const LOCAL_BOOKS_KEY = "bookCatalogLocalBooks";

export const updateProfile = (payload) =>
  request("/api/users/profile", { method: "PUT", body: payload });

const LOCAL_CATALOGS = [
  { id: "technology", name: "Technology", code: "TECH" },
  { id: "fiction", name: "Fiction", code: "FIC" },
  { id: "business", name: "Business", code: "BUS" },
  { id: "education", name: "Education", code: "EDU" },
  { id: "general", name: "General", code: "GEN" },
];

const LOCAL_BOOK_SEED = [
  {
    isbn: "9780132350884",
    title: "Clean Code",
    author: "Robert C. Martin",
    catalogId: "technology",
    catalogName: "Technology",
    catalogCode: "TECH",
    publisher: "Prentice Hall",
    publicationDate: "2008-08-01",
    pages: 464,
    description: "A handbook of agile software craftsmanship.",
  },
  {
    isbn: "9780134494166",
    title: "Clean Architecture",
    author: "Robert C. Martin",
    catalogId: "technology",
    catalogName: "Technology",
    catalogCode: "TECH",
    publisher: "Prentice Hall",
    publicationDate: "2017-09-20",
    pages: 432,
    description:
      "Practical guidance for building maintainable software systems.",
  },
  {
    isbn: "9780134685991",
    title: "Effective Java",
    author: "Joshua Bloch",
    catalogId: "technology",
    catalogName: "Technology",
    catalogCode: "TECH",
    publisher: "Addison-Wesley",
    publicationDate: "2017-12-27",
    pages: 416,
    description: "Best practices for the Java platform.",
  },
  {
    isbn: "9781617294945",
    title: "Spring in Action",
    author: "Craig Walls",
    catalogId: "technology",
    catalogName: "Technology",
    catalogCode: "TECH",
    publisher: "Manning",
    publicationDate: "2018-10-05",
    pages: 520,
    description: "A hands-on guide to Spring applications.",
  },
  {
    isbn: "9781492078005",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    catalogId: "technology",
    catalogName: "Technology",
    catalogCode: "TECH",
    publisher: "O'Reilly Media",
    publicationDate: "2017-03-16",
    pages: 611,
    description: "Concepts for scalable data systems.",
  },
  {
    isbn: "9780062316110",
    title: "The Alchemist",
    author: "Paulo Coelho",
    catalogId: "fiction",
    catalogName: "Fiction",
    catalogCode: "FIC",
    publisher: "HarperOne",
    publicationDate: "2014-04-15",
    pages: 208,
    description: "A modern allegory about following your dream.",
  },
  {
    isbn: "9781400079278",
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    catalogId: "fiction",
    catalogName: "Fiction",
    catalogCode: "FIC",
    publisher: "Riverhead Books",
    publicationDate: "2004-05-29",
    pages: 372,
    description: "A powerful story of friendship and redemption.",
  },
  {
    isbn: "9780743273565",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    catalogId: "fiction",
    catalogName: "Fiction",
    catalogCode: "FIC",
    publisher: "Scribner",
    publicationDate: "2004-09-30",
    pages: 180,
    description: "A classic novel set in the Jazz Age.",
  },
  {
    isbn: "9781501128035",
    title: "It Ends with Us",
    author: "Colleen Hoover",
    catalogId: "fiction",
    catalogName: "Fiction",
    catalogCode: "FIC",
    publisher: "Atria Books",
    publicationDate: "2016-08-02",
    pages: 385,
    description: "A contemporary romance about love and resilience.",
  },
  {
    isbn: "9780316769488",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    catalogId: "fiction",
    catalogName: "Fiction",
    catalogCode: "FIC",
    publisher: "Little, Brown and Company",
    publicationDate: "2001-07-01",
    pages: 277,
    description: "A coming-of-age story about Holden Caulfield.",
  },
  {
    isbn: "9780062315007",
    title: "Atomic Habits",
    author: "James Clear",
    catalogId: "business",
    catalogName: "Business",
    catalogCode: "BUS",
    publisher: "Avery",
    publicationDate: "2018-10-16",
    pages: 320,
    description: "Tiny changes with remarkable results.",
  },
  {
    isbn: "9780735211292",
    title: "The Lean Startup",
    author: "Eric Ries",
    catalogId: "business",
    catalogName: "Business",
    catalogCode: "BUS",
    publisher: "Crown Business",
    publicationDate: "2011-09-13",
    pages: 336,
    description: "How today's entrepreneurs use continuous innovation.",
  },
  {
    isbn: "9780062457714",
    title: "Principles",
    author: "Ray Dalio",
    catalogId: "business",
    catalogName: "Business",
    catalogCode: "BUS",
    publisher: "Simon & Schuster",
    publicationDate: "2017-09-19",
    pages: 592,
    description: "Life and work principles from Ray Dalio.",
  },
  {
    isbn: "9781476784937",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    catalogId: "business",
    catalogName: "Business",
    catalogCode: "BUS",
    publisher: "Farrar, Straus and Giroux",
    publicationDate: "2013-04-02",
    pages: 512,
    description: "A deep look into how we think and decide.",
  },
  {
    isbn: "9780307887894",
    title: "Zero to One",
    author: "Peter Thiel",
    catalogId: "business",
    catalogName: "Business",
    catalogCode: "BUS",
    publisher: "Crown Business",
    publicationDate: "2014-09-16",
    pages: 224,
    description: "Notes on startups and building the future.",
  },
  {
    isbn: "9780134685991-EDU",
    title: "Java Programming",
    author: "Joyce Farrell",
    catalogId: "education",
    catalogName: "Education",
    catalogCode: "EDU",
    publisher: "Cengage Learning",
    publicationDate: "2019-01-01",
    pages: 800,
    description: "Introductory Java programming concepts and examples.",
  },
  {
    isbn: "9780321356680",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    catalogId: "education",
    catalogName: "Education",
    catalogCode: "EDU",
    publisher: "MIT Press",
    publicationDate: "2009-07-31",
    pages: 1312,
    description: "A comprehensive algorithms textbook.",
  },
  {
    isbn: "9780134757599",
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    catalogId: "education",
    catalogName: "Education",
    catalogCode: "EDU",
    publisher: "Pearson",
    publicationDate: "2010-10-19",
    pages: 960,
    description: "Foundations of networking and protocols.",
  },
  {
    isbn: "9780133594140",
    title: "Operating System Concepts",
    author: "Abraham Silberschatz",
    catalogId: "education",
    catalogName: "Education",
    catalogCode: "EDU",
    publisher: "Wiley",
    publicationDate: "2018-12-28",
    pages: 976,
    description: "Operating systems theory and practice.",
  },
  {
    isbn: "9781292061226",
    title: "Database System Concepts",
    author: "Abraham Silberschatz",
    catalogId: "education",
    catalogName: "Education",
    catalogCode: "EDU",
    publisher: "McGraw-Hill",
    publicationDate: "2019-01-01",
    pages: 1376,
    description: "Database design, querying, and management.",
  },
  {
    isbn: "9781982137274",
    title: "The Midnight Library",
    author: "Matt Haig",
    catalogId: "general",
    catalogName: "General",
    catalogCode: "GEN",
    publisher: "Viking",
    publicationDate: "2020-08-13",
    pages: 304,
    description: "A story about second chances and choices.",
  },
];

const hydrateSeedBooks = () =>
  LOCAL_BOOK_SEED.map((book, index) =>
    normalizeLocalBook(
      {
        ...book,
        addedByName: "Shaik Gafoor",
        totalCopies: 5,
        availableCopies: 5,
        active: true,
      },
      {
        ...book,
        id: `seed-${index + 1}`,
        createdAt: new Date(Date.now() - index * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - index * 86400000).toISOString(),
        addedByName: "Shaik Gafoor",
        totalCopies: 5,
        availableCopies: 5,
        active: true,
      },
    ),
  );

const emptyPageResponse = () => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 0,
  number: 0,
  first: true,
  last: true,
  empty: true,
});

const disabledApiResponse = (path, method) => {
  if (method !== "GET") {
    return { message: "Remote API is disabled in this build." };
  }

  if (path === "/api/books/status") {
    return { totalActiveBooks: 0, totalAvailableBooks: 0 };
  }

  if (
    path === "/api/books" ||
    path === "/api/books/search" ||
    path === "/api/book-loans/my" ||
    path === "/api/reservations/my" ||
    path === "/api/wishlist/my-wishlist" ||
    path === "/api/subscription-plans" ||
    path === "/api/fines/my" ||
    path === "/api/fines" ||
    path === "/api/payments" ||
    path === "/api/reviews/book"
  ) {
    return emptyPageResponse();
  }

  if (path.startsWith("/api/reviews/book/")) {
    return emptyPageResponse();
  }

  if (
    path === "/api/catalog" ||
    path === "/api/catalog/top-level" ||
    path === "/api/users/list"
  ) {
    return [];
  }

  if (path === "/api/catalog/count") {
    return 0;
  }

  if (path === "/api/subscriptions/user/active") {
    return null;
  }

  if (path === "/api/users/profile") {
    return null;
  }

  return null;
};

const getLocalCatalogs = () => LOCAL_CATALOGS;

const getLocalBooks = () => {
  if (typeof localStorage === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_BOOKS_KEY);
  try {
    const parsed = stored ? JSON.parse(stored) : [];
    if (parsed.length === 0) {
      const seededBooks = hydrateSeedBooks();
      localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(seededBooks));
      return seededBooks;
    }

    return parsed;
  } catch {
    const seededBooks = hydrateSeedBooks();
    localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(seededBooks));
    return seededBooks;
  }
};

const saveLocalBooks = (books) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(books));
};

const generateLocalBookId = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeLocalBook = (payload, existingBook) => {
  const user = getAuthUser();
  const createdAt = existingBook?.createdAt || new Date().toISOString();
  const title = payload?.title?.trim() || existingBook?.title || "Untitled";
  const author = payload?.author?.trim() || existingBook?.author || "Unknown";
  const catalogId = payload?.catalogId || existingBook?.catalogId || "general";
  const catalog = getLocalCatalogs().find(
    (item) => String(item.id) === String(catalogId),
  ) || {
    id: catalogId,
    name: payload?.catalogName || "General",
    code: payload?.catalogCode || "GEN",
  };

  return {
    id: existingBook?.id || generateLocalBookId(),
    isbn: payload?.isbn || existingBook?.isbn || `LOCAL-${Date.now()}`,
    title,
    author,
    catalogId: catalog.id,
    catalogName: catalog.name,
    catalogCode: catalog.code,
    publisher: payload?.publisher || existingBook?.publisher || "",
    publicationDate:
      payload?.publicationDate || existingBook?.publicationDate || null,
    language: payload?.language || existingBook?.language || "",
    pages: payload?.pages || existingBook?.pages || null,
    description: payload?.description || existingBook?.description || "",
    totalCopies: Number(payload?.totalCopies || existingBook?.totalCopies || 1),
    availableCopies: Number(
      payload?.availableCopies || existingBook?.availableCopies || 1,
    ),
    price: payload?.price || existingBook?.price || null,
    coverImagesUrl:
      payload?.coverImagesUrl || existingBook?.coverImagesUrl || "",
    active: true,
    createdAt,
    updatedAt: new Date().toISOString(),
    addedByName:
      payload?.addedByName ||
      existingBook?.addedByName ||
      user?.fullName ||
      user?.name ||
      user?.email ||
      "Unknown user",
    source: "local",
  };
};

const compareValues = (left, right, direction = "DESC") => {
  const leftValue = left instanceof Date ? left.getTime() : left;
  const rightValue = right instanceof Date ? right.getTime() : right;
  if (leftValue === rightValue) return 0;
  const base = leftValue > rightValue ? 1 : -1;
  return direction === "ASC" ? base : -base;
};

const pageLocalBooks = (query = {}) => {
  const {
    searchTera,
    catalogId,
    availableOnly,
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDirection = "DESC",
  } = query;

  const searchValue = String(searchTera || "")
    .trim()
    .toLowerCase();
  const normalizedCatalogId =
    catalogId === undefined ? null : String(catalogId);

  const filtered = getLocalBooks().filter((book) => {
    const matchesSearch =
      !searchValue ||
      [book.title, book.author, book.description, book.catalogName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchValue);

    const matchesCatalog =
      normalizedCatalogId === null ||
      normalizedCatalogId === "" ||
      String(book.catalogId) === normalizedCatalogId;

    const isAvailable = Number(book.availableCopies || 0) > 0;
    const matchesAvailability =
      availableOnly === undefined || availableOnly === null
        ? true
        : availableOnly
          ? isAvailable
          : !isAvailable;

    return matchesSearch && matchesCatalog && matchesAvailability;
  });

  const sorted = [...filtered].sort((left, right) => {
    const leftValue = left?.[sortBy];
    const rightValue = right?.[sortBy];
    const leftComparable =
      leftValue instanceof Date ? leftValue : new Date(leftValue || 0);
    const rightComparable =
      rightValue instanceof Date ? rightValue : new Date(rightValue || 0);

    if (sortBy === "title" || sortBy === "author" || sortBy === "catalogName") {
      return compareValues(
        String(leftValue || "").toLowerCase(),
        String(rightValue || "").toLowerCase(),
        sortDirection,
      );
    }

    return compareValues(leftComparable, rightComparable, sortDirection);
  });

  const safeSize = Math.max(Number(size) || 0, 1);
  const safePage = Math.max(Number(page) || 0, 0);
  const totalElements = sorted.length;
  const totalPages = Math.max(Math.ceil(totalElements / safeSize), 1);
  const content = sorted.slice(
    safePage * safeSize,
    safePage * safeSize + safeSize,
  );

  return {
    content,
    totalElements,
    totalPages,
    size: safeSize,
    number: safePage,
    first: safePage === 0,
    last: safePage >= totalPages - 1,
    empty: totalElements === 0,
  };
};

const buildUrl = (path, query) => {
  const url = new URL(path, API_BASE_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
};

const readJson = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async (
  path,
  { method = "GET", body, query, auth = true } = {},
) => {
  if (!REMOTE_API_ENABLED) {
    return disabledApiResponse(path, method);
  }

  const headers = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const data = await readJson(response);
    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    if (method === "GET") {
      return disabledApiResponse(path, method);
    }

    throw error;
  }
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthSession = (token, user) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(SESSION_STARTED_AT_KEY, String(Date.now()));
  localStorage.removeItem(NOTIFICATION_STATE_KEY);
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SESSION_STARTED_AT_KEY);
  localStorage.removeItem(NOTIFICATION_STATE_KEY);
};

export const getAuthUser = () => {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const getAuthSessionStartedAt = () => {
  const value = localStorage.getItem(SESSION_STARTED_AT_KEY);
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
};

export const getNotificationState = () => {
  const stored = localStorage.getItem(NOTIFICATION_STATE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const setNotificationState = (state) => {
  localStorage.setItem(NOTIFICATION_STATE_KEY, JSON.stringify(state));
};

export const apiRequest = request;

export const authLogin = (payload) =>
  request("/auth/login", { method: "POST", body: payload, auth: false });

export const authSignup = (payload) =>
  request("/auth/signup", { method: "POST", body: payload, auth: false });

export const forgotPassword = (payload) =>
  request("/auth/forgot-password", {
    method: "POST",
    body: payload,
    auth: false,
  });

export const resetPassword = (payload) =>
  request("/auth/reset-password", {
    method: "POST",
    body: payload,
    auth: false,
  });

export const getBooks = (params) => {
  if (!REMOTE_API_ENABLED) {
    return Promise.resolve(pageLocalBooks(params));
  }

  return request("/api/books", { query: params });
};

export const searchBooks = (payload) => {
  if (!REMOTE_API_ENABLED) {
    return Promise.resolve(pageLocalBooks(payload));
  }

  return request("/api/books/search", { method: "POST", body: payload });
};
export const getBookById = (id) => request(`/api/books/${id}`);
export const createBook = async (payload) => {
  if (!REMOTE_API_ENABLED) {
    const savedBook = normalizeLocalBook(payload);
    const nextBooks = [
      savedBook,
      ...getLocalBooks().filter((book) => book.id !== savedBook.id),
    ];
    saveLocalBooks(nextBooks);
    return savedBook;
  }

  try {
    const createdBook = await request("/api/admin/book/admin", {
      method: "POST",
      body: payload,
    });

    if (createdBook) {
      const savedBook = normalizeLocalBook(
        { ...payload, ...createdBook },
        createdBook,
      );
      const nextBooks = [
        savedBook,
        ...getLocalBooks().filter((book) => book.id !== savedBook.id),
      ];
      saveLocalBooks(nextBooks);
    }

    return createdBook;
  } catch (error) {
    const savedBook = normalizeLocalBook(payload);
    const nextBooks = [
      savedBook,
      ...getLocalBooks().filter((book) => book.id !== savedBook.id),
    ];
    saveLocalBooks(nextBooks);
    return savedBook;
  }
};
export const createBooksBulk = (payload) =>
  request("/api/books/bulk", { method: "POST", body: payload });
export const updateBook = async (id, payload) => {
  if (!REMOTE_API_ENABLED) {
    const nextBooks = getLocalBooks().map((book) =>
      String(book.id) === String(id)
        ? normalizeLocalBook(payload, { ...book, id })
        : book,
    );
    const savedBook = nextBooks.find((book) => String(book.id) === String(id));
    saveLocalBooks(nextBooks);
    return savedBook || normalizeLocalBook(payload, { id });
  }

  const updatedBook = await request(`/api/books/${id}`, {
    method: "PUT",
    body: payload,
  });

  if (updatedBook) {
    const nextBooks = getLocalBooks().map((book) =>
      String(book.id) === String(id)
        ? normalizeLocalBook({ ...payload, ...updatedBook }, { ...book, id })
        : book,
    );
    saveLocalBooks(nextBooks);
  }

  return updatedBook;
};
export const deleteBook = (id) =>
  request(`/api/books/${id}`, { method: "DELETE" });
export const hardDeleteBook = (id) =>
  request(`/api/books/${id}/permanent`, { method: "DELETE" });
export const getBookStatus = () => {
  if (!REMOTE_API_ENABLED) {
    const books = getLocalBooks();
    return Promise.resolve({
      totalActiveBooks: books.filter((book) => book.active !== false).length,
      totalAvailableBooks: books.filter(
        (book) => Number(book.availableCopies || 0) > 0,
      ).length,
    });
  }

  return request("/api/books/status").catch(() => ({
    totalActiveBooks: 0,
    totalAvailableBooks: 0,
  }));
};
export const getLatestBooks = (params) =>
  request("/api/books", {
    query: {
      page: 0,
      size: 1,
      sortBy: "createdAt",
      sortDirection: "DESC",
      ...params,
    },
  }).catch(() => emptyPageResponse());

export const getCatalogs = () => {
  if (!REMOTE_API_ENABLED) {
    return Promise.resolve(getLocalCatalogs());
  }

  return request("/api/catalog").catch(() => getLocalCatalogs());
};
export const createCatalog = (payload) =>
  request("/api/catalog/create", { method: "POST", body: payload });
export const updateCatalog = (id, payload) =>
  request(`/api/catalog/${id}`, { method: "PUT", body: payload });
export const deleteCatalog = (id) =>
  request(`/api/catalog/${id}`, { method: "DELETE" });
export const hardDeleteCatalog = (id) =>
  request(`/api/catalog/${id}/hard`, { method: "DELETE" });
export const getTopLevelCatalogs = () => {
  if (!REMOTE_API_ENABLED) {
    return Promise.resolve(getLocalCatalogs());
  }

  return request("/api/catalog/top-level").catch(() => getLocalCatalogs());
};

export const getCatalogCount = () => {
  if (!REMOTE_API_ENABLED) {
    return Promise.resolve(getLocalCatalogs().length);
  }

  return request("/api/catalog/count").catch(() => getLocalCatalogs().length);
};

export const getCatalogBookCount = (id) => {
  if (!REMOTE_API_ENABLED) {
    return Promise.resolve(
      getLocalBooks().filter((book) => String(book.catalogId) === String(id))
        .length,
    );
  }

  return request(`/api/catalog/${id}/book-count`).catch(() => 0);
};

export const checkoutBook = (payload) =>
  request("/api/book-loans/checkout", { method: "POST", body: payload });
export const checkoutBookForUser = (userId, payload) =>
  request(`/api/book-loans/checkout/user/${userId}`, {
    method: "POST",
    body: payload,
  });
export const checkinBook = (payload) =>
  request("/api/book-loans/checkin", { method: "POST", body: payload });
export const renewBook = (payload) =>
  request("/api/book-loans/renew", { method: "POST", body: payload });
export const getMyBookLoans = (params) =>
  request("/api/book-loans/my", { query: params }).catch(() =>
    emptyPageResponse(),
  );
export const searchBookLoans = (payload) =>
  request("/api/book-loans/search", { method: "POST", body: payload });
export const updateOverdueBookLoans = () =>
  request("/api/book-loans/admin/update-overdue", { method: "POST" });

export const createReview = (payload) =>
  request("/api/reviews", { method: "POST", body: payload });
export const updateReview = (id, payload) =>
  request(`/api/reviews/${id}`, { method: "PUT", body: payload });
export const deleteReview = (id) =>
  request(`/api/reviews/${id}`, { method: "DELETE" });
export const getReviewsByBook = (bookId, params) =>
  request(`/api/reviews/book/${bookId}`, { query: params });

export const createFine = (payload) =>
  request("/api/fines", { method: "POST", body: payload });
export const payFine = (id, transactionId) =>
  request(`/api/fines/${id}/pay`, { method: "POST", query: { transactionId } });
export const waiveFine = (payload) =>
  request("/api/fines/waive", { method: "POST", body: payload });
export const getMyFines = (params) =>
  request("/api/fines/my", { query: params }).catch(() => emptyPageResponse());
export const getAllFines = (params) => request("/api/fines", { query: params });

export const verifyPayment = (payload) =>
  request("/api/payments/verify", { method: "POST", body: payload });
export const getPayments = (params) =>
  request("/api/payments", { query: params }).catch(() => emptyPageResponse());

export const createReservation = (payload) =>
  request("/api/reservations", { method: "POST", body: payload });
export const createReservationForUser = (userId, payload) =>
  request(`/api/reservations/user/${userId}`, {
    method: "POST",
    body: payload,
  });
export const cancelReservation = (id) =>
  request(`/api/reservations/${id}`, { method: "DELETE" });
export const fulfillReservation = (id) =>
  request(`/api/reservations/${id}/fulfill`, { method: "POST" });
export const getMyReservations = (params) =>
  request("/api/reservations/my", { query: params }).catch(() =>
    emptyPageResponse(),
  );
export const searchReservations = (params) =>
  request("/api/reservations", { query: params });

export const subscribe = (payload) =>
  request("/api/subscriptions/subscribe", { method: "POST", body: payload });
export const getActiveSubscription = (userId) =>
  request("/api/subscriptions/user/active", { query: { userId } }).catch(
    () => null,
  );
export const getAllSubscriptions = () =>
  request("/api/subscriptions/admin").catch(() => emptyPageResponse());
export const deactivateExpiredSubscriptions = () =>
  request("/api/subscriptions/admin/deactivate-expired");
export const cancelSubscription = (subscriptionId, reason) =>
  request(`/api/subscriptions/cancel/${subscriptionId}`, {
    method: "POST",
    query: { reason },
  });
export const activateSubscription = (subscriptionId, paymentId) =>
  request("/api/subscriptions/activate", {
    method: "POST",
    query: { subscriptionId, paymentId },
  });

export const getSubscriptionPlans = () => request("/api/subscription-plans");
export const createSubscriptionPlan = (payload) =>
  request("/api/subscription-plans/admin/create", {
    method: "POST",
    body: payload,
  });
export const updateSubscriptionPlan = (id, payload) =>
  request(`/api/subscription-plans/admin/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deleteSubscriptionPlan = (id) =>
  request(`/api/subscription-plans/admin/${id}`, { method: "DELETE" });

export const getUsers = () => request("/api/users/list");
export const getProfile = () => request("/api/users/profile").catch(() => null);

export const addToWishlist = (bookId, notes) =>
  request(`/api/wishlist/add/${bookId}`, { method: "POST", query: { notes } });
export const removeFromWishlist = (bookId) =>
  request(`/api/wishlist/remove/${bookId}`, { method: "DELETE" });
export const getWishlist = (params) =>
  request("/api/wishlist/my-wishlist", { query: params }).catch(() =>
    emptyPageResponse(),
  );
