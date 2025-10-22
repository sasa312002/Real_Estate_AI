import React, { useEffect, useState } from 'react'
import { authAPI, paymentsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Check, Zap, Crown, Gift, TrendingUp, Shield, Star } from 'lucide-react'

const planMeta = {
  free: {
    name: 'Free',
    color: 'border-gray-300 dark:border-gray-600',
    gradient: 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700',
    icon: Gift,
    iconColor: 'text-gray-600',
    highlight: false
  },
  standard: {
    name: 'Standard',
    color: 'border-blue-500',
    gradient: 'from-blue-500 to-purple-500',
    icon: Zap,
    iconColor: 'text-blue-600',
    highlight: true
  },
  premium: {
    name: 'Premium',
    color: 'border-purple-500',
    gradient: 'from-purple-500 to-pink-500',
    icon: Crown,
    iconColor: 'text-purple-600',
    highlight: true
  }
}

export default function Plans() {
  const { user, isAuthenticated, } = useAuth()
  const [plans, setPlans] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [upgrading, setUpgrading] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authAPI.plans()
        setPlans(res.data.plans)
        // If returning from Stripe success, verify and refresh
        const params = new URLSearchParams(window.location.search)
        const sessionId = params.get('session_id')
        const success = params.get('success')
        if (success && sessionId) {
          try {
            await paymentsAPI.verifySession(sessionId)
            window.history.replaceState({}, document.title, '/plans')
            window.location.reload()
          } catch (err) {
            // ignore verification errors here
          }
        }
        const msg = params.get('msg')
        if (msg) {
          setMessage(msg)
        }
      } catch (e) {
        setError(e.response?.data?.detail || 'Failed to load plans')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUpgrade = async (plan) => {
    if (!isAuthenticated) {
      setMessage('Please login first')
      return
    }
    setUpgrading(plan)
    setMessage('')
    try {
      if (plan === 'free') {
        await authAPI.upgrade(plan)
        window.location.href = '/plans'
        return
      }
      // Paid plans: create Stripe Checkout session and redirect
      const res = await paymentsAPI.createCheckout(plan)
      const url = res.data?.url
      if (!url) {
        throw new Error('No checkout URL returned')
      }
      window.location.href = url
    } catch (e) {
      setMessage(e.response?.data?.detail || 'Upgrade failed')
    } finally {
      setUpgrading('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="relative z-10 p-8 flex flex-col items-center justify-center min-h-screen">
          <div className="relative inline-block mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-blue-600"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-20 w-20 border-r-4 border-l-4 border-purple-600" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Loading plans...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative z-10 p-8 flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-red-200 dark:border-red-700">
            <p className="text-red-600 dark:text-red-400 text-lg font-semibold">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-hidden">
      {/* Animated Background Blur Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto py-16 px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-6 shadow-lg border border-blue-200 dark:border-blue-700">
            <Star className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pricing Plans</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed">
            Upgrade for more in-depth AI property analyses. Unlock powerful insights to make smarter real estate decisions.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Prices shown in LKR</p>
          {user && (
            <div className="mt-8 inline-flex items-center gap-3 px-6 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-blue-200 dark:border-blue-700 rounded-2xl shadow-xl">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Current Plan</p>
                <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize">{user.plan}</p>
              </div>
              <div className="h-10 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Remaining</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{user.analyses_remaining}</p>
              </div>
            </div>
          )}
        </div>

        {message && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="p-5 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-2xl shadow-lg text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold">{message}</p>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Object.entries(plans || {}).map(([key, p]) => {
          const meta = planMeta[key] || { name: key, icon: Star, iconColor: 'text-gray-600', gradient: 'from-gray-100 to-gray-200' }
          const isCurrent = user?.plan === key
          const Icon = meta.icon
          return (
            <div 
              key={key} 
              className={`group relative rounded-3xl border-2 ${meta.color} bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-xl hover:shadow-3xl transition-all duration-300 p-8 flex flex-col transform hover:scale-[1.02] ${meta.highlight ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Popular Badge */}
              {meta.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-sm font-bold rounded-full shadow-xl border-2 border-white dark:border-gray-900 animate-pulse">
                  ✨ Popular Choice
                </div>
              )}

              {/* Icon Header */}
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${meta.gradient} shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                {isCurrent && (
                  <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full border border-green-200 dark:border-green-700 shadow-sm">
                    Active
                  </div>
                )}
              </div>

              {/* Plan Name */}
              <h2 className={`text-3xl font-bold mb-3 ${key === 'free' ? 'text-gray-900 dark:text-white' : 'bg-gradient-to-r ' + meta.gradient + ' bg-clip-text text-transparent'}`}>
                {meta.name}
              </h2>

              {/* Price */}
              <div className="mb-6">
                {p.price_LKR === 0 ? (
                  <div className="text-5xl font-extrabold text-green-600 dark:text-green-400">Free</div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-extrabold bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent`}>
                      LKR {p.price_LKR.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">/month</span>
                  </div>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start space-x-3 group/item">
                  <div className="mt-1 p-1 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{p.limit}</span> AI analyses
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-1 p-1 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Property price estimation</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-1 p-1 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Deal verdict analysis</span>
                </li>
                {key !== 'free' && (
                  <>
                    <li className="flex items-start space-x-3">
                      <div className="mt-1 p-1 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Location risk assessment</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="mt-1 p-1 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Priority processing</span>
                    </li>
                  </>
                )}
                {key === 'premium' && (
                  <></>
                )}
              </ul>

              {/* CTA Button */}
              <button
                disabled={isCurrent || upgrading === key}
                onClick={() => handleUpgrade(key)}
                className={`group/btn w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform shadow-lg hover:shadow-2xl ${
                  isCurrent 
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : key === 'free'
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white hover:scale-[1.02]'
                    : `bg-gradient-to-r ${meta.gradient} hover:shadow-3xl text-white hover:scale-[1.02]`
                } disabled:opacity-60 disabled:hover:scale-100`}
              >
                <span className="flex items-center justify-center gap-2">
                  {isCurrent ? (
                    <>
                      <Shield className="w-5 h-5" />
                      Current Plan
                    </>
                  ) : upgrading === key ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Redirecting...
                    </>
                  ) : (
                    <>
                      {key === 'free' ? 'Downgrade to Free' : 'Upgrade Now'}
                      <TrendingUp className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-16 text-center">
        <div className="inline-block p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-3xl">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            <span className="font-bold text-blue-600 dark:text-blue-400">Note:</span> Upgrades take effect immediately. Analysis counts don't reset on upgrade. Future billing cycles may include count resets.
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
