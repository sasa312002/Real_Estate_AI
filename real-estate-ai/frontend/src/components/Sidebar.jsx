import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
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

function Sidebar({ isOpen, onToggle, className = '' }) {
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
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
  
  // Personal property analysis history - your recent searches
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      title: "My Family Home Search",
      date: "2024-09-25",
      preview: "4 bed house in Dehiwala - budget 50M...",
      isActive: false
    },
    {
      id: 2,
      title: "Investment Property Analysis",
      date: "2024-09-24",
      preview: "Apartment complex in Nugegoda - ROI check...",
      isActive: false
    },
    {
      id: 3,
      title: "Weekend Getaway Villa",
      date: "2024-09-23",
      preview: "Beach house in Mirissa - holiday rental...",
      isActive: false
    },
    {
      id: 4,
      title: "Office Space Requirements",
      date: "2024-09-22",
      preview: "Commercial space in Colombo 03 - 2000 sqft...",
      isActive: false
    },
    {
      id: 5,
      title: "Land for Future Development",
      date: "2024-09-21",
      preview: "Residential plot in Malabe - development potential...",
      isActive: false
    },
    {
      id: 6,
      title: "Retirement Home Search",
      date: "2024-09-20",
      preview: "Quiet property in Kandy - mountain view...",
      isActive: false
    },
    {
      id: 7,
      title: "Student Accommodation",
      date: "2024-09-19",
      preview: "Apartment near University of Colombo...",
      isActive: false
    }
  ])

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

  const handleChatSelect = (chatId) => {
    // In real app, this would load the specific chat
    navigate(`/query?chat=${chatId}`)
    if (window.innerWidth < 768) {
      onToggle()
    }
  }

  const deleteChatHistory = (chatId, e) => {
    e.stopPropagation()
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
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
        fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
        transform transition-all duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-80'} md:translate-x-0 md:static md:z-auto
        flex flex-col
        ${className}
      `}>
        {/* Sidebar Header */}
        <div className={`${isCollapsed ? 'flex flex-col items-center space-y-3 p-3' : 'flex items-center justify-between p-4'} border-b border-gray-200 dark:border-gray-700`}>
          {/* Logo Section */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className={`${isCollapsed ? 'h-10 w-10' : 'h-8 w-8'} bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 shadow-lg`}>
              <svg className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} text-white transition-all duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 dark:text-white transition-opacity duration-300">
                  Real Estate AI
                </span>
                {(window.innerWidth >= 768 && window.innerWidth < 1024) && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Responsive Mode
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Toggle Button Section */}
          <div className="flex items-center space-x-2">
            {/* Collapse/Expand Button - Desktop and Tablet */}
            {!isMobile && (
              <button
                onClick={toggleCollapse}
                className="group p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 transform hover:scale-110"
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
            className={`w-full flex items-center justify-center ${isCollapsed ? 'p-3' : 'py-3 px-4 space-x-2'} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl`}
            title={isCollapsed ? 'New Analysis' : ''}
          >
            <Plus className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300`} />
            {!isCollapsed && <span className="transition-opacity duration-300">New Analysis</span>}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className={`${isCollapsed ? 'px-3' : 'px-4'} mb-4`}>
          {!isCollapsed && (
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 px-4 transition-opacity duration-300">
              Navigation
            </div>
          )}
          <nav className={`${isCollapsed ? 'space-y-3' : 'space-y-2'}`}>
            <button
              onClick={() => handleNavigation('/')}
              className={`group w-full flex items-center ${isCollapsed ? 'justify-start pl-3 pr-3 py-3' : 'space-x-3 px-4 py-3'} rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                isActive('/')
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              title={isCollapsed ? 'Home' : ''}
            >
              <svg className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {!isCollapsed && <span className="font-medium transition-opacity duration-300">Home</span>}
            </button>
            
            <button
              onClick={() => handleNavigation('/query')}
              className={`group w-full flex items-center ${isCollapsed ? 'justify-start pl-3 pr-3 py-3' : 'space-x-3 px-4 py-3'} rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                isActive('/query')
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              title={isCollapsed ? 'AI Analysis' : ''}
            >
              <MessageSquare className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300`} />
              {!isCollapsed && <span className="font-medium transition-opacity duration-300">AI Analysis</span>}
            </button>
            
            <button
              onClick={() => handleNavigation('/history')}
              className={`group w-full flex items-center ${isCollapsed ? 'justify-start pl-3 pr-3 py-3' : 'space-x-3 px-4 py-3'} rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                isActive('/history')
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              title={isCollapsed ? 'History' : ''}
            >
              <History className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300`} />
              {!isCollapsed && <span className="font-medium transition-opacity duration-300">History</span>}
            </button>
          </nav>
        </div>

        {/* History */}
        {!isCollapsed && (
          <div className="px-4 mb-4 transition-opacity duration-300">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                History
              </h3>
              <div className="space-y-2">
              {chatHistory.slice(-7).map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {chat.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                      {chat.preview}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {chat.date}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Edit functionality
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => deleteChatHistory(chat.id, e)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
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
        <div className={`mt-auto border-t border-gray-200 dark:border-gray-700 ${isCollapsed ? 'p-3' : 'p-4'} space-y-3`}>
          {/* Theme Toggle */}
          {isCollapsed ? (
            <button
              onClick={toggleTheme}
              className="group w-full flex items-center justify-center p-3 text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
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
              className="group w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 group-hover:rotate-180 transition-all duration-300" />
              ) : (
                <Moon className="w-5 h-5 group-hover:rotate-12 transition-all duration-300" />
              )}
              <span className="font-medium transition-opacity duration-300">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          )}

          {/* Logout Button */}
          {isCollapsed ? (
            <button
              onClick={handleLogout}
              className="w-full h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              title={`Logout ${user?.username || 'User'}`}
            >
              <LogOut className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="group w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium transition-opacity duration-300">
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