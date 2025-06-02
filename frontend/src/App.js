import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminPage from './pages/AdminPage';
import TutorPage from './pages/TutorPage';
import StudentPage from './pages/StudentPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/tutor" element={<TutorPage />} />
          <Route path="/student" element={<StudentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;