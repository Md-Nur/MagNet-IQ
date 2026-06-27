'use client'

import { useState } from 'react'
import { getRecommendations } from '@/lib/api'
import { MaterialResult } from '@/types'
import ElementPills from '@/components/ElementPills'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Filter, Download, Zap, Sparkles } from 'lucide-react'

export default function RecommendPage() {
  const [selectedElements, setSelectedElements] = useState<string[]>(['Fe'])
  const [crystalSystem, setCrystalSystem] = useState<string>('all')
  const [maxStability, setMaxStability] = useState<number>(0.1)
  const [sortParam, setSortParam] = useState<string>('score')
  const [limit, setLimit] = useState<number>(10)
  const [rareEarthFree, setRareEarthFree] = useState<boolean>(false)

  const [results, setResults] = useState<MaterialResult[]>([])
  const [reFreeCount, setReFreeCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [hasSearched, setHasSearched] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const elementGroups = [
    { label: 'Transition Metals', elements: ['Fe', 'Co', 'Ni', 'Mn', 'Cr', 'V', 'Cu', 'Ti'], color: 'blue' as const },
    { label: 'Rare Earths (Purple)', elements: ['Nd', 'Sm', 'Gd', 'Eu', 'Dy', 'Pr', 'Tb', 'La', 'Ce'], color: 'purple' as const },
    { label: 'Common Alloys & Non-Metals', elements: ['O', 'Li', 'B', 'C', 'N', 'F', 'P', 'Si', 'Ba', 'Sr'], color: 'muted' as const },
  ]

  const handleSearch = async () => {
    if (selectedElements.length === 0) {
      setError('Please select at least one element.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await getRecommendations({
        elements: selectedElements.join(','),
        crystal_system: crystalSystem,
        max_stability: maxStability,
        rare_earth_free: rareEarthFree,
        sort_by: sortParam,
        limit: limit,
      })
      setResults(res.results)
      setReFreeCount(res.rare_earth_free_count)
      setHasSearched(true)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch recommendations. Make sure the backend server is online.')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (results.length === 0) return

    const headers = ['Rank', 'ID', 'Formula', 'Magnetization (uB)', 'MagNet-IQ Score', 'Stability (eV/atom)', 'Crystal System', 'Density (g/cm3)', 'Rare Earth Free']
    const rows = results.map(row => [
      row.rank,
      row.material_id,
      row.formula,
      row.total_magnetization,
      row.magnet_score,
      row.energy_above_hull,
      row.crystal_system,
      row.density,
      !row.has_rare_earth ? 'RE-Free' : 'Contains RE'
    ])

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `MagNet-IQ-recommendations-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
          Material <span className="gradient-text">Discovery & Recommender</span>
        </h1>
        <p className="mt-2 text-sm text-magnet-muted">
          Screen 28,472 magnet candidates based on chemical, structural, and thermodynamic constraints.
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-12">
        {/* Left Filters Panel */}
        <div className="glass rounded-2xl p-5 lg:col-span-4 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Filter className="h-5 w-5 text-magnet-blue flex-shrink-0" /> Screening Filters
          </h2>

          {/* Element Pills */}
          <div>
            <label className="block text-xs font-semibold text-magnet-muted uppercase mb-1">
              Elements
            </label>
            <p className="text-[11px] text-magnet-muted mb-3">
              Materials must contain ALL selected elements
            </p>
            <ElementPills
              selected={selectedElements}
              onChange={setSelectedElements}
              groups={elementGroups}
            />
          </div>

          <hr className="border-magnet-border/30" />

          {/* Filters Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-magnet-muted uppercase mb-1">
                Crystal System
              </label>
              <select
                value={crystalSystem}
                onChange={(e) => setCrystalSystem(e.target.value)}
                className="input-dark"
              >
                <option value="all">All Systems</option>
                {['Monoclinic', 'Triclinic', 'Orthorhombic', 'Trigonal', 'Tetragonal', 'Cubic', 'Hexagonal'].map(
                  (sys) => (
                    <option key={sys} value={sys}>
                      {sys}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-magnet-muted uppercase mb-1">
                Thermodynamic Stability (Max Hull)
              </label>
              <select
                value={String(maxStability)}
                onChange={(e) => setMaxStability(Number(e.target.value))}
                className="input-dark"
              >
                <option value="0.00">Perfectly Stable (0.00 eV/atom)</option>
                <option value="0.05">High Stability (≤ 0.05 eV/atom)</option>
                <option value="0.10">Good Stability (≤ 0.10 eV/atom)</option>
                <option value="1.00">Unrestricted (1.00 eV/atom)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-magnet-muted uppercase mb-1">
                  Sort By
                </label>
                <select
                  value={sortParam}
                  onChange={(e) => setSortParam(e.target.value)}
                  className="input-dark"
                >
                  <option value="score">Score</option>
                  <option value="magnetization">Magnetization</option>
                  <option value="stability">Stability</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-magnet-muted uppercase mb-1">
                  Limit
                </label>
                <select
                  value={String(limit)}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="input-dark"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            {/* ⭐ RARE EARTH FREE TOGGLE ⭐ */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                rareEarthFree
                  ? 'border-magnet-green bg-magnet-green/5 glow-green'
                  : 'border-magnet-border/60 bg-magnet-surface/20'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="block text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-magnet-green flex-shrink-0" /> Rare-Earth-Free Only
                  </span>
                  <span className="block text-[11px] text-magnet-muted mt-0.5 leading-tight">
                    Exclude Nd, Sm, Gd, Eu, Dy, Pr, Tb, La, Ce
                  </span>
                </div>
                <label className="toggle-switch flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={rareEarthFree}
                    onChange={(e) => setRareEarthFree(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

          <button onClick={handleSearch} disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2">
            {loading ? 'Finding Materials...' : 'Find Materials'}
          </button>
        </div>

        {/* Right Results Panel */}
        <div className="lg:col-span-8 flex flex-col">
          {loading ? (
            <div className="glass rounded-2xl p-12 flex justify-center items-center flex-1 min-h-[300px]">
              <LoadingSpinner message="Querying dataset candidates..." />
            </div>
          ) : results.length > 0 ? (
            <div className="glass rounded-2xl overflow-hidden flex flex-col flex-1">
              {/* Summary Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-magnet-border/30 bg-magnet-surface/30">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Showing <span className="text-magnet-blue">{results.length}</span> materials
                  </p>
                  <p className="text-xs text-magnet-muted mt-0.5">
                    · <span className="text-magnet-green font-semibold">{reFreeCount}</span> are rare-earth-free
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="btn-outline flex items-center gap-2 text-xs py-2"
                >
                  <Download className="h-4 w-4" /> Export CSV
                </button>
              </div>

              {/* Desktop Table (hidden on mobile) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="table-dark">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Formula</th>
                      <th>Score</th>
                      <th>Magnetization</th>
                      <th>Crystal</th>
                      <th>Stability</th>
                      <th>Density</th>
                      <th>RE-Free</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((mat) => (
                      <tr key={mat.rank}>
                        <td className="font-mono text-magnet-blue font-semibold">#{mat.rank}</td>
                        <td className="font-mono font-bold text-white">{mat.formula}</td>
                        <td className="font-mono text-magnet-blue font-semibold">{mat.magnet_score.toFixed(1)}</td>
                        <td className="font-mono">{mat.total_magnetization.toFixed(2)} μB</td>
                        <td className="text-magnet-text/90">{mat.crystal_system}</td>
                        <td className="font-mono text-xs">{mat.energy_above_hull.toFixed(3)}</td>
                        <td className="font-mono text-xs">{mat.density.toFixed(2)}</td>
                        <td>
                          {mat.has_rare_earth ? (
                            <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">
                              Contains RE
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-magnet-green bg-magnet-green/10 px-2 py-0.5 rounded border border-magnet-green/20">
                              ✓ RE-Free
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (visible on mobile only) */}
              <div className="sm:hidden divide-y divide-magnet-border/20">
                {results.map((mat) => (
                  <div key={mat.rank} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs text-magnet-blue font-semibold flex-shrink-0">#{mat.rank}</span>
                        <span className="font-mono font-bold text-white truncate">{mat.formula}</span>
                      </div>
                      {mat.has_rare_earth ? (
                        <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20 flex-shrink-0">
                          Contains RE
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-magnet-green bg-magnet-green/10 px-2 py-0.5 rounded border border-magnet-green/20 flex-shrink-0">
                          ✓ RE-Free
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-magnet-muted">Score</span>
                        <span className="font-mono font-semibold text-magnet-blue">{mat.magnet_score.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-magnet-muted">Mag.</span>
                        <span className="font-mono">{mat.total_magnetization.toFixed(1)} μB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-magnet-muted">Crystal</span>
                        <span className="text-magnet-text/90">{mat.crystal_system}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-magnet-muted">Stability</span>
                        <span className="font-mono">{mat.energy_above_hull.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-magnet-muted">Density</span>
                        <span className="font-mono">{mat.density.toFixed(2)} g/cm³</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-10 sm:p-12 flex flex-col justify-center items-center text-center flex-1 min-h-[300px] border border-dashed border-magnet-border/40">
              <Zap className="h-12 w-12 text-magnet-muted mb-4" />
              <h3 className="text-white font-bold text-lg">
                {hasSearched ? 'No Materials Found' : 'Discovery Dashboard'}
              </h3>
              <p className="text-xs text-magnet-muted max-w-sm mt-1">
                {hasSearched
                  ? 'No materials found containing all selected elements. Try selecting fewer elements or relaxing other filters.'
                  : 'Select target constituent elements and click Find Materials to begin screening.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
