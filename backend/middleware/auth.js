const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Main authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({ 
        error: 'Invalid token - user not found or inactive',
        code: 'INVALID_USER'
      });
    }

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      userInstance: user
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Role-based authorization middleware
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'NO_AUTH'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        code: 'INSUFFICIENT_ROLE'
      });
    }

    next();
  };
};

// Admin only middleware
const requireAdmin = requireRole('admin');

// Tutor or Admin middleware
const requireTutorOrAdmin = requireRole('tutor', 'admin');

// Student, Tutor, or Admin middleware (authenticated users)
const requireAuthenticated = requireRole('student', 'tutor', 'admin', 'parent');

// Self or Admin access (user can access their own data, admin can access anyone's)
const requireSelfOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'NO_AUTH'
      });
    }

    const targetUserId = req.params.userId || req.body.userId || req.query.userId;
    
    // Admin can access anyone's data
    if (req.user.role === 'admin') {
      return next();
    }

    // User can access their own data
    if (req.user.userId === targetUserId) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Access denied - can only access your own data',
      code: 'ACCESS_DENIED'
    });

  } catch (error) {
    console.error('Self or admin middleware error:', error);
    return res.status(500).json({ 
      error: 'Authorization check failed',
      code: 'AUTH_CHECK_ERROR'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (user && user.is_active) {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        userInstance: user
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    req.user = null;
    next();
  }
};

// Batch access control (user must be enrolled in batch or be tutor/admin)
const requireBatchAccess = async (req, res, next) => {
  try {
    const batchId = req.params.batchId || req.body.batchId;
    
    if (!batchId) {
      return res.status(400).json({ 
        error: 'Batch ID required',
        code: 'NO_BATCH_ID'
      });
    }

    // Admin has access to all batches
    if (req.user.role === 'admin') {
      return next();
    }

    // TODO: Implement batch access check when Batch and Enrollment models are ready
    // For now, allow tutor and admin access
    if (req.user.role === 'tutor' || req.user.role === 'admin') {
      return next();
    }

    // Students need to be enrolled (implement after Enrollment model)
    if (req.user.role === 'student') {
      // TODO: Check enrollment
      return next(); // Temporary - allow all for now
    }

    return res.status(403).json({ 
      error: 'Access denied to this batch',
      code: 'BATCH_ACCESS_DENIED'
    });

  } catch (error) {
    console.error('Batch access middleware error:', error);
    return res.status(500).json({ 
      error: 'Batch access check failed',
      code: 'BATCH_ACCESS_ERROR'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireTutorOrAdmin,
  requireAuthenticated,
  requireSelfOrAdmin,
  optionalAuth,
  requireBatchAccess
};
