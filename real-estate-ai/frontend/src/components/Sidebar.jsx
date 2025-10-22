import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useHistory as useHistoryContext } from '../contexts/HistoryContext'
import { 
  Plus, 
  MessageSquare, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  User,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { propertyAPI } from '../services/api'
import Logo from './Logo'

function Sidebar({ isOpen, onToggle, className = '' }) {
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const { refreshTrigger } = useHistoryContext()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Collapsed state management
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      const tablet = window.innerWidth >= 768 && window.innerWidth < 1024
      const desktop = window.innerWidth >= 1024
      
      setIsMobile(mobile)
      
      // Auto-collapse/expand based on screen size
      if (mobile) {
        // Always collapse on mobile for space efficiency
        setIsCollapsed(true)
      } else if (desktop) {
        // Auto-expand on large desktop screens (>= 1024px)
        setIsCollapsed(false)
      }
      // On tablet (768-1023px), preserve user's manual choice
    }
    
    handleResize() // Check on mount
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }
  
  // Keyboard shortcut support (Ctrl+B)
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.ctrlKey && e.key === 'b' && !isMobile) {
        e.preventDefault()
        toggleCollapse()
      }
    }
    
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [isMobile, toggleCollapse])
  
  // Replace static mock history with real fetched history (latest 5)
  const [chatHistory, setChatHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState('')

  // Fetch history on mount and when location changes (to refresh on navigation)
  useEffect(() => {
    const loadHistory = async () => {
      setLoadingHistory(true)
      setHistoryError('')
      try {
        const res = await propertyAPI.history(5)
        // Adapt to structure: each item has id, query_text, created_at
        const adapted = res.data.map(h => ({
          id: h.id,
          // Show city name primarily; fallback to query snippet
          title: h.city || (h.query_text?.slice(0, 60) || 'Query'),
          // preview left empty or truncated further text
          preview: h.query_text?.length > 60 ? h.query_text.slice(60, 120) + '...' : '',
          date: new Date(h.created_at).toLocaleDateString(),
          isActive: false,
          hasResponse: h.has_response
        }))
        setChatHistory(adapted)
      } catch (e) {
        setHistoryError(e.response?.data?.detail || 'Failed to load recent history')
      } finally {
        setLoadingHistory(false)
      }
    }
    loadHistory()
  }, [location.pathname, refreshTrigger])

  const refreshHistoryAfterDelete = async () => {
    try {
      const res = await propertyAPI.history(5)
      const adapted = res.data.map(h => ({
        id: h.id,
        title: h.city || (h.query_text?.slice(0, 60) || 'Query'),
        preview: h.query_text?.length > 60 ? h.query_text.slice(60, 120) + '...' : '',
        date: new Date(h.created_at).toLocaleDateString(),
        isActive: false,
        hasResponse: h.has_response
      }))
      setChatHistory(adapted)
    } catch {}
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleNewChat = () => {
    navigate('/query')
    if (window.innerWidth < 768) {
      onToggle()
    }
  }

  const handleNavigation = (path) => {
    navigate(path)
    if (window.innerWidth < 768) {
      onToggle()
    }
  }

  const handleAnalyzeLocationNav = () => {
    const plan = user?.plan?.toLowerCase()
    if (plan && (plan === 'standard' || plan === 'premium')) {
      handleNavigation('/analyze-location')
    } else {
      // Redirect to plans with a message
      navigate('/plans?msg=' + encodeURIComponent('Analyze Location is available on Standard and Premium plans. Please upgrade your plan.'))
      if (window.innerWidth < 768) onToggle()
    }
  }

  const handleChatSelect = (chatId) => {
    navigate(`/history?select=${chatId}`)
    if (window.innerWidth < 768) {
      onToggle()
    }
  }

  const deleteChatHistory = async (chatId, e) => {
    e.stopPropagation()
    try {
      await propertyAPI.deleteHistory(chatId)
      setChatHistory(prev => prev.filter(c => c.id !== chatId))
      // backfill to still show up to 5
      refreshHistoryAfterDelete()
    } catch (err) {
      console.error('Failed to delete history', err)
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full
        bg-gradient-to-b from-white via-gray-50 to-blue-50 
        dark:from-gray-900 dark:via-gray-900 dark:to-gray-800
        border-r border-gray-200 dark:border-gray-700 
        transform transition-all duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-80'} md:translate-x-0 md:static md:z-auto
        flex flex-col shadow-xl
        ${className}
      `}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-600/5 dark:to-purple-600/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 dark:from-purple-600/5 dark:to-pink-600/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Sidebar Header */}
        <div className={`${isCollapsed ? 'flex flex-col items-center space-y-3 p-3' : 'flex items-center justify-between p-4'} border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm`}>
          {/* Logo Section */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <Logo size={isCollapsed ? 10 : 8} collapsed={isCollapsed} showText={!isCollapsed} />
          </div>
          
          {/* Toggle Button Section */}
          <div className="flex items-center space-x-2">
            {/* Collapse/Expand Button - Desktop and Tablet */}
            {!isMobile && (
              <button
                onClick={toggleCollapse}
                className="group p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-sm"
                title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                ) : (
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                )}
              </button>
            )}
            
            {/* Mobile Close Button */}
            {isMobile && (
              <button
                onClick={onToggle}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${isCollapsed ? 'p-3' : 'p-4'} space-y-3`}>
          <button
            onClick={handleNewChat}
            className={`group w-full flex items-center justify-center ${isCollapsed ? 'p-3' : 'py-3.5 px-4 space-x-2'} bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl bg-size-200 bg-pos-0 hover:bg-pos-100`}
            style={{ backgroundSize: '200% auto' }}
            title={isCollapsed ? 'New Analysis' : ''}
          >
            <Plus className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300 group-hover:rotate-90`} />
            {!isCollapsed && <span className="transition-opacity duration-300">New Analysis</span>}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className={`${isCollapsed ? 'px-3' : 'px-4'} mb-4`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2 text-xs font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text uppercase tracking-wide mb-3 px-4 transition-opacity duration-300">
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              Navigation
            </div>
          )}
          <nav className={`${isCollapsed ? 'space-y-3' : 'space-y-2'}`}>
            <button
              onClick={() => handleNavigation('/')}
              className={`group w-full flex items-center ${isCollapsed ? 'justify-start pl-3 pr-3 py-3' : 'space-x-3 px-4 py-3'} rounded-2xl transition-all duration-200 transform hover:scale-[1.02] ${
                isActive('/')
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
              }`}
              title={isCollapsed ? 'Home' : ''}
            >
              <svg className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300 ${isActive('/') ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {!isCollapsed && <span className="font-semibold transition-opacity duration-300">Home</span>}
            </button>
            
            <button
              onClick={() => handleNavigation('/query')}
              className={`group w-full flex items-center ${isCollapsed ? 'justify-start pl-3 pr-3 py-3' : 'space-x-3 px-4 py-3'} rounded-2xl transition-all duration-200 transform hover:scale-[1.02] ${
                isActive('/query')
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
              }`}
              title={isCollapsed ? 'Property Analysis' : ''}
            >
              <MessageSquare className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300 ${isActive('/query') ? 'scale-110' : ''}`} />
              {!isCollapsed && <span className="font-semibold transition-opacity duration-300">Property Analysis</span>}
            </button>

            <button
              onClick={handleAnalyzeLocationNav}
              className={`group w-full flex items-center ${isCollapsed ? 'justify-start pl-3 pr-3 py-3' : 'space-x-3 px-4 py-3'} rounded-2xl transition-all duration-200 transform hover:scale-[1.02] ${
                isActive('/analyze-location')
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
              }`}
              title={isCollapsed ? 'Analyze Location' : ''}
            >
              <svg className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300 ${isActive('/analyze-location') ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {!isCollapsed && <span className="font-semibold transition-opacity duration-300">Analyze Location</span>}
            </button>
            
            <button
              onClick={() => handleNavigation('/history')}
              className={`group w-full flex items-center ${isCollapsed ? 'justify-start pl-3 pr-3 py-3' : 'space-x-3 px-4 py-3'} rounded-2xl transition-all duration-200 transform hover:scale-[1.02] ${
                isActive('/history')
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
              }`}
              title={isCollapsed ? 'History' : ''}
            >
              <History className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300 ${isActive('/history') ? 'scale-110' : ''}`} />
              {!isCollapsed && <span className="font-semibold transition-opacity duration-300">History</span>}
            </button>
            <button
              onClick={() => handleNavigation('/plans')}
              className={`group w-full flex items-center ${isCollapsed ? 'justify-start pl-3 pr-3 py-3' : 'space-x-3 px-4 py-3'} rounded-2xl transition-all duration-200 transform hover:scale-[1.02] ${
                isActive('/plans')
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
              }`}
              title={isCollapsed ? 'Plans' : ''}
            >
              <Settings className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300 ${isActive('/plans') ? 'scale-110' : ''}`} />
              {!isCollapsed && <span className="font-semibold transition-opacity duration-300">Plans & Pricing</span>}
            </button>
          </nav>
        </div>

        {/* History */}
        {!isCollapsed && (
          <div className="px-4 mb-4 transition-opacity duration-300">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text uppercase tracking-wide mb-3">
                <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                Recent History
              </h3>
              {historyError && <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl mb-2">{historyError}</div>}
              <div className="space-y-2">
              {loadingHistory && <div className="text-xs text-gray-400 px-3 py-2">Loading...</div>}
              {!loadingHistory && chatHistory.length === 0 && <div className="text-xs text-gray-400 px-3 py-2">No recent items</div>}
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 cursor-pointer transition-all duration-200 hover:shadow-md border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate flex items-center space-x-2">
                      <span>{chat.title}</span>
                      {!chat.hasResponse && <span className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-400 rounded-full font-bold">Pending</span>}
                    </h4>
                    {chat.preview && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {chat.preview}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
                      {chat.date}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => deleteChatHistory(chat.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        )}

        {/* Spacer to push bottom controls down */}
        <div className="flex-1"></div>

        {/* Bottom Controls - Fixed to bottom */}
        <div className={`mt-auto border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm ${isCollapsed ? 'p-3' : 'p-4'} space-y-3`}>
          {/* Theme Toggle */}
          {isCollapsed ? (
            <button
              onClick={toggleTheme}
              className="group w-full flex items-center justify-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-6 h-6 group-hover:rotate-180 transition-all duration-300" />
              ) : (
                <Moon className="w-6 h-6 group-hover:rotate-12 transition-all duration-300" />
              )}
            </button>
          ) : (
            <button
              onClick={toggleTheme}
              className="group w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 group-hover:rotate-180 transition-all duration-300" />
              ) : (
                <Moon className="w-5 h-5 group-hover:rotate-12 transition-all duration-300" />
              )}
              <span className="font-semibold transition-opacity duration-300">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          )}

          {/* Logout Button */}
          {isCollapsed ? (
            <button
              onClick={handleLogout}
              className="w-full h-12 bg-gradient-to-br from-red-500 via-red-600 to-pink-600 rounded-2xl flex items-center justify-center text-white hover:from-red-600 hover:via-red-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-2xl"
              title={`Logout ${user?.username || 'User'}`}
            >
              <LogOut className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="group w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold transition-opacity duration-300">
                Logout {user?.username}
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default Sidebar