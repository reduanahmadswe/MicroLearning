'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  Play,
  ArrowRight,
  Zap,
  Target,
  MessageSquare,
  Trophy,
  Clock,
  Globe,
  Sparkles,
  GraduationCap,
  BarChart3,
  Shield,
  Rocket,
  Heart,
  Code,
  ChevronRight,
  Video
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState({
    totalStudents: 5000,
    instructors: 50,
    completionRate: 92
  });

  useEffect(() => {
    // Fetch real stats if needed
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Add API call here if you have a stats endpoint
  };

  const handleGetStarted = () => {
    if (token && user) {
      if (user.role === 'instructor') {
        router.push('/instructor/dashboard');
      } else if (user.role === 'student') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/auth/register');
    }
  };

  const features = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: 'Interactive Learning',
      description: 'Engage with bite-sized micro-lessons designed for quick, effective learning on the go.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Gamification & Rewards',
      description: 'Earn XP, badges, and climb leaderboards. Make learning fun and competitive!',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Track Your Progress',
      description: 'Visualize your learning journey with detailed analytics and progress tracking.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and experienced educators worldwide.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Quiz & Assessments',
      description: 'Test your knowledge with interactive quizzes and get instant feedback.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'AI-Powered Learning',
      description: 'Get personalized learning paths and recommendations powered by AI.',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Developer',
      image: '👩‍💻',
      rating: 5,
      text: 'MicroLearning transformed how I learn. The bite-sized lessons fit perfectly into my busy schedule!'
    },
    {
      name: 'Ahmed Rahman',
      role: 'Business Analyst',
      image: '👨‍💼',
      rating: 5,
      text: 'The gamification features keep me motivated. I\'ve completed 10 courses in just 3 months!'
    },
    {
      name: 'Maria Garcia',
      role: 'Marketing Manager',
      image: '👩‍🎓',
      rating: 5,
      text: 'Best investment in my career! The instructors are top-notch and content is always up-to-date.'
    }
  ];

  const services = [
    {
      icon: <Code className="w-12 h-12" />,
      title: 'Programming Courses',
      description: 'Master coding languages from basics to advanced concepts',
      courses: '50+ Courses'
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: 'Business & Marketing',
      description: 'Grow your business skills and marketing expertise',
      courses: '40+ Courses'
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: 'Language Learning',
      description: 'Learn new languages with interactive micro-lessons',
      courses: '30+ Courses'
    },
    {
      icon: <GraduationCap className="w-12 h-12" />,
      title: 'Personal Development',
      description: 'Enhance soft skills and personal growth',
      courses: '35+ Courses'
    }
  ];

  return (
    <div className="min-h-screen bg-page-gradient">
      {/* Navigation is handled by global Navbar component */}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 sm:py-12 lg:py-20 bg-page-gradient">
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-64 h-64 sm:w-96 sm:h-96 bg-green-100/30 dark:bg-green-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-teal-100/30 dark:bg-teal-900/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-full text-xs sm:text-sm font-medium shadow-sm">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <span className="text-green-700 dark:text-green-400">#1 Micro Learning Platform</span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gray-900 dark:text-white">Master </span>
                <span className="text-green-600 dark:text-green-500">New Skills</span>
                <br />
                <span className="text-gray-900 dark:text-white">In </span>
                <span className="text-green-600 dark:text-green-500">Bite-Sized</span>
                <br />
                <span className="text-green-600 dark:text-green-500">Micro Lessons</span>
              </h1>
              
              {/* Description */}
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
                Master new skills with bite-sized lessons designed for busy professionals. Learn anytime, anywhere with our gamified micro-learning platform powered by AI.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={handleGetStarted}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Get Started
                </button>
                <button
                  onClick={() => router.push('/courses')}
                  className="px-6 py-3 sm:px-8 sm:py-4 border-2 border-green-600 text-green-600 dark:text-green-500 dark:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-semibold transition-all text-sm sm:text-base"
                >
                  Get free trial
                </button>
              </div>
              
              {/* Features */}
              <div className="flex flex-wrap gap-4 sm:gap-6 lg:gap-8 pt-2 sm:pt-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Quick Learning</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 dark:text-pink-500" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Gamified Learning</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-500" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered</span>
                </div>
              </div>
              
              
            </div>

            {/* Right Content - Hero Image with Stats */}
            <div className="relative flex items-center justify-center mt-8 lg:mt-0">
              {/* Main circular background */}
              <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-square mx-auto">
                {/* Green circular background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full"></div>
                
                {/* Hero Image */}
                <div className="absolute inset-0 flex items-end justify-center overflow-hidden rounded-full">
                  <img
                    src="https://img.freepik.com/free-photo/young-smiling-pretty-caucasian-schoolgirl-wearing-glasses-back-bag-points-side-with-hand-holding-books-green-with-copy-space_141793-62821.jpg?semt=ais_hybrid&w=740&q=80"
                    alt="Happy student with books"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                
                {/* Micro Lessons Card */}
                <div className="absolute top-1/3 -left-4 sm:-left-6 lg:-left-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 shadow-xl border border-gray-100 dark:border-gray-700 animate-float">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">1K+</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Micro Lessons</div>
                    </div>
                  </div>
                </div>
                
                {/* Active Students Card */}
                <div className="absolute top-12 sm:top-14 lg:top-16 -right-4 sm:-right-6 lg:-right-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 shadow-xl border border-gray-100 dark:border-gray-700 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Active Students</div>
                    </div>
                  </div>
                </div>
                
                {/* Instructors Card */}
                <div className="absolute bottom-12 sm:bottom-14 lg:bottom-16 -right-2 sm:-right-3 lg:-right-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 shadow-xl border border-gray-100 dark:border-gray-700 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Instructors</div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.instructors}+</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Partner Logos */}
          <div className="mt-12 sm:mt-16 lg:mt-20 pt-8 sm:pt-10 lg:pt-12 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 xl:gap-12 opacity-60">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-400 dark:text-gray-600">Coursera</div>
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-400 dark:text-gray-600">Udemy</div>
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-400 dark:text-gray-600">EdX</div>
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-400 dark:text-gray-600">Khan Academy</div>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Platform Features
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform is packed with features designed to make learning engaging, effective, and fun.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-card to-background rounded-2xl p-8 border border-border hover:border-primary/50 hover:shadow-xl transition-all"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                About Us
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Revolutionizing
                <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Online Learning</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                MicroLearning was founded with a simple mission: make quality education accessible to everyone,
                everywhere. We believe that learning should be flexible, engaging, and fit into your busy life.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our bite-sized lessons are designed by experts and delivered through an innovative gamified
                platform that keeps you motivated and on track to achieve your goals.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <Target className="w-8 h-8 text-green-600 dark:text-green-500 mb-3" />
                  <h4 className="font-bold text-foreground mb-2">Our Mission</h4>
                  <p className="text-sm text-muted-foreground">Empower learners worldwide with accessible education</p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-500 mb-3" />
                  <h4 className="font-bold text-foreground mb-2">Our Vision</h4>
                  <p className="text-sm text-muted-foreground">Transform learning through innovation and technology</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
                    <Clock className="w-12 h-12 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">5-10 min</h3>
                    <p className="text-blue-100">Average Lesson Time</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white">
                    <Award className="w-12 h-12 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">10K+</h3>
                    <p className="text-green-100">Certificates Issued</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white">
                    <Star className="w-12 h-12 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">4.9/5</h3>
                    <p className="text-purple-100">Average Rating</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
                    <TrendingUp className="w-12 h-12 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">98%</h3>
                    <p className="text-orange-100">Student Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              What We Offer
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Explore Our
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Course Categories</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from a wide range of subjects taught by industry experts and passionate educators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-card to-background rounded-2xl p-8 border-2 border-border hover:border-primary hover:shadow-xl transition-all text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-500 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-500">
                  {service.courses}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium mb-4">
              <MessageSquare className="w-4 h-4" />
              Student Success Stories
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              What Our
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Students Say</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied learners who have transformed their careers with MicroLearning.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-8 border border-border hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground/80 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-teal-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
            Join over 5,000 students already learning with MicroLearning. Get started today with our free plan!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-white text-green-600 rounded-lg hover:shadow-2xl transition-all font-semibold flex items-center gap-2"
            >
              Start Learning Now
              <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              href="/courses"
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-green-600 transition-all font-semibold"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">MicroLearning</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering learners worldwide with bite-sized, engaging micro-lessons.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                  <span className="sr-only">Facebook</span>
                  📘
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                  <span className="sr-only">Twitter</span>
                  🐦
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  💼
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/courses" className="hover:text-green-500 transition-colors">Browse Courses</Link></li>
                <li><Link href="#about" className="hover:text-green-500 transition-colors">About Us</Link></li>
                <li><Link href="#features" className="hover:text-green-500 transition-colors">Features</Link></li>
                <li><Link href="#testimonials" className="hover:text-green-500 transition-colors">Testimonials</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-green-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-white font-bold mb-4">Stay Updated</h3>
              <p className="text-gray-400 mb-4">Subscribe to get latest courses and updates.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 MicroLearning. All rights reserved. Made with ❤️ for learners worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
