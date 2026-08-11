# ParkingSpot API Documentation

Base URL: `/api`

All responses follow the standard response format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## Authentication Headers
Protected endpoints require:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Auth Endpoints

### `POST /api/auth/register`
Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "CUSTOMER", // CUSTOMER | OWNER
  "phone": "+1234567890"
}
```

### `POST /api/auth/login`
Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
Response `data`: `{ token, user }`

### `GET /api/auth/me`
Response `data`: `{ user }`

---

## 2. Parking Facilities Endpoints

### `GET /api/parking`
Query parameters: `search`, `location`, `minPrice`, `maxPrice`, `facility`
Returns list of active parking facilities with available slot count.

### `GET /api/parking/:id`
Returns parking facility details including pricing, location, address, amenities, and slot summary.

### `POST /api/owner/parking` (Owner)
Creates a new parking facility for the authenticated Owner.

### `PUT /api/owner/parking/:id` (Owner)
Updates existing parking facility details.

### `DELETE /api/owner/parking/:id` (Owner)
Deletes or archives a parking facility.

---

## 3. Slot Management Endpoints

### `GET /api/parking/:parkingId/slots`
Returns slots for a given parking facility with statuses: `AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`.

### `POST /api/owner/parking/:parkingId/slots` (Owner)
Creates slots (e.g. A-101, B-202) for a parking facility.

### `PUT /api/owner/slots/:id` (Owner)
Updates slot number, vehicle type (`4-Wheeler`, `2-Wheeler`, `EV`), or status.

### `DELETE /api/owner/slots/:id` (Owner)
Deletes a slot.

---

## 4. Bookings & Payments Endpoints

### `POST /api/bookings` (Customer)
Body: `{ parkingId, slotId, vehicleNumber, date, startTime, endTime }`
Creates a booking with status `PENDING`.

### `GET /api/bookings/my` (Customer)
Returns customer's booking history.

### `GET /api/bookings/:id` (Customer/Owner/Employee)
Returns detailed booking info including QR pass token and pass details.

### `PATCH /api/bookings/:id/cancel` (Customer)
Cancels booking if eligible (status `CONFIRMED` or `PENDING` before start time).

### `POST /api/payments/create` (Customer)
Body: `{ bookingId }`
Generates payment intent/order.

### `POST /api/payments/verify` (Customer)
Body: `{ bookingId, paymentId, signature }`
Verifies payment, updates booking status to `CONFIRMED`, payment status to `PAID`, and reserves slot.

---

## 5. Owner Management & Employees Endpoints

### `GET /api/owner/analytics` (Owner)
Returns revenue, occupancy rates, slot counts, and booking trends for owner's facilities.

### `GET /api/owner/bookings` (Owner)
Returns all bookings across owner's parking facilities.

### `GET /api/owner/employees` (Owner)
Returns employees created under this Owner.

### `POST /api/owner/employees` (Owner)
Body: `{ name, email, phone, password, parkingId, permissions: { scanQR, verifyEntry, verifyExit, viewBookings } }`
Creates an Employee account assigned to one parking facility under this Owner.

### `PATCH /api/owner/employees/:id/verify` (Owner)
Body: `{ status: "ACTIVE" | "SUSPENDED" }`
Owner approves/verifies employee.

### `PATCH /api/owner/employees/:id/permissions` (Owner)
Body: `{ permissions: { scanQR, verifyEntry, verifyExit, viewBookings } }`
Updates employee operational permissions.

---

## 6. Employee Operations Endpoints

### `GET /api/employee/me` (Employee)
Returns employee details, assigned facility, and active permissions.

### `POST /api/employee/scan` (Employee - requires `scanQR` permission)
Body: `{ qrToken }` or `{ bookingId }`
Validates pass token and returns booking details.

### `POST /api/employee/entry` (Employee - requires `verifyEntry` permission)
Body: `{ bookingId }`
Marks booking as `ACTIVE`, records entry time, and sets slot status to `OCCUPIED`.

### `POST /api/employee/exit` (Employee - requires `verifyExit` permission)
Body: `{ bookingId }`
Marks booking as `COMPLETED`, records exit time, and sets slot status to `AVAILABLE`.

### `GET /api/employee/bookings` (Employee - requires `viewBookings` permission)
Returns list of bookings for assigned parking facility.

### `GET /api/employee/activity` (Employee)
Returns activity history (entries/exits verified by this employee).

---

## 7. Admin Endpoints

### `GET /api/admin/dashboard` (Admin)
Returns system-wide high level metrics.

### `GET /api/admin/users` (Admin)
List all platform users with role filter and search.

### `PATCH /api/admin/users/:id/status` (Admin)
Body: `{ status: "ACTIVE" | "SUSPENDED" }`

### `GET /api/admin/owners` (Admin)
List owners and their approval state.

### `PATCH /api/admin/owners/:id/approve` (Admin)
Approve owner registration.

### `PATCH /api/admin/owners/:id/reject` (Admin)
Reject owner registration.

### `GET /api/admin/parking` (Admin)
List all parking facilities across the platform.

### `GET /api/admin/bookings` (Admin)
List all platform bookings.

### `GET /api/admin/payments` (Admin)
List all transaction logs.

### `GET /api/admin/analytics` (Admin)
Platform revenue and usage analytics.
