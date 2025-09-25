import React from 'react'

/*
  Unified Logo component.
  Props:
    size: tailwind size for outer square (default 12)
    collapsed: boolean to switch to compact version
    showText: whether to render brand text
    variant: 'default' | 'mono'
*/
export function Logo({ size = 12, collapsed = false, showText = true, variant = 'default', className = '' }) {
  const gradientId = 'logoGradient'
  const boxSize = collapsed ? 10 : size
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`h-${boxSize} w-${boxSize} rounded-xl relative flex items-center justify-center overflow-hidden shadow-lg`}>        
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64" role="img" aria-label="Real Estate AI Logo">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="64" x2="64" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563eb" />
              <stop offset="1" stopColor="#7e22ce" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
            </filter>
          </defs>
          <rect x="2" y="2" width="60" height="60" rx="14" fill={`url(#${gradientId})`} />
          {/* Stylized monogram: R + AI roof/building motif */}
          <path d="M20 44V22c0-2 1.8-4 4-4h8c6 0 12 4 12 11 0 5-3 9-7 10l7 9h-8l-6-8h-2v8h-8Zm8-16h6c2 0 4-2 4-4s-2-4-4-4h-6v8Z" fill="#ffffff" fillOpacity={variant==='mono'?0.9:1} />
          <path d="M34 18 48 28v16c0 1.1-.9 2-2 2h-4V30L32 24l-6 4v-6l8-4Z" fill="#ffffff" opacity="0.9" />
        </svg>
      </div>
      {showText && !collapsed && (
        <div className="ml-3 leading-tight select-none">
          <div className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            RealEstate<span className="opacity-80">AI</span>
          </div>
          <div className="text-[10px] uppercase font-medium text-gray-500 dark:text-gray-400 tracking-wider">Sri Lanka Insights</div>
        </div>
      )}
    </div>
  )
}

export default Logo
