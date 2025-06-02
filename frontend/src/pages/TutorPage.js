import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authUtils } from '../services/api';

const TutorPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is tutor
    if (!authUtils.isAuthenticated() || !authUtils.isTutor()) {
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
              <span className="ml-4 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Tutor
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
          <h2 className="text-3xl font-bold text-gray-900">Teaching Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Manage your classes and track student progress.
          </p>
        </div>

        {/* Today's Sessions */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Today's Sessions
            </h3>
            
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📅</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Sessions Today
              </h4>
              <p className="text-gray-600 mb-4">
                You don't have any classes scheduled for today.
              </p>
            </div>
          </div>
        </div>

        {/* My Batches */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              My Batches
            </h3>
            
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Assigned Batches
              </h4>
              <p className="text-gray-600 mb-4">
                You haven't been assigned to any batches yet. Admin will assign you soon!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <span className="text-3xl">✅</span>
              <h4 className="mt-2 font-medium text-gray-900">Mark Attendance</h4>
              <p className="text-sm text-gray-600">Record student attendance</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <span className="text-3xl">📝</span>
              <h4 className="mt-2 font-medium text-gray-900">Session Notes</h4>
              <p className="text-sm text-gray-600">Add notes for classes</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <span className="text-3xl">📚</span>
              <h4 className="mt-2 font-medium text-gray-900">Curriculum</h4>
              <p className="text-sm text-gray-600">Access course materials</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <span className="text-3xl">🏖️</span>
              <h4 className="mt-2 font-medium text-gray-900">Request Leave</h4>
              <p className="text-sm text-gray-600">Apply for time off</p>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <span className="text-2xl mr-4">ℹ️</span>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Important Reminders</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• All sessions are accessed through the platform only</li>
                <li>• Student contact information is never shared</li>
                <li>• Follow the provided curriculum for each session</li>
                <li>• Record attendance and notes after each class</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TutorPage;
