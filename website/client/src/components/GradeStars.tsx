'use client'

interface GradeStarsProps {
  grade: string
}

export default function GradeStars({ grade }: GradeStarsProps) {
  // Count filled stars (★) vs empty (☆)
  const filled = (grade.match(/★/g) || []).length
  const empty = (grade.match(/☆/g) || []).length
  const total = filled + empty

  // Extract text label after stars
  const label = grade.replace(/[★☆]/g, '').trim()

  const gradeColors: Record<number, string> = {
    5: '#f59e0b',
    4: '#f59e0b',
    3: '#f59e0b',
    2: '#f97316',
    1: '#64748b',
  }
  const color = gradeColors[filled] || '#64748b'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            style={{
              fontSize: 18,
              color: i < filled ? color : '#1e3a5f',
              filter: i < filled ? `drop-shadow(0 0 4px ${color}88)` : 'none',
              lineHeight: 1,
            }}
          >
            {i < filled ? '★' : '☆'}
          </span>
        ))}
      </div>
      <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>
        {label}
      </span>
    </div>
  )
}
