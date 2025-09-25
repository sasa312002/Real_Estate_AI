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
          {/* House-only logo (aligned with favicon) */}
          <g fill="#ffffff" fillOpacity={variant==='mono'?0.9:1}>
            {/* House silhouette */}
            <path d="M16 36 32 22l16 14v14c0 1.1-.9 2-2 2h-6V40H24v12h-6c-1.1 0-2-.9-2-2V36Z" />
            {/* Roof ridge highlight */}
            {variant !== 'mono' && (
              <path d="M16 36 32 22l16 14" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
            )}
            {/* Door */}
            <rect x="28" y="40" width="8" height="12" rx="1.5" fill={variant==='mono'? '#ffffff' : '#4f46e5'} />
            {/* Door knob */}
            <circle cx="34" cy="46" r="1.1" fill="#ffffff" />
          </g>
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
