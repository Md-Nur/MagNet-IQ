'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Brain, Cpu, Database, Zap, Shield, Layers } from 'lucide-react'
import { getStats, getTopMaterials, healthCheck } from '@/lib/api'
import { StatsResult, MaterialResult } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Home() {
  const [stats, setStats] = useState<StatsResult | null>(null)
  const [top5, setTop5] = useState<MaterialResult[]>([])
  const [loading, setLoading] = useState(true)
  const [isWarmingUp, setIsWarmingUp] = useState(false)
  const [apiConnected, setApiConnected] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function fetchData() {
      // Check API connection
      const isAlive = await healthCheck()
      setApiConnected(isAlive)
      if (!isAlive) {
        setIsWarmingUp(true)
        // Set a timer to check again
        const interval = setInterval(async () => {
          const check = await healthCheck()
          if (check) {
            setApiConnected(true)
            setIsWarmingUp(false)
            clearInterval(interval)
            loadData()
          }
        }, 5000)
      } else {
        loadData()
      }
    }

    async function loadData() {
      try {
        const statsData = await getStats()
        setStats(statsData)
        const topData = await getTopMaterials(5, false)
        setTop5(topData.results)
      } catch (err) {
        console.warn('Backend API offline or warming up. Using cached/static fallback data.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Static Fallback values if API is loading or down
  const displayStats = stats || {
    total_materials: 52205,
    crystal_systems: {},
    top_elements: {},
    magnetization_stats: { mean: 68.42, max: 843.5, min: 0.1, std: 45.2 },
    model_performance: { r2: 0.8903, mae_ub: 2.36, model: 'Random Forest v2', features: 25, training_samples: 22777 }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-16">
      {/* Background Animated Field Lines (SVG) */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="field-glow" cx="50%" cy="40%" r="50%" fx="50%" fy="40%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#00d4ff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0a0e1a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#field-glow)" />
          
          {/* Pulse Magnetic Loops */}
          <path
            d="M -100 400 C 300 100, 700 100, 1100 400"
            fill="none"
            stroke="url(#field-line-grad-1)"
            strokeWidth="1.5"
            className="animate-pulse-field"
            strokeDasharray="8 4"
          />
          <path
            d="M -100 500 C 400 200, 600 200, 1100 500"
            fill="none"
            stroke="url(#field-line-grad-2)"
            strokeWidth="1"
            className="animate-pulse-field"
            style={{ animationDelay: '1s' }}
          />
          <path
            d="M 100 600 C 400 350, 600 350, 900 600"
            fill="none"
            stroke="url(#field-line-grad-1)"
            strokeWidth="2"
            className="animate-pulse-field"
            style={{ animationDelay: '2s' }}
          />

          <linearGradient id="field-line-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#00d4ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="field-line-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.05" />
          </linearGradient>
        </svg>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8 lg:pt-32">
        
        <div className="flex flex-col items-center text-center">
          {isWarmingUp && (
            <div className="mb-6 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-xs font-semibold text-yellow-500 glow-blue animate-pulse">
              ⚡ Hugging Face Space is warming up. Features will load shortly (~30s)...
            </div>
          )}

          <div className="relative">
            <span className="absolute -left-8 -top-8 sm:-left-12 sm:-top-12 animate-float text-4xl sm:text-5xl">🧲</span>
            <h1 className="font-sans text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="gradient-text">MagNet-IQ</span>
            </h1>
          </div>

          <p className="mt-6 max-w-2xl text-base text-magnet-text/80 sm:text-lg lg:text-xl px-4">
            Discover optimal permanent magnet materials using advanced machine learning. Screen, predict, and export candidates instantly.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4 w-full max-w-xs sm:max-w-none sm:w-auto">
            <Link href="/predict" className="btn-primary flex items-center justify-center gap-2">
              <Brain className="h-5 w-5" />
              Predict Material
            </Link>
            <Link href="/recommend" className="btn-secondary flex items-center justify-center gap-2">
              <Zap className="h-5 w-5" />
              Find Materials
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 mx-auto mt-16 sm:mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <div className="glass gradient-border rounded-xl p-4 sm:p-6 text-center">
            <Database className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-magnet-blue mb-2" />
            <span className="block text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-white">
              {mounted ? displayStats.total_materials.toLocaleString() : '52,205'}
            </span>
            <span className="text-[10px] sm:text-xs text-magnet-muted uppercase tracking-wider font-semibold">Total Materials</span>
          </div>

          <div className="glass gradient-border rounded-xl p-4 sm:p-6 text-center">
            <Zap className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-magnet-purple mb-2" />
            <span className="block text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-white">28,472</span>
            <span className="text-[10px] sm:text-xs text-magnet-muted uppercase tracking-wider font-semibold">PM Candidates</span>
          </div>

          <div className="glass gradient-border rounded-xl p-4 sm:p-6 text-center">
            <Cpu className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-magnet-green mb-2" />
            <span className="block text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-white">
              {displayStats.model_performance.r2.toFixed(4)}
            </span>
            <span className="text-[10px] sm:text-xs text-magnet-muted uppercase tracking-wider font-semibold">Model R² Score</span>
          </div>

          <div className="glass gradient-border rounded-xl p-4 sm:p-6 text-center">
            <Layers className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-magnet-blue mb-2" />
            <span className="block text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-white">
              {displayStats.model_performance.mae_ub.toFixed(2)} <span className="text-sm">μB</span>
            </span>
            <span className="text-[10px] sm:text-xs text-magnet-muted uppercase tracking-wider font-semibold">Model MAE</span>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 mx-auto mt-16 sm:mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div className="glass glass-hover rounded-xl p-6 sm:p-8 transition-all">
            <div className="mb-4 inline-block rounded-lg bg-magnet-blue/10 p-3 text-magnet-blue">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Predict</h3>
            <p className="text-sm text-magnet-text/75 leading-relaxed">
              Input custom crystal structure properties and chemical metrics to get a total magnetization prediction and materials rating instantly.
            </p>
          </div>

          <div className="glass glass-hover rounded-xl p-6 sm:p-8 transition-all">
            <div className="mb-4 inline-block rounded-lg bg-magnet-purple/10 p-3 text-magnet-purple">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Recommend</h3>
            <p className="text-sm text-magnet-text/75 leading-relaxed">
              Filter and query the entire candidate database of 28,472 permanent magnet options by element configuration, stability, and structure.
            </p>
          </div>

          <div className="glass glass-hover rounded-xl p-6 sm:p-8 transition-all border-l-2 border-magnet-green/50 sm:col-span-2 md:col-span-1">
            <div className="mb-4 inline-block rounded-lg bg-magnet-green/10 p-3 text-magnet-green">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Rare-Earth-Free</h3>
            <p className="text-sm text-magnet-text/75 leading-relaxed">
              Screen for high-performance magnets that exclude critical raw materials like Nd, Dy, Sm, Gd, lowering supply chain risks.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 mx-auto mt-20 sm:mt-28 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Methodology & Pipeline</h2>
          <p className="text-magnet-muted mt-2 text-sm sm:text-base">The engineering behind MagNet-IQ material discovery</p>
        </div>

        {/* Mobile: vertical stack; Desktop: horizontal with connector line */}
        <div className="relative">
          {/* Desktop horizontal connector line */}
          <div className="absolute top-6 left-0 right-0 hidden h-0.5 bg-gradient-to-r from-magnet-blue via-magnet-purple to-magnet-green md:block z-0" />
          
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-8">
            {[
              { step: '1', title: 'Data Querying', desc: 'Queried 52,205 ferromagnetic candidates from Materials Project API.' },
              { step: '2', title: 'Feature Design', desc: 'Constructed 25 physical, structural, and chemical engineered features.' },
              { step: '3', title: 'RF Training', desc: 'Trained Random Forest model on 22,777 samples achieving R² = 0.8903.' },
              { step: '4', title: 'Dashboard API', desc: 'Created high-performance UI screening with zero-lag prediction & export.' },
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 glass rounded-xl p-4 sm:p-6 text-center">
                <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-magnet-bg border-2 border-magnet-blue font-bold text-magnet-blue mb-3 sm:mb-4 shadow-[0_0_15px_rgba(0,212,255,0.2)] text-sm sm:text-base">
                  {item.step}
                </div>
                <h4 className="font-bold text-white text-sm sm:text-base mb-1 sm:mb-2">{item.title}</h4>
                <p className="text-xs text-magnet-text/75 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top 5 Preview Table */}
      <section className="relative z-10 mx-auto mt-20 sm:mt-28 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Top 5 Magnet Candidates</h2>
            <p className="text-xs text-magnet-muted mt-0.5">Ranked by MagNet-IQ magnet score</p>
          </div>
          <Link href="/recommend" className="text-xs font-semibold text-magnet-blue flex items-center gap-1 hover:underline flex-shrink-0 ml-4">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="glass rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner message="Fetching top materials..." />
            </div>
          ) : top5.length === 0 ? (
            <div className="py-12 text-center text-magnet-muted text-sm px-4">
              Failed to load preview data. Please check back shortly.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="table-dark">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Formula</th>
                      <th>ID</th>
                      <th>Total Mag (μB)</th>
                      <th>Score</th>
                      <th>Crystal</th>
                      <th>Stability (eV/atom)</th>
                      <th>Raw Material</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top5.map((mat) => (
                      <tr key={mat.rank}>
                        <td className="font-mono text-magnet-blue font-bold">#{mat.rank}</td>
                        <td className="font-mono font-bold text-white">{mat.formula}</td>
                        <td className="font-mono text-xs text-magnet-muted">{mat.material_id}</td>
                        <td className="font-mono">{mat.total_magnetization.toFixed(3)}</td>
                        <td className="font-mono font-bold text-magnet-blue">{mat.magnet_score.toFixed(1)}</td>
                        <td>{mat.crystal_system}</td>
                        <td className="font-mono">{mat.energy_above_hull.toFixed(3)}</td>
                        <td>
                          {mat.has_rare_earth ? (
                            <span className="text-xs font-semibold text-magnet-purple/90">Contains RE</span>
                          ) : (
                            <span className="text-xs font-semibold text-magnet-green">✓ RE-Free</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-magnet-border/20">
                {top5.map((mat) => (
                  <div key={mat.rank} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs text-magnet-blue font-bold flex-shrink-0">#{mat.rank}</span>
                        <span className="font-mono font-bold text-white truncate">{mat.formula}</span>
                      </div>
                      {mat.has_rare_earth ? (
                        <span className="text-xs font-semibold text-magnet-purple/90 flex-shrink-0">Contains RE</span>
                      ) : (
                        <span className="text-xs font-semibold text-magnet-green flex-shrink-0">✓ RE-Free</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-magnet-muted">Score</span>
                        <span className="font-mono font-bold text-magnet-blue">{mat.magnet_score.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-magnet-muted">Mag.</span>
                        <span className="font-mono">{mat.total_magnetization.toFixed(2)} μB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-magnet-muted">Crystal</span>
                        <span>{mat.crystal_system}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-magnet-muted">Stability</span>
                        <span className="font-mono">{mat.energy_above_hull.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-magnet-muted">ID</span>
                        <span className="font-mono text-[10px] text-magnet-muted">{mat.material_id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
