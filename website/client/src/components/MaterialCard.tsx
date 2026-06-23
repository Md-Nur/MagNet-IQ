'use client'

import ScoreBar from './ScoreBar'
import { MaterialResult } from '@/types'

interface MaterialCardProps {
  material: MaterialResult
  rank: number
}

const rankColors: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', text: '#0a0e1a', label: '🥇' },
  2: { bg: 'linear-gradient(135deg, #94a3b8, #64748b)', text: '#0a0e1a', label: '🥈' },
  3: { bg: 'linear-gradient(135deg, #cd7f32, #a06020)', text: '#fff', label: '🥉' },
}

function StabilityDot({ hull }: { hull: number }) {
  const color = hull <= 0.05 ? '#10b981' : hull <= 0.10 ? '#f59e0b' : '#ef4444'
  const label = hull <= 0.05 ? 'Stable' : hull <= 0.10 ? 'Good' : 'Unstable'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
      <span style={{ color: '#64748b', fontSize: 11 }}>{label}</span>
    </div>
  )
}

export default function MaterialCard({ material, rank }: MaterialCardProps) {
  const rankStyle = rankColors[rank]

  return (
    <div
      className="glass glass-hover gradient-border"
      style={{
        borderRadius: 12,
        padding: 20,
        transition: 'all 0.25s',
        cursor: 'default',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {rankStyle ? (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: rankStyle.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {rankStyle.label}
            </div>
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(30,58,95,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#64748b',
                fontFamily: 'var(--font-space-mono)',
              }}
            >
              #{rank}
            </div>
          )}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: 16,
                fontWeight: 700,
                color: '#e2e8f0',
                letterSpacing: '-0.02em',
              }}
            >
              {material.formula}
            </div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
              {material.material_id}
            </div>
          </div>
        </div>

        {/* RE-Free badge */}
        {!material.has_rare_earth && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              borderRadius: 20,
              padding: '2px 10px',
              fontSize: 11,
              fontWeight: 600,
              color: '#10b981',
            }}
          >
            ✓ RE-Free
          </div>
        )}
      </div>

      {/* Score bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            MagNet-IQ Score
          </span>
        </div>
        <ScoreBar score={material.magnet_score} maxScore={500} />
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: 'rgba(0,212,255,0.05)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Magnetization</div>
          <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: 15, fontWeight: 700, color: '#00d4ff', marginTop: 2 }}>
            {material.total_magnetization.toFixed(2)}<span style={{ fontSize: 11, color: '#64748b' }}> μB</span>
          </div>
        </div>

        <div style={{ background: 'rgba(124,58,237,0.05)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Crystal</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#a78bfa', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {material.crystal_system}
          </div>
        </div>

        <div style={{ background: 'rgba(30,58,95,0.3)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stability</div>
          <div style={{ marginTop: 4 }}>
            <StabilityDot hull={material.energy_above_hull} />
          </div>
        </div>

        <div style={{ background: 'rgba(30,58,95,0.3)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Density</div>
          <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginTop: 2 }}>
            {material.density.toFixed(2)} g/cm³
          </div>
        </div>
      </div>

      {/* Elements */}
      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {material.elements.map(el => (
          <span
            key={el}
            style={{
              background: 'rgba(30,58,95,0.5)',
              border: '1px solid rgba(30,58,95,0.8)',
              borderRadius: 4,
              padding: '1px 7px',
              fontSize: 11,
              fontFamily: 'var(--font-space-mono)',
              color: '#94a3b8',
            }}
          >
            {el}
          </span>
        ))}
      </div>
    </div>
  )
}
