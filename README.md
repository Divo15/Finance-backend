# Finance Dashboard Backend

A role-based finance dashboard backend built with NestJS, TypeScript, PostgreSQL, and Prisma.

## Tech Stack

- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL (Neon cloud)
- **ORM:** Prisma v5
- **Auth:** JWT + Passport
- **Validation:** class-validator + class-transformer

## Setup Instructions

### 1. Clone and install
```bash
git clone github.com/Divo15/
cd finance-backend
npm install
```

### 2. Configure environment
Create a `.env` file:
```env
DATABASE_URL="your-neon-postgresql-connection-string"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
PORT=3000
```

### 3. Run database migrations
```bash
npx prisma migrate dev
```

### 4. Start the server
```bash
npm run start:dev
```

Server runs at `http://localhost:3000`

---

## Role Permission Table

| Action | VIEWER | ANALYST | ADMIN |
|---|---|---|---|
| Register/Login | ✅ | ✅ | ✅ |
| View records | ✅ | ✅ | ✅ |
| View dashboard | ❌ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## API Documentation

### Auth
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get JWT token | Public |

**Register example:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "ADMIN"
}
```

**Login example:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Users
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/users` | Get all users | ADMIN |
| GET | `/api/users/:id` | Get user by ID | ADMIN |
| PATCH | `/api/users/:id` | Update user role/status | ADMIN |
| DELETE | `/api/users/:id` | Delete a user | ADMIN |

**Update user example:**
```json
PATCH /api/users/:id
{
  "role": "ANALYST",
  "status": "INACTIVE"
}
```

---

### Financial Records
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/records` | Create a record | ADMIN |
| GET | `/api/records` | Get all records (with filters) | ALL |
| GET | `/api/records/:id` | Get record by ID | ALL |
| PATCH | `/api/records/:id` | Update a record | ADMIN |
| DELETE | `/api/records/:id` | Soft delete a record | ADMIN |

**Create record example:**
```json
POST /api/records
{
  "amount": 5000,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01T00:00:00.000Z",
  "notes": "Monthly salary"
}
```

**Filter records example:**
```
GET /api/records?type=INCOME&category=Salary&startDate=2026-01-01&endDate=2026-12-31&page=1&limit=10
```

---
### Dashboard
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Get financial summary | ADMIN, ANALYST |
| GET | `/api/dashboard/weekly` | Get last 7 days trends | ADMIN, ANALYST |

**Summary response example:**
```json
{
  "totalIncome": 5000,
  "totalExpense": 0,
  "netBalance": 5000,
  "byCategory": { "Salary": 5000 },
  "monthlyTrends": { "2026-04": { "income": 5000, "expense": 0 } },
  "recentActivity": [...]
}
```

---

## Assumptions Made

1. **Soft delete** — Records are never permanently deleted. A `isDeleted` flag is used.
2. **Role assignment** — Any role can be assigned at registration for testing. In production this would be restricted.
3. **JWT expiry** — Tokens expire in 24 hours.
4. **Passwords** — Hashed with bcrypt (10 salt rounds).
5. **Pagination** — Default page size is 10 records.

## What I Would Add With More Time

- Unit and integration tests
- Rate limiting
- Swagger/OpenAPI documentation
- Refresh tokens
- Search across all fields
- Export records to CSV
- 
