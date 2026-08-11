class ApiResponse {
  static success(res, statusCode, message, data = null) {
    const response = { success: true, message };
    if (data !== null) response.data = data;
    return res.status(statusCode).json(response);
  }

  static created(res, message, data = null) {
    return ApiResponse.success(res, 201, message, data);
  }

  static ok(res, message, data = null) {
    return ApiResponse.success(res, 200, message, data);
  }

  static error(res, statusCode, message, errors = []) {
    const response = { success: false, message };
    if (errors.length > 0) response.errors = errors;
    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
