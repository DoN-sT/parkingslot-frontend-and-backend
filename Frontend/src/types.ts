export type Role = "ADMIN" | "OWNER" | "EMPLOYEE" | "CUSTOMER";
export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type SlotStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "MAINTENANCE";
export type VehicleType = "2-Wheeler" | "4-Wheeler" | "EV";
export type BookingStatus = "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface EmployeePermissions {
  scanQR: boolean;
  verifyEntry: boolean;
  verifyExit: boolean;
  viewBookings: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  status: UserStatus;
  ownerId?: string;
  parkingId?: string;
  assignedFacilityId?: string;
  permissions?: EmployeePermissions;
  createdAt: string;
}

export interface Slot {
  id: string;
  parkingId: string;
  slotNumber: string;
  vehicleType: VehicleType;
  status: SlotStatus;
  floor?: string;
  pricePerHour: number;
}

export interface ParkingFacility {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  hourlyRate: number;
  facilities: string[];
  openingTime: string;
  closingTime: string;
  totalSlots: number;
  availableSlotsCount?: number;
  totalSlotsCount?: number;
  images: string[];
  status: "ACTIVE" | "INACTIVE";
  slots?: Slot[];
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  parkingId: string;
  parkingName: string;
  parkingAddress: string;
  slotId: string;
  slotNumber: string;
  vehicleNumber: string;
  vehicleType: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  qrToken: string;
  entryTime?: string;
  exitTime?: string;
  verifiedByEmployeeId?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  amount: number;
  gateway: "RAZORPAY" | "STRIPE";
  transactionId: string;
  status: "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  employeeId: string;
  employeeName: string;
  parkingId: string;
  bookingId: string;
  action: "SCAN" | "ENTRY_VERIFIED" | "EXIT_VERIFIED";
  details: string;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}
