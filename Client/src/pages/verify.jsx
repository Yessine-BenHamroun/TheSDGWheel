import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import ApiService from "../services/api";

export default function Verify() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/verify/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed. Please try again.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Verification failed. Please try again.");
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-2xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 p-8 transition-all duration-300 hover:border-purple-500/50">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>
          
          <div className="relative text-center">
            {status === "loading" && (
              <>
                <div className="flex justify-center mb-6">
                  <Loader className="w-12 h-12 text-purple-500 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Verifying Your Email</h1>
                <p className="text-zinc-400">Please wait while we verify your email address...</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="flex justify-center mb-6">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold mb-4 text-green-500">Email Verified!</h1>
                <p className="text-zinc-400 mb-6">{message}</p>
                <button
                  onClick={handleGoToLogin}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 rounded text-white font-semibold transition"
                >
                  Go to Login
                </button>
              </>
            )}

            {status === "error" && (
              <>
                <div className="flex justify-center mb-6">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold mb-4 text-red-500">Verification Failed</h1>
                <p className="text-zinc-400 mb-6">{message}</p>
                <button
                  onClick={handleGoToLogin}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 rounded text-white font-semibold transition"
                >
                  Go to Login
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 