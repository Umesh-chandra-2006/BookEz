const express = require('express');
const {
  signup,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout,
  getStats
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const {
  validateSignup,
  validateLogin,
  validateProfileUpdate,
  validatePasswordUpdate,
  handleValidationErrors
} = require('../utils/validators');

const router = express.Router();

// Public routes
router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/login', validateLogin, handleValidationErrors, login);

// Protected routes - All routes after this middleware are protected
router.use(protect);

router.get('/me', getMe);
router.get('/stats', getStats);
router.put('/updatedetails', validateProfileUpdate, handleValidationErrors, updateDetails);
router.put('/updatepassword', validatePasswordUpdate, handleValidationErrors, updatePassword);
router.post('/logout', logout);

module.exports = router;
