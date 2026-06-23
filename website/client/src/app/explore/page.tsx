'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { getStats } from '@/lib/api'
import { StatsResult } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner'

// Dynamically import Recharts to prevent SSR hydration mismatch errors
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
)
const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
)
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
)

const FEATURE_IMPORTANCE = [
  { name: 'num_magnetic_sites', value: 49.0 },
  { name: 'has_Fe', value: 8.0 },
  { name: 'has_Mn', value: 7.0 },
  { name: 'formation_energy', value: 6.8 },
  { name: 'band_gap', value: 4.8 },
  { name: 'has_Eu', value: 4.5 },
  { name: 'has_Gd', value: 3.8 },
  { name: 'volume', value: 3.3 },
  { name: 'density', value: 3.0 },
  { name: 'nsites', value: 2.8 },
]

export default function ExplorePage() {
  const [stats, setStats] = useState<StatsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function loadStats() {
      try {
        const data = await getStats()
        setStats(data)
        setIsFallback(false)
      } catch (err) {
        console.warn('Backend API offline or warming up. Using cached statistics fallback.')
        setIsFallback(true)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <LoadingSpinner message="Fetching dataset & model statistics..." />
      </div>
    )
  }

  // Fallback stats structure if API is down
  const displayStats = stats || {
    total_materials: 28472,
    crystal_systems: {
      Triclinic: 1204,
      Monoclinic: 4503,
      Orthorhombic: 7120,
      Tetragonal: 4320,
      Trigonal: 2980,
      Hexagonal: 3245,
      Cubic: 5100,
    },
    top_elements: {
      Fe: 12300,
      Co: 5400,
      Ni: 4200,
      Mn: 3100,
      Nd: 1800,
      Sm: 1200,
      Gd: 950,
      Eu: 600,
      O: 14500,
      Li: 8200,
    },
  }

  const crystalData = Object.entries(displayStats.crystal_systems).map(([name, value]) => ({
    name,
    count: value,
  }))

  const elementData = Object.entries(displayStats.top_elements)
    .map(([name, value]) => ({
      name,
      count: value,
    }))
    .slice(0, 20)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Dataset & Model <span className="gradient-text">Insights</span>
        </h1>
        <p className="mt-2 text-sm text-magnet-muted">
          Detailed metrics showing the crystal structures, elements, and machine learning models under the hood.
        </p>
        {isFallback && (
          <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs font-semibold text-yellow-500/90 glow-blue animate-pulse">
            ⚠️ Live statistics are currently unavailable (warming up or offline). Displaying cached dataset statistics.
          </div>
        )}
      </div>

      {/* Grid: 2 Charts */}
      <div className="grid gap-8 md:grid-cols-2 mb-8">
        {/* Chart 1: Crystal systems */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4">
            Crystal System Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crystalData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" style={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1e3a5f', borderRadius: 8 }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#00d4ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top elements */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4">
            Top Elements Frequency
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={elementData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#64748b" style={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" style={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1e3a5f', borderRadius: 8 }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Comparison table & Feature Importance */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Chart 3: Model comparison table */}
        <div className="glass rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-4">
              Model Performance Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>R² Score</th>
                    <th>MAE (μB)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono text-white font-semibold">RF v2 (This App)</td>
                    <td className="font-mono">0.8903</td>
                    <td className="font-mono">2.36</td>
                    <td>
                      <span className="text-[10px] font-bold text-magnet-green bg-magnet-green/10 px-2 py-0.5 rounded border border-magnet-green/20">
                        BEST
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono text-magnet-muted">XGBoost v2</td>
                    <td className="font-mono text-magnet-muted">0.8871</td>
                    <td className="font-mono text-magnet-muted">2.68</td>
                    <td className="text-magnet-muted">-</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-magnet-muted">RF Fair (base)</td>
                    <td className="font-mono text-magnet-muted">0.8817</td>
                    <td className="font-mono text-magnet-muted">2.49</td>
                    <td className="text-magnet-muted">-</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-magnet-muted">GradientBoost</td>
                    <td className="font-mono text-magnet-muted">0.8646</td>
                    <td className="font-mono text-magnet-muted">3.04</td>
                    <td className="text-magnet-muted">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] text-magnet-muted mt-4 leading-relaxed">
            Evaluation metrics computed using 5-fold cross-validation on 22,777 training candidates.
          </p>
        </div>

        {/* Chart 4: Feature Importance */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4">
            Feature Importance (Relative Weight)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FEATURE_IMPORTANCE} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#64748b" style={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" style={{ fontSize: 10 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1e3a5f', borderRadius: 8 }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="url(#featureGrad)" radius={[0, 4, 4, 0]} />
                <defs>
                  <linearGradient id="featureGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#00d4ff" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
