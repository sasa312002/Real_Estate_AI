import React, { useEffect, useState } from 'react'
import { authAPI, paymentsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Check } from 'lucide-react'

const planMeta = {
  free: {
    name: 'Free',
    color: 'border-gray-300 dark:border-gray-600',
    highlight: false
  },
  standard: {
    name: 'Standard',
    color: 'border-blue-500',
    highlight: true
  },
  premium: {
    name: 'Premium',
    color: 'border-purple-500',
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
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading plans...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Upgrade for more in-depth AI property analyses. Prices shown in LKR.</p>
        {user && (
          <div className="mt-4 inline-block bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm">
            Current Plan: <strong className="capitalize">{user.plan}</strong> · Remaining Analyses: {user.analyses_remaining}
          </div>
        )}
      </div>

      {message && (
        <div className="mb-6 text-center text-sm text-red-600 dark:text-red-400">{message}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(plans || {}).map(([key, p]) => {
          const meta = planMeta[key] || { name: key }
          const isCurrent = user?.plan === key
          return (
            <div key={key} className={`relative rounded-2xl border ${meta.color} bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-shadow p-6 flex flex-col`}>
              {meta.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">Popular</div>
              )}
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{meta.name}</h2>
              <div className="text-4xl font-extrabold mb-4">
                {p.price_LKR === 0 ? <span className="text-green-600">Free</span> : <><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">LKR {p.price_LKR.toLocaleString()}</span></>}
              </div>
              <ul className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-300 flex-1">
                <li className="flex items-start space-x-2"><Check className="w-4 h-4 text-green-500 mt-0.5" /> <span>{p.limit} AI analyses</span></li>
                {key !== 'free' && <li className="flex items-start space-x-2"><Check className="w-4 h-4 text-green-500 mt-0.5" /> <span>Priority processing</span></li>}
                {key === 'premium' && <li className="flex items-start space-x-2"><Check className="w-4 h-4 text-green-500 mt-0.5" /> <span>Advanced market insights</span></li>}
              </ul>
              <button
                disabled={isCurrent || upgrading === key}
                onClick={() => handleUpgrade(key)}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${isCurrent ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'} disabled:opacity-60`}
              >
                {isCurrent ? 'Current Plan' : upgrading === key ? 'Redirecting...' : 'Choose Plan'}
              </button>
            </div>
          )
        })}
      </div>

      <p className="mt-10 text-xs text-center text-gray-500 dark:text-gray-500">* Upgrades take effect immediately. Analysis counts don’t reset on upgrade (future billing cycles can add resets).</p>
    </div>
  )
}
