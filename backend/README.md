# Backend API Reference

This backend is a Spring Boot application that exposes a JSON REST API for a book catalog, loans, reservations, reviews, subscriptions, fines, payments, wishlists, and users.

Base URL: `http://localhost:8080`

If no custom server port is configured, Spring Boot uses port `8080`.

## Authentication And Access

- Public endpoints: `/auth/**`
- JWT required: every `/api/**` endpoint
- Admin role required: `/api/admin/**` and `/api/subscription-plans/admin/**`
- Send the token in the header:

```http
Authorization: Bearer <jwt>
```

## Common Response Shapes

### ApiResponse

```json
{
  "message": "Book deleted successfully",
  "status": true
}
```

### AuthResponse

```json
{
  "jwt": "eyJhbGciOi...",
  "message": "Login successful",
  "title": "Welcome back",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "password": "***",
    "phone": "9876543210",
    "fullName": "John Doe",
    "role": "ROLE_USER",
    "username": "user@example.com",
    "lastLogin": "2026-05-23T10:15:30"
  }
}
```

### PaymentInitiateResponse

```json
{
  "paymentId": 10,
  "gateway": "RAZORPAY",
  "transactionId": "TXN-12345",
  "razorpayOrderId": "order_ABC123",
  "amount": 499,
  "description": "Subscription payment",
  "checkoutUrl": "https://checkout.example.com/pay",
  "message": "Payment initiated",
  "success": true
}
```

### pageResponse<T>

```json
{
  "content": [],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 0,
  "totalPages": 0,
  "last": true,
  "first": true,
  "empty": true
}
```

## Data Types Used By The API

### Important enums

- `UserRole`: `ROLE_USER`, `ROLE_ADMIN`
- `PaymentGateway`: `RAZORPAY`, `STRIPE`
- `PaymentType`: `FINE`, `MEMBERSHIP`, `LOST_BOOK_PENALTY`, `DAMAGED_BOOK_PENALTY`, `REFUND`
- `PaymentStatus`: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `REFUNDED`, `PROCESSING`
- `BookLoanStatus`: `CHECKED_OUT`, `RETURNED`, `OVERDUE`, `LOST`, `DAMAGED`
- `BookLoanType`: `CHECKOUT`, `RENEWAL`, `RETURN`
- `ReservationStatus`: `PENDING`, `AVAILABLE`, `FULFILLED`, `CANCELLED`, `EXPIRED`
- `FineType`: `OVERDUE`, `DAMAGE`, `LOSS`, `PROCESSING`
- `FineStatus`: `PENDING`, `PARTIALLY_PAID`, `PAID`, `WAIVED`

### Main DTOs

- `UserDTO`
- `BookDTO`
- `CatalogDTO`
- `BookLoanDTO`
- `BookReviewDTO`
- `FineDTO`
- `PaymentDTO`
- `ReservationDTO`
- `SubscriptionDTO`
- `SubscriptionPlanDTO`
- `WishlistDTO`

## API Reference

## Auth Controller

### POST /auth/signup

Creates a new user and returns a JWT plus user details.

Request body: `UserDTO`

Sample request:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "phone": "9876543210",
  "fullName": "John Doe"
}
```

Sample response:

```json
{
  "jwt": "eyJhbGciOi...",
  "message": "Signup successful",
  "title": "Account created",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "password": "***",
    "phone": "9876543210",
    "fullName": "John Doe",
    "role": "ROLE_USER",
    "username": "user@example.com",
    "lastLogin": null
  }
}
```

### POST /auth/login

Authenticates a user and returns a JWT.

Request body: `LoginRequest`

Sample request:

```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

Sample response:

```json
{
  "jwt": "eyJhbGciOi...",
  "message": "Login successful",
  "title": "Welcome back",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "password": "***",
    "phone": "9876543210",
    "fullName": "John Doe",
    "role": "ROLE_USER",
    "username": "user@example.com",
    "lastLogin": "2026-05-23T10:15:30"
  }
}
```

### POST /auth//forgot-password

Creates a password reset token and sends a reset email.

Request body: `ForgotPasswordRequest`

Sample request:

```json
{
  "email": "user@example.com"
}
```

Sample response:

```json
{
  "message": "A Reset link was sent to your email.",
  "status": true
}
```

Note: the controller currently maps this route with a double slash in code.

### POST /auth/reset-password

Resets the password using a reset token.

Request body: `ResetPasswordRequest`

Sample request:

```json
{
  "token": "reset-token-123",
  "password": "newPassword123"
}
```

Sample response:

```json
{
  "message": "Password reset successful",
  "status": true
}
```

## Book Controller

### POST /api/books/bulk

Creates multiple books in one request.

Request body: array of `BookDTO`

Sample request:

```json
[
  {
    "isbn": "9780134685991",
    "title": "Effective Java",
    "author": "Joshua Bloch",
    "catalogId": 1,
    "publisher": "Addison-Wesley",
    "publicationDate": "2018-01-06",
    "language": "English",
    "pages": 416,
    "description": "Java best practices.",
    "totalCopies": 5,
    "availableCopies": 5,
    "price": 499.0,
    "coverImagesUrl": "https://example.com/effective-java.jpg",
    "active": true
  }
]
```

Sample response:

```json
[
  {
    "id": 101,
    "isbn": "9780134685991",
    "title": "Effective Java",
    "author": "Joshua Bloch",
    "catalogId": 1,
    "catalogName": "Programming",
    "catalogCode": "PROG",
    "publisher": "Addison-Wesley",
    "publicationDate": "2018-01-06",
    "language": "English",
    "pages": 416,
    "description": "Java best practices.",
    "totalCopies": 5,
    "availableCopies": 5,
    "price": 499.0,
    "coverImagesUrl": "https://example.com/effective-java.jpg",
    "alreadyHaveLoan": false,
    "alreadyHaveReservation": false,
    "active": true,
    "createdAt": "2026-05-23T10:15:30",
    "updatedAt": "2026-05-23T10:15:30"
  }
]
```

Implementation note: the controller currently declares the wrong return type for this endpoint, so the runtime behavior may need a fix even though the intended response is a list of `BookDTO` objects.

### GET /api/books/{id}

Fetches a single book by ID.

Path parameter: `id`

Sample response:

```json
{
  "id": 101,
  "isbn": "9780134685991",
  "title": "Effective Java",
  "author": "Joshua Bloch",
  "catalogId": 1,
  "catalogName": "Programming",
  "catalogCode": "PROG",
  "publisher": "Addison-Wesley",
  "publicationDate": "2018-01-06",
  "language": "English",
  "pages": 416,
  "description": "Java best practices.",
  "totalCopies": 5,
  "availableCopies": 5,
  "price": 499.0,
  "coverImagesUrl": "https://example.com/effective-java.jpg",
  "alreadyHaveLoan": false,
  "alreadyHaveReservation": false,
  "active": true,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:15:30"
}
```

### PUT /api/books/{id}

Updates an existing book.

Path parameter: `id`

Request body: `BookDTO`

Sample request:

```json
{
  "isbn": "9780134685991",
  "title": "Effective Java, 3rd Edition",
  "author": "Joshua Bloch",
  "catalogId": 1,
  "publisher": "Addison-Wesley",
  "publicationDate": "2018-01-06",
  "language": "English",
  "pages": 416,
  "description": "Updated edition.",
  "totalCopies": 6,
  "availableCopies": 6,
  "price": 549.0,
  "coverImagesUrl": "https://example.com/effective-java-3.jpg",
  "active": true
}
```

Sample response:

```json
{
  "id": 101,
  "isbn": "9780134685991",
  "title": "Effective Java, 3rd Edition",
  "author": "Joshua Bloch",
  "catalogId": 1,
  "catalogName": "Programming",
  "catalogCode": "PROG",
  "publisher": "Addison-Wesley",
  "publicationDate": "2018-01-06",
  "language": "English",
  "pages": 416,
  "description": "Updated edition.",
  "totalCopies": 6,
  "availableCopies": 6,
  "price": 549.0,
  "coverImagesUrl": "https://example.com/effective-java-3.jpg",
  "alreadyHaveLoan": false,
  "alreadyHaveReservation": false,
  "active": true,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:20:00"
}
```

### DELETE /api/books/{id}

Soft deletes a book.

Path parameter: `id`

Sample response:

```json
{
  "message": "Book deleted successfully",
  "status": true
}
```

### DELETE /api/books/{id}/permanent

Hard deletes a book.

Path parameter: `id`

Sample response:

```json
{
  "message": "Book permanently deleted",
  "status": true
}
```

### GET /api/books

Searches books with query parameters.

Query parameters:

- `catalogId` optional
- `availableOnly` optional, default `false`
- `activeOnly` optional, default `true`
- `page` default `0`
- `size` default `20`
- `sortBy` default `createdAt`
- `sortDirection` default `DESC`

Sample request:

```text
/api/books?catalogId=1&availableOnly=true&page=0&size=10&sortBy=createdAt&sortDirection=DESC
```

Sample response:

```json
{
  "content": [
    {
      "id": 101,
      "isbn": "9780134685991",
      "title": "Effective Java",
      "author": "Joshua Bloch",
      "catalogId": 1,
      "catalogName": "Programming",
      "catalogCode": "PROG",
      "publisher": "Addison-Wesley",
      "publicationDate": "2018-01-06",
      "language": "English",
      "pages": 416,
      "description": "Java best practices.",
      "totalCopies": 5,
      "availableCopies": 3,
      "price": 499.0,
      "coverImagesUrl": "https://example.com/effective-java.jpg",
      "alreadyHaveLoan": false,
      "alreadyHaveReservation": false,
      "active": true,
      "createdAt": "2026-05-23T10:15:30",
      "updatedAt": "2026-05-23T10:15:30"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "empty": false
}
```

Note: `activeOnly` is accepted by the controller but is not currently copied into the search request object.

### POST /api/books/search

Performs advanced search using a request body.

Request body: `BookSearchRequest`

Sample request:

```json
{
  "searchTera": "java",
  "catalogId": 1,
  "availableOnly": true,
  "page": 0,
  "size": 10,
  "sortBy": "createdAt",
  "sortDirection": "DESC"
}
```

Sample response:

```json
{
  "content": [
    {
      "id": 101,
      "isbn": "9780134685991",
      "title": "Effective Java",
      "author": "Joshua Bloch",
      "catalogId": 1,
      "catalogName": "Programming",
      "catalogCode": "PROG",
      "publisher": "Addison-Wesley",
      "publicationDate": "2018-01-06",
      "language": "English",
      "pages": 416,
      "description": "Java best practices.",
      "totalCopies": 5,
      "availableCopies": 3,
      "price": 499.0,
      "coverImagesUrl": "https://example.com/effective-java.jpg",
      "alreadyHaveLoan": false,
      "alreadyHaveReservation": false,
      "active": true,
      "createdAt": "2026-05-23T10:15:30",
      "updatedAt": "2026-05-23T10:15:30"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "empty": false
}
```

### GET /api/books/status

Returns book counts.

Sample response:

```json
{
  "totalActiveBooks": 120,
  "totalAvailableBooks": 87
}
```

## Admin Book Controller

### POST /api/admin/book/admin

Creates a single book as an admin.

Request body: `BookDTO`

Sample request:

```json
{
  "isbn": "9780321356680",
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "catalogId": 1,
  "publisher": "Prentice Hall",
  "publicationDate": "2008-08-01",
  "language": "English",
  "pages": 464,
  "description": "A handbook of agile software craftsmanship.",
  "totalCopies": 4,
  "availableCopies": 4,
  "price": 599.0,
  "coverImagesUrl": "https://example.com/clean-code.jpg",
  "active": true
}
```

Sample response:

```json
{
  "id": 102,
  "isbn": "9780321356680",
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "catalogId": 1,
  "catalogName": "Programming",
  "catalogCode": "PROG",
  "publisher": "Prentice Hall",
  "publicationDate": "2008-08-01",
  "language": "English",
  "pages": 464,
  "description": "A handbook of agile software craftsmanship.",
  "totalCopies": 4,
  "availableCopies": 4,
  "price": 599.0,
  "coverImagesUrl": "https://example.com/clean-code.jpg",
  "alreadyHaveLoan": false,
  "alreadyHaveReservation": false,
  "active": true,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:15:30"
}
```

## Book Loan Controller

### POST /api/book-loans/checkout

Checks out a book for the authenticated user.

Request body: `CheckoutRequest`

Sample request:

```json
{
  "bookId": 101,
  "checkoutDays": 14,
  "notes": "Need this for two weeks"
}
```

Sample response:

```json
{
  "id": 5001,
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "bookId": 101,
  "bookTitle": "Effective Java",
  "bookIsbn": "9780134685991",
  "bookAuthor": "Joshua Bloch",
  "type": "CHECKOUT",
  "status": "CHECKED_OUT",
  "checkoutDate": "2026-05-23",
  "dueDate": "2026-06-06",
  "remainingDays": 14,
  "returnDate": null,
  "renewalCount": 0,
  "maxRenewals": 2,
  "fineAmount": 0,
  "finePaid": false,
  "notes": "Need this for two weeks",
  "isOverdue": false,
  "overdueDays": 0,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:15:30"
}
```

### POST /api/book-loans/checkout/user/{userId}

Checks out a book for a specific user. Admin-only.

Path parameter: `userId`

Request body: `CheckoutRequest`

Sample request:

```json
{
  "bookId": 101,
  "checkoutDays": 14,
  "notes": "Issued by admin"
}
```

Sample response:

```json
{
  "id": 5002,
  "userId": 2,
  "userName": "Jane Reader",
  "userEmail": "jane@example.com",
  "bookId": 101,
  "bookTitle": "Effective Java",
  "bookIsbn": "9780134685991",
  "bookAuthor": "Joshua Bloch",
  "type": "CHECKOUT",
  "status": "CHECKED_OUT",
  "checkoutDate": "2026-05-23",
  "dueDate": "2026-06-06",
  "remainingDays": 14,
  "returnDate": null,
  "renewalCount": 0,
  "maxRenewals": 2,
  "fineAmount": 0,
  "finePaid": false,
  "notes": "Issued by admin",
  "isOverdue": false,
  "overdueDays": 0,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:15:30"
}
```

### POST /api/book-loans/checkin

Returns a checked-out book.

Request body: `CheckinRequest`

Sample request:

```json
{
  "bookLoanId": 5001,
  "condition": "RETURNED",
  "notes": "Book returned in good condition"
}
```

Sample response:

```json
{
  "id": 5001,
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "bookId": 101,
  "bookTitle": "Effective Java",
  "bookIsbn": "9780134685991",
  "bookAuthor": "Joshua Bloch",
  "type": "RETURN",
  "status": "RETURNED",
  "checkoutDate": "2026-05-23",
  "dueDate": "2026-06-06",
  "remainingDays": 0,
  "returnDate": "2026-05-30",
  "renewalCount": 0,
  "maxRenewals": 2,
  "fineAmount": 0,
  "finePaid": false,
  "notes": "Book returned in good condition",
  "isOverdue": false,
  "overdueDays": 0,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-30T12:00:00"
}
```

### POST /api/book-loans/renew

Renews an active checkout.

Request body: `RenewalRequest`

Sample request:

```json
{
  "bookLoanId": 5001,
  "extensionDays": 14,
  "notes": "Need more time"
}
```

Sample response:

```json
{
  "id": 5001,
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "bookId": 101,
  "bookTitle": "Effective Java",
  "bookIsbn": "9780134685991",
  "bookAuthor": "Joshua Bloch",
  "type": "RENEWAL",
  "status": "CHECKED_OUT",
  "checkoutDate": "2026-05-23",
  "dueDate": "2026-06-20",
  "remainingDays": 28,
  "returnDate": null,
  "renewalCount": 1,
  "maxRenewals": 2,
  "fineAmount": 0,
  "finePaid": false,
  "notes": "Need more time",
  "isOverdue": false,
  "overdueDays": 0,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:25:00"
}
```

### GET /api/book-loans/my

Returns the authenticated user's loans.

Query parameters:

- `status` optional, one of `BookLoanStatus`
- `page` default `0`
- `size` default `20`

Sample request:

```text
/api/book-loans/my?status=CHECKED_OUT&page=0&size=20
```

Sample response:

```json
{
  "content": [
    {
      "id": 5001,
      "userId": 1,
      "userName": "John Doe",
      "userEmail": "user@example.com",
      "bookId": 101,
      "bookTitle": "Effective Java",
      "bookIsbn": "9780134685991",
      "bookAuthor": "Joshua Bloch",
      "type": "CHECKOUT",
      "status": "CHECKED_OUT",
      "checkoutDate": "2026-05-23",
      "dueDate": "2026-06-06",
      "remainingDays": 14,
      "returnDate": null,
      "renewalCount": 0,
      "maxRenewals": 2,
      "fineAmount": 0,
      "finePaid": false,
      "notes": null,
      "isOverdue": false,
      "overdueDays": 0,
      "createdAt": "2026-05-23T10:15:30",
      "updatedAt": "2026-05-23T10:15:30"
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "empty": false
}
```

### POST /api/book-loans/search

Searches loans with filters.

Request body: `BookLoanSearchRequest`

Sample request:

```json
{
  "userId": 1,
  "bookId": 101,
  "status": "OVERDUE",
  "overdueOnly": true,
  "unpaidFinesOnly": false,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "page": 0,
  "size": 20,
  "sortBy": "createdAt",
  "sortDirection": "DESC"
}
```

Sample response:

```json
{
  "content": [
    {
      "id": 5003,
      "userId": 1,
      "userName": "John Doe",
      "userEmail": "user@example.com",
      "bookId": 102,
      "bookTitle": "Clean Code",
      "bookIsbn": "9780321356680",
      "bookAuthor": "Robert C. Martin",
      "type": "CHECKOUT",
      "status": "OVERDUE",
      "checkoutDate": "2026-04-01",
      "dueDate": "2026-04-15",
      "remainingDays": 0,
      "returnDate": null,
      "renewalCount": 0,
      "maxRenewals": 2,
      "fineAmount": 200,
      "finePaid": false,
      "notes": "",
      "isOverdue": true,
      "overdueDays": 38,
      "createdAt": "2026-04-01T10:15:30",
      "updatedAt": "2026-05-23T10:15:30"
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "empty": false
}
```

### POST /api/book-loans/admin/update-overdue

Marks overdue loans as overdue.

Sample response:

```json
{
  "message": "overduew book loans are updated",
  "status": true
}
```

## Book Review Controller

### POST /api/reviews

Creates a review.

Request body: `CreateReviewRequest`

Sample request:

```json
{
  "bookId": 101,
  "rating": 5,
  "reviewText": "Excellent practical advice for Java developers.",
  "title": "Very useful"
}
```

Sample response:

```json
{
  "id": 9001,
  "userId": 1,
  "userName": "John Doe",
  "bookId": 101,
  "bookTitle": "Effective Java",
  "rating": 5,
  "reviewText": "Excellent practical advice for Java developers.",
  "title": "Very useful",
  "isVerifiedReader": true,
  "isActive": true,
  "helpfulCount": 0,
  "createdAt": "2026-05-23 10:15:30",
  "updatedAt": "2026-05-23 10:15:30"
}
```

### PUT /api/reviews/{id}

Updates a review.

Path parameter: `id`

Request body: `UpdateReviewRequest`

Sample request:

```json
{
  "rating": 4,
  "reviewText": "After a second read, this is still excellent.",
  "title": "Updated review"
}
```

Sample response:

```json
{
  "id": 9001,
  "userId": 1,
  "userName": "John Doe",
  "bookId": 101,
  "bookTitle": "Effective Java",
  "rating": 4,
  "reviewText": "After a second read, this is still excellent.",
  "title": "Updated review",
  "isVerifiedReader": true,
  "isActive": true,
  "helpfulCount": 0,
  "createdAt": "2026-05-23 10:15:30",
  "updatedAt": "2026-05-23 10:25:00"
}
```

### DELETE /api/reviews/{reviewId}

Deletes a review.

Path parameter: `reviewId`

Sample response:

```json
{
  "message": "Review deleted successfully",
  "status": true
}
```

### GET /api/reviews/book/{bookId}

Returns reviews for a book.

Path parameter: `bookId`

Query parameters:

- `page` default `0`
- `size` default `10`

Sample request:

```text
/api/reviews/book/101?page=0&size=10
```

Sample response:

```json
{
  "content": [
    {
      "id": 9001,
      "userId": 1,
      "userName": "John Doe",
      "bookId": 101,
      "bookTitle": "Effective Java",
      "rating": 5,
      "reviewText": "Excellent practical advice for Java developers.",
      "title": "Very useful",
      "isVerifiedReader": true,
      "isActive": true,
      "helpfulCount": 3,
      "createdAt": "2026-05-23 10:15:30",
      "updatedAt": "2026-05-23 10:15:30"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "empty": false
}
```

## Catalog Controller

### POST /api/catalog/create

Creates a catalog.

Request body: `CatalogDTO`

Sample request:

```json
{
  "code": "PROG",
  "name": "Programming",
  "description": "Programming books and references",
  "displayOrder": 1,
  "active": true,
  "parentCatalogId": null
}
```

Sample response:

```json
{
  "id": 1,
  "code": "PROG",
  "name": "Programming",
  "description": "Programming books and references",
  "displayOrder": 1,
  "active": true,
  "parentCatalogId": null,
  "parentCatalogName": null,
  "subCatalog": [],
  "bookCount": 0,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:15:30",
  "parentCatalog": null
}
```

### GET /api/catalog

Returns all catalogs.

Sample response:

```json
[
  {
    "id": 1,
    "code": "PROG",
    "name": "Programming",
    "description": "Programming books and references",
    "displayOrder": 1,
    "active": true,
    "parentCatalogId": null,
    "parentCatalogName": null,
    "subCatalog": [],
    "bookCount": 12,
    "createdAt": "2026-05-23T10:15:30",
    "updatedAt": "2026-05-23T10:15:30",
    "parentCatalog": null
  }
]
```

### GET /api/catalog/{catalogId}

Returns a catalog by ID.

Path parameter: `catalogId`

Sample response:

```json
{
  "id": 1,
  "code": "PROG",
  "name": "Programming",
  "description": "Programming books and references",
  "displayOrder": 1,
  "active": true,
  "parentCatalogId": null,
  "parentCatalogName": null,
  "subCatalog": [],
  "bookCount": 12,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:15:30",
  "parentCatalog": null
}
```

### PUT /api/catalog/{catalogId}

Updates a catalog.

Path parameter: `catalogId`

Request body: `CatalogDTO`

Sample request:

```json
{
  "code": "PROG",
  "name": "Programming & Software",
  "description": "Programming and software engineering books",
  "displayOrder": 1,
  "active": true,
  "parentCatalogId": null
}
```

Sample response:

```json
{
  "id": 1,
  "code": "PROG",
  "name": "Programming & Software",
  "description": "Programming and software engineering books",
  "displayOrder": 1,
  "active": true,
  "parentCatalogId": null,
  "parentCatalogName": null,
  "subCatalog": [],
  "bookCount": 12,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:25:00",
  "parentCatalog": null
}
```

### DELETE /api/catalog/{catalogId}

Soft deletes a catalog.

Path parameter: `catalogId`

Sample response:

```json
{
  "message": "catalog deleted - soft delete",
  "status": true
}
```

### DELETE /api/catalog/{catalogId}/hard

Hard deletes a catalog.

Path parameter: `catalogId`

Sample response:

```json
{
  "message": "catalog deleted - hard delete",
  "status": true
}
```

### GET /api/catalog/top-level

Returns top-level catalogs.

Sample response:

```json
[
  {
    "id": 1,
    "code": "PROG",
    "name": "Programming",
    "description": "Programming books and references",
    "displayOrder": 1,
    "active": true,
    "parentCatalogId": null,
    "parentCatalogName": null,
    "subCatalog": [],
    "bookCount": 12,
    "createdAt": "2026-05-23T10:15:30",
    "updatedAt": "2026-05-23T10:15:30",
    "parentCatalog": null
  }
]
```

### GET /api/catalog/count

Returns the total number of active catalogs.

Sample response:

```json
5
```

### GET /api/catalog/{id}/book-count

Returns the number of books in a catalog.

Path parameter: `id`

Sample response:

```json
12
```

## Fine Controller

### POST /api/fines

Creates a fine.

Request body: `CreateFineRequest`

Sample request:

```json
{
  "bookLoanId": 5003,
  "type": "OVERDUE",
  "amount": 200,
  "reason": "Returned after due date",
  "notes": "Calculated at 10 per day"
}
```

Sample response:

```json
{
  "id": 3001,
  "bookLoanId": 5003,
  "bookTitle": "Clean Code",
  "bookIsbn": "9780321356680",
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "type": "OVERDUE",
  "amount": 200,
  "amountPaid": 0,
  "amountOutstanding": 200,
  "status": "PENDING",
  "reason": "Returned after due date",
  "notes": "Calculated at 10 per day",
  "waivedByUserId": null,
  "waivedByUserName": null,
  "waivedAt": null,
  "waiverReason": null,
  "paidAt": null,
  "processedByUserId": null,
  "processedByUserName": null,
  "transactionId": null,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:15:30"
}
```

### POST /api/fines/{id}/pay

Marks a fine as paid.

Path parameter: `id`

Query parameter: `transactionId` optional

Sample request:

```text
/api/fines/3001/pay?transactionId=TXN-999
```

Sample response:

```json
{
  "paymentId": 8001,
  "gateway": "RAZORPAY",
  "transactionId": "TXN-999",
  "razorpayOrderId": "order_XYZ999",
  "amount": 200,
  "description": "Fine payment",
  "checkoutUrl": "https://checkout.example.com/pay",
  "message": "Fine payment initiated",
  "success": true
}
```

### POST /api/fines/waive

Waives a fine.

Request body: `WaiveFineRequest`

Sample request:

```json
{
  "fineId": 3001,
  "reason": "First-time waiver"
}
```

Sample response:

```json
{
  "id": 3001,
  "bookLoanId": 5003,
  "bookTitle": "Clean Code",
  "bookIsbn": "9780321356680",
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "type": "OVERDUE",
  "amount": 200,
  "amountPaid": 0,
  "amountOutstanding": 0,
  "status": "WAIVED",
  "reason": "Returned after due date",
  "notes": "Calculated at 10 per day",
  "waivedByUserId": 99,
  "waivedByUserName": "Admin User",
  "waivedAt": "2026-05-23T10:20:00",
  "waiverReason": "First-time waiver",
  "paidAt": null,
  "processedByUserId": null,
  "processedByUserName": null,
  "transactionId": null,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:20:00"
}
```

### GET /api/fines/my

Returns the authenticated user's fines.

Query parameters:

- `status` optional, one of `FineStatus`
- `type` optional, one of `FineType`

Sample request:

```text
/api/fines/my?status=PENDING&type=OVERDUE
```

Sample response:

```json
[
  {
    "id": 3001,
    "bookLoanId": 5003,
    "bookTitle": "Clean Code",
    "bookIsbn": "9780321356680",
    "userId": 1,
    "userName": "John Doe",
    "userEmail": "user@example.com",
    "type": "OVERDUE",
    "amount": 200,
    "amountPaid": 0,
    "amountOutstanding": 200,
    "status": "PENDING",
    "reason": "Returned after due date",
    "notes": "Calculated at 10 per day",
    "waivedByUserId": null,
    "waivedByUserName": null,
    "waivedAt": null,
    "waiverReason": null,
    "paidAt": null,
    "processedByUserId": null,
    "processedByUserName": null,
    "transactionId": null,
    "createdAt": "2026-05-23T10:15:30",
    "updatedAt": "2026-05-23T10:15:30"
  }
]
```

### GET /api/fines

Returns all fines, optionally filtered.

Query parameters:

- `status` optional
- `type` optional
- `userId` optional
- `page` default `0`
- `size` default `20`

Sample request:

```text
/api/fines?status=PENDING&type=OVERDUE&userId=1&page=0&size=20
```

Sample response:

```json
{
  "content": [
    {
      "id": 3001,
      "bookLoanId": 5003,
      "bookTitle": "Clean Code",
      "bookIsbn": "9780321356680",
      "userId": 1,
      "userName": "John Doe",
      "userEmail": "user@example.com",
      "type": "OVERDUE",
      "amount": 200,
      "amountPaid": 0,
      "amountOutstanding": 200,
      "status": "PENDING",
      "reason": "Returned after due date",
      "notes": "Calculated at 10 per day",
      "waivedByUserId": null,
      "waivedByUserName": null,
      "waivedAt": null,
      "waiverReason": null,
      "paidAt": null,
      "processedByUserId": null,
      "processedByUserName": null,
      "transactionId": null,
      "createdAt": "2026-05-23T10:15:30",
      "updatedAt": "2026-05-23T10:15:30"
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "empty": false
}
```

## Payment Controller

### POST /api/payments/verify

Verifies a gateway payment.

Request body: `PaymentVerifyRequest`

Sample request:

```json
{
  "razorpayPaymentId": "pay_12345",
  "stripePaymentIntentId": null,
  "stripePaymentIntentStatus": null
}
```

Sample response:

```json
{
  "id": 8001,
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "bookLoanId": null,
  "subscriptionId": 6001,
  "paymentType": "MEMBERSHIP",
  "status": "SUCCESS",
  "gateway": "RAZORPAY",
  "amount": 499,
  "transactionId": "TXN-12345",
  "gatewayPaymentId": "pay_12345",
  "gatewayOrderId": "order_ABC123",
  "gatewaySignature": "sig_123",
  "description": "Subscription payment",
  "failureReason": null,
  "retryCount": 0,
  "initiatedAt": "2026-05-23T10:15:30",
  "completedAt": "2026-05-23T10:16:00",
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:16:00"
}
```

### GET /api/payments

Returns all payments with pagination.

Query parameters:

- `page` default `0`
- `size` default `10`
- `sortBy` default `createdAt`
- `sortDir` default `DESC`

Sample request:

```text
/api/payments?page=0&size=10&sortBy=createdAt&sortDir=DESC
```

Sample response:

```json
{
  "content": [
    {
      "id": 8001,
      "userId": 1,
      "userName": "John Doe",
      "userEmail": "user@example.com",
      "bookLoanId": null,
      "subscriptionId": 6001,
      "paymentType": "MEMBERSHIP",
      "status": "SUCCESS",
      "gateway": "RAZORPAY",
      "amount": 499,
      "transactionId": "TXN-12345",
      "gatewayPaymentId": "pay_12345",
      "gatewayOrderId": "order_ABC123",
      "gatewaySignature": "sig_123",
      "description": "Subscription payment",
      "failureReason": null,
      "retryCount": 0,
      "initiatedAt": "2026-05-23T10:15:30",
      "completedAt": "2026-05-23T10:16:00",
      "createdAt": "2026-05-23T10:15:30",
      "updatedAt": "2026-05-23T10:16:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "last": true,
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0,
  "first": true,
  "numberOfElements": 1,
  "empty": false
}
```

## Reservation Controller

### POST /api/reservations

Creates a reservation for the authenticated user.

Request body: `ReservationRequest`

Sample request:

```json
{
  "bookId": 101,
  "notes": "Please notify me when available"
}
```

Sample response:

```json
{
  "id": 7001,
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "bookId": 101,
  "bookTitle": "Effective Java",
  "bookIsbn": "9780134685991",
  "bookAuthor": "Joshua Bloch",
  "isBookAvailable": false,
  "status": "PENDING",
  "reservedAt": "2026-05-23T10:15:30",
  "availableAt": null,
  "availableUntil": null,
  "fulfilledAt": null,
  "cancelledAt": null,
  "queuePosition": 1,
  "notificationSent": false,
  "notes": "Please notify me when available",
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:15:30",
  "expired": false,
  "canBeCancelled": true,
  "hoursUntilExpiry": null
}
```

### POST /api/reservations/user/{userId}

Creates a reservation for a specific user. Admin-only.

Path parameter: `userId`

Request body: `ReservationRequest`

Sample request:

```json
{
  "bookId": 101,
  "notes": "Created by admin"
}
```

Sample response:

```json
{
  "id": 7002,
  "userId": 2,
  "userName": "Jane Reader",
  "userEmail": "jane@example.com",
  "bookId": 101,
  "bookTitle": "Effective Java",
  "bookIsbn": "9780134685991",
  "bookAuthor": "Joshua Bloch",
  "isBookAvailable": false,
  "status": "PENDING",
  "reservedAt": "2026-05-23T10:15:30",
  "availableAt": null,
  "availableUntil": null,
  "fulfilledAt": null,
  "cancelledAt": null,
  "queuePosition": 2,
  "notificationSent": false,
  "notes": "Created by admin",
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:15:30",
  "expired": false,
  "canBeCancelled": true,
  "hoursUntilExpiry": null
}
```

### DELETE /api/reservations/{id}

Cancels a reservation.

Path parameter: `id`

Sample response:

```json
{
  "id": 7001,
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "bookId": 101,
  "bookTitle": "Effective Java",
  "bookIsbn": "9780134685991",
  "bookAuthor": "Joshua Bloch",
  "isBookAvailable": false,
  "status": "CANCELLED",
  "reservedAt": "2026-05-23T10:15:30",
  "availableAt": null,
  "availableUntil": null,
  "fulfilledAt": null,
  "cancelledAt": "2026-05-23T10:20:00",
  "queuePosition": 1,
  "notificationSent": false,
  "notes": "Please notify me when available",
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:20:00",
  "expired": false,
  "canBeCancelled": false,
  "hoursUntilExpiry": null
}
```

### POST /api/reservations/{id}/fulfill

Marks a reservation as fulfilled.

Path parameter: `id`

Sample response:

```json
{
  "id": 7001,
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "bookId": 101,
  "bookTitle": "Effective Java",
  "bookIsbn": "9780134685991",
  "bookAuthor": "Joshua Bloch",
  "isBookAvailable": true,
  "status": "FULFILLED",
  "reservedAt": "2026-05-23T10:15:30",
  "availableAt": "2026-05-24T09:00:00",
  "availableUntil": "2026-05-27T09:00:00",
  "fulfilledAt": "2026-05-24T10:00:00",
  "cancelledAt": null,
  "queuePosition": 1,
  "notificationSent": true,
  "notes": "Please notify me when available",
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-24T10:00:00",
  "expired": false,
  "canBeCancelled": false,
  "hoursUntilExpiry": 72
}
```

### GET /api/reservations/my

Returns the authenticated user's reservations.

Query parameters:

- `status` optional, one of `ReservationStatus`
- `activeOnly` optional
- `page` default `0`
- `size` default `20`
- `sortBy` default `reservedAt`
- `sortDirection` default `DESC`

Sample request:

```text
/api/reservations/my?status=PENDING&activeOnly=true&page=0&size=20
```

Sample response:

```json
{
  "content": [
    {
      "id": 7001,
      "userId": 1,
      "userName": "John Doe",
      "userEmail": "user@example.com",
      "bookId": 101,
      "bookTitle": "Effective Java",
      "bookIsbn": "9780134685991",
      "bookAuthor": "Joshua Bloch",
      "isBookAvailable": false,
      "status": "PENDING",
      "reservedAt": "2026-05-23T10:15:30",
      "availableAt": null,
      "availableUntil": null,
      "fulfilledAt": null,
      "cancelledAt": null,
      "queuePosition": 1,
      "notificationSent": false,
      "notes": "Please notify me when available",
      "createdAt": "2026-05-23T10:15:30",
      "updatedAt": "2026-05-23T10:15:30",
      "expired": false,
      "canBeCancelled": true,
      "hoursUntilExpiry": null
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "empty": false
}
```

### GET /api/reservations

Searches reservations with filters.

Query parameters:

- `userId` optional
- `bookId` optional
- `status` optional
- `activeOnly` optional
- `page` default `0`
- `size` default `20`
- `sortBy` default `reservedAt`
- `sortDirection` default `DESC`

Sample request:

```text
/api/reservations?userId=1&bookId=101&status=PENDING&page=0&size=20
```

Sample response:

```json
{
  "content": [
    {
      "id": 7001,
      "userId": 1,
      "userName": "John Doe",
      "userEmail": "user@example.com",
      "bookId": 101,
      "bookTitle": "Effective Java",
      "bookIsbn": "9780134685991",
      "bookAuthor": "Joshua Bloch",
      "isBookAvailable": false,
      "status": "PENDING",
      "reservedAt": "2026-05-23T10:15:30",
      "availableAt": null,
      "availableUntil": null,
      "fulfilledAt": null,
      "cancelledAt": null,
      "queuePosition": 1,
      "notificationSent": false,
      "notes": "Please notify me when available",
      "createdAt": "2026-05-23T10:15:30",
      "updatedAt": "2026-05-23T10:15:30",
      "expired": false,
      "canBeCancelled": true,
      "hoursUntilExpiry": null
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "empty": false
}
```

## Subscription Controller

### POST /api/subscriptions/subscribe

Starts a subscription checkout flow.

Request body: `SubscriptionDTO`

Sample request:

```json
{
  "userId": 1,
  "planId": 1,
  "notes": "Annual membership"
}
```

Sample response:

```json
{
  "paymentId": 8101,
  "gateway": "RAZORPAY",
  "transactionId": "SUB-TXN-1",
  "razorpayOrderId": "order_SUB123",
  "amount": 999,
  "description": "Subscription checkout",
  "checkoutUrl": "https://checkout.example.com/subscription",
  "message": "Subscription payment initiated",
  "success": true
}
```

### GET /api/subscriptions/user/active

Returns the active subscription for a user.

Query parameter: `userId` optional

Sample request:

```text
/api/subscriptions/user/active?userId=1
```

Sample response:

```json
{
  "id": 6001,
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "planId": 1,
  "planName": "Annual Plan",
  "planCode": "ANNUAL",
  "price": 999,
  "currency": "INR",
  "startDate": "2026-05-23",
  "endDate": "2027-05-23",
  "isActive": true,
  "maxBooksAllowed": 10,
  "maxDaysPerBook": 30,
  "autoRenew": true,
  "cancelledAt": null,
  "cancellationReason": null,
  "notes": "Annual membership",
  "daysRemaining": 365,
  "isValid": true,
  "isExpired": false,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:15:30"
}
```

### GET /api/subscriptions/admin

Returns all subscriptions for admin use.

Sample response:

```json
[
  {
    "id": 6001,
    "userId": 1,
    "userName": "John Doe",
    "userEmail": "user@example.com",
    "planId": 1,
    "planName": "Annual Plan",
    "planCode": "ANNUAL",
    "price": 999,
    "currency": "INR",
    "startDate": "2026-05-23",
    "endDate": "2027-05-23",
    "isActive": true,
    "maxBooksAllowed": 10,
    "maxDaysPerBook": 30,
    "autoRenew": true,
    "cancelledAt": null,
    "cancellationReason": null,
    "notes": "Annual membership",
    "daysRemaining": 365,
    "isValid": true,
    "isExpired": false,
    "createdAt": "2026-05-23T10:15:30",
    "updatedAt": "2026-05-23T10:15:30"
  }
]
```

### GET /api/subscriptions/admin/deactivate-expired

Deactivates expired subscriptions.

Sample response:

```json
{
  "message": "task done!",
  "status": true
}
```

### POST /api/subscriptions/cancel/{subscriptionId}

Cancels a subscription.

Path parameter: `subscriptionId`

Query parameter: `reason` optional

Sample request:

```text
/api/subscriptions/cancel/6001?reason=No longer needed
```

Sample response:

```json
{
  "id": 6001,
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "planId": 1,
  "planName": "Annual Plan",
  "planCode": "ANNUAL",
  "price": 999,
  "currency": "INR",
  "startDate": "2026-05-23",
  "endDate": "2027-05-23",
  "isActive": false,
  "maxBooksAllowed": 10,
  "maxDaysPerBook": 30,
  "autoRenew": true,
  "cancelledAt": "2026-06-01T10:00:00",
  "cancellationReason": "No longer needed",
  "notes": "Annual membership",
  "daysRemaining": 357,
  "isValid": false,
  "isExpired": false,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-06-01T10:00:00"
}
```

### POST /api/subscriptions/activate

Activates a subscription after payment.

Query parameters:

- `subscriptionId`
- `paymentId`

Sample request:

```text
/api/subscriptions/activate?subscriptionId=6001&paymentId=8101
```

Sample response:

```json
{
  "id": 6001,
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "planId": 1,
  "planName": "Annual Plan",
  "planCode": "ANNUAL",
  "price": 999,
  "currency": "INR",
  "startDate": "2026-05-23",
  "endDate": "2027-05-23",
  "isActive": true,
  "maxBooksAllowed": 10,
  "maxDaysPerBook": 30,
  "autoRenew": true,
  "cancelledAt": null,
  "cancellationReason": null,
  "notes": "Annual membership",
  "daysRemaining": 365,
  "isValid": true,
  "isExpired": false,
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:20:00"
}
```

## Subscription Plan Controller

### GET /api/subscription-plans

Returns all subscription plans.

Sample response:

```json
[
  {
    "id": 1,
    "planCode": "ANNUAL",
    "name": "Annual Plan",
    "description": "Best value annual membership",
    "durationDays": 365,
    "price": 999,
    "currency": "INR",
    "maxBooksAllowed": 10,
    "maxDaysPerBook": 30,
    "displayOrder": 1,
    "isActive": true,
    "isFeatured": true,
    "badgeText": "Popular",
    "adminNotes": "Featured plan",
    "createdAt": "2026-05-23T10:15:30",
    "updatedAt": "2026-05-23T10:15:30",
    "createdBy": "admin",
    "updatedBy": "admin"
  }
]
```

### POST /api/subscription-plans/admin/create

Creates a subscription plan.

Request body: `SubscriptionPlanDTO`

Sample request:

```json
{
  "planCode": "ANNUAL",
  "name": "Annual Plan",
  "description": "Best value annual membership",
  "durationDays": 365,
  "price": 999,
  "currency": "INR",
  "maxBooksAllowed": 10,
  "maxDaysPerBook": 30,
  "displayOrder": 1,
  "isActive": true,
  "isFeatured": true,
  "badgeText": "Popular",
  "adminNotes": "Featured plan"
}
```

Sample response:

```json
{
  "id": 1,
  "planCode": "ANNUAL",
  "name": "Annual Plan",
  "description": "Best value annual membership",
  "durationDays": 365,
  "price": 999,
  "currency": "INR",
  "maxBooksAllowed": 10,
  "maxDaysPerBook": 30,
  "displayOrder": 1,
  "isActive": true,
  "isFeatured": true,
  "badgeText": "Popular",
  "adminNotes": "Featured plan",
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:15:30",
  "createdBy": "admin",
  "updatedBy": "admin"
}
```

### PUT /api/subscription-plans/admin/{id}

Updates a subscription plan.

Path parameter: `id`

Request body: `SubscriptionPlanDTO`

Sample request:

```json
{
  "planCode": "ANNUAL",
  "name": "Annual Plan Plus",
  "description": "Updated annual membership",
  "durationDays": 365,
  "price": 1099,
  "currency": "INR",
  "maxBooksAllowed": 12,
  "maxDaysPerBook": 30,
  "displayOrder": 1,
  "isActive": true,
  "isFeatured": true,
  "badgeText": "Popular",
  "adminNotes": "Updated pricing"
}
```

Sample response:

```json
{
  "id": 1,
  "planCode": "ANNUAL",
  "name": "Annual Plan Plus",
  "description": "Updated annual membership",
  "durationDays": 365,
  "price": 1099,
  "currency": "INR",
  "maxBooksAllowed": 12,
  "maxDaysPerBook": 30,
  "displayOrder": 1,
  "isActive": true,
  "isFeatured": true,
  "badgeText": "Popular",
  "adminNotes": "Updated pricing",
  "createdAt": "2026-05-23T10:15:30",
  "updatedAt": "2026-05-23T10:25:00",
  "createdBy": "admin",
  "updatedBy": "admin"
}
```

### DELETE /api/subscription-plans/admin/{id}

Deletes a subscription plan.

Path parameter: `id`

Sample response:

```json
{
  "message": "Plan deleted successfully",
  "status": true
}
```

## User Controller

### GET /api/users/list

Returns all users.

Sample response:

```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "password": "***",
    "phone": "9876543210",
    "fullName": "John Doe",
    "role": "ROLE_USER",
    "username": "user@example.com",
    "lastLogin": "2026-05-23T10:15:30"
  }
]
```

### GET /api/users/profile

Returns the current authenticated user profile.

Sample response:

```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "ROLE_USER",
    "phone": "9876543210",
    "authProvider": "LOCAL",
    "googleId": null,
    "profileImage": null,
    "password": "***",
    "lastLogin": "2026-05-23T10:15:30",
    "createdAt": "2026-05-01T09:00:00",
    "updatedAt": "2026-05-23T10:15:30"
  }
]
```

Note: this endpoint returns a one-element array containing the current `User` entity.

## Wishlist Controller

### POST /api/wishlist/add/{bookId}

Adds a book to the authenticated user's wishlist.

Path parameter: `bookId`

Query parameter: `notes` optional

Sample request:

```text
/api/wishlist/add/101?notes=Buy later
```

Sample response:

```json
{
  "id": 4001,
  "userId": 1,
  "userFullName": "John Doe",
  "book": {
    "id": 101,
    "isbn": "9780134685991",
    "title": "Effective Java",
    "author": "Joshua Bloch",
    "catalogId": 1,
    "catalogName": "Programming",
    "catalogCode": "PROG",
    "publisher": "Addison-Wesley",
    "publicationDate": "2018-01-06",
    "language": "English",
    "pages": 416,
    "description": "Java best practices.",
    "totalCopies": 5,
    "availableCopies": 3,
    "price": 499.0,
    "coverImagesUrl": "https://example.com/effective-java.jpg",
    "alreadyHaveLoan": false,
    "alreadyHaveReservation": false,
    "active": true,
    "createdAt": "2026-05-23T10:15:30",
    "updatedAt": "2026-05-23T10:15:30"
  },
  "addedAt": "2026-05-23T10:15:30",
  "notes": "Buy later"
}
```

### DELETE /api/wishlist/remove/{bookId}

Removes a book from the wishlist.

Path parameter: `bookId`

Sample response:

```json
{
  "message": "Book removed from wishlist successfully",
  "status": true
}
```

### GET /api/wishlist/my-wishlist

Returns the authenticated user's wishlist.

Query parameters:

- `page` default `0`
- `size` default `10`

Sample request:

```text
/api/wishlist/my-wishlist?page=0&size=10
```

Sample response:

```json
{
  "content": [
    {
      "id": 4001,
      "userId": 1,
      "userFullName": "John Doe",
      "book": {
        "id": 101,
        "isbn": "9780134685991",
        "title": "Effective Java",
        "author": "Joshua Bloch",
        "catalogId": 1,
        "catalogName": "Programming",
        "catalogCode": "PROG",
        "publisher": "Addison-Wesley",
        "publicationDate": "2018-01-06",
        "language": "English",
        "pages": 416,
        "description": "Java best practices.",
        "totalCopies": 5,
        "availableCopies": 3,
        "price": 499.0,
        "coverImagesUrl": "https://example.com/effective-java.jpg",
        "alreadyHaveLoan": false,
        "alreadyHaveReservation": false,
        "active": true,
        "createdAt": "2026-05-23T10:15:30",
        "updatedAt": "2026-05-23T10:15:30"
      },
      "addedAt": "2026-05-23T10:15:30",
      "notes": "Buy later"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "empty": false
}
```

## Known Implementation Notes

- The controller for password reset uses `/auth//forgot-password` in code.
- `GET /api/books` accepts `activeOnly`, but the current controller does not populate it into the search request object.
- `POST /api/books/bulk` is intended to return created books, but the controller currently has a return-type mismatch.
- `GET /api/users/profile` returns a one-item JSON array instead of a single object.

## H2 Console

- URL: `/h2-console`
- JDBC URL: `jdbc:h2:mem:demo`
- Username: `sa`
- Password: empty
