import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authUtils } from '../services/api';

const StudentPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is student
    if (!authUtils.isAuthenticated() || (!authUtils.isStudent() && authUtils.getUserRole() !== 'parent')) {
      navigate('/');
      return;
    }

    loadUserData();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Mock user data for now
      setUser({
        first_name: authUtils.getUserName(),
        role: authUtils.getUserRole()
      });

    } catch (error) {
      console.error('User data load error:', error);
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
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Student
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
          <h2 className="text-3xl font-bold text-gray-900">My Learning</h2>
          <p className="mt-2 text-gray-600">
            Track your progress and access your classes.
          </p>
        </div>

        {/* Current Classes */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Current Classes
            </h3>
            
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📚</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Active Classes
              </h4>
              <p className="text-gray-600 mb-4">
                You're not enrolled in any classes yet. Contact admin to get enrolled!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <span className="text-3xl mr-4">🎥</span>
              <div>
                <h4 className="font-medium text-gray-900">Session Recordings</h4>
                <p className="text-sm text-gray-600">Access past class recordings</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <span className="text-3xl mr-4">📈</span>
              <div>
                <h4 className="font-medium text-gray-900">Progress Report</h4>
                <p className="text-sm text-gray-600">View your learning progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <span className="text-3xl mr-4">🗓️</span>
              <div>
                <h4 className="font-medium text-gray-900">Schedule</h4>
                <p className="text-sm text-gray-600">View upcoming classes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Learning Journey
            </h3>
            
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🌟</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Start Learning!
              </h4>
              <p className="text-gray-600">
                Your learning dashboard will show progress once you're enrolled in courses.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentPage;
