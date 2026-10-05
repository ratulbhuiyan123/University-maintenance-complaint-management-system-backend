# University Maintenance & Complaint Management System - Backend

A robust, beginner-friendly RESTful API built with **Node.js**, **Express.js**, **Supabase (PostgreSQL)**, and **Prisma ORM**. It follows a clean **Modular Controller-Service Pattern** inspired by modern industry standards.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: JavaScript (ES6+ / CommonJS)
- **Framework**: Express.js
- **Database**: PostgreSQL (Hosted on [Supabase](https://supabase.com))
- **ORM**: Prisma ORM (v6.4.1)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Security**: CORS, Environment Variable Management (dotenv)

---

## 🏗️ Architecture & Folder Structure

```text
backend/
├── prisma/
│   ├── schema.prisma       # Database schema & relations
│   └── seed.js             # Initial database seed data
├── src/
│   ├── config/
│   │   └── prisma.js       # Prisma client instance
│   ├── middlewares/
│   │   ├── auth.middleware.js       # protect & role restrictTo middlewares
│   │   └── globalErrorHandler.js    # Centralized error handler
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.service.js
│   │   └── complaint/
│   │       ├── complaint.controller.js
│   │       ├── complaint.route.js
│   │       └── complaint.service.js
│   ├── utils/
│   │   └── AppError.js     # Custom operational error class
│   ├── app.js              # Express app & route mounting
│   └── server.js           # Server entry point
├── .env.example
├── .gitignore
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ratulbhuiyan123/University-maintenance-complaint-management-system-backend.git
cd University-maintenance-complaint-management-system-backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
JWT_SECRET="your_jwt_secret_key"

# Supabase PostgreSQL Connection Strings
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[ENCODED-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[ENCODED-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### 3. Sync Database & Seed Initial Data
```bash
# Push schema to Supabase
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed sample buildings, rooms, categories, and test accounts
npm run seed
```

### 4. Start Server
```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm run start
```
The API will run at `http://localhost:5000`.

---

## 🔑 Default Test Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@campus.edu` | `password123` |
| **Staff** | `staff@campus.edu` | `password123` |
| **Student** | `student@campus.edu` | `password123` |

---

## 📡 API Endpoints

### 1. Health Check
- **`GET /api/health`** - Server status check.

### 2. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Log in user and receive JWT token |

### 3. Student Features (`/api/complaints`)
> Requires Header: `Authorization: Bearer <JWT_TOKEN>` (Role: `STUDENT`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/complaints` | Submit a new complaint |
| `GET` | `/api/complaints/my-complaints` | Get personal complaint history |

### 4. Admin Features (`/api/admin/complaints`)
> Requires Header: `Authorization: Bearer <JWT_TOKEN>` (Role: `ADMIN`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/complaints` | Fetch all complaints (Filter by `status`, `category`) |
| `PUT` | `/api/admin/complaints/:id/assign` | Assign complaint to staff & set priority |

### 5. Maintenance Staff Features (`/api/staff/complaints`)
> Requires Header: `Authorization: Bearer <JWT_TOKEN>` (Role: `STAFF`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/staff/complaints` | Fetch complaints assigned to logged-in staff |
| `PUT` | `/api/staff/complaints/:id/status` | Update complaint status & create StatusLog entry |
