'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  CreditCard,
  MessageSquare,
  Users,
  Trophy,
  Award,
  Target,
  TrendingUp,
  Map,
  Video,
  Bot,
  Home,
  Menu,
  X,
  LogOut,
  User,
  Bookmark,
  ShoppingBag,
  Shield,
  FileText,
  Settings,
  BarChart3,
  DollarSign,
  Bell,
  HelpCircle,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import NotificationBell from './NotificationBell';

// Public navigation items (when not logged in)
const publicNavItems = [
  { name: 'Features', path: '/features', icon: Zap },
  { name: 'Courses', path: '/courses', icon: GraduationCap },
  { name: 'About', path: '/about', icon: BookOpen },
  { name: 'Contact', path: '/contact', icon: MessageSquare },
];

// Role-based navigation items - Main navbar (important items only)
const roleBasedNavItems = {
  learner: [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Courses', path: '/courses', icon: GraduationCap },
    { name: 'Lessons', path: '/lessons', icon: BookOpen },
    { name: 'Quiz', path: '/quiz', icon: CreditCard },
    { name: 'AI Tutor', path: '/ai-tutor', icon: Bot },
    { name: 'Forum', path: '/forum', icon: MessageSquare },
  ],
  instructor: [
    { name: 'Dashboard', path: '/instructor', icon: Home },
    { name: 'My Courses', path: '/instructor/courses', icon: GraduationCap },
    { name: 'Lessons', path: '/instructor/lessons', icon: BookOpen },
    { name: 'Students', path: '/instructor/students', icon: Users },
    { name: 'Analytics', path: '/instructor/analytics', icon: BarChart3 },
  ],
  admin: [
    { name: 'Dashboard', path: '/admin', icon: Shield },
    { name: 'Content', path: '/admin/content', icon: BookOpen },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'System', path: '/admin/system', icon: Settings },
  ],
};

// Additional menu items for profile dropdown
const additionalMenuItems = {
  learner: [
    { name: 'Flashcards', path: '/flashcards', icon: FileText },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'Videos', path: '/videos', icon: Video },
    { name: 'Leaderboard', path: '/leaderboard', icon: TrendingUp },
    { name: 'Badges', path: '/badges', icon: Award },
    { name: 'Friends', path: '/friends', icon: Users },
    { name: 'Challenges', path: '/challenges', icon: Trophy },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { name: 'Analytics', path: '/analytics', icon: Target },
    { name: 'Roadmap', path: '/roadmap', icon: Map },
  ],
  instructor: [
    { name: 'Quizzes', path: '/instructor/quizzes', icon: CreditCard },
    { name: 'Forum', path: '/forum', icon: MessageSquare },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
  ],
  admin: [
    { name: 'Marketplace', path: '/admin/marketplace', icon: DollarSign },
    { name: 'Badges', path: '/admin/badges', icon: Award },
    { name: 'Challenges', path: '/admin/challenges', icon: Trophy },
  ],
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Get navigation items based on user role or show public nav
  const navItems = useMemo(() => {
    if (!user) {
      return publicNavItems;
    }
    const role = user?.role?.toLowerCase() || 'learner';
    return roleBasedNavItems[role as keyof typeof roleBasedNavItems] || roleBasedNavItems.learner;
  }, [user]);

  // Get additional items for profile dropdown
  const additionalItems = useMemo(() => {
    const role = user?.role?.toLowerCase() || 'learner';
    return additionalMenuItems[role as keyof typeof additionalMenuItems] || [];
  }, [user?.role]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    // Force redirect to home page
    window.location.href = '/home';
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Don't show navbar on auth pages
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  // Get role-specific styling
  const getRoleColor = () => {
    const role = user?.role?.toLowerCase();
    if (role === 'admin') return 'from-red-600 to-orange-600';
    if (role === 'instructor') return 'from-green-600 to-teal-600';
    return 'from-blue-600 to-purple-600';
  };

  const getRoleBgColor = () => {
    const role = user?.role?.toLowerCase();
    if (role === 'admin') return 'bg-red-50 text-red-600';
    if (role === 'instructor') return 'bg-green-50 text-green-600';
    return 'bg-blue-50 text-blue-600';
  };

  const getRoleLabel = () => {
    const role = user?.role?.toLowerCase();
    if (role === 'admin') return 'Admin';
    if (role === 'instructor') return 'Instructor';
    return 'Learner';
  };

  // Get role-specific menu items
  const getProfileMenuItems = () => {
    const role = user?.role?.toLowerCase();
    const commonItems = [
      { icon: User, label: 'My Profile', path: '/profile' },
      { icon: Settings, label: 'Settings', path: '/settings' },
      { icon: HelpCircle, label: 'Help & Support', path: '/help' },
    ];

    if (role === 'instructor') {
      return [
        { icon: BarChart3, label: 'My Dashboard', path: '/instructor' },
        { icon: GraduationCap, label: 'My Courses', path: '/instructor/courses' },
        ...commonItems,
      ];
    }

    if (role === 'admin') {
      return [
        { icon: Shield, label: 'Admin Panel', path: '/admin' },
        { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
        ...commonItems,
      ];
    }

    return [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Trophy, label: 'My Achievements', path: '/badges' },
      ...commonItems,
    ];
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href={user ? "/dashboard" : "/home"} className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor()} rounded-lg flex items-center justify-center shadow-md`}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className={`text-xl font-bold bg-gradient-to-r ${getRoleColor()} bg-clip-text text-transparent`}>
                  MicroLearning
                </span>
                {user && <p className="text-[10px] text-gray-500 -mt-1">{getRoleLabel()} Portal</p>}
              </div>
            </Link>

            {/* Desktop Navigation - Important items with names visible */}
            <div className="hidden lg:flex items-center gap-2 flex-1 justify-center max-w-4xl px-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      active
                        ? `${getRoleBgColor()} shadow-sm`
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Real-time Notifications */}
                  <div className="hidden md:block">
                    <NotificationBell />
                  </div>

                  {/* Profile Dropdown */}
                  <div className="hidden md:block relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                    >
                      <div className={`w-9 h-9 bg-gradient-to-br ${getRoleColor()} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white`}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm text-left max-w-[120px]">
                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getRoleBgColor()}`}>
                          {getRoleLabel()}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in slide-in-from-top-2">
                        {/* Profile Header */}
                        <div className={`px-5 py-4 bg-gradient-to-br ${getRoleColor()} text-white`}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/50">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white truncate">{user.name}</p>
                              <p className="text-xs text-white/80 truncate">{user.email}</p>
                            </div>
                          </div>
                          
                          {/* Level & XP Info */}
                          <div className="space-y-2">
                            {user.level && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1 text-white/90">
                                  <Zap className="w-4 h-4" />
                                  Level
                                </span>
                                <span className="font-bold text-white">{user.level}</span>
                              </div>
                            )}
                            
                            {user.xp && (
                              <div>
                                <div className="flex justify-between text-xs text-white/90 mb-1">
                                  <span>Experience Points</span>
                                  <span className="font-semibold">{user.xp} XP</span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-white/90 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((user.xp % 1000) / 10, 100)}%` }}
                                  ></div>
                                </div>
                                <p className="text-[10px] text-white/70 mt-1">
                                  {1000 - (user.xp % 1000)} XP to next level
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Additional Navigation Items */}
                        {additionalItems.length > 0 && (
                          <>
                            <div className="px-5 py-2 border-t border-gray-100">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">More Options</p>
                            </div>
                            <div className="py-2 max-h-60 overflow-y-auto scrollbar-hide">
                              {additionalItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setProfileDropdownOpen(false)}
                                    className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors group"
                                  >
                                    <Icon className={`w-4 h-4 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    <span className={`text-sm ${isActive(item.path) ? 'font-semibold text-blue-600' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                      {item.name}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </>
                        )}

                        {/* Menu Items */}
                        <div className="py-2 border-t border-gray-100">
                          {getProfileMenuItems().map((item, index) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setProfileDropdownOpen(false)}
                                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
                              >
                                <div className={`w-8 h-8 rounded-lg ${getRoleBgColor()} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>

                        {/* Logout Section */}
                        <div className="border-t border-gray-100 p-2">
                          <button
                            onClick={() => {
                              handleLogout();
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-all text-red-600 hover:text-red-700 font-medium group"
                          >
                            <LogOut className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
                            <span className="text-sm">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                      Login
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg">
                      Sign Up Free
                    </button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-50 bg-white overflow-y-auto">
          <div className="px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {user ? (
              <>
                <div className="border-t border-gray-200 my-4"></div>
                
                {/* Mobile Profile Section */}
                <div className="px-4 py-3 bg-gray-50 rounded-lg mx-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getRoleColor()} rounded-full flex items-center justify-center text-white font-bold`}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getRoleBgColor()}`}>
                        {getRoleLabel()}
                      </span>
                    </div>
                  </div>
                  {user.xp && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>XP Progress</span>
                        <span>{user.xp} XP</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${getRoleColor()}`}
                          style={{ width: `${Math.min((user.xp % 1000) / 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Profile Menu Items */}
                <div className="px-4 py-2 space-y-1">
                  {getProfileMenuItems().map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Icon className="w-5 h-5 text-gray-500" />
                        <span className="text-base text-gray-700">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Logout */}
                <div className="px-4 mt-2">
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 my-4"></div>
                {/* Mobile Auth Buttons */}
                <div className="px-4 space-y-2">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors">
                      <User className="w-5 h-5" />
                      <span>Login</span>
                    </button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-white bg-gradient-to-r from-green-600 to-teal-600 hover:opacity-90 transition-opacity shadow-md">
                      <GraduationCap className="w-5 h-5" />
                      <span>Sign Up Free</span>
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
