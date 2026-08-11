const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const validate = require('../middleware/validate');

// POST /api/auth/register — Customer self-register or Owner register (status=PENDING)
router.post('/register', registerValidator, validate, register);

// POST /api/auth/login — Return JWT
router.post('/login', loginValidator, validate, login);

// GET /api/auth/me — Authenticated user info
router.get('/me', authMiddleware, getMe);

module.exports = router;
