const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs for sensitive operations
  message: {
    error: 'Too many attempts, please try again later.'
  },
});

// Validation middleware
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('first_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'tutor', 'student', 'parent'])
    .withMessage('Invalid role specified'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
];

const validateAdminCreation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 12 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Admin password must be at least 12 characters with uppercase, lowercase, number, and special character'),
  body('first_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required'),
  body('last_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required'),
];

// Helper middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Routes

// POST /api/auth/login - User login
router.post('/login', 
  authLimiter,
  validateLogin,
  handleValidationErrors,
  AuthController.login
);

// POST /api/auth/register - User registration (students self-register, admin creates tutors)
router.post('/register',
  authLimiter,
  validateRegister,
  handleValidationErrors,
  AuthController.register
);

// POST /api/auth/create-admin - Create first admin user (only if no admin exists)
router.post('/create-admin',
  strictAuthLimiter,
  validateAdminCreation,
  handleValidationErrors,
  AuthController.createFirstAdmin
);

// GET /api/auth/profile - Get current user profile
router.get('/profile',
  authenticateToken,
  AuthController.profile
);

// POST /api/auth/logout - User logout
router.post('/logout',
  authenticateToken,
  AuthController.logout
);

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh',
  authLimiter,
  authenticateToken,
  AuthController.refresh
);

// GET /api/auth/check - Check if user is authenticated (for frontend)
router.get('/check', 
  authenticateToken, 
  (req, res) => {
    res.json({
      success: true,
      authenticated: true,
      user: {
        id: req.user.userId,
        email: req.user.email,
        role: req.user.role
      }
    });
  }
);

// Health check for auth service
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Authentication',
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;
