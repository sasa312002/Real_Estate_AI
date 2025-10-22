import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import ImageSlideshow from '../components/ImageSlideshow'
import { 
  TrendingUp, 
  MapPin, 
  BarChart3, 
  Shield, 
  Clock, 
  Target,
  CheckCircle2,
  ArrowRight,
  Users,
  Sparkles
} from 'lucide-react'

const HomePage = () => {
  const { isDarkMode } = useTheme()
  const { isAuthenticated, user } = useAuth()

  const features = [
    {
      title: 'AI-Powered Price Estimation',
      description: 'Get accurate property valuations using advanced machine learning algorithms tailored for Sri Lankan real estate market',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Location Intelligence',
      description: 'Analyze neighborhoods, schools, transport links, and safety ratings across Sri Lankan cities',
      icon: <MapPin className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Deal Evaluation',
      description: 'Evaluate investment opportunities with confidence scoring and risk assessment for the Sri Lankan market',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Risk Assessment',
      description: 'Comprehensive analysis of environmental, financial, and market risks for informed decisions',
      icon: <Shield className="w-8 h-8" />,
      color: 'from-red-500 to-orange-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Real-Time Updates',
      description: 'Stay informed with instant market insights and property trend notifications',
      icon: <Clock className="w-8 h-8" />,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      title: 'Investment Tracking',
      description: 'Monitor your property portfolio performance with detailed analytics and reports',
      icon: <Target className="w-8 h-8" />,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    },
  ]

  const stats = [
    { number: '10K+', label: 'Properties Analyzed', icon: <BarChart3 className="w-6 h-6" /> },
    { number: '95%', label: 'Accuracy Rate', icon: <Target className="w-6 h-6" /> },
    { number: '24/7', label: 'AI Support', icon: <Clock className="w-6 h-6" /> },
    { number: '500+', label: 'Happy Users', icon: <Users className="w-6 h-6" /> },
  ]

  

  const benefits = [
    'Save time with instant AI-powered analysis',
    'Make data-driven investment decisions',
    'Access comprehensive location insights',
    'Get accurate price estimations',
    'Track your analysis history',
    'Upgrade plans as your needs grow'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <Header />

      {/* Hero Section with Enhanced Design */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-6">
              {isAuthenticated && (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700 rounded-full">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Welcome back, <span className="font-bold">{user?.username}</span>!
                  </p>
                </div>
              )}
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                  AI-Powered Real Estate
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Intelligence
                </span>
                <br />
                <span className="text-2xl sm:text-3xl lg:text-4xl text-gray-600 dark:text-gray-400 font-semibold">
                  for Sri Lanka
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {isAuthenticated 
                  ? "Ready to analyze your next property investment? Use our advanced AI tools to make informed decisions in the Sri Lankan real estate market."
                  : "Make smarter real estate decisions with our advanced AI platform. Get accurate price estimates, analyze neighborhoods, and evaluate investment opportunities with confidence."
                }
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/query"
                      className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                    >
                      <Sparkles className="w-5 h-5" />
                      Start New Analysis
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    {user?.plan && ['standard', 'premium'].includes(user.plan.toLowerCase()) && (
                      <Link
                        to="/analyze-location"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 px-8 rounded-2xl text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <MapPin className="w-5 h-5" />
                        Analyze Location
                      </Link>
                    )}
                    <Link
                      to="/history"
                      className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-4 px-8 rounded-2xl text-base sm:text-lg transition-all duration-300 shadow-md"
                    >
                      <Clock className="w-5 h-5" />
                      View History
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-4 px-8 rounded-2xl text-base sm:text-lg transition-all duration-300 shadow-md"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Free to Start</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Instant Results</span>
                </div>
              </div>
            </div>

            {/* Slideshow with Enhanced Styling */}
            <div className="order-first lg:order-last">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-20 blur-2xl"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/10 dark:ring-white/10">
                  <ImageSlideshow />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 dark:from-blue-600/20 dark:to-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-400/30 to-blue-400/30 dark:from-green-600/20 dark:to-blue-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </section>

      {/* Stats Section - Redesigned */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {stat.icon}
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced Grid */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Everything You Need for
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Property Decisions
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive AI-powered tools designed specifically for the Sri Lankan real estate market
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`group relative ${feature.bgColor} rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 hover:border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-800/50 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Improved */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full mb-4">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Get Started in
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> 3 Easy Steps</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From signup to insights in minutes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connecting Lines (hidden on mobile) */}
            <div className="hidden md:block absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 dark:from-blue-800 dark:via-purple-800 dark:to-green-800 -z-10"></div>
            
            <div className="relative text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl sm:text-3xl font-bold mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                1
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 sm:p-8 border border-blue-200 dark:border-blue-800 group-hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Create Account
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Sign up for free in seconds. No credit card required to start.
                </p>
              </div>
            </div>
            
            <div className="relative text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white text-2xl sm:text-3xl font-bold mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                2
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 sm:p-8 border border-purple-200 dark:border-purple-800 group-hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Enter Details
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Provide property information and location anywhere in Sri Lanka.
                </p>
              </div>
            </div>
            
            <div className="relative text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-2xl sm:text-3xl font-bold mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                3
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 sm:p-8 border border-green-200 dark:border-green-800 group-hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Get AI Insights
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Receive detailed analysis and actionable recommendations instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="mt-12 sm:mt-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              Why Choose Our Platform?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      

      {/* Plans Overview - Enhanced */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full border border-blue-300 dark:border-blue-700">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Flexible Plans
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    Choose Your Perfect Plan
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">
                    Start with <span className="font-bold text-blue-600">5 free analyses</span> on our Free plan. Upgrade to 
                    <span className="font-bold text-purple-600"> Standard (50 analyses)</span> or 
                    <span className="font-bold text-pink-600"> Premium (500 analyses)</span> for higher volume and priority support.
                    {isAuthenticated && user?.plan && (
                      <span className="block mt-2 text-sm">
                        Current plan: <span className="font-bold capitalize text-green-600">{user.plan}</span>
                        {typeof user.analyses_remaining === 'number' && (
                          <span className="ml-1">• {user.analyses_remaining} analyses remaining</span>
                        )}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 w-full sm:w-auto lg:min-w-[240px]">
                  <Link
                    to="/plans"
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-4 text-base shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <Sparkles className="w-5 h-5" />
                    View All Plans
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  {isAuthenticated && user?.plan !== 'premium' && (
                    <Link
                      to="/plans"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 bg-white/70 dark:bg-blue-900/10 backdrop-blur px-6 py-3 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Upgrade Now
                    </Link>
                  )}
                  {isAuthenticated && user?.plan === 'premium' && (
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-2xl">
                      <CheckCircle2 className="w-5 h-5" />
                      Premium Member
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMjBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isAuthenticated ? (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Ready to Analyze</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                Welcome Back, {user?.username}! 👋
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
                Ready to analyze your next property investment? Our AI is ready to help you make informed decisions in the Sri Lankan real estate market.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <Link
                  to="/query"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-8 sm:px-10 rounded-2xl text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl w-full sm:w-auto"
                >
                  <Sparkles className="w-5 h-5" />
                  Start New Analysis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                {user?.plan && ['standard', 'premium'].includes(user.plan.toLowerCase()) && (
                  <Link
                    to="/analyze-location"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 font-bold py-4 px-8 sm:px-10 rounded-2xl text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl w-full sm:w-auto"
                  >
                    <MapPin className="w-5 h-5" />
                    Analyze Location
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Get Started Today</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                Ready to Make Smarter
                <br className="hidden sm:block" />
                Property Decisions?
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
                Join hundreds of users making informed real estate decisions in Sri Lanka with our AI-powered platform. Start your free trial today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-8 sm:px-10 rounded-2xl text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl w-full sm:w-auto"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur border-2 border-white/40 text-white hover:bg-white/30 font-semibold py-4 px-8 sm:px-10 rounded-2xl text-base sm:text-lg transition-all duration-300 w-full sm:w-auto"
                >
                  Sign In
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-8 sm:mt-12 text-white/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">5 free analyses</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Instant results</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage