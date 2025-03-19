"use client";  

import React, { useState } from 'react';

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic (API call to verify credentials)
    console.log('Logging in:', formData);
  };

  return (
    <div className="min-h-screen bg-[#0E0F1C] text-white flex items-center justify-center p-6">
      <div className="bg-[#181c29] p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-3xl font-semibold text-center mb-6">
          Welcome <span className="text-blue-400">baaaaaack</span> 🐶
        </h2>
        <p className="text-gray-400 text-center mb-6">
          We knew you would be back. Enter your details below and get back to writing your stories.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full mt-2 p-3 bg-[#22242b] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full mt-2 p-3 bg-[#22242b] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              className="w-full py-3 mt-6 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Log In
            </button>
          </div>
        </form>

        {/* Sign-up Link */}
        <p className="mt-4 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-400 hover:underline">
            Create one here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
