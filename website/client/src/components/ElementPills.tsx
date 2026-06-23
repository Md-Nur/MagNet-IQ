'use client'

interface Group {
  label: string
  elements: string[]
  color?: 'blue' | 'purple' | 'green' | 'muted'
}

interface ElementPillsProps {
  selected: string[]
  onChange: (elements: string[]) => void
  groups: Group[]
}

const colorMap = {
  blue: { bg: 'rgba(0, 212, 255, 0.15)', border: '#00d4ff', text: '#00d4ff', selectedBg: '#00d4ff', selectedText: '#0a0e1a' },
  purple: { bg: 'rgba(124, 58, 237, 0.15)', border: '#7c3aed', text: '#a78bfa', selectedBg: '#7c3aed', selectedText: '#fff' },
  green: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#10b981', selectedBg: '#10b981', selectedText: '#0a0e1a' },
  muted: { bg: 'rgba(100, 116, 139, 0.1)', border: '#1e3a5f', text: '#94a3b8', selectedBg: '#1e3a5f', selectedText: '#e2e8f0' },
}

export default function ElementPills({ selected, onChange, groups }: ElementPillsProps) {
  const toggle = (elem: string) => {
    if (selected.includes(elem)) {
      onChange(selected.filter(e => e !== elem))
    } else {
      onChange([...selected, elem])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {groups.map(group => {
        const c = colorMap[group.color || 'blue']
        return (
          <div key={group.label}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 6 }}>
              {group.label}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {group.elements.map(elem => {
                const active = selected.includes(elem)
                return (
                  <button
                    key={elem}
                    onClick={() => toggle(elem)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'var(--font-space-mono)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      border: `1.5px solid ${active ? c.border : 'rgba(30,58,95,0.5)'}`,
                      background: active ? c.selectedBg : c.bg,
                      color: active ? c.selectedText : c.text,
                      boxShadow: active ? `0 0 10px ${c.border}44` : 'none',
                      transform: active ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {elem}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
