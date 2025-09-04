import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader, ArrowRight } from "lucide-react";
import ApiService from "../services/api";

export default function Verify() {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const hasVerified = useRef(false); // Prevent duplicate verification calls

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent duplicate calls (React Strict Mode runs effects twice)
      if (hasVerified.current) {
        console.log('🔄 Verification already attempted, skipping...');
        return;
      }
      
      hasVerified.current = true;
      
      try {
        // Get token from URL params or query parameters
        const token = paramToken || searchParams.get('token');
        
        console.log('🔍 Attempting verification with token:', token);
        
        if (!token) {
          setStatus("error");
          setMessage("No verification token provided. Please check your email link.");
          return;
        }

        // Call the API service for verification
        console.log('📡 Making API call to verify email...');
        const response = await ApiService.verifyEmail(token);
        
        console.log('📊 Full API response:', response);
        console.log('✅ Response success property:', response.success);
        console.log('📝 Response message:', response.message);
        console.log('👤 Response user:', response.user);

        // Check for success more thoroughly
        if (response && (response.success === true || response.success === "true")) {
          setStatus("success");
          setMessage(response.message || "Email verified successfully! Your account is now active.");
          setUserInfo(response.user);
          console.log('✅ Email verified successfully:', response.user);
        } else {
          console.log('❌ Verification response indicates failure');
          setStatus("error");
          setMessage(response.message || response.error || "Verification failed. Please try again.");
        }
      } catch (error) {
        console.error('❌ Verification error:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        setStatus("error");
        setMessage(error.message || "Network error occurred. Please try again.");
      }
    };

    verifyEmail();
  }, [paramToken, searchParams]);

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleGoToDashboard = () => {
    navigate("/user-dashboard");
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
                  <CheckCircle className="w-20 h-20 text-green-500" />
                </div>
                <h1 className="text-4xl font-bold mb-4 text-green-500">🎉 Verification Complete!</h1>
                <p className="text-green-400 mb-2 font-semibold">{message}</p>
                {userInfo && (
                  <p className="text-zinc-300 mb-6">Welcome to SDG Wheel, <span className="font-bold text-green-400">{userInfo.username}</span>! Your account is now fully activated.</p>
                )}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                  <p className="text-green-300 text-sm">
                    ✅ Your email has been successfully verified<br/>
                    ✅ Your account is now active<br/>
                    ✅ You can now access all features
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleGoToDashboard}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 rounded-lg text-white font-semibold transition flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/25"
                  >
                    Start Exploring Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleGoToLogin}
                    className="w-full px-6 py-2 border border-green-600 hover:border-green-500 rounded-lg text-green-300 hover:text-green-200 font-semibold transition"
                  >
                    Go to Login Page
                  </button>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="flex justify-center mb-6">
                  <XCircle className="w-16 h-16 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4 text-red-500">Verification Issue</h1>
                <p className="text-zinc-400 mb-6">{message}</p>
                
                {/* Show different content based on the error message */}
                {message.includes("already been verified") ? (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                    <p className="text-blue-300 text-sm">
                      ℹ️ Your account is already verified and ready to use!
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                    <p className="text-red-300 text-sm">
                      Please try the following:<br/>
                      • Check if you used the latest verification email<br/>
                      • Make sure you copied the complete link<br/>
                      • Try logging in - your account might already be verified
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <button
                    onClick={handleGoToLogin}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 rounded-lg text-white font-semibold transition"
                  >
                    Try Logging In
                  </button>
                  <p className="text-sm text-zinc-500">
                    Still having issues? Contact support or try registering again.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 