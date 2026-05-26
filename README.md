# Book Catalog

> A simple, professional library management system (Book Catalog) — Spring Boot backend with a React + Vite frontend. This README explains the project purpose, architecture, and how to run it locally. (Payments are not included.)

## Project Overview

Book Catalog is a full-stack application for managing books, users, loans, reservations, reviews, subscriptions, and wishlists. It provides a REST API backend (Spring Boot) and a single-page application frontend (React + Vite).

## Key Features

- User registration, authentication (JWT)
- Role-based access (admin / user)
- Browse and search books
- Add / edit / delete books (admin)
- Loan management and current loans
- Reservations and reservation management
- Book reviews and ratings
- Wishlists and user subscriptions

## Architecture

- Backend: Spring Boot (Java), REST API, JWT security
- Frontend: React, Vite, Material UI components
- Build tools: Maven for backend, npm/yarn + Vite for frontend
- Data: Relational database (configurable via Spring properties)

## Tech Stack

- Java 17+ with Spring Boot
- Maven (wrapper included)
- React, Vite
- Node.js (for frontend), npm or yarn
- JWT for authentication

## Repo Layout

- `backend/` — Spring Boot backend application
- `frontend/book-catalog/` — React + Vite frontend app

## Prerequisites

- Java 17+ (or the version required by the project)
- Maven (or use the included `mvnw` / `mvnw.cmd` wrappers)
- Node.js 16+ and npm or yarn
- A relational database (e.g., PostgreSQL, MySQL) or in-memory DB for development

## Configuration

1. Backend configuration is stored in `backend/src/main/resources/application-local.properties` (and `application.properties`). Copy and update any environment-specific values as needed.

   Typical properties to set:
   - `spring.datasource.url` — JDBC URL for the database
   - `spring.datasource.username` — DB user
   - `spring.datasource.password` — DB password
   - `jwt.secret` or equivalent — secret used to sign JWTs
   - `jwt.expirationMs` — token expiration time

2. Frontend environment: copy `frontend/book-catalog/.env.example` to `frontend/book-catalog/.env` and set the API base URL and any feature flags required (for example, `VITE_API_BASE_URL` or `REACT_APP_API_URL`).

## Running Locally

1. Start the backend
   - Linux / macOS:

     ```bash
     cd backend
     ./mvnw spring-boot:run
     ```

   - Windows (PowerShell / cmd):

     ```powershell
     cd backend
     mvnw.cmd spring-boot:run
     ```

   Alternatively build and run the jar:

   ```bash
   cd backend
   ./mvnw clean package
   java -jar target/demo-0.0.1-SNAPSHOT.jar
   ```

2. Start the frontend

   ```bash
   cd frontend/book-catalog
   npm install
   npm run dev
   ```

The frontend runs on Vite's dev server (by default `http://localhost:5173`) and should talk to the backend API base URL configured in the `.env`.

## Database and Migrations

This project uses a relational database configured via Spring properties. If the project includes an ORM (JPA/Hibernate), schema generation or migration files may be present. For production, use a managed migration tool (Flyway or Liquibase).

For quick local development you can use an in-memory H2 database by setting the datasource URL to an H2 memory URL in `application-local.properties`.

## API Overview

The backend exposes REST endpoints for most features. Common endpoint groups include:

- `/api/auth` — registration and authentication
- `/api/books` — create, read, update, delete, and search books
- `/api/users` — user administration and profiles
- `/api/loans` — loan lifecycle and current loans
- `/api/reservations` — book reservations
- `/api/reviews` — book reviews and ratings
- `/api/wishlist` — user wishlist

Check the controller classes in `backend/src/main/java/.../Controller` for the full list of routes and request/response formats.

## Tests

Run backend tests with Maven:

```bash
cd backend
./mvnw test
```

Run frontend tests (if configured) from the frontend app folder:

```bash
cd frontend/book-catalog
npm test
```

## Docker

The `backend/` folder includes a `Dockerfile`. To build and run a Docker image:

```bash
cd backend
docker build -t book-catalog-backend .
docker run -e SPRING_PROFILES_ACTIVE=local -p 8080:8080 book-catalog-backend
```

Adjust environment variables and database connectivity for containerized execution.

## Environment & Security Notes

- Keep JWT secrets, database passwords, and other sensitive values out of source control. Use secrets management or environment variables in deployments.
- For production, enable HTTPS and secure token storage and rotation.

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Add tests for new behavior
4. Open a pull request with a clear description

## License

This repository does not include a license file by default. Add a license (for example, MIT) at the project root if you intend to make the code open-source.

## Contact

For questions or help, open an issue in this repository or contact the maintainers listed in project metadata.

---

If you'd like, I can also:

- generate a shorter project 'Quickstart' section tailored to your OS, or
- add example `.env` variables copied from the repo files into the README.
