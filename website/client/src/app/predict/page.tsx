'use client'

import { useState } from 'react'
import { Brain, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react'
import { predictMaterial } from '@/lib/api'
import { PredictInput, PredictResult } from '@/types'
import ScoreBar from '@/components/ScoreBar'
import GradeStars from '@/components/GradeStars'
import LoadingSpinner from '@/components/LoadingSpinner'

const EXAMPLE_DATA: PredictInput = {
  formula: 'Gd2Fe14C',
  elements: ['Gd', 'Fe', 'C'],
  nelements: 3,
  nsites: 34,
  volume: 866.4,
  density: 8.5,
  energy_above_hull: 0.036,
  formation_energy: -0.45,
  band_gap: 0.0,
  num_magnetic_sites: 16,
  crystal_system: 'Tetragonal',
  magnetization_norm_vol: 0.198,
}

export default function PredictPage() {
  const [formData, setFormData] = useState({
    formula: '',
    elements: '',
    nelements: '',
    nsites: '',
    volume: '',
    density: '',
    energy_above_hull: '',
    formation_energy: '',
    band_gap: '',
    num_magnetic_sites: '',
    magnetization_norm_vol: '',
    crystal_system: 'Monoclinic',
  })

  const [loading, setLoading] = useState(false)
  const [warmingMessage, setWarmingMessage] = useState(false)
  const [result, setResult] = useState<PredictResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const prefillExample = () => {
    setFormData({
      formula: EXAMPLE_DATA.formula,
      elements: EXAMPLE_DATA.elements.join(', '),
      nelements: String(EXAMPLE_DATA.nelements),
      nsites: String(EXAMPLE_DATA.nsites),
      volume: String(EXAMPLE_DATA.volume),
      density: String(EXAMPLE_DATA.density),
      energy_above_hull: String(EXAMPLE_DATA.energy_above_hull),
      formation_energy: String(EXAMPLE_DATA.formation_energy),
      band_gap: String(EXAMPLE_DATA.band_gap),
      num_magnetic_sites: String(EXAMPLE_DATA.num_magnetic_sites),
      magnetization_norm_vol: String(EXAMPLE_DATA.magnetization_norm_vol),
      crystal_system: EXAMPLE_DATA.crystal_system,
    })
    setError(null)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setWarmingMessage(false)

    // Trigger warming up warning if request takes longer than 5 seconds
    const timer = setTimeout(() => {
      setWarmingMessage(true)
    }, 5000)

    try {
      const elementsArray = formData.elements
        .split(',')
        .map((el) => el.trim())
        .filter((el) => el !== '')

      const payload: PredictInput = {
        formula: formData.formula,
        elements: elementsArray,
        nelements: Number(formData.nelements),
        nsites: Number(formData.nsites),
        volume: Number(formData.volume),
        density: Number(formData.density),
        energy_above_hull: Number(formData.energy_above_hull),
        formation_energy: Number(formData.formation_energy),
        band_gap: Number(formData.band_gap),
        num_magnetic_sites: Number(formData.num_magnetic_sites),
        magnetization_norm_vol: Number(formData.magnetization_norm_vol),
        crystal_system: formData.crystal_system,
      }

      const res = await predictMaterial(payload)
      setResult(res)
    } catch (err: any) {
      console.error(err)
      setError('Prediction failed. Make sure all numerical values are positive and correct.')
    } finally {
      clearTimeout(timer)
      setLoading(false)
      setWarmingMessage(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
          Magnetization <span className="gradient-text">Predictor</span>
        </h1>
        <p className="mt-2 text-sm text-magnet-muted">
          Leverage a Random Forest Regressor to compute total magnetization in real-time.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Form */}
        <div className="glass rounded-2xl p-5 sm:p-6 md:p-8 lg:col-span-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-magnet-blue flex-shrink-0" /> Material Specifications
            </h2>
            <button
              onClick={prefillExample}
              type="button"
              className="text-xs font-semibold text-magnet-purple hover:text-magnet-blue flex items-center gap-1.5 transition-colors self-start sm:self-auto flex-shrink-0"
            >
              <Sparkles className="h-4 w-4" /> Try Example (Gd₂Fe₁₄C)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-magnet-muted uppercase mb-2">
                  Chemical Formula
                </label>
                <input
                  type="text"
                  name="formula"
                  value={formData.formula}
                  onChange={handleInputChange}
                  placeholder="e.g. Gd2Fe14C"
                  required
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-magnet-muted uppercase mb-2">
                  Constituent Elements
                </label>
                <input
                  type="text"
                  name="elements"
                  value={formData.elements}
                  onChange={handleInputChange}
                  placeholder="Comma-separated: Gd, Fe, C"
                  required
                  className="input-dark"
                />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-magnet-muted uppercase mb-2">
                  Num Elements
                </label>
                <input
                  type="number"
                  name="nelements"
                  value={formData.nelements}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-magnet-muted uppercase mb-2">
                  Total Atoms (nsites)
                </label>
                <input
                  type="number"
                  name="nsites"
                  value={formData.nsites}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-magnet-muted uppercase mb-2">
                  Magnetic Sites
                </label>
                <input
                  type="number"
                  name="num_magnetic_sites"
                  value={formData.num_magnetic_sites}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="input-dark"
                />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-magnet-muted uppercase mb-2">
                  Volume (Å³)
                </label>
                <input
                  type="number"
                  name="volume"
                  value={formData.volume}
                  onChange={handleInputChange}
                  step="0.1"
                  required
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-magnet-muted uppercase mb-2">
                  Density (g/cm³)
                </label>
                <input
                  type="number"
                  name="density"
                  value={formData.density}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-magnet-muted uppercase mb-2">
                  Mag Norm Vol
                </label>
                <input
                  type="number"
                  name="magnetization_norm_vol"
                  value={formData.magnetization_norm_vol}
                  onChange={handleInputChange}
                  step="0.0001"
                  required
                  className="input-dark"
                />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-magnet-muted uppercase mb-2">
                  Formation E (eV/atom)
                </label>
                <input
                  type="number"
                  name="formation_energy"
                  value={formData.formation_energy}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-magnet-muted uppercase mb-2">
                  Energy Above Hull (eV)
                </label>
                <input
                  type="number"
                  name="energy_above_hull"
                  value={formData.energy_above_hull}
                  onChange={handleInputChange}
                  step="0.001"
                  min="0"
                  required
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-magnet-muted uppercase mb-2">
                  Band Gap (eV)
                </label>
                <input
                  type="number"
                  name="band_gap"
                  value={formData.band_gap}
                  onChange={handleInputChange}
                  step="0.001"
                  min="0"
                  required
                  className="input-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-magnet-muted uppercase mb-2">
                Crystal System
              </label>
              <select
                name="crystal_system"
                value={formData.crystal_system}
                onChange={handleInputChange}
                className="input-dark"
              >
                {['Monoclinic', 'Triclinic', 'Orthorhombic', 'Trigonal', 'Tetragonal', 'Cubic', 'Hexagonal'].map(
                  (sys) => (
                    <option key={sys} value={sys}>
                      {sys}
                    </option>
                  )
                )}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              {loading ? 'Predicting...' : 'Predict Magnetization'}
            </button>
          </form>
        </div>

        {/* Right Column: Prediction Results */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          {loading ? (
            <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[200px] sm:min-h-[300px]">
              <LoadingSpinner message={warmingMessage ? 'Hugging Face Space is warming up (~30s)...' : 'Evaluating properties...'} />
            </div>
          ) : error ? (
            <div className="glass rounded-2xl p-6 border-l-4 border-red-500 bg-red-500/10 flex gap-4 min-h-[150px]">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white">Prediction Failed</h3>
                <p className="text-sm text-red-200/80 mt-1">{error}</p>
              </div>
            </div>
          ) : result ? (
            <div className="glass rounded-2xl p-6 md:p-8 animate-fade-in-up border-l-2 border-magnet-blue shadow-[0_0_30px_rgba(0,212,255,0.05)]">
              <span className="text-xs text-magnet-muted uppercase tracking-wider font-semibold">
                Prediction Output ({result.formula})
              </span>
              
              <div className="mt-4">
                <span className="font-mono text-5xl font-extrabold text-white sm:text-6xl">
                  {result.predicted_magnetization}
                </span>
                <span className="text-sm font-semibold text-magnet-blue ml-2">μB</span>
                <p className="text-xs text-magnet-muted mt-1">Predicted Magnetization (Total)</p>
              </div>

              <div className="mt-6 space-y-4">
                {/* Score */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-magnet-muted uppercase mb-1">
                    <span>MagNet-IQ Score</span>
                  </div>
                  <ScoreBar score={result.magnet_score} />
                </div>

                {/* Grade */}
                <div className="flex items-center justify-between py-2 border-b border-magnet-border/30">
                  <span className="text-sm text-magnet-text/80 font-medium">Material Grade</span>
                  <GradeStars grade={result.grade} />
                </div>

                {/* Rare Earth Status */}
                <div className="flex items-center justify-between py-2 border-b border-magnet-border/30">
                  <span className="text-sm text-magnet-text/80 font-medium">Critical Materials</span>
                  {result.has_rare_earth ? (
                    <span className="rounded bg-red-500/15 border border-red-500/50 px-2 py-0.5 text-xs font-semibold text-red-400">
                      Contains Rare-Earth
                    </span>
                  ) : (
                    <span className="rounded bg-magnet-green/15 border border-magnet-green/50 px-2 py-0.5 text-xs font-semibold text-magnet-green">
                      ✓ Rare-Earth-Free
                    </span>
                  )}
                </div>

                {/* Transition Metals */}
                <div className="flex items-center justify-between py-2 border-b border-magnet-border/30">
                  <span className="text-sm text-magnet-text/80 font-medium">Transition Metals</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {result.num_transition_metals}
                  </span>
                </div>

                {/* Confidence */}
                <div className="flex items-center justify-between py-2 border-b border-magnet-border/30">
                  <span className="text-sm text-magnet-text/80 font-medium">Confidence Interval</span>
                  <span className={`text-xs uppercase font-bold tracking-wider ${result.confidence === 'high' ? 'text-magnet-green' : 'text-yellow-500'}`}>
                    {result.confidence}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href={`https://materialsproject.org/materials?formula=${result.formula}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline flex items-center justify-center gap-2 text-xs w-full"
                >
                  View on Materials Project <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[200px] sm:min-h-[300px] border border-dashed border-magnet-border/40 text-center">
              <Brain className="h-10 w-10 text-magnet-muted mb-3" />
              <h3 className="text-white font-bold">Awaiting Input</h3>
              <p className="text-xs text-magnet-muted max-w-[240px] mt-1">
                Prefill or complete the material specs on the left, then click Predict.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
