export interface PredictInput {
  formula: string
  elements: string[]
  nelements: number
  nsites: number
  volume: number
  density: number
  energy_above_hull: number
  formation_energy: number
  band_gap: number
  num_magnetic_sites: number
  crystal_system: string
  magnetization_norm_vol: number
}

export interface PredictResult {
  formula: string
  predicted_magnetization: number
  magnet_score: number
  grade: string
  has_rare_earth: boolean
  num_transition_metals: number
  confidence: string
}

export interface MaterialResult {
  rank: number
  material_id: string
  formula: string
  total_magnetization: number
  magnet_score: number
  energy_above_hull: number
  crystal_system: string
  density: number
  elements: string[]
  has_rare_earth: boolean
}

export interface RecommendResult {
  count: number
  rare_earth_free_count: number
  filters_applied: Record<string, unknown>
  results: MaterialResult[]
}

export interface StatsResult {
  total_materials: number
  crystal_systems: Record<string, number>
  top_elements: Record<string, number>
  magnetization_stats: {
    mean: number
    max: number
    min: number
    std: number
  }
  model_performance: {
    r2: number
    mae_ub: number
    model: string
    features: number
    training_samples: number
  }
}
