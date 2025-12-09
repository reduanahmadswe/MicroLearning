'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  CheckCircle,
  HelpCircle,
  Users,
  Headphones
} from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  const contactMethods = [
    {
      icon: <Mail className="w-8 h-8" />,
      title: 'Email Us',
      description: 'Our team will respond within 24 hours',
      value: 'support@microlearning.com',
      link: 'mailto:support@microlearning.com',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: 'Call Us',
      description: 'Mon-Fri from 8am to 6pm',
      value: '+1 (555) 123-4567',
      link: 'tel:+15551234567',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Visit Us',
      description: 'Our office headquarters',
      value: '123 Learning Street, Education City, EC 12345',
      link: '#',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Live Chat',
      description: 'Available 24/7 for instant support',
      value: 'Start Chat',
      link: '#',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const faq = [
    {
      question: 'How do I get started?',
      answer: 'Simply sign up for a free account and start browsing our course catalog. You can enroll in courses instantly!'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers. All payments are secure and encrypted.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'Yes! We offer a 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.'
    },
    {
      question: 'Do you offer certificates?',
      answer: 'Yes, you receive a verified certificate upon completing each course that you can share on LinkedIn and your resume.'
    }
  ];

  const socialLinks = [
    { icon: <Facebook className="w-6 h-6" />, name: 'Facebook', link: '#', color: 'hover:text-blue-600' },
    { icon: <Twitter className="w-6 h-6" />, name: 'Twitter', link: '#', color: 'hover:text-sky-500' },
    { icon: <Linkedin className="w-6 h-6" />, name: 'LinkedIn', link: '#', color: 'hover:text-blue-700' },
    { icon: <Instagram className="w-6 h-6" />, name: 'Instagram', link: '#', color: 'hover:text-pink-600' }
  ];

  const supportHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' }
  ];

  return (
    <div className="min-h-screen bg-page-gradient">
      {/* Navigation is handled by global Navbar component */}

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium mb-6">
            <Headphones className="w-4 h-4" />
            We're Here to Help
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Get in
            <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                className="bg-card rounded-2xl p-8 text-center border border-border/50 hover:shadow-xl hover:border-green-300 dark:hover:border-green-700 transition-all group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {method.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                <p className="text-green-600 dark:text-green-400 font-semibold">{method.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-card rounded-3xl p-8 lg:p-12 border border-border/50 shadow-lg">
              <h2 className="text-3xl font-bold text-foreground mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              {/* Support Hours */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Support Hours</h3>
                </div>
                <div className="space-y-3">
                  {supportHours.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-blue-200 dark:border-blue-800 last:border-0">
                      <span className="font-medium text-foreground">{item.day}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Follow Us</h3>
                </div>
                <p className="text-muted-foreground mb-6">Stay connected on social media for updates and tips!</p>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.link}
                      className={`w-12 h-12 bg-card rounded-xl flex items-center justify-center text-muted-foreground ${social.color} transition-all hover:shadow-lg`}
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Join Our Community</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-foreground">5,000+ Active Students</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-foreground">50+ Expert Instructors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-foreground">24/7 Support Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-foreground">100+ Countries Worldwide</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Quick
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Answers</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about our platform.
            </p>
          </div>

          <div className="space-y-4">
            {faq.map((item, index) => (
              <div key={index} className="bg-card rounded-xl border-2 border-border/50 hover:border-green-300 dark:hover:border-green-700 transition-all">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.question}</h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Link
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              <MessageSquare className="w-5 h-5" />
              Start Live Chat
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-secondary/50 rounded-3xl h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Interactive Map Coming Soon</p>
            </div>
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
