// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const isTokenValid = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 > Date.now(); // Check if token is not expired
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token || !isTokenValid(token)) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
