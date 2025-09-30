import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import ImageSlideshow from '../components/ImageSlideshow'

const HomePage = () => {
  const { isDarkMode } = useTheme()
  const { isAuthenticated, user } = useAuth()

  const features = [
    {
      title: 'AI-Powered Price Estimation',
      description: 'Get accurate property valuations using advanced machine learning algorithms tailored for Sri Lankan real estate market',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'bg-blue-500',
    },
    {
      title: 'Location Intelligence',
      description: 'Analyze neighborhoods, schools, transport links, and safety ratings across Sri Lankan cities',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-green-500',
    },
    {
      title: 'Deal Evaluation',
      description: 'Evaluate investment opportunities with confidence scoring and risk assessment for the Sri Lankan market',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-purple-500',
    },
  ]

  const stats = [
    { number: '10K+', label: 'Properties Analyzed' },
    { number: '95%', label: 'Accuracy Rate' },
    { number: '24/7', label: 'AI Support' },
    { number: '1K+', label: 'Happy Users' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Hero Section with Slideshow */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              {isAuthenticated && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg inline-block">
                  <p className="text-blue-700 dark:text-blue-300 font-medium">
                    👋 Welcome back, {user?.username}!
                  </p>
                </div>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                AI-Powered
                <span className="text-blue-600 block">Real Estate</span>
                Intelligence for Sri Lanka
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
                {isAuthenticated 
                  ? "Ready to analyze your next property investment? Use our advanced AI tools to make informed decisions in the Sri Lankan real estate market."
                  : "Make smarter real estate decisions in Sri Lanka with our advanced AI platform. Get accurate price estimates, analyze neighborhoods, and evaluate investment opportunities with confidence."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/query"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Start New Analysis
                    </Link>
                    <Link
                      to="/history"
                      className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3 px-8 rounded-xl text-lg transition-colors duration-200"
                    >
                      View History
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
                    >
                      Try Demo
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Slideshow */}
            <div className="order-first lg:order-last">
              <ImageSlideshow />
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-transparent"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/30 rounded-full -translate-y-48 translate-x-48 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100 dark:bg-green-900/30 rounded-full translate-y-48 -translate-x-48 opacity-50"></div>
        </div>
      </section>

      {/* Plans Overview Note */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-white dark:bg-gray-800 shadow-sm p-6 md:p-8">
            <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-pink-900/20" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Plans & Usage</span>
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Start on the <strong>Free</strong> plan with <strong>5 AI analyses</strong>. Upgrade to <strong>Standard (50 analyses)</strong> or <strong>Premium (500 analyses)</strong> for higher volume and priority processing. All prices are in <span className="font-semibold">LKR</span>. {isAuthenticated && user?.plan && (<span>Your current plan is <span className="font-semibold capitalize">{user.plan}</span>{typeof user.analyses_remaining === 'number' && ` · ${user.analyses_remaining} analyses left`}.</span>)}
                </p>
              </div>
              <div className="flex flex-col items-stretch gap-3 w-full md:w-auto md:min-w-[220px]">
                <a
                  href="/plans"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-5 py-3 text-sm shadow-md hover:shadow-lg transition-all"
                >
                  View Plans & Pricing
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7l-10 10m0-6v6h6" /></svg>
                </a>
                {isAuthenticated && user?.plan !== 'premium' && (
                  <a
                    href="/plans"
                    className="inline-flex items-center justify-center rounded-lg border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 bg-white/70 dark:bg-blue-900/10 backdrop-blur px-5 py-2.5 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    Upgrade for More Analyses
                  </a>
                )}
                {isAuthenticated && user?.plan === 'premium' && (
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium text-center">You are on the Premium plan 🎉</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Sri Lankan Real Estate
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to make informed real estate decisions in Sri Lanka
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className={`${feature.color} text-white p-3 rounded-lg w-fit mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Simple steps to get started with Real Estate AI Sri Lanka
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Sign Up
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your free account in seconds and start exploring
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Enter Property Details
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Input property information and location in Sri Lanka
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Get AI Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Receive detailed analysis and recommendations instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isAuthenticated ? (
            <>
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome back, {user?.username}!
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Ready to analyze your next property investment in Sri Lanka?
              </p>
              <Link
                to="/query"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start New Analysis
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join hundreds of users making smarter real estate decisions in Sri Lanka with AI
              </p>
              <Link
                to="/signup"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
              >
                Start Free Trial
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Footer 
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RE</span>
                </div>
                <span className="ml-2 text-xl font-bold">Real Estate AI</span>
              </div>
              <p className="text-gray-400">
                Making real estate decisions smarter with AI for Sri Lanka
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Price Estimator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Location Analyzer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Deal Evaluator</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Real Estate AI Sri Lanka. All rights reserved.</p>
          </div>
        </div>
      </footer>*/}
    </div>
  )
}

export default HomePage