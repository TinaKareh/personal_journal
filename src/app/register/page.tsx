"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const SignUp = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("User registered:", data);
        setSuccessMsg("Account created successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
        });
        setTimeout(() => {
          router.push("/login");
        }, 1500); // 1.5 seconds
      } else {
        console.error("Registration failed:", data);
        // Display specific error from the API
        setErrorMsg(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMsg("Network error. Please try again.");
    }
  };

  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  return (
    <div className="bg-[#0E0F1C] text-white min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6">
        <h1 className="text-2xl sm:text-4xl font-semibold">
          Journal me <span className="text-green-500">●</span>
        </h1>
      </nav>
      <div className="min-h-screen bg-[#0E0F1C] text-white flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-[#181c29] p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold text-center mb-6">
            Your stories <span className="text-blue-400">start here</span>
          </h2>

          {/* Success & Error Messages */}
          {successMsg && (
            <div className="mb-4 text-green-400 text-center font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full mt-2 p-3 bg-[#22242b] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full mt-2 p-3 bg-[#22242b] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

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

              {errorMsg && (
                <div className="mb-4 text-red-400 text-center font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Create Account Button */}
              <button
                type="submit"
                className="w-full py-3 mt-6 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>

          {/* Login Link */}
          <p className="mt-4 text-center text-sm text-gray-400">
            Have an account?{" "}
            <a href="/login" className="text-blue-400 hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
