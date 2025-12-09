"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  GraduationCap,
  BookOpen,
  Trophy,
  Target,
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Shield,
  Clock,
  Users,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };



  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/google-login", {
        idToken: credentialResponse.credential
      });
      const { data } = response.data;

      const userData = {
        _id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        profilePicture: data.user.profilePicture,
        xp: data.user.xp || 0,
        level: data.user.level || 1,
        streak: data.user.streak || 0,
      };

      login(userData, data.accessToken);
      toast.success("Account created & Login successful!");

      if (data.user.role === 'admin') {
        router.push("/admin");
      } else if (data.user.role === 'instructor') {
        router.push("/instructor");
      } else {
        router.push("/dashboard");
      }

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Google Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await api.post("/auth/register", registerData);

      toast.success("🎉 Account created successfully! Please login.");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 33, label: "Weak", color: "bg-red-500" };
    if (password.length < 10) return { strength: 66, label: "Medium", color: "bg-yellow-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">

        {/* Left Side - Branding & Benefits (Hidden on mobile, visible on lg+) */}
        <div className="hidden lg:flex flex-col gap-8 animate-in slide-in-from-left duration-700">
          {/* Logo & Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  MicroLearning
                </h1>
                <p className="text-gray-600 font-medium">Learn Smarter, Not Harder</p>
              </div>
            </div>

            <p className="text-xl text-gray-700 leading-relaxed">
              Join thousands of students who are mastering new skills through bite-sized, interactive lessons designed for the modern learner.
            </p>
          </div>

          {/* Benefits Highlights */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Start Your Learning Journey Today</h2>

            <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Free Access to 1000+ Courses</h3>
                <p className="text-sm text-gray-600">Learn programming, design, business, and more</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-teal-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Earn Certificates & Badges</h3>
                <p className="text-sm text-gray-600">Showcase your achievements to employers</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Learn at Your Own Pace</h3>
                <p className="text-sm text-gray-600">5-10 minute lessons that fit your schedule</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">AI-Powered Personalization</h3>
                <p className="text-sm text-gray-600">Get customized learning paths and instant help</p>
              </div>
            </div>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/80 rounded-xl border border-green-100 shadow-sm">
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">10K+</p>
              <p className="text-xs text-gray-600 font-medium mt-1">Active Students</p>
            </div>
            <div className="text-center p-4 bg-white/80 rounded-xl border border-teal-100 shadow-sm">
              <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">1000+</p>
              <p className="text-xs text-gray-600 font-medium mt-1">Courses</p>
            </div>
            <div className="text-center p-4 bg-white/80 rounded-xl border border-emerald-100 shadow-sm">
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">50K+</p>
              <p className="text-xs text-gray-600 font-medium mt-1">Certificates</p>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full animate-in slide-in-from-right duration-700">
          {/* Mobile Logo (visible only on mobile) */}
          <div className="lg:hidden mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                MicroLearning
              </h1>
            </div>
            <p className="text-sm text-gray-600">Join 10,000+ students learning smarter</p>
          </div>

          {/* Registration Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Card Header with Gradient */}
            <div className="bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 px-4 sm:px-8 py-6 sm:py-8 text-white">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Create Your Account</h2>
              <p className="text-sm sm:text-base text-green-50">Start your free learning journey today!</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-4 sm:px-8 py-6 sm:py-8 space-y-4 sm:space-y-5">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: "" });
                    }}
                    disabled={isLoading}
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-4 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${errors.name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                      }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors({ ...errors, email: "" });
                    }}
                    disabled={isLoading}
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-4 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setErrors({ ...errors, password: "" });
                    }}
                    disabled={isLoading}
                    className={`w-full pl-12 pr-12 py-3 sm:py-4 bg-white border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-4 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      setErrors({ ...errors, confirmPassword: "" });
                    }}
                    disabled={isLoading}
                    className={`w-full pl-12 pr-12 py-3 sm:py-4 bg-white border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-4 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${errors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                  <p className="text-xs sm:text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Passwords match!
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 text-white font-bold py-3 sm:py-4 px-6 rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm sm:text-base mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Your Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="mt-4 w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => toast.error("Google Signup Failed")}
                  theme="outline"
                  size="large"
                  width="100%"
                  text="signup_with"
                  shape="circle"
                />
              </div>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">Already have an account?</span>
                </div>
              </div>

              {/* Sign In Link */}
              <Link href="/auth/login">
                <button
                  type="button"
                  className="w-full bg-white text-green-600 font-bold py-3 sm:py-4 px-6 rounded-xl border-2 border-green-600 hover:bg-green-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <span>Sign In to Existing Account</span>
                  <Users className="w-5 h-5" />
                </button>
              </Link>
            </form>

            {/* Footer Note */}
            <div className="px-4 sm:px-8 pb-6 sm:pb-8 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-green-600 hover:underline font-medium">
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-green-600 hover:underline font-medium">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Mobile Stats (visible only on mobile) */}
          <div className="lg:hidden mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="text-center p-3 sm:p-4 bg-white rounded-xl border border-green-100 shadow-sm">
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">10K+</p>
              <p className="text-[10px] sm:text-xs text-gray-600 font-medium mt-1">Students</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white rounded-xl border border-teal-100 shadow-sm">
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">1000+</p>
              <p className="text-[10px] sm:text-xs text-gray-600 font-medium mt-1">Courses</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white rounded-xl border border-emerald-100 shadow-sm">
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">50K+</p>
              <p className="text-[10px] sm:text-xs text-gray-600 font-medium mt-1">Certificates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
