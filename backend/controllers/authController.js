const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
  // Login endpoint
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }

      // Find user by email
      const user = await User.findOne({ 
        where: { 
          email: email.toLowerCase().trim(),
          is_active: true
        }
      });

      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // Update last login
      await user.update({ last_login: new Date() });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return user profile and token
      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: user.getSecureProfile('self'),
        redirect: this.getRedirectUrl(user.role)
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Login failed. Please try again.' 
      });
    }
  }

  // Register endpoint (admin only for tutors, open for students)
  static async register(req, res) {
    try {
      const { email, password, first_name, last_name, role = 'student', phone } = req.body;

      // Validate required fields
      if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ 
          error: 'Email, password, first name, and last name are required' 
        });
      }

      // Validate role permissions
      if (role === 'admin' || role === 'tutor') {
        // Only admin can create admin/tutor accounts
        const requesterRole = req.user?.role;
        if (requesterRole !== 'admin') {
          return res.status(403).json({ 
            error: 'Only administrators can create tutor or admin accounts' 
          });
        }
      }

      // Check if user already exists
      const existingUser = await User.findOne({ 
        where: { email: email.toLowerCase().trim() } 
      });

      if (existingUser) {
        return res.status(409).json({ 
          error: 'An account with this email already exists' 
        });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 12);

      // Create user
      const user = await User.create({
        email: email.toLowerCase().trim(),
        password_hash,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role,
        phone: phone?.trim(),
        profile_data: {
          created_by: req.user?.id || 'self-registration',
          registration_date: new Date().toISOString()
        }
      });

      // Generate token for new user
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: user.getSecureProfile('self'),
        redirect: this.getRedirectUrl(user.role)
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Invalid input data',
          details: error.errors.map(e => e.message)
        });
      }

      res.status(500).json({ 
        error: 'Registration failed. Please try again.' 
      });
    }
  }

  // Get current user profile
  static async profile(req, res) {
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        user: user.getSecureProfile('self')
      });

    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  // Logout (invalidate token - client-side)
  static async logout(req, res) {
    try {
      // In a more complex setup, you'd blacklist the token
      // For now, we rely on client-side token removal
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  // Refresh token
  static async refresh(req, res) {
    try {
      const user = await User.findByPk(req.user.userId);
      
      if (!user || !user.is_active) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }

      // Generate new token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: user.getSecureProfile('self')
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }

  // Helper method to determine redirect URL based on role
  static getRedirectUrl(role) {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'tutor':
        return '/tutor';
      case 'student':
      case 'parent':
        return '/student';
      default:
        return '/';
    }
  }

  // Create first admin user (for initial setup)
  static async createFirstAdmin(req, res) {
    try {
      // Check if any admin already exists
      const existingAdmin = await User.findOne({ 
        where: { role: 'admin' } 
      });

      if (existingAdmin) {
        return res.status(409).json({ 
          error: 'Admin user already exists' 
        });
      }

      const { email, password, first_name, last_name } = req.body;

      if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ 
          error: 'All fields are required for admin creation' 
        });
      }

      const password_hash = await bcrypt.hash(password, 12);

      const admin = await User.create({
        email: email.toLowerCase().trim(),
        password_hash,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role: 'admin',
        profile_data: {
          is_founder: true,
          created_at: new Date().toISOString()
        }
      });

      const token = jwt.sign(
        { 
          userId: admin.id, 
          email: admin.email, 
          role: admin.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'First admin user created successfully',
        token,
        user: admin.getSecureProfile('self'),
        redirect: '/admin'
      });

    } catch (error) {
      console.error('Create admin error:', error);
      res.status(500).json({ 
        error: 'Failed to create admin user' 
      });
    }
  }
}

module.exports = AuthController;
