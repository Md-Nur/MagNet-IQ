'use client'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ message, size = 'md' }: LoadingSpinnerProps) {
  const sizes = { sm: 24, md: 40, lg: 64 }
  const px = sizes[size]

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div style={{ width: px, height: px, position: 'relative' }}>
        {/* Outer ring */}
        <div
          style={{
            width: px,
            height: px,
            borderRadius: '50%',
            border: `${size === 'lg' ? 4 : 2}px solid rgba(0, 212, 255, 0.1)`,
            borderTopColor: '#00d4ff',
            animation: 'spin-slow 1s linear infinite',
            position: 'absolute',
          }}
        />
        {/* Inner ring */}
        <div
          style={{
            width: px * 0.65,
            height: px * 0.65,
            borderRadius: '50%',
            border: `${size === 'lg' ? 3 : 2}px solid rgba(124, 58, 237, 0.15)`,
            borderBottomColor: '#7c3aed',
            animation: 'spin-slow 1.5s linear infinite reverse',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        {/* Center dot */}
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#00d4ff',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 8px #00d4ff',
          }}
        />
      </div>
      {message && (
        <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', maxWidth: 200 }}>
          {message}
        </p>
      )}
    </div>
  )
}
