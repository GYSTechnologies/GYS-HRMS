import { useState } from "react";
import { useAuth } from "../context/AppContext";
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: reset password
  const { requestPasswordReset, verifyOtp, resetPassword } = useAuth();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      await requestPasswordReset(email);
      setSuccess("OTP has been sent to your email");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      await verifyOtp(email, otp);
      setSuccess("OTP verified successfully");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await resetPassword(email, otp, password);
      setSuccess("Password has been reset successfully");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 1) {
      window.location.href = "/login";
    } else {
      setStep(step - 1);
      setError("");
      setSuccess("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-sm w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-[#104774] rounded-full flex items-center justify-center mb-3">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {step === 1 && "Reset Your Password"}
            {step === 2 && "Enter OTP"}
            {step === 3 && "Create New Password"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            {step === 1 && "Enter your email to receive a verification code"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Enter your new password"}
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={goBack}
          className="flex items-center text-xs sm:text-sm text-[#104774] hover:text-[#0d385d] font-medium transition-colors duration-200"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back
        </button>

        {/* Form Container */}
        <div className="bg-white py-4 sm:py-6 px-4 sm:px-6 shadow-lg rounded-lg border border-gray-100">
          <form
            onSubmit={
              step === 1
                ? handleRequestOtp
                : step === 2
                ? handleVerifyOtp
                : handleResetPassword
            }
            className="space-y-4"
          >
            {/* Error Alert */}
            {error && (
              <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-xs text-red-700">{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-xs text-green-700">{success}</span>
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full pl-8 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#104774] focus:border-[#104774] text-xs sm:text-sm transition-colors duration-200"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Step 2: OTP Input */}
            {step === 2 && (
              <div>
                <label
                  htmlFor="otp"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                >
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="6"
                    autoComplete="one-time-code"
                    required
                    className="appearance-none relative block w-full pl-8 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#104774] focus:border-[#104774] text-xs sm:text-sm transition-colors duration-200 tracking-widest text-center"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setOtp(value.slice(0, 6));
                    }}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the 6-digit code sent to {email}
                </p>
              </div>
            )}

            {/* Step 3: Password Inputs */}
            {step === 3 && (
              <>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="appearance-none relative block w-full pl-8 pr-8 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#104774] focus:border-[#104774] text-xs sm:text-sm transition-colors duration-200"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-2 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="appearance-none relative block w-full pl-8 pr-8 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#104774] focus:border-[#104774] text-xs sm:text-sm transition-colors duration-200"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-2 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-[#104774] hover:bg-[#0d385d] focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#104774] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs sm:text-sm">
                      {step === 1
                        ? "Sending OTP..."
                        : step === 2
                        ? "Verifying..."
                        : "Resetting..."}
                    </span>
                  </div>
                ) : (
                  <>
                    {step === 1 && "Send OTP"}
                    {step === 2 && "Verify OTP"}
                    {step === 3 && "Reset Password"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Remember your password?{" "}
            <a
              href="/login"
              className="font-medium text-[#104774] hover:text-[#0d385d] transition-colors duration-200"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
  //     <div className="max-w-md w-full space-y-8">
  //       {/* Header */}
  //       <div className="text-center">
  //         <div className="mx-auto h-16 w-16 bg-[#104774] rounded-full flex items-center justify-center mb-4">
  //           <Lock className="h-8 w-8 text-white" />
  //         </div>
  //         <h2 className="text-3xl font-bold text-gray-900 mb-2">
  //           {step === 1 && "Reset Your Password"}
  //           {step === 2 && "Enter OTP"}
  //           {step === 3 && "Create New Password"}
  //         </h2>
  //         <p className="text-gray-600">
  //           {step === 1 && "Enter your email to receive a verification code"}
  //           {step === 2 && "Enter the 6-digit code sent to your email"}
  //           {step === 3 && "Enter your new password"}
  //         </p>
  //       </div>

  //       {/* Back Button */}
  //       <button
  //         onClick={goBack}
  //         className="flex items-center text-sm text-[#104774] hover:text-[#0d385d] font-medium transition-colors duration-200"
  //       >
  //         <ArrowLeft className="h-4 w-4 mr-1" />
  //         Back
  //       </button>

  //       {/* Form Container */}
  //       <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
  //         <form
  //           onSubmit={
  //             step === 1
  //               ? handleRequestOtp
  //               : step === 2
  //               ? handleVerifyOtp
  //               : handleResetPassword
  //           }
  //           className="space-y-6"
  //         >
  //           {/* Error Alert */}
  //           {error && (
  //             <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
  //               <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
  //               <span className="text-sm text-red-700">{error}</span>
  //             </div>
  //           )}

  //           {/* Success Alert */}
  //           {success && (
  //             <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
  //               <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
  //               <span className="text-sm text-green-700">{success}</span>
  //             </div>
  //           )}

  //           {/* Step 1: Email Input */}
  //           {step === 1 && (
  //             <div>
  //               <label
  //                 htmlFor="email"
  //                 className="block text-sm font-medium text-gray-700 mb-2"
  //               >
  //                 Email address
  //               </label>
  //               <div className="relative">
  //                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
  //                   <Mail className="h-5 w-5 text-gray-400" />
  //                 </div>
  //                 <input
  //                   id="email"
  //                   name="email"
  //                   type="email"
  //                   autoComplete="email"
  //                   required
  //                   className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#104774] focus:border-[#104774] focus:z-10 sm:text-sm transition-colors duration-200"
  //                   placeholder="Enter your email"
  //                   value={email}
  //                   onChange={(e) => setEmail(e.target.value)}
  //                   disabled={loading}
  //                 />
  //               </div>
  //             </div>
  //           )}

  //           {/* Step 2: OTP Input */}
  //           {step === 2 && (
  //             <div>
  //               <label
  //                 htmlFor="otp"
  //                 className="block text-sm font-medium text-gray-700 mb-2"
  //               >
  //                 Verification Code
  //               </label>
  //               <div className="relative">
  //                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
  //                   <Lock className="h-5 w-5 text-gray-400" />
  //                 </div>
  //                 <input
  //                   id="otp"
  //                   name="otp"
  //                   type="text"
  //                   inputMode="numeric"
  //                   pattern="[0-9]*"
  //                   maxLength="6"
  //                   autoComplete="one-time-code"
  //                   required
  //                   className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#104774] focus:border-[#104774] focus:z-10 sm:text-sm transition-colors duration-200 tracking-widest"
  //                   placeholder="Enter 6-digit code"
  //                   value={otp}
  //                   onChange={(e) => {
  //                     const value = e.target.value.replace(/\D/g, "");
  //                     setOtp(value.slice(0, 6));
  //                   }}
  //                   disabled={loading}
  //                 />
  //               </div>
  //               <p className="text-xs text-gray-500 mt-2">
  //                 Enter the 6-digit code sent to {email}
  //               </p>
  //             </div>
  //           )}

  //           {/* Step 3: Password Inputs */}
  //           {step === 3 && (
  //             <>
  //               <div>
  //                 <label
  //                   htmlFor="password"
  //                   className="block text-sm font-medium text-gray-700 mb-2"
  //                 >
  //                   New Password
  //                 </label>
  //                 <div className="relative">
  //                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
  //                     <Lock className="h-5 w-5 text-gray-400" />
  //                   </div>
  //                   <input
  //                     id="password"
  //                     name="password"
  //                     type={showPassword ? "text" : "password"}
  //                     autoComplete="new-password"
  //                     required
  //                     className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#104774] focus:border-[#104774] focus:z-10 sm:text-sm transition-colors duration-200"
  //                     placeholder="Enter new password"
  //                     value={password}
  //                     onChange={(e) => setPassword(e.target.value)}
  //                     disabled={loading}
  //                   />
  //                   <button
  //                     type="button"
  //                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
  //                     onClick={() => setShowPassword(!showPassword)}
  //                     disabled={loading}
  //                   >
  //                     {showPassword ? (
  //                       <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
  //                     ) : (
  //                       <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
  //                     )}
  //                   </button>
  //                 </div>
  //               </div>

  //               <div>
  //                 <label
  //                   htmlFor="confirmPassword"
  //                   className="block text-sm font-medium text-gray-700 mb-2"
  //                 >
  //                   Confirm New Password
  //                 </label>
  //                 <div className="relative">
  //                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
  //                     <Lock className="h-5 w-5 text-gray-400" />
  //                   </div>
  //                   <input
  //                     id="confirmPassword"
  //                     name="confirmPassword"
  //                     type={showConfirmPassword ? "text" : "password"}
  //                     autoComplete="new-password"
  //                     required
  //                     className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#104774] focus:border-[#104774] focus:z-10 sm:text-sm transition-colors duration-200"
  //                     placeholder="Confirm new password"
  //                     value={confirmPassword}
  //                     onChange={(e) => setConfirmPassword(e.target.value)}
  //                     disabled={loading}
  //                   />
  //                   <button
  //                     type="button"
  //                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
  //                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  //                     disabled={loading}
  //                   >
  //                     {showConfirmPassword ? (
  //                       <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
  //                     ) : (
  //                       <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
  //                     )}
  //                   </button>
  //                 </div>
  //               </div>
  //             </>
  //           )}

  //           {/* Submit Button */}
  //           <div>
  //             <button
  //               type="submit"
  //               disabled={loading}
  //               className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#104774] hover:bg-[#0d385d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#104774] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
  //             >
  //               {loading ? (
  //                 <div className="flex items-center space-x-2">
  //                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  //                   <span>
  //                     {step === 1
  //                       ? "Sending OTP..."
  //                       : step === 2
  //                       ? "Verifying..."
  //                       : "Resetting..."}
  //                   </span>
  //                 </div>
  //               ) : (
  //                 <>
  //                   {step === 1 && "Send OTP"}
  //                   {step === 2 && "Verify OTP"}
  //                   {step === 3 && "Reset Password"}
  //                 </>
  //               )}
  //             </button>
  //           </div>
  //         </form>
  //       </div>

  //       {/* Footer */}
  //       <div className="text-center">
  //         <p className="text-sm text-gray-600">
  //           Remember your password?{" "}
  //           <a
  //             href="/login"
  //             className="font-medium text-[#104774] hover:text-[#0d385d] transition-colors duration-200"
  //           >
  //             Sign in
  //           </a>
  //         </p>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default ForgotPassword;