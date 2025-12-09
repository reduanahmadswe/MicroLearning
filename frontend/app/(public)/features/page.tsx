'use client';

import Link from 'next/link';
import {
  BookOpen,
  Rocket,
  Trophy,
  BarChart3,
  Users,
  Shield,
  Sparkles,
  Zap,
  Target,
  Clock,
  Award,
  TrendingUp,
  CheckCircle,
  Play,
  Heart,
  MessageSquare,
  Code,
  Globe,
  Star,
  ArrowRight
} from 'lucide-react';

export default function FeaturesPage() {
  const mainFeatures = [
    {
      icon: <Rocket className="w-12 h-12" />,
      title: 'Micro-Learning Format',
      description: 'Bite-sized lessons designed to fit into your busy schedule. Learn in just 5-10 minutes per lesson.',
      details: [
        'Short, focused lessons that target specific skills',
        'Perfect for on-the-go learning',
        'Complete courses in your own pace',
        'Mobile-optimized for learning anywhere'
      ],
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
    },
    {
      icon: <Trophy className="w-12 h-12" />,
      title: 'Gamification & Rewards',
      description: 'Stay motivated with XP points, badges, achievements, and compete on leaderboards.',
      details: [
        'Earn XP for every lesson completed',
        'Unlock special badges and achievements',
        'Climb global and course-specific leaderboards',
        'Daily streak bonuses to keep you engaged'
      ],
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: 'Progress Tracking',
      description: 'Visualize your learning journey with detailed analytics and progress metrics.',
      details: [
        'Real-time progress tracking',
        'Detailed analytics and insights',
        'Course completion certificates',
        'Visual learning path representation'
      ],
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and experienced educators worldwide.',
      details: [
        'Verified industry experts',
        'Experienced educators and trainers',
        'Regular content updates',
        'Instructor Q&A support'
      ],
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20'
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with interactive quizzes and get instant feedback.',
      details: [
        'Multiple choice and true/false questions',
        'Instant feedback on answers',
        'Detailed explanations for each question',
        'Retake quizzes to improve scores'
      ],
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'
    },
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: 'AI-Powered Learning',
      description: 'Get personalized recommendations and learning paths powered by artificial intelligence.',
      details: [
        'AI-driven course recommendations',
        'Personalized learning paths',
        'Adaptive difficulty levels',
        'Smart content suggestions'
      ],
      color: 'from-teal-500 to-teal-600',
      bgColor: 'from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20'
    }
  ];

  const additionalFeatures = [
    { icon: <Clock className="w-6 h-6" />, title: 'Flexible Schedule', description: 'Learn at your own pace, anytime, anywhere' },
    { icon: <Award className="w-6 h-6" />, title: 'Certificates', description: 'Earn certificates upon course completion' },
    { icon: <MessageSquare className="w-6 h-6" />, title: 'Discussion Forums', description: 'Connect with peers and instructors' },
    { icon: <Code className="w-6 h-6" />, title: 'Coding Exercises', description: 'Practice with interactive coding challenges' },
    { icon: <Globe className="w-6 h-6" />, title: 'Multi-language', description: 'Content available in multiple languages' },
    { icon: <Star className="w-6 h-6" />, title: 'Bookmark Lessons', description: 'Save and revisit your favorite content' },
    { icon: <TrendingUp className="w-6 h-6" />, title: 'Skill Assessment', description: 'Track skill improvement over time' },
    { icon: <Heart className="w-6 h-6" />, title: 'Wishlist', description: 'Save courses you want to take later' }
  ];

  const comparisons = [
    { feature: 'Micro-Lessons', us: true, others: false },
    { feature: 'Gamification', us: true, others: false },
    { feature: 'AI Recommendations', us: true, others: false },
    { feature: 'Progress Analytics', us: true, others: true },
    { feature: 'Mobile App', us: true, others: true },
    { feature: 'Certificates', us: true, others: true },
    { feature: 'Interactive Quizzes', us: true, others: true },
    { feature: 'Lifetime Access', us: true, others: false }
  ];

  return (
    <div className="min-h-screen bg-page-gradient">
      {/* Navigation is handled by global Navbar component */}

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Platform Features
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Master New Skills
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Discover the powerful features that make MicroLearning the most effective way to
            learn new skills and advance your career.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2"
            >
              Try It Free
              <Play className="w-5 h-5" />
            </Link>
            <Link
              href="/courses"
              className="px-8 py-4 border-2 border-border text-muted-foreground rounded-lg hover:border-green-600 hover:text-green-600 dark:hover:text-green-400 transition-all font-semibold"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {mainFeatures.map((feature, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6`}>
                    {feature.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">{feature.title}</h2>
                  <p className="text-lg text-muted-foreground mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className={`w-6 h-6 flex-shrink-0 mt-1 bg-gradient-to-br ${feature.color} text-white rounded-full p-1`} />
                        <span className="text-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className={`bg-gradient-to-br ${feature.bgColor} rounded-3xl p-12 h-96 flex items-center justify-center`}>
                    <div className={`w-48 h-48 bg-gradient-to-br ${feature.color} rounded-full opacity-20`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              And There's
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> More!</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Even more features to enhance your learning experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-xl hover:border-green-300 dark:hover:border-green-700 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> MicroLearning?</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See how we compare to other learning platforms.
            </p>
          </div>

          <div className="bg-card rounded-2xl border-2 border-border/50 overflow-hidden">
            <div className="grid grid-cols-3 bg-gradient-to-r from-green-600 to-teal-600 text-white p-4">
              <div className="text-lg font-bold">Feature</div>
              <div className="text-lg font-bold text-center">MicroLearning</div>
              <div className="text-lg font-bold text-center">Other Platforms</div>
            </div>
            {comparisons.map((item, index) => (
              <div key={index} className={`grid grid-cols-3 p-4 ${index % 2 === 0 ? 'bg-muted/50' : 'bg-card'}`}>
                <div className="font-medium text-foreground">{item.feature}</div>
                <div className="text-center">
                  {item.us ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                  ) : (
                    <span className="text-gray-400">✗</span>
                  )}
                </div>
                <div className="text-center">
                  {item.others ? (
                    <CheckCircle className="w-6 h-6 text-muted-foreground mx-auto" />
                  ) : (
                    <span className="text-muted-foreground/50">✗</span>
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
            Experience These Features Yourself
          </h2>
          <p className="text-xl text-green-50 mb-8">
            Start your free trial today and discover why thousands choose MicroLearning.
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
              Browse Courses
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
