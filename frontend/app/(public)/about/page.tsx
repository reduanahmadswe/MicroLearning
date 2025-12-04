'use client';

import Link from 'next/link';
import {
  BookOpen,
  Users,
  Target,
  Sparkles,
  Heart,
  Globe,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  Star
} from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { icon: <Users className="w-8 h-8" />, value: '5,000+', label: 'Active Students', color: 'from-blue-500 to-blue-600' },
    { icon: <BookOpen className="w-8 h-8" />, value: '150+', label: 'Expert Courses', color: 'from-green-500 to-green-600' },
    { icon: <Award className="w-8 h-8" />, value: '50+', label: 'Certified Instructors', color: 'from-purple-500 to-purple-600' },
    { icon: <Star className="w-8 h-8" />, value: '4.9/5', label: 'Average Rating', color: 'from-yellow-500 to-yellow-600' }
  ];

  const values = [
    {
      icon: <Target className="w-12 h-12" />,
      title: 'Excellence',
      description: 'We strive for excellence in every course, every lesson, and every interaction with our students.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Heart className="w-12 h-12" />,
      title: 'Student First',
      description: 'Our students are at the heart of everything we do. Your success is our success.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: 'Innovation',
      description: 'We continuously innovate to provide the best learning experience using cutting-edge technology.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: 'Accessibility',
      description: 'Quality education should be accessible to everyone, everywhere, at any time.',
      color: 'from-green-500 to-green-600'
    }
  ];

  const milestones = [
    { year: '2020', title: 'Platform Launch', description: 'MicroLearning was founded with a mission to revolutionize online education.' },
    { year: '2021', title: '1,000 Students', description: 'Reached our first thousand active learners across 20 countries.' },
    { year: '2022', title: '50 Courses', description: 'Expanded our course library to cover multiple disciplines and skill levels.' },
    { year: '2023', title: '5,000 Students', description: 'Grew our community to over 5,000 active learners worldwide.' },
    { year: '2024', title: 'AI Integration', description: 'Launched AI-powered personalized learning paths and recommendations.' },
    { year: '2025', title: 'Global Expansion', description: 'Now serving students in over 100 countries with multilingual support.' }
  ];

  const team = [
    { name: 'John Smith', role: 'CEO & Founder', image: '👨‍💼', bio: '15+ years in EdTech' },
    { name: 'Sarah Johnson', role: 'Head of Education', image: '👩‍🏫', bio: 'Former Harvard Professor' },
    { name: 'Michael Chen', role: 'CTO', image: '👨‍💻', bio: 'Ex-Google Engineer' },
    { name: 'Emily Rodriguez', role: 'Head of Content', image: '👩‍🎨', bio: 'Award-winning Educator' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Navigation is handled by global Navbar component */}

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            About MicroLearning
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Transforming Education
            <br />
            <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              One Micro-Lesson at a Time
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            We believe that learning should be accessible, engaging, and fit into your busy life. 
            That's why we've created a platform that delivers bite-sized, high-quality education 
            to learners worldwide.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white mx-auto mb-4`}>
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                To democratize education by making high-quality learning accessible to everyone, 
                everywhere, through innovative micro-learning technology.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Break down complex topics into digestible lessons</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Provide flexible learning that fits any schedule</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Make learning engaging through gamification</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                To become the world's leading micro-learning platform, empowering millions of 
                learners to achieve their goals through personalized, efficient education.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Pioneer AI-powered personalized learning</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Build a global community of lifelong learners</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Set new standards for online education quality</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Core
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do and shape our commitment to excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all">
                <div className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center text-white mb-6`}>
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From a small startup to a global learning platform - here's our story.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-500 to-teal-600 hidden lg:block"></div>

            {/* Timeline Items */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-green-500 hover:shadow-xl transition-all">
                      <div className="inline-block px-4 py-1 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full text-sm font-bold mb-3">
                        {milestone.year}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="hidden lg:block w-6 h-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Leadership Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate educators and technologists dedicated to transforming education.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center border border-gray-200 hover:shadow-xl transition-all">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                  {member.image}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-green-600 font-semibold mb-2">{member.role}</p>
                <p className="text-sm text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-teal-600 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Join Our Learning Community
          </h2>
          <p className="text-xl text-green-50 mb-8">
            Be part of a global movement that's making education accessible to everyone.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-white text-green-600 rounded-lg hover:shadow-2xl transition-all font-semibold flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
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
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 MicroLearning. All rights reserved. Made with ❤️ for learners worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
