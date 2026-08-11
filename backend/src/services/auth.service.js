const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');

/**
 * Register a new user (CUSTOMER self-register, OWNER register with PENDING status).
 */
const register = async ({ name, email, phone, password, role }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('Email is already registered');
  }

  // Set role defaults
  const userRole = role || 'CUSTOMER';

  // Owners need admin approval — start as PENDING
  const status = userRole === 'OWNER' ? 'PENDING' : 'ACTIVE';

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: userRole,
    status,
  });

  const token = generateToken(user._id, user.role);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Login with email and password.
 */
const login = async ({ email, password }) => {
  // Find user with password field explicitly selected
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check account status
  if (user.status === 'SUSPENDED') {
    throw ApiError.forbidden('Your account has been suspended. Contact support.');
  }
  if (user.status === 'INACTIVE') {
    throw ApiError.forbidden('Your account is inactive.');
  }

  const token = generateToken(user._id, user.role);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Get current authenticated user info.
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

module.exports = { register, login, getMe };
