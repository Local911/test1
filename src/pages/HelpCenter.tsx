import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search,
  TrendingUp,
  Users,
  Bell,
  Bookmark,
  Settings,
  ExternalLink,
  PlayCircle,
  BookOpen,
  FileText,
  MessageCircle,
  BarChart2,
  AlertCircle,
  Lock,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface GuideItem {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
}

const guides: GuideItem[] = [
  {
    title: 'Getting Started Guide',
    description: 'Learn the basics of OnlyViral AI and how to set up your account',
    icon: PlayCircle,
    link: '#getting-started'
  },
  {
    title: 'Content Discovery',
    description: 'Master the art of finding trending content across platforms',
    icon: Search,
    link: '#content-discovery'
  },
  {
    title: 'Trend Analysis',
    description: 'Understand trend metrics and virality scores',
    icon: BarChart2,
    link: '#trend-analysis'
  },
  {
    title: 'Competitor Tracking',
    description: 'Learn how to monitor and analyze your competitors',
    icon: Users,
    link: '#competitor-tracking'
  }
];

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I start finding trending content?',
    answer: 'Begin by visiting the Explore page or using the Quick Search on your Dashboard. Enter keywords, select a category, and choose a timeframe to discover trending content across different platforms. Our AI-powered system will show you the most relevant and trending content based on your criteria.'
  },
  {
    category: 'Getting Started',
    question: 'What do the virality scores mean?',
    answer: 'Virality scores help you identify content\'s potential:\n\n• High (Red): Exceptional engagement, rapidly growing\n• Medium (Green): Above-average performance, steady growth\n• Low (Gray): Standard performance\n\nScores are calculated using engagement metrics, growth rate, and AI analysis.'
  },
  {
    category: 'Features',
    question: 'How do I save content for later?',
    answer: 'To save content, click the bookmark icon on any content card. You can access your saved content in two ways:\n\n1. Through the Saved section in the navigation menu\n2. Via the Saved Content widget on your Dashboard\n\nYou can organize saved content by virality score and track their performance over time.'
  },
  {
    category: 'Features',
    question: 'What metrics are tracked for trends?',
    answer: 'We track comprehensive engagement metrics including:\n\n• Views and Reach\n• Likes and Reactions\n• Comments and Replies\n• Shares and Reposts\n• Saves and Bookmarks\n• Growth Rate\n• Virality Score\n• Sentiment Analysis'
  },
  {
    category: 'Account',
    question: 'How do I connect my social media accounts?',
    answer: 'To connect your social media accounts:\n\n1. Go to Settings\n2. Navigate to Connected Accounts\n3. Enter your username for each platform\n4. Click Save Changes\n\nConnecting accounts helps personalize your content recommendations and competitor analysis.'
  },
  {
    category: 'Account',
    question: 'Can I change my primary niche?',
    answer: 'Yes! To change your primary niche:\n\n1. Visit Settings\n2. Find the Primary Niche dropdown\n3. Select your new niche\n4. Save Changes\n\nYour content recommendations and trend analysis will update automatically based on your new niche.'
  },
  {
    category: 'Alerts',
    question: 'How do trend alerts work?',
    answer: 'Trend alerts notify you about viral content opportunities:\n\n1. Set keywords and topics\n2. Choose platforms to monitor\n3. Set growth thresholds\n4. Enable notifications\n\nYou\'ll receive alerts when content matching your criteria shows significant growth or viral potential.'
  },
  {
    category: 'Alerts',
    question: 'How often are alerts checked?',
    answer: 'Our system actively monitors trends:\n\n• Real-time monitoring for rapid trends\n• 5-minute intervals for regular checks\n• Instant notifications for threshold triggers\n• Daily summaries of top trends\n\nYou can customize notification frequency in Settings.'
  },
  {
    category: 'Competitors',
    question: 'How do I track competitors?',
    answer: 'To track competitors:\n\n1. Visit the Competitors page\n2. Click "Add Competitor"\n3. Enter their username and platform\n4. Select metrics to track\n\nYou can monitor multiple competitors across different platforms and receive insights about their content strategy.'
  },
  {
    category: 'Competitors',
    question: 'What competitor metrics are available?',
    answer: 'We track comprehensive competitor metrics:\n\n• Follower Growth\n• Engagement Rates\n• Content Performance\n• Posting Patterns\n• Top-Performing Content\n• Audience Demographics\n• Content Categories\n• Hashtag Usage'
  }
];

const categories = Array.from(new Set(faqs.map(faq => faq.category)));

const quickLinks = [
  { icon: TrendingUp, label: 'Explore Trends', path: '/dashboard/explore' },
  { icon: Users, label: 'Track Competitors', path: '/dashboard/competitors' },
  { icon: Bell, label: 'Set Up Alerts', path: '/dashboard/alerts' },
  { icon: Bookmark, label: 'Saved Content', path: '/dashboard/saved' },
  { icon: Settings, label: 'Account Settings', path: '/dashboard/settings' }
];

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleFAQ = (question: string) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(question)) {
      newExpanded.delete(question);
    } else {
      newExpanded.add(question);
    }
    setExpandedFAQs(newExpanded);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <HelpCircle className="h-10 w-10 text-purple-500 mr-3" />
          <h1 className="text-3xl sm:text-4xl font-bold">Help Center</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Find answers, learn best practices, and get support
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for help..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Quick Start Guides */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Quick Start Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guides.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <a
                key={index}
                href={guide.link}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors group"
              >
                <div className="bg-purple-500 bg-opacity-10 rounded-lg p-3 w-fit mb-4 group-hover:bg-opacity-20 transition-colors">
                  <Icon className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">{guide.title}</h3>
                <p className="text-sm text-gray-400">{guide.description}</p>
              </a>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Popular Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={index}
                to={link.path}
                className="bg-gray-800 rounded-lg p-4 flex flex-col items-center text-center hover:bg-gray-700 transition-colors"
              >
                <Icon className="h-6 w-6 text-purple-500 mb-2" />
                <span className="text-sm">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Topics
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-4 mb-12">
        {filteredFAQs.map((faq, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(faq.question)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700 transition-colors"
            >
              <span className="font-medium flex items-center">
                <QuestionIcon className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                {faq.question}
              </span>
              {expandedFAQs.has(faq.question) ? (
                <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
              )}
            </button>
            {expandedFAQs.has(faq.question) && (
              <div className="px-6 pb-4">
                <div className="pl-8 text-gray-300 whitespace-pre-line">
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="max-w-3xl mx-auto text-center">
          <HelpCircle className="h-12 w-12 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Still need help?</h2>
          <p className="text-gray-400 mb-6">
            Can't find what you're looking for? Our support team is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:support@onlyviral.ai"
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Support
            </a>
            <a
              href="#documentation"
              className="inline-flex items-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12" y2="17" />
    </svg>
  );
}
