import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function VerifyNotice() {
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
            <div className="inline-block mb-4">
              <div className="relative px-3 py-1 text-sm font-medium rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="relative z-10">Email Verification Required</span>
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Please Verify Your Email</h1>
            <p className="text-zinc-400 mb-6">
              We've sent a verification link to your email address.<br />
              Please check your inbox and click the link to activate your account.
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 rounded text-white font-semibold transition"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 