# 📝 MemoNest

> A full-stack note-taking application built to practice real-world engineering: a layered Express/PostgreSQL API with JWT authentication and strict user data isolation, paired with a Next.js + TypeScript client built on TanStack Query for server-state management.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52B0E7?style=flat-square&logo=sequelize&logoColor=white)
![Joi](https://img.shields.io/badge/Joi-Validation-2E7D32?style=flat-square)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-Tested-6E9F18?style=flat-square&logo=vitest&logoColor=white)

---

## 📌 What is MemoNest?

MemoNest is a **note-taking application** where a user can register, sign in, and manage a personal, private collection of notes — creating, editing, archiving, and deleting them. Every note belongs to exactly one user, and the backend guarantees that a user can never read, edit, or delete another user's notes, even if they know that note's ID.

Beyond the CRUD surface, the project is structured to demonstrate specific engineering practices:

- A **layered backend** (`routes → middleware → controllers → services → models`) instead of putting logic straight into route handlers.
- **JWT-based authentication** with a dedicated middleware that resolves the request's identity before any controller runs.
- **User data isolation** enforced at the query level — the `user_id` used to scope every note lookup always comes from the verified token, never from client input.
- A typed, service/hook-based **frontend architecture** where components never call `fetch` directly.
- **TanStack Query** for all server state — no manual `loading`/`data`/`error` `useState` triplets.
- A real, evolving **PostgreSQL schema**, tracked through 8 incremental Sequelize migrations rather than one static table definition.
- **Automated tests** (Node's built-in test runner on the backend, Vitest + Testing Library on the frontend) that lock in the auth lifecycle, validation rules, and cache-invalidation behavior.

### High-level request flow

```
                 User
                  │
                  ▼
        Next.js Frontend (App Router)
                  │
                  ▼
     React Hook Form + Zod (client validation)
                  │
                  ▼
      TanStack Query hooks (useNotes, useAuthMutations, ...)
                  │
                  ▼
        Frontend services (auth.service.ts / note.service.ts)
                  │
                  ▼
           apiRequest() — fetch wrapper
                  │
                  ▼
        ══════════ HTTP (REST, JSON) ══════════
                  │
                  ▼
              Express app
                  │
                  ▼
      CORS → JSON body parser → /api router
                  │
                  ▼
     Route-level middleware (validate, authenticate)
                  │
                  ▼
              Controllers
                  │
                  ▼
       Services (AuthService / NoteService)
                  │
                  ▼
         Sequelize models (User, Note)
                  │
                  ▼
              PostgreSQL
```

---

## ✨ Key Features

### 🔐 Authentication
- Email/password **registration** (`POST /api/auth/register`) — email is normalized and uniqueness-checked, password is hashed with bcrypt before storage.
- **Login** (`POST /api/auth/login`) — verifies the hashed password and issues a signed JWT (`sub` = `user_id`, default expiry `7d`).
- **Current-session lookup** (`GET /api/auth/me`) — used by the frontend to revalidate a stored token on load.
- **Profile update** (`PATCH /api/auth/profile`) — change display name and/or upload a profile photo (multipart), or remove the current photo.
- **Forgot / reset password** — generates a time-limited, hashed reset token; the reset endpoint verifies the token and expiry before allowing a new password.
- **Logout** endpoint — acknowledges the request; since JWTs are stateless, the actual session teardown happens client-side (clearing storage), which the code explicitly documents.
- **Route protection** on the frontend via `AuthGuard`, plus stored-session revalidation against `/api/auth/me`.

### 📝 Notes
- Full CRUD: create, list, get one, update, delete — all scoped to the authenticated user.
- A `status` field (`ACTIVE` / `ARCHIVED` / `DELETED`) drives an **archive** feature in the UI (toggling a note between `ACTIVE` and `ARCHIVED`) in addition to permanent deletion.
- Search and filter (All / Active / Archived) on the dashboard, computed client-side over the already-fetched note list.
- Server-side validation of `title` (1–100 chars) and `content` (non-empty) on both create and update, via Joi.

### 🎨 Frontend
- Distinct **auth pages** (login, signup, forgot-password) with a shared two-panel `AuthLayoutShell`.
- **Dashboard** with a responsive notes grid, empty state, error state (with retry), loading skeletons, and a create/edit modal.
- **Profile page** for updating name and profile photo, with client-side image-type/size checks before upload.
- Fully responsive layout (mobile bottom "add note" FAB, desktop navbar actions) per the project's own `DESIGN.md` spec.

### 🛡️ Security
- Passwords hashed with **bcrypt** (10 rounds); the hash is excluded from every query by a Sequelize `defaultScope` and only pulled in explicitly via a `withPassword` scope for login/reset.
- **JWT verification middleware** rejects requests with a missing, malformed, or invalid/expired token before they reach any controller.
- Every note operation is scoped with `WHERE user_id = <verified user>` — the ID never comes from the request body, params, or query string.
- **Password reset tokens** are generated with `crypto.randomBytes`, stored only as a SHA-256 hash, and expire after 1 hour.
- File uploads are restricted by MIME type (`jpeg`/`png`/`webp`) and size (2 MB) at the `multer` layer, with server-generated random filenames (no client-supplied filenames touch the filesystem).
- Secrets (`JWT_SECRET`, DB credentials) are read from environment variables and are never hardcoded; a missing `JWT_SECRET` fails fast at token-signing/verification time.
- CORS is restricted to an explicit, configurable allow-list of frontend origins.

---

## 🛠️ Tech Stack

### Backend

| Layer          | Technology       | Why it's used here                                                                 |
| -------------- | ----------------- | ------------------------------------------------------------------------------------ |
| Runtime        | Node.js            | JavaScript runtime for the API server                                               |
| Framework      | Express 5          | Routing, middleware pipeline, and HTTP handling                                      |
| ORM            | Sequelize 6        | Maps `User`/`Note` models to PostgreSQL tables, manages associations and migrations  |
| Database       | PostgreSQL (`pg`)  | Relational storage with real foreign-key constraints between users and notes         |
| Validation     | Joi                | Schema-based validation for request bodies and route params                          |
| Auth           | jsonwebtoken       | Signs and verifies stateless access tokens                                           |
| Password hashing | bcrypt           | One-way hashing so plaintext passwords are never stored                              |
| File uploads   | multer             | Handles multipart profile-photo uploads with type/size limits                        |
| CORS           | cors               | Restricts cross-origin requests to known frontend origins                            |
| Testing        | Node `node:test`   | Built-in test runner used for service/validation/util unit tests                     |

### Frontend

| Layer          | Technology            | Why it's used here                                                                 |
| -------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| Framework      | Next.js 16 (App Router) | File-based routing, route groups for `(auth)` pages, layouts                        |
| UI library     | React 19               | Component model for the whole client                                                |
| Language       | TypeScript              | Shared, compile-time-checked shapes for API requests/responses                       |
| Styling        | Tailwind CSS 4          | Utility-first styling matching the project's `DESIGN.md` design tokens               |
| Server state   | TanStack Query 5        | Fetching, caching, loading/error state, and cache invalidation for notes and auth     |
| Forms          | React Hook Form + Zod   | Form state plus schema validation that mirrors the backend's Joi rules               |
| Icons          | Lucide React            | Consistent icon set used throughout the auth, notes, and layout components           |
| Testing        | Vitest + Testing Library | Unit/component tests for pages, hooks, services, and schemas                        |

---

## 🏗️ Architecture

### Backend architecture

```
Routes
  │  maps an HTTP verb + path to a middleware chain
  ▼
Middleware
  │  authenticate (JWT), validate (Joi), profile-upload (multer)
  ▼
Controllers
  │  translate an HTTP request into a service call, shape the HTTP response
  ▼
Services
  │  business logic: ownership checks, password hashing, token generation
  ▼
Sequelize Models
  │  schema definition, associations, scopes
  ▼
PostgreSQL
```

Business logic intentionally does **not** live in routes or controllers. A controller's job is to pull data off `req`, call exactly one service method, and shape the JSON response (`{ success, message, data }`). If validation, ownership checks, or hashing lived in the controller instead, every future endpoint would have to re-implement (and could easily get wrong) the same rules — pushing them into `AuthService`/`NoteService` means they exist in exactly one place.

### Frontend architecture

```
Pages (app/**/page.tsx)
  │  route-level composition, wires hooks to components
  ▼
Components (components/auth, notes, layout, ui)
  │  presentation + local UI state only
  ▼
Hooks (hooks/useNotes.ts, useAuthMutations.ts, useAuth.ts)
  │  wrap TanStack Query around service calls; own query keys/invalidation
  ▼
Services (services/note.service.ts, auth.service.ts)
  │  know the API's request/response shapes; no React here
  ▼
API client (lib/api.ts → apiRequest())
  │  attaches the bearer token, builds URLs, normalizes errors
  ▼
Backend REST API
```

Components never call `fetch` or import a service directly — they call a hook. Hooks never know the exact URL path — they call a service. This keeps each layer replaceable: the API base URL, auth-token storage strategy, or query-caching policy can all change without touching a single component.

---

## 📂 Project Structure

```
note-taking-api/
├── backend/
│   ├── server.js                      # Express app bootstrap, CORS, static /uploads, DB connect
│   ├── uploads/profile/                # Stored profile photos (created at runtime)
│   ├── test/                           # node:test unit tests
│   └── src/
│       ├── config/database.config.js   # Sequelize connection config (env-driven)
│       ├── controllers/                # auth.controller.js, note.controller.js
│       ├── services/                   # auth.service.js, note.service.js, email.service.js, file.service.js
│       ├── routes/                     # index.js, auth.route.js, note.route.js
│       ├── middleware/                 # auth, validate-request, error, not-found, profile-upload
│       ├── models/                     # index.js (associations), user.model.js, note.model.js
│       ├── validations/ & schemas/     # Joi schemas for auth and notes
│       ├── database/migrations/        # 8 incremental Sequelize migrations
│       ├── database/seeders/           # sample note seed data
│       ├── enums/                      # http-status.enum.js, note-status.enum.js
│       ├── errors/app.error.js         # AppError + typed subclasses (404/401/400/409)
│       └── utils/                      # jwt, password, reset-token, normalize-email, async-handler
│
├── frontend/
│   ├── src/
│   │   ├── app/                        # Next.js App Router
│   │   │   ├── (auth)/                 # login, signup, forgot-password (+ shared layout)
│   │   │   ├── dashboard/page.tsx      # notes grid, filters, modals
│   │   │   ├── profile/page.tsx        # profile photo + name editing
│   │   │   └── layout.tsx, providers.tsx
│   │   ├── components/
│   │   │   ├── auth/                   # AuthCard, AuthGuard, PasswordStrength, UserMenu, ...
│   │   │   ├── notes/                  # NoteCard, NoteModal, DeleteNoteDialog, Notes*State
│   │   │   ├── layout/                 # Navbar, MobileNavigation
│   │   │   └── ui/                     # Button, Input, Modal, Select, Textarea, IconButton
│   │   ├── hooks/                      # useAuth, useAuthMutations, useNotes, *-keys.ts
│   │   ├── services/                   # auth.service.ts, note.service.ts
│   │   ├── contexts/AuthContext.tsx     # session state via useSyncExternalStore
│   │   ├── schemas/auth.schema.ts       # Zod schemas mirroring backend Joi rules
│   │   ├── types/                       # auth.ts, note.ts
│   │   └── lib/                         # api.ts, auth-storage.ts, auth-events.ts, query-client.ts
│   └── public/
│
├── DESIGN.md                           # Design tokens, spacing, and component specs
└── README.md
```

---

## 🗄️ Database

### `users`

| Column                       | Type          | Notes                                                    |
| ----------------------------- | ------------- | --------------------------------------------------------- |
| `user_id`                     | UUID (PK)      | Primary key, generated with `UUIDV4`                       |
| `username`                    | VARCHAR(100)   | Display name (renamed from `name` in a later migration)    |
| `email`                       | VARCHAR(255)   | Unique, normalized to lowercase before validation           |
| `password_hash`               | VARCHAR(255)   | bcrypt hash only — excluded from queries by default         |
| `role`                        | VARCHAR(20)    | Defaults to `"user"`                                        |
| `profile_image_url`           | VARCHAR(500)   | Nullable; set after a profile photo upload                  |
| `reset_password_token_hash`   | VARCHAR(64)    | Nullable; SHA-256 hash of an active reset token              |
| `reset_password_expires_at`   | TIMESTAMP      | Nullable; reset tokens expire 1 hour after issue             |
| `created_at` / `updated_at`   | TIMESTAMP      | Managed by Sequelize (`underscored: true`)                   |

### `notes`

| Column       | Type            | Notes                                                                |
| ------------ | ---------------- | ---------------------------------------------------------------------- |
| `note_id`    | UUID (PK)          | Primary key, generated with `UUIDV4`                                    |
| `user_id`    | UUID (FK → users)  | Owning user; `ON DELETE CASCADE`, `ON UPDATE CASCADE`                    |
| `title`      | VARCHAR(100)       | Required, 1–100 characters                                              |
| `content`    | TEXT               | Required, non-empty                                                     |
| `status`     | ENUM               | `ACTIVE` \| `ARCHIVED` \| `DELETED`; defaults to `ACTIVE`                 |
| `created_at` / `updated_at` | TIMESTAMP | Managed by Sequelize                                                   |

`note_id` and `user_id` are used instead of a bare `id` because both tables need to refer to identities unambiguously once they're joined — a `Note` row already has a foreign key, and calling it `id` on both sides would make every join and log line ambiguous about which table's identity is being read. All timestamp and identifier columns use `snake_case` (`created_at`, `user_id`) because the project's tables live in PostgreSQL, where `snake_case` is the idiomatic column-naming convention; Sequelize's `underscored: true` option maps this automatically to/from JS-side `camelCase` where relevant.

> Note the `status: "DELETED"` enum value exists in the schema, but the current `NoteService.deleteNote` performs a real `note.destroy()` — a **hard delete** — rather than setting `status` to `DELETED`. The enum value is defined but not currently used by the delete flow; only `ACTIVE` and `ARCHIVED` are set through the running code (the archive toggle in the UI).

### Relationship

```
┌────────────────────┐
│        User         │
├────────────────────┤
│ user_id (PK)         │
│ username             │
│ email (unique)        │
│ password_hash         │
│ role                  │
│ profile_image_url     │
└─────────┬───────────┘
          │ hasMany (as "notes")
          │ 1 : N
          ▼
┌────────────────────┐
│        Note          │
├────────────────────┤
│ note_id (PK)          │
│ user_id (FK)           │
│ title                  │
│ content                │
│ status                  │
└────────────────────┘
```

`User.hasMany(Note, { foreignKey: "user_id", onDelete: "CASCADE" })` and the inverse `Note.belongsTo(User)` mean deleting a user also deletes their notes at the database level — there is no way for a note to outlive its owner.

### Migrations

The schema was **not** designed once and left alone — it evolved through 8 real migrations, in this order:

1. `create-notes-table` — initial `notes` table (no owner yet).
2. `create-users-table` — initial `users` table (`name`/`password` columns, unique email index).
3. `add-password-reset-fields-to-users` — adds the reset-token hash and expiry columns.
4. `add-profile-image-url-to-users` — adds the profile photo column.
5. `rename-notes-id-to-note-id` — renames the notes PK for a clearer, table-qualified identity.
6. `rename-users-id-to-user-id` — same rename, applied to users.
7. `add-identity-fields-to-users` — renames `name → username`, `password → password_hash`, adds `role`.
8. `add-user-id-to-notes` — adds the `user_id` foreign key to notes, deletes any pre-existing ownerless notes, then enforces `NOT NULL` and the foreign-key constraint.

This history is exactly why `note_id`/`user_id` and ownership exist as they do today: notes originally had no owner at all, and ownership was retrofitted once authentication was built.

---

## 🔌 REST API

Base path: `/api` (mounted in `server.js` as `app.use("/api", router)`).

### Auth — `/api/auth`

| Method | Endpoint                  | Auth | Purpose                                         |
| ------ | -------------------------- | ---- | ------------------------------------------------ |
| POST   | `/auth/register`            | ❌    | Create an account, return a user + JWT             |
| POST   | `/auth/login`                | ❌    | Verify credentials, return a user + JWT             |
| GET    | `/auth/me`                   | ✅    | Return the authenticated user's profile             |
| PATCH  | `/auth/profile`              | ✅    | Update `name` and/or upload/remove a profile photo   |
| POST   | `/auth/forgot-password`      | ❌    | Issue a password reset token (emailed in production) |
| POST   | `/auth/reset-password`       | ❌    | Consume a reset token, set a new password            |
| POST   | `/auth/logout`               | ❌    | Acknowledge logout (client discards the token)       |

### Notes — `/api/note` (all routes require a valid Bearer token)

| Method | Endpoint         | Auth | Purpose                                    |
| ------ | ----------------- | ---- | -------------------------------------------- |
| GET    | `/note`             | ✅    | List the authenticated user's notes           |
| POST   | `/note`             | ✅    | Create a note owned by the authenticated user |
| GET    | `/note/:note_id`    | ✅    | Get one note (only if it belongs to the user) |
| PUT    | `/note/:note_id`    | ✅    | Update a note (only if it belongs to the user) |
| DELETE | `/note/:note_id`    | ✅    | Permanently delete a note (only if owned)      |

Every response follows the same envelope:

```json
{
  "success": true,
  "message": "Notes retrieved successfully",
  "data": [ /* note or note[] */ ]
}
```

Errors follow the same shape with `"success": false` and no `data`.

### Example — Login

**Request**
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "ana@example.com", "password": "correct-horse-battery" }
```

**Response**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": "b2b0...",
      "name": "Ana",
      "email": "ana@example.com",
      "profile_image_url": null
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Example — Create note

**Request**
```http
POST /api/note
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "Backend Architecture", "content": "Controllers stay thin; services hold logic." }
```

**Response**
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "note_id": "1f2a...",
    "user_id": "b2b0...",
    "title": "Backend Architecture",
    "content": "Controllers stay thin; services hold logic.",
    "status": "ACTIVE",
    "created_at": "2026-08-12T09:00:00.000Z",
    "updated_at": "2026-08-12T09:00:00.000Z"
  }
}
```

---

## 🔐 Authentication & Authorization

**Authentication** answers *"who are you?"* — handled by `/auth/register` and `/auth/login`, which end with a signed JWT (`{ sub: user_id }`) in the client's hands.

**Authorization** answers *"what are you allowed to touch?"* — handled by the `authenticate` middleware plus every service method that takes a `userId` argument and folds it into a `WHERE user_id = ...` query. MemoNest demonstrates both: authentication proves identity once at login, and authorization is re-checked on *every single* note request afterward.

### Signup flow

```
Signup form → Zod validation → useSignup() → registerUser()
   → POST /auth/register → validate (Joi) → AuthController.register
   → AuthService.registerUser
       → normalize email → check uniqueness → hash password (bcrypt)
       → User.create() → sign JWT
   → { user, token } → frontend redirects to /login?registered=1
```
Registration intentionally does **not** log the user in automatically — the token returned by `/register` is discarded by the frontend on purpose (see the comment in `useAuthMutations.ts`), and the user must sign in with their new credentials on the login page.

### Login flow

```
Login form → Zod validation → useLogin() → loginUser()
   → POST /auth/login → validate (Joi) → AuthController.login
   → AuthService.loginUser
       → find user by normalized email (with password_hash scope)
       → bcrypt.compare() → sign JWT
   → { user, token } → AuthContext.login() saves to localStorage
   → redirect to /dashboard
```

### Token / middleware flow

```
Incoming request
   → Authorization: Bearer <token>
   → auth.middleware.js
       → missing header?            → 401 "Authentication token is required"
       → not "Bearer ..." prefix?   → 401 "Invalid authorization header"
       → jwt.verify() fails?        → 401 "Invalid or expired authentication token"
       → decoded.sub missing?       → 401 "Invalid authentication token"
   → req.user = { user_id: decoded.sub }
   → next() → controller → service (user-scoped query)
```

On the frontend, any `401` from an authenticated request triggers a single shared handler (`handleUnauthorized` in `lib/api.ts`) that clears the stored session, notifies the rest of the app via a custom event, and hard-navigates to `/login?session=expired` — so an expired or tampered token can never leave the app in a half-authenticated state.

---

## 🛡️ User Data Isolation

This is the core security property of the notes feature: **a user must never be able to read, modify, or delete another user's note, even by guessing or brute-forcing a note ID.**

```
User A (user_id = A)                 User B (user_id = B)
      │                                     │
      ▼                                     ▼
GET /note/:note_id                    GET /note/:note_id  (same ID)
      │                                     │
      ▼                                     ▼
NoteService.getNoteById(id, A)        NoteService.getNoteById(id, B)
      │                                     │
      ▼                                     ▼
WHERE note_id = id AND user_id = A    WHERE note_id = id AND user_id = B
      │                                     │
      ▼                                     ▼
  found → 200                          not found → 404
```

The `user_id` used in that `WHERE` clause is **never** read from `req.body`, `req.params`, or a query string — it always comes from `req.user.user_id`, which is set exclusively by the auth middleware after verifying the JWT signature. A malicious client cannot influence which rows a query touches by sending a different `user_id` in a request, because `NoteService` never looks at one. This pattern is applied identically to `getAllNotes`, `getNoteById`, `updateNote`, and `deleteNote`.

---

## ✅ Validation

**Backend (Joi)** is the actual security/integrity boundary — every write to `users` or `notes` passes through a Joi schema first (`validate-request.middleware.js` for JSON bodies, a dedicated function for the multipart profile update). Unknown fields are stripped (`stripUnknown: true`), so extra client-supplied fields are silently dropped rather than saved.

**Frontend (Zod + React Hook Form)** exists purely for UX — instant feedback before a request is even sent. The frontend's `auth.schema.ts` explicitly mirrors the backend's Joi rules (same 8–72 character password range, same 255-character email cap) so that anything the client accepts is never rejected by the server for a rule the frontend "forgot" to enforce — but the frontend check is never trusted as the security boundary; the backend re-validates everything regardless of what the client already checked.

| Field                | Rule                                                    |
| --------------------- | -------------------------------------------------------- |
| `email`                | Valid email format, ≤255 chars, lower-cased/trimmed        |
| `password`             | 8–72 characters                                              |
| `name` (user)          | 1–100 characters                                             |
| `title` (note)         | 1–100 characters, required                                    |
| `content` (note)       | Non-empty, required                                            |
| `status` (note)        | One of `ACTIVE` / `ARCHIVED` / `DELETED`                        |
| `note_id` (param)      | Must be a valid UUIDv4                                          |
| profile image           | JPG / PNG / WebP, ≤2 MB, one file                                |

---

## 🧩 Service Layer

| Concern             | Lives in           | Responsibility                                                                  |
| -------------------- | ------------------- | ---------------------------------------------------------------------------------- |
| HTTP shape             | Controllers          | Read `req`, call one service method, shape the JSON response                        |
| Business logic         | `AuthService` / `NoteService` | Ownership checks, uniqueness checks, hashing, token issuance                    |
| Database access         | Sequelize models      | Column definitions, associations, scopes                                             |
| Email delivery           | `EmailService`         | Isolated so `AuthService` never has to know *how* email is sent                     |
| File/URL generation      | `FileService`           | Turns a `multer` upload into a servable `/uploads/...` URL                          |

`EmailService.sendPasswordResetEmail` is a real class with a real method call in the reset-password flow, but its body is intentionally empty with a comment explaining why: provider-specific code (Nodemailer, SendGrid, SES, etc.) belongs entirely inside that one method, so swapping providers later never touches `AuthService`. Today, no email is actually sent — `AuthService.requestPasswordReset` returns the plaintext reset token directly in the API response, but **only when `NODE_ENV !== "production"`**, so local development and testing can exercise the full reset flow without a configured mail provider.

`FileService.getProfileImageUrl` exists so `AuthService.updateProfile` only ever receives a final URL string — it has no idea a file was uploaded, where it's stored, or what naming scheme `multer` used. Storage concerns stay entirely in `FileService` and the `profile-upload.middleware.js` that configures `multer`.

---

## 🔄 TanStack Query in this project

- **Queries** (`useNotes`, `useNote`) fetch and cache server state; the dashboard reads `isPending`, `isError`, `error`, and `refetch` directly off `useNotes()` to drive its loading/error/empty UI.
- **Mutations** (`useCreateNote`, `useUpdateNote`, `useArchiveNote`, `useDeleteNote`) wrap every write. `useArchiveNote` is just `useUpdateNote` under the hood, calling `PUT /note/:id` with `{ status: "ARCHIVED" | "ACTIVE" }`.
- **Query keys** are centralized in `note-keys.ts`/`auth-keys.ts` (e.g. `["notes", "list", "all"]`) so every hook that reads or invalidates notes agrees on the exact same key shape.
- **Invalidation**: every mutation's `onSuccess` calls `queryClient.invalidateQueries({ queryKey: noteKeys.lists() })`, so after a create/update/archive/delete, the next render of `useNotes()` automatically refetches — the dashboard never manually re-fetches or manages a "did this just change?" flag.
- **Caching**: `queryClient` is configured with a 30-second `staleTime` and no refetch-on-window-focus, and mutations never retry (`retry: 0`) so a failed create/update is never silently duplicated by an automatic retry.
- **Auth-aware retries**: queries never retry on a `401` (`ApiError.status === 401`), because retrying a request that the token itself made invalid would just repeat the same failure.

This avoids the common alternative — a component-level `useEffect` that fetches on mount, tracked by three separate `useState` calls for data/loading/error — which has to be re-implemented (and re-debugged) in every component that needs server data.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`, from `backend/.env.example`)

| Variable        | Purpose                                                         |
| ---------------- | ------------------------------------------------------------------ |
| `PORT`             | Port the Express server listens on (default `5000`)                  |
| `NODE_ENV`         | `development` / `test` / `production` — also gates reset-token exposure |
| `DB_HOST`          | PostgreSQL host                                                        |
| `DB_PORT`          | PostgreSQL port (default `5432`)                                       |
| `DB_NAME`          | Database name                                                           |
| `DB_USER`          | Database username                                                       |
| `DB_PASSWORD`      | Database password                                                       |
| `DB_DIALECT`       | Sequelize dialect (default `postgres`)                                  |
| `FRONTEND_URL`     | Comma-separated list of allowed CORS origins                            |
| `JWT_SECRET`       | Secret used to sign/verify access tokens — **required**, no default    |
| `JWT_EXPIRES_IN`   | Access token lifetime (default `7d`)                                    |

### Frontend (`frontend/.env.local`, from `frontend/.env.example`)

| Variable                    | Purpose                                          |
| ----------------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`     | Base URL the frontend calls (default `http://localhost:5000/api`) |

Never commit a real `.env`/`.env.local` — only the `.env.example` templates are tracked in the repository.

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- npm
- PostgreSQL (running locally or reachable)
- Git

### Clone
```bash
git clone https://github.com/Anas-Khannn/note-taking-api.git
cd note-taking-api
```

### Backend
```bash
cd backend
cp .env.example .env      # fill in DB_*, JWT_SECRET, etc.
npm install
npx sequelize-cli db:migrate     # apply all migrations
npx sequelize-cli db:seed:all    # optional: seed two sample notes
npm run dev                      # nodemon server.js
```
The API starts on `http://localhost:5000`, mounted under `/api`.

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                      # next dev
```
The app starts on `http://localhost:3000`.

### Database setup, step by step
1. Create a PostgreSQL database matching `DB_NAME`.
2. Fill in `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `backend/.env`.
3. Run `npx sequelize-cli db:migrate` from `backend/` — this walks through all 8 migrations in order.
4. Start the backend (`npm run dev`); a successful `"Database connection established successfully"` log confirms connectivity (`authenticateDatabase()` in `server.js`).

---

## 🧪 Testing

The backend has **automated unit tests** (`backend/test/`, run with `npm test` → `node --test`):

| File                          | Covers                                                          |
| ------------------------------ | ------------------------------------------------------------------ |
| `auth.service.test.js`           | Register, login, profile update, forgot/reset-password logic         |
| `auth.validation.test.js`        | Joi schema edge cases for auth inputs                                 |
| `note.service.test.js`           | CRUD + ownership enforcement, using a fake in-memory `Note` model     |
| `password.util.test.js`          | Hashing/comparison behavior                                            |
| `reset-token.util.test.js`       | Token generation and hashing                                            |

These are **unit tests with mocked models** (via a `Module._load` interception), not integration tests against a live PostgreSQL instance — they verify service logic and validation rules in isolation.

The frontend has **automated tests** (`frontend/`, run with `npm test` → `vitest run`) under `__tests__` folders alongside pages, hooks, services, schemas, and the auth context, using Vitest + Testing Library + jsdom.

### Manual verification scenarios
Beyond the automated suite, these flows are worth walking through by hand against a running instance:
- Register → attempt to register the same email again → expect `409 Conflict`.
- Login with a wrong password → expect `401`.
- Create a note as User A, then try `GET /note/:id` for that note while authenticated as User B → expect `404` (not `403` — the row is filtered out of the query entirely, so it looks like it doesn't exist).
- Send a request to any `/note` route with no `Authorization` header → expect `401`.
- Archive a note, confirm the dashboard's "Archived" filter picks it up without a manual refresh (TanStack Query invalidation).

---

## 🩺 Troubleshooting

**Backend can't connect to the database** — check `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD` in `backend/.env`, confirm PostgreSQL is actually running, and check the exact error printed by `authenticateDatabase()` on startup.

**Login/register requests fail with a network error** — confirm the backend is running and that `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local` points at it; `lib/api.ts` surfaces a `"Unable to reach the server"` error whenever `fetch` itself throws.

**Frontend gets CORS errors** — the origin making the request must be in the backend's `FRONTEND_URL` list (comma-separated); the default already covers ports `3000`/`3001`/`3100`.

**Notes don't update in the UI after a create/edit/delete** — this should self-resolve via TanStack Query's `invalidateQueries` calls in `useNotes.ts`; if it doesn't, check the mutation's `onSuccess` actually fired (i.e. the request returned `2xx`).

**"JWT_SECRET environment variable is not configured"** — the backend intentionally throws rather than signing/verifying tokens with an empty secret; set `JWT_SECRET` in `backend/.env` before starting the server.

---

## 🧠 Concepts This Project Exercises

- **Backend engineering** — Express routing, middleware composition, centralized error handling (`error.middleware.js` maps `AppError` subclasses to status codes), environment-driven configuration.
- **Database engineering** — relational modeling, UUID primary keys, a real foreign key with `CASCADE` behavior, and schema evolution through incremental migrations rather than a single frozen definition.
- **API design** — consistent response envelopes, meaningful HTTP status codes via a shared enum, REST-ish resource routes.
- **Security** — password hashing, stateless token auth, never trusting a client-supplied identity, scoped queries, upload validation.
- **Frontend engineering** — App Router route groups, typed API contracts, a service/hook/component layering that keeps each layer independently testable.
- **Server state** — queries vs. mutations, query-key design, and invalidation as the mechanism that keeps the UI in sync with the backend.

## 🎓 Interview-Ready Concepts

- **Middleware** — a function that runs between the incoming request and the final handler; here, `authenticate` and `validate()` both short-circuit the request (via `next(error)`) before a controller ever runs.
- **Authentication vs. authorization** — proving identity once (login) vs. checking permission on every subsequent request (the `user_id`-scoped queries).
- **Why hash passwords** — so a database breach doesn't hand over usable credentials; bcrypt's salted, slow hash makes brute-forcing impractical.
- **Why JWTs here** — stateless auth means the server doesn't need a session store; the trade-off (shown honestly in the `logout` controller) is that a JWT can't be server-side revoked before it expires.
- **ORM** — Sequelize lets the code describe `User`/`Note` as JS classes and relationships instead of hand-writing SQL for every query, while migrations still give explicit control over the actual schema.
- **Migration** — a versioned, reversible (`up`/`down`) description of one schema change; the 8 migrations here are a real audit trail of how the schema grew.
- **Foreign key** — the `notes.user_id → users.user_id` constraint that makes an orphaned note (a note with no valid owner) impossible at the database level.
- **User data isolation** — every note query is filtered by the authenticated user's ID, so ownership is enforced by the query itself, not by an after-the-fact permission check.
- **Query vs. mutation (TanStack Query)** — queries read and cache server state; mutations write and are followed by explicit cache invalidation so reads reflect the write.
- **Query invalidation** — telling the cache "this data might be stale now" so the next read refetches, instead of manually pushing the new value into every place it's displayed.

---

## 🔮 Future Improvements

*(Not currently implemented — ideas only.)*
- Real email delivery for password resets (`EmailService` is stubbed intentionally).
- A frontend `/reset-password` page — the backend endpoint and the `useResetPassword`/`resetPasswordSchema` code exist, but no page currently uses them.
- Pagination and/or server-side search for notes (currently all notes are fetched and filtered client-side).
- Refresh tokens / server-side token revocation (current JWTs cannot be invalidated before expiry).
- Rate limiting on auth endpoints.
- An automated integration test suite against a real (test) PostgreSQL database, alongside the existing mocked-model unit tests.
- OpenAPI/Swagger documentation for the REST API.
- CI/CD and a deployment pipeline.

---

## 📄 License

No license file is currently present in this repository.

## 👨‍💻 Author

**Anas Khan**
Repository: [github.com/Anas-Khannn/note-taking-api](https://github.com/Anas-Khannn/note-taking-api)
