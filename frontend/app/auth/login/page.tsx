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
  Award, 
  Users, 
  Zap,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      console.log('Login response:', response.data);
      const { data } = response.data;
      
      // Backend returns: { user: {id, email, name, role, xp, level, streak}, accessToken, refreshToken }
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
      
      console.log('Calling login with:', userData, 'token:', data.accessToken);
      login(userData, data.accessToken);
      
      // Verify token was stored
      setTimeout(() => {
        const storedToken = localStorage.getItem('token');
        const storeState = useAuthStore.getState();
        console.log('After login - localStorage token:', storedToken);
        console.log('After login - store state:', storeState);
      }, 100);
      
      // Redirect based on user role
      if (data.user.role === 'admin') {
        toast.success("Welcome Admin!");
        router.push("/admin");
      } else if (data.user.role === 'instructor') {
        toast.success("Welcome Instructor!");
        router.push("/instructor");
      } else {
        toast.success("Login successful!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
        
        {/* Left Side - Branding & Features (Hidden on mobile, visible on lg+) */}
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
              Welcome back to your personalized learning journey! Continue growing your skills with bite-sized lessons designed for students.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Students Love MicroLearning</h2>
            
            <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Bite-Sized Lessons</h3>
                <p className="text-sm text-gray-600">Learn in 5-10 minute chunks that fit your busy schedule</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-teal-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Earn Certificates & Badges</h3>
                <p className="text-sm text-gray-600">Get recognized for your achievements and skills</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Learn with Friends</h3>
                <p className="text-sm text-gray-600">Join a community of 10,000+ students worldwide</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">AI-Powered Tutoring</h3>
                <p className="text-sm text-gray-600">Get instant help with your personalized AI tutor</p>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl text-white shadow-xl">
            <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg">Trusted by 10,000+ Students</p>
              <p className="text-sm text-green-50">Join the fastest-growing learning platform</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
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
            <p className="text-sm text-gray-600">Learn Smarter, Not Harder</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Card Header with Gradient */}
            <div className="bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 px-4 sm:px-8 py-6 sm:py-8 text-white">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Welcome Back!</h2>
              <p className="text-sm sm:text-base text-green-50">Sign in to continue your learning journey</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-4 sm:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  />
                </div>
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
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 text-white font-bold py-3 sm:py-4 px-6 rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to MicroLearning</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">New to MicroLearning?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <Link href="/auth/register">
                <button
                  type="button"
                  className="w-full bg-white text-green-600 font-bold py-3 sm:py-4 px-6 rounded-xl border-2 border-green-600 hover:bg-green-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <span>Create Free Account</span>
                  <GraduationCap className="w-5 h-5" />
                </button>
              </Link>
            </form>

            {/* Footer Note */}
            <div className="px-4 sm:px-8 pb-6 sm:pb-8 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                By signing in, you agree to our{" "}
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

          {/* Mobile Trust Badge */}
          <div className="lg:hidden mt-6 flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl sm:rounded-2xl text-white shadow-lg">
            <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
            <div className="text-left">
              <p className="font-bold text-sm sm:text-base">Trusted by 10,000+ Students</p>
              <p className="text-xs sm:text-sm text-green-50">Join the fastest-growing learning platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
