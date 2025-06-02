import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
      // Redirect based on role
      const redirectPath = userRole === 'admin' ? '/admin' : 
                          userRole === 'tutor' ? '/tutor' : '/student';
      navigate(redirectPath);
    }
  }, [navigate]);

  // Check if admin setup is needed
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        // Try to access admin endpoint to see if setup is needed
        const response = await api.get('/auth/health');
        // If we get here, backend is working
      } catch (error) {
        console.log('Backend not ready or admin setup needed');
      }
    };

    checkAdminExists();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Registration specific validation
    if (!isLogin && !showAdminSetup) {
      if (!formData.first_name) {
        newErrors.first_name = 'First name is required';
      }
      if (!formData.last_name) {
        newErrors.last_name = 'Last name is required';
      }
    }

    // Admin setup specific validation
    if (showAdminSetup) {
      if (!formData.first_name) {
        newErrors.first_name = 'First name is required';
      }
      if (!formData.last_name) {
        newErrors.last_name = 'Last name is required';
      }
      if (formData.password.length < 8) {
        newErrors.password = 'Admin password must be at least 8 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');
    setErrors({});

    try {
      let response;
      
      if (showAdminSetup) {
        // Create first admin user
        response = await api.post('/auth/create-admin', {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name
        });
      } else if (isLogin) {
        // Login
        response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
      } else {
        // Student registration
        response = await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role: 'student'
        });
      }

      if (response.data.success) {
        // Store auth data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userName', response.data.user.first_name);

        setMessage(response.data.message);

        // Redirect after success
        setTimeout(() => {
          navigate(response.data.redirect);
        }, 1000);
      }

    } catch (error) {
      console.error('Auth error:', error);
      
      if (error.response?.data?.error) {
        if (error.response.data.details) {
          // Validation errors
          const validationErrors = {};
          error.response.data.details.forEach(detail => {
            validationErrors[detail.field] = detail.message;
          });
          setErrors(validationErrors);
        } else {
          setMessage(error.response.data.error);
        }
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: ''
    });
    setErrors({});
    setMessage('');
    setShowAdminSetup(false);
  };

  const handleAdminSetup = () => {
    setShowAdminSetup(true);
    setIsLogin(false);
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: ''
    });
    setErrors({});
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🎓 Learner Circle</h1>
          <p className="text-gray-600 mt-2">
            {showAdminSetup ? 'Admin Setup' : 
             isLogin ? 'Welcome back!' : 'Join our learning community'}
          </p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('successful') || message.includes('created') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name fields for registration/admin setup */}
          {(!isLogin || showAdminSetup) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="First name"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Last name"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={showAdminSetup ? "Minimum 8 characters" : "Your password"}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Phone for student registration */}
          {!isLogin && !showAdminSetup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+91 9876543210"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            } text-white`}
          >
            {loading ? 'Processing...' : 
             showAdminSetup ? 'Create Admin Account' :
             isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle between login/register */}
        {!showAdminSetup && (
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        )}

        {/* Admin setup option */}
        {isLogin && !showAdminSetup && (
          <div className="mt-4 text-center">
            <button
              onClick={handleAdminSetup}
              className="text-gray-500 hover:text-gray-700 text-xs"
            >
              First time setup? Create admin account
            </button>
          </div>
        )}

        {/* Back to login from admin setup */}
        {showAdminSetup && (
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setShowAdminSetup(false);
                setIsLogin(true);
              }}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
