/**
 * Full Seed script — creates demo users for all roles, sample parking facilities, and slots.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Parking = require('./models/Parking');
const ParkingSlot = require('./models/ParkingSlot');
const Employee = require('./models/Employee');
const connectDB = require('./config/db');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // ───────── 1. ADMIN USER ─────────
    let admin = await User.findOne({ email: 'admin@parkingspot.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Platform Admin',
        email: 'admin@parkingspot.com',
        phone: '+91-9999999999',
        password: 'Admin@123',
        role: 'ADMIN',
        status: 'ACTIVE',
      });
      console.log('✅ Admin user created');
    } else {
      console.log('⏭️  Admin already exists');
    }

    // ───────── 2. OWNER USER ─────────
    let owner = await User.findOne({ email: 'owner@parkingspot.com' });
    if (!owner) {
      owner = await User.create({
        name: 'Demo Owner',
        email: 'owner@parkingspot.com',
        phone: '+91-9888888888',
        password: 'Owner@123',
        role: 'OWNER',
        status: 'ACTIVE',
      });
      console.log('✅ Owner user created');
    } else {
      console.log('⏭️  Owner already exists');
    }

    // ───────── 3. CUSTOMER USER ─────────
    let customer = await User.findOne({ email: 'customer@parkingspot.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Demo Customer',
        email: 'customer@parkingspot.com',
        phone: '+91-9777777777',
        password: 'Customer@123',
        role: 'CUSTOMER',
        status: 'ACTIVE',
      });
      console.log('✅ Customer user created');
    } else {
      console.log('⏭️  Customer already exists');
    }

    // ───────── 4. EMPLOYEE USER ─────────
    let employeeUser = await User.findOne({ email: 'employee@parkingspot.com' });
    if (!employeeUser) {
      employeeUser = await User.create({
        name: 'Demo Employee',
        email: 'employee@parkingspot.com',
        phone: '+91-9666666666',
        password: 'Employee@123',
        role: 'EMPLOYEE',
        status: 'ACTIVE',
      });
      console.log('✅ Employee user created');
    } else {
      console.log('⏭️  Employee already exists');
    }

    // ───────── 5. SAMPLE PARKING FACILITIES ─────────
    const existingParkings = await Parking.countDocuments({ ownerId: owner._id });
    if (existingParkings === 0) {
      const parkings = await Parking.insertMany([
        {
          ownerId: owner._id,
          name: 'City Center Parking',
          description: 'Premium multi-level parking in the heart of the city with 24/7 security and CCTV surveillance.',
          address: '123 Main Street, City Center, Chennai 600001',
          location: { lat: 13.0827, lng: 80.2707 },
          totalSlots: 50,
          pricing: { twoWheeler: 20, fourWheeler: 50, heavy: 100 },
          facilities: ['CCTV', 'Security Guard', 'EV Charging', 'Covered Parking'],
          openingTime: '06:00',
          closingTime: '23:00',
          status: 'ACTIVE',
        },
        {
          ownerId: owner._id,
          name: 'Mall Parking Complex',
          description: 'Spacious underground parking at the shopping mall with easy elevator access to all floors.',
          address: '456 Shopping Avenue, T Nagar, Chennai 600017',
          location: { lat: 13.0418, lng: 80.2341 },
          totalSlots: 100,
          pricing: { twoWheeler: 15, fourWheeler: 40, heavy: 80 },
          facilities: ['CCTV', 'Elevator Access', 'Disability Friendly', 'Covered Parking'],
          openingTime: '08:00',
          closingTime: '22:00',
          status: 'ACTIVE',
        },
        {
          ownerId: owner._id,
          name: 'Airport Express Parking',
          description: 'Long-term and short-term parking near the airport with shuttle service to terminals.',
          address: '789 Airport Road, Meenambakkam, Chennai 600027',
          location: { lat: 12.9941, lng: 80.1709 },
          totalSlots: 200,
          pricing: { twoWheeler: 30, fourWheeler: 80, heavy: 150 },
          facilities: ['CCTV', 'Shuttle Service', '24/7 Security', 'Covered Parking', 'Car Wash'],
          openingTime: '00:00',
          closingTime: '23:59',
          status: 'ACTIVE',
        },
      ]);
      console.log(`✅ ${parkings.length} parking facilities created`);

      // ───────── 6. SAMPLE PARKING SLOTS ─────────
      const allSlots = [];
      for (const parking of parkings) {
        const slotCount = Math.min(parking.totalSlots, 20); // Create up to 20 slots per facility
        for (let i = 1; i <= slotCount; i++) {
          let vehicleType = 'FOUR_WHEELER';
          if (i <= Math.floor(slotCount * 0.3)) vehicleType = 'TWO_WHEELER';
          else if (i > slotCount - 2) vehicleType = 'HEAVY';

          allSlots.push({
            parkingId: parking._id,
            slotNumber: `${parking.name.charAt(0)}${String(i).padStart(3, '0')}`,
            vehicleType,
            status: 'AVAILABLE',
          });
        }
      }
      const insertedSlots = await ParkingSlot.insertMany(allSlots);
      console.log(`✅ ${insertedSlots.length} parking slots created`);

      // ───────── 7. EMPLOYEE ASSIGNMENT ─────────
      const existingEmployee = await Employee.findOne({ userId: employeeUser._id });
      if (!existingEmployee) {
        await Employee.create({
          userId: employeeUser._id,
          ownerId: owner._id,
          parkingId: parkings[0]._id,
          permissions: {
            scanQR: true,
            verifyEntry: true,
            verifyExit: true,
            viewBookings: true,
          },
          status: 'ACTIVE',
          verifiedAt: new Date(),
        });
        console.log('✅ Employee assigned to City Center Parking');
      }
    } else {
      console.log('⏭️  Parking facilities already exist');
    }

    // ───────── SUMMARY ─────────
    console.log('\n══════════════════════════════════════════');
    console.log('  🎉 Database seeded successfully!');
    console.log('══════════════════════════════════════════');
    console.log('\n  Demo Login Credentials:');
    console.log('  ─────────────────────────────────────');
    console.log('  Admin:    admin@parkingspot.com    / Admin@123');
    console.log('  Owner:    owner@parkingspot.com    / Owner@123');
    console.log('  Customer: customer@parkingspot.com / Customer@123');
    console.log('  Employee: employee@parkingspot.com / Employee@123');
    console.log('  ─────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
