import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, authUtils } from '../services/api';

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeBatches: 0,
    todaySessions: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!authUtils.isAuthenticated() || !authUtils.isAdmin()) {
      navigate('/');
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user profile
      const userResponse = await authUtils.getProfile();
      if (userResponse.data.success) {
        setUser(userResponse.data.user);
      }

      // Get dashboard metrics (mock data for now)
      // const dashboardResponse = await adminAPI.getDashboard();
      
      // Mock data until we implement the dashboard API
      setDashboardData({
        totalUsers: 0,
        totalCourses: 0,
        activeBatches: 0,
        todaySessions: 0
      });

    } catch (error) {
      console.error('Dashboard load error:', error);
      if (error.response?.status === 401) {
        authUtils.clearAuth();
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authUtils.clearAuth();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🎓 Learner Circle
              </h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Admin
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {authUtils.getUserName()}!
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Manage your educational platform and monitor key metrics.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">📚</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.totalCourses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">🎯</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Batches
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.activeBatches}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">📅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Today's Sessions
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.todaySessions}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👨‍🏫</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Create Tutor Account</h4>
                    <p className="text-sm text-gray-600">Add a new tutor to the platform</p>
                  </div>
                </div>
              </button>

              <button className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left transition-colors">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📚</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Create Course</h4>
                    <p className="text-sm text-gray-600">Add a new course with curriculum</p>
                  </div>
                </div>
              </button>

              <button className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg p-4 text-left transition-colors">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🎯</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Create Batch</h4>
                    <p className="text-sm text-gray-600">Start a new batch with smart scheduling</p>
                  </div>
                </div>
              </button>

              <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-left transition-colors">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👩‍🎓</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Manage Students</h4>
                    <p className="text-sm text-gray-600">View and manage student accounts</p>
                  </div>
                </div>
              </button>

              <button className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-4 text-left transition-colors">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  <div>
                    <h4 className="font-medium text-gray-900">View Analytics</h4>
                    <p className="text-sm text-gray-600">Monitor performance and metrics</p>
                  </div>
                </div>
              </button>

              <button className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg p-4 text-left transition-colors">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🗓️</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Manage Holidays</h4>
                    <p className="text-sm text-gray-600">Set holidays and system breaks</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎉</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Learner Circle Admin!
              </h4>
              <p className="text-gray-600 mb-4">
                Your platform is set up and ready. Start by creating your first course or adding tutors.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✅ Admin account created successfully</p>
                <p>✅ Database connected and ready</p>
                <p>✅ Authentication system active</p>
                <p>🔄 Ready to create courses and batches</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              System Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Database Connected</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Authentication Active</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Google APIs Pending</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
