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
  Star,
  Linkedin,
  Twitter,
  Github,
  Mail
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
    { 
      name: 'Reduan Ahmad', 
      role: 'CEO & Founder', 
      image: 'https://avatars.githubusercontent.com/u/143122014?v=4', 
      bio: '3+ years in EdTech',
      socials: {
        linkedin: 'https://linkedin.com/in/reduanahmadswe',
        twitter: 'https://twitter.com/reduanahmadswe',
        github: 'https://github.com/reduanahmadswe',
        email: 'reduanahmadswe@gmail.com'
      }
    },
    { 
      name: 'Mohammad Ali Nayeem', 
      role: 'Co-Founder & Managing Director', 
      image: 'https://avatars.githubusercontent.com/u/85398213?v=4', 
      bio: 'Visionary Leader in Education',
      socials: {
        linkedin: 'https://linkedin.com/in/mohammadalinayeem',
        twitter: 'https://twitter.com',
        email: 'nayeem@microlearning.com'
      }
    },
    { 
      name: 'Fatema Akter', 
      role: 'Head of Education', 
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', 
      bio: 'Former DU Professor',
      socials: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        email: 'fatema@microlearning.com'
      }
    },
    { 
      name: 'Abdullah Al Noman', 
      role: 'CTO', 
      image: 'https://avatars.githubusercontent.com/u/141672697?v=4', 
      bio: 'Building the Future of EdTech',
      socials: {
        linkedin: 'https://linkedin.com/in/abdullahalnoman',
        github: 'https://github.com/abdullahalnoman003',
        twitter: 'https://twitter.com/abdullahalnoman',
        email: 'noman@microlearning.com'
      }
    },
    { 
      name: 'Nusrat Jahan', 
      role: 'Head of Content', 
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', 
      bio: 'Award-winning Educator',
      socials: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        email: 'nusrat@microlearning.com'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-page-gradient">
      {/* Navigation is handled by global Navbar component */}

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            About MicroLearning
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Transforming Education
            <br />
            <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              One Micro-Lesson at a Time
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            We believe that learning should be accessible, engaging, and fit into your busy life.
            That's why we've created a platform that delivers bite-sized, high-quality education
            to learners worldwide.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white mx-auto mb-4`}>
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-3xl p-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                To democratize education by making high-quality learning accessible to everyone,
                everywhere, through innovative micro-learning technology.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <span className="text-foreground/80">Break down complex topics into digestible lessons</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <span className="text-foreground/80">Provide flexible learning that fits any schedule</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <span className="text-foreground/80">Make learning engaging through gamification</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-3xl p-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Vision</h2>
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                To become the world's leading micro-learning platform, empowering millions of
                learners to achieve their goals through personalized, efficient education.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                  <span className="text-foreground/80">Pioneer AI-powered personalized learning</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                  <span className="text-foreground/80">Build a global community of lifelong learners</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                  <span className="text-foreground/80">Set new standards for online education quality</span>
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
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Our Core
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Values</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do and shape our commitment to excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-card rounded-2xl p-8 border border-border/50 hover:shadow-xl transition-all">
                <div className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center text-white mb-6`}>
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Our
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Journey</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              From a small startup to a global learning platform - here's our story.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line - Hidden on mobile, shown on large screens */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-500 to-teal-600 hidden lg:block"></div>

            {/* Timeline Items */}
            <div className="space-y-6 sm:space-y-8 md:space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center gap-4 sm:gap-6 md:gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'} text-left`}>
                    <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-border/50 hover:border-green-500 hover:shadow-xl transition-all">
                      <div className="inline-block px-3 py-1 sm:px-4 sm:py-1 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full text-xs sm:text-sm font-bold mb-2 sm:mb-3">
                        {milestone.year}
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2">{milestone.title}</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="hidden lg:block w-6 h-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-full border-4 border-white dark:border-gray-900 shadow-lg z-10"></div>
                  <div className="hidden lg:block flex-1"></div>
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
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Meet Our
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Leadership Team</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Passionate educators and technologists dedicated to transforming education.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 text-center border border-border/50 hover:shadow-xl transition-all group flex flex-col h-full">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-green-500/20 group-hover:ring-green-500/40 transition-all">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-green-600 dark:text-green-400 font-semibold mb-2 text-sm min-h-[2.5rem]">{member.role}</p>
                <p className="text-xs text-muted-foreground mb-4 flex-grow">{member.bio}</p>
                
                {/* Social Media Links */}
                <div className="flex items-center justify-center gap-2 pt-3 border-t border-border/50 mt-auto">
                  {member.socials?.linkedin && (
                    <a 
                      href={member.socials.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.socials?.twitter && (
                    <a 
                      href={member.socials.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {member.socials?.github && (
                    <a 
                      href={member.socials.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {member.socials?.email && (
                    <a 
                      href={`mailto:${member.socials.email}`}
                      className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
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
