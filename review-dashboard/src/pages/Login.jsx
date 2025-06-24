// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('viewer');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://autocrit.onrender.com/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, role }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role || role);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 font-mono">
      {/* Background elements */}
      <img
        src="/github-bg.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-contain object-center opacity-5 pointer-events-none"
      />
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse [animation-delay:4s]"></div>

      {/* Login Card */}
      <div className="relative animate-scaleIn w-full max-w-md p-8 m-4 space-y-8 glass rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-wider text-white">
            Welcome
          </h1>
          <p className="text-gray-400 mt-2">Sign in to the dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <p className="bg-red-900/50 text-red-300 border border-red-700/50 rounded-lg text-center p-3 text-sm">
              {error}
            </p>
          )}

          <div className="relative">
            <input
              type="text"
              id="username"
              placeholder=" " // Required for floating label
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block px-4 py-3 w-full text-lg text-white bg-black/20 rounded-lg border-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-teal-400 peer transition"
              required
            />
            <label
              htmlFor="username"
              className="absolute text-lg text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-teal-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
            >
              Username
            </label>
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 bg-black/20 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-0 focus:border-teal-400 transition"
          >
            <option value="viewer" className="bg-gray-900">
              Viewer
            </option>
            <option value="admin" className="bg-gray-900">
              Admin
            </option>
          </select>

          <button
            type="submit"
            className="w-full py-3 bg-teal-500 text-black font-bold rounded-lg shadow-lg hover:bg-teal-400 hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-500/50 animate-glow"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
