const paymentService = require('../services/payment.service');
const ApiResponse = require('../utils/ApiResponse');

const createPayment = async (req, res, next) => {
  try {
    const result = await paymentService.createPayment(
      req.body.bookingId,
      req.user.userId
    );
    return ApiResponse.created(res, 'Payment order created', result);
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const result = await paymentService.verifyPayment(req.body);
    return ApiResponse.ok(res, 'Payment verified successfully', result);
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(
      req.params.id,
      req.user.userId,
      req.user.role
    );
    return ApiResponse.ok(res, 'Payment retrieved', payment);
  } catch (error) {
    next(error);
  }
};

module.exports = { createPayment, verifyPayment, getPaymentById };
