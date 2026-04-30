const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const validate = require('../middleware/validate');
const { registerRules, loginRules, forgotPasswordRules, resetPasswordRules } = require('../controllers/validators/auth.validator');
const { register, login, getMe, forgotPassword, resetPassword, getAllUsers } = require('../controllers/auth.controller');

// Public routes
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, resetPassword);

// Protected routes
router.get('/me', auth, getMe);

module.exports = router;
