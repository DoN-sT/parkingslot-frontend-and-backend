# ParkingSpot Backend

Production-ready REST API for the ParkingSpot smart parking reservation and management platform.

## Tech Stack

- **Runtime:** Node.js + Express.js
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Payments:** Razorpay
- **Images:** Cloudinary (optional)
- **Security:** Helmet, CORS, express-validator

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Razorpay test account (for payments)

### Installation

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
```

### Seed Admin User

```bash
npm run seed
# Creates admin@parkingspot.com / Admin@123
```

### Run Development Server

```bash
npm run dev
# Server starts on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### Run Production

```bash
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── config/         # Database & Cloudinary configuration
│   ├── controllers/    # Route handlers (thin, delegate to services)
│   ├── middleware/      # Auth, role, permission, error handling, validation
│   ├── models/         # Mongoose schemas (User, Parking, ParkingSlot, Booking, Payment, Employee, EntryLog)
│   ├── routes/         # Express route definitions
│   ├── services/       # Business logic layer
│   ├── utils/          # ApiError, ApiResponse, token/QR generation
│   ├── validators/     # express-validator chains
│   ├── app.js          # Express app setup
│   ├── server.js       # Entry point
│   └── seed.js         # Admin user seeder
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Roles

| Role | Description |
|------|-------------|
| ADMIN | Platform oversight — manage users, approve owners, view all data |
| OWNER | Manage own parking facilities, slots, employees, view revenue |
| EMPLOYEE | Scan QR, verify entry/exit at assigned parking facility |
| CUSTOMER | Search parking, book slots, make payments, receive QR pass |

## API Documentation

Full API contract: [`/docs/api.md`](../docs/api.md)

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

## Deployment

1. Push to GitHub
2. Deploy on Render or Railway
3. Set environment variables (MONGODB_URI, JWT_SECRET, FRONTEND_URL, etc.)
4. The app uses `process.env.PORT` — no hardcoded ports
