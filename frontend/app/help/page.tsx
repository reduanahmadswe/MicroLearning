'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  Search,
  MessageCircle,
  Mail,
  Phone,
  BookOpen,
  Video,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  Clock,
  Headphones,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'resources'>('faq');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click on the "Sign Up" button in the top right corner, fill in your details, and verify your email address to get started.',
        },
        {
          q: 'What types of courses are available?',
          a: 'We offer micro-lessons, full courses, interactive quizzes, and live learning sessions across various topics including programming, design, business, and more.',
        },
        {
          q: 'How do I enroll in a course?',
          a: 'Browse our course catalog, click on a course you\'re interested in, and click the "Enroll Now" button. Free courses are instantly accessible, while paid courses require payment.',
        },
      ],
    },
    {
      category: 'Account & Billing',
      questions: [
        {
          q: 'How can I reset my password?',
          a: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email to reset your password.',
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards, debit cards, and SSLCommerz payment gateway for secure transactions in Bangladesh.',
        },
        {
          q: 'Can I get a refund?',
          a: 'Yes, we offer a 7-day money-back guarantee for paid courses if you\'re not satisfied. Contact our support team to process a refund.',
        },
      ],
    },
    {
      category: 'Learning Experience',
      questions: [
        {
          q: 'Can I download course materials?',
          a: 'Yes, most courses include downloadable resources like PDFs, code files, and additional materials that you can access anytime.',
        },
        {
          q: 'How do I track my progress?',
          a: 'Your dashboard shows your learning progress, completed lessons, earned badges, and upcoming milestones. You can also view detailed analytics.',
        },
        {
          q: 'Are certificates provided?',
          a: 'Yes! Upon completing a course, you\'ll receive a digital certificate stored on blockchain that you can share on LinkedIn and your resume.',
        },
      ],
    },
    {
      category: 'Technical Support',
      questions: [
        {
          q: 'The video won\'t play. What should I do?',
          a: 'Try refreshing the page, clearing your browser cache, or using a different browser. Ensure you have a stable internet connection.',
        },
        {
          q: 'Can I access courses on mobile?',
          a: 'Yes! Our platform is fully responsive and works seamlessly on mobile devices, tablets, and desktops.',
        },
        {
          q: 'How do I report a bug or issue?',
          a: 'Use the contact form below or email us at support@microlearning.com with details about the issue you\'re experiencing.',
        },
      ],
    },
  ];

  const supportChannels = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      availability: 'Available 24/7',
      action: 'Start Chat',
      color: 'green',
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@microlearning.com',
      availability: 'Response within 24 hours',
      action: 'Send Email',
      color: 'teal',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '+880 1234-567890',
      availability: 'Mon-Fri, 9AM-6PM',
      action: 'Call Now',
      color: 'emerald',
    },
  ];

  const resources = [
    {
      icon: BookOpen,
      title: 'User Guide',
      description: 'Complete guide to using the platform',
      link: '/docs/user-guide',
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step tutorials',
      link: '/tutorials',
    },
    {
      icon: FileQuestion,
      title: 'Knowledge Base',
      description: 'Browse our extensive help articles',
      link: '/knowledge-base',
    },
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq =>
        searchQuery === '' ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('✅ Message sent! We\'ll get back to you within 24 hours.');
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-page-gradient py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Help & Support Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're here to help! Browse FAQs, contact support, or explore our resources.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help articles, FAQs, or topics..."
              className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg shadow-lg bg-card text-foreground placeholder-muted-foreground"
            />
          </div>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {supportChannels.map((channel, index) => {
            const Icon = channel.icon;
            const colorClasses = {
              green: 'from-green-600 to-emerald-600 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
              teal: 'from-teal-600 to-cyan-600 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
              emerald: 'from-emerald-600 to-green-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
            };

            return (
              <Card key={index} className="hover:shadow-xl transition-all border-border bg-card">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[channel.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[channel.color as keyof typeof colorClasses].split(' ')[1]} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{channel.title}</h3>
                  <p className="text-muted-foreground mb-1 text-sm">{channel.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    {channel.availability}
                  </div>
                  <Button className={`w-full bg-gradient-to-r ${colorClasses[channel.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[channel.color as keyof typeof colorClasses].split(' ')[1]} hover:shadow-lg`}>
                    {channel.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-card rounded-2xl shadow-lg p-2 border border-border inline-flex">
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'faq'
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                  : 'text-muted-foreground hover:bg-secondary'
                }`}
            >
              <FileQuestion className="w-4 h-4 inline mr-2" />
              FAQs
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'contact'
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                  : 'text-muted-foreground hover:bg-secondary'
                }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'resources'
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                  : 'text-muted-foreground hover:bg-secondary'
                }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Resources
            </button>
          </div>
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-8">
            {filteredFaqs.length === 0 ? (
              <Card className="border-border shadow-xl bg-card">
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try different keywords or browse all FAQs</p>
                </CardContent>
              </Card>
            ) : (
              filteredFaqs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {categoryIndex + 1}
                    </span>
                    {category.category}
                  </h2>
                  <div className="space-y-3">
                    {category.questions.map((faq, faqIndex) => {
                      const globalIndex = categoryIndex * 100 + faqIndex;
                      const isExpanded = expandedFaq === globalIndex;

                      return (
                        <Card key={faqIndex} className="border-border shadow-md hover:shadow-xl transition-all bg-card">
                          <CardContent className="p-0">
                            <button
                              onClick={() => toggleFaq(globalIndex)}
                              className="w-full p-6 text-left flex items-center justify-between hover:bg-secondary/50 transition-colors rounded-xl"
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isExpanded ? 'bg-green-600' : 'bg-secondary'
                                  }`}>
                                  <HelpCircle className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-muted-foreground'}`} />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-foreground text-lg">{faq.q}</h3>
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              )}
                            </button>
                            {isExpanded && (
                              <div className="px-6 pb-6 pt-0 ml-11">
                                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <Card className="border-border shadow-2xl bg-card">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 p-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl font-bold">Send Us a Message</CardTitle>
                  <p className="text-green-50 text-sm mt-1">We typically respond within 24 hours</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmitContact} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Your Name *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-background text-foreground"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Email Address *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-background text-foreground"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Subject *</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-background text-foreground"
                    placeholder="How can we help you?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Message *</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all bg-background text-foreground"
                    placeholder="Describe your issue or question in detail..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-xl hover:shadow-2xl px-8 py-6 text-lg"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <Card key={index} className="border-border shadow-xl hover:shadow-2xl transition-all group bg-card">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-xl">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{resource.title}</h3>
                    <p className="text-muted-foreground mb-6">{resource.description}</p>
                    <Button variant="outline" className="border-green-300 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20">
                      Learn More
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Still Need Help Section */}
        <Card className="mt-12 border-0 bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-2xl">
          <CardContent className="p-8 sm:p-12 text-center">
            <Headphones className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-green-50 text-lg mb-6 max-w-2xl mx-auto">
              Our support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="bg-white text-green-600 hover:bg-green-50 shadow-xl px-8 py-6 text-lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Live Chat
              </Button>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                <Mail className="w-5 h-5 mr-2" />
                Email Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
