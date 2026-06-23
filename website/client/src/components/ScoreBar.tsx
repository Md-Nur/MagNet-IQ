'use client'

import { useEffect, useState } from 'react'

interface ScoreBarProps {
  score: number
  maxScore?: number
  showLabel?: boolean
}

export default function ScoreBar({ score, maxScore = 500, showLabel = true }: ScoreBarProps) {
  const [width, setWidth] = useState(0)
  const pct = Math.min(100, (score / maxScore) * 100)

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100)
    return () => clearTimeout(t)
  }, [pct])

  const getColor = () => {
    if (pct >= 70) return 'linear-gradient(90deg, #7c3aed, #00d4ff)'
    if (pct >= 40) return 'linear-gradient(90deg, #5b21b6, #00d4ff)'
    return 'linear-gradient(90deg, #1e3a5f, #7c3aed)'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      <div className="score-bar-track" style={{ flex: 1 }}>
        <div
          className="score-bar-fill"
          style={{
            width: `${width}%`,
            background: getColor(),
          }}
        />
      </div>
      {showLabel && (
        <span
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: 12,
            color: '#00d4ff',
            minWidth: 48,
            textAlign: 'right',
            fontWeight: 700,
          }}
        >
          {score.toFixed(1)}
        </span>
      )}
    </div>
  )
}
