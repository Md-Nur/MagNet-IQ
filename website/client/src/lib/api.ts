import { PredictInput, PredictResult, RecommendResult, StatsResult, MaterialResult } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL

export async function predictMaterial(data: PredictInput): Promise<PredictResult> {
  const res = await fetch(`${API}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Prediction failed: ${res.status}`)
  return res.json()
}

export async function getRecommendations(params: {
  elements: string
  element_match_mode?: 'all' | 'any'
  crystal_system?: string
  max_stability?: number
  rare_earth_free?: boolean
  sort_by?: string
  limit?: number
}): Promise<RecommendResult> {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    )
  ).toString()
  const res = await fetch(`${API}/recommend?${query}`)
  if (!res.ok) throw new Error('Recommendation failed')
  return res.json()
}

export async function getStats(): Promise<StatsResult> {
  const res = await fetch(`${API}/stats`)
  if (!res.ok) throw new Error('Stats failed')
  return res.json()
}

export async function getTopMaterials(
  limit = 20,
  rareEarthFree = false
): Promise<{ count: number; results: MaterialResult[] }> {
  const res = await fetch(
    `${API}/top-materials?limit=${limit}&rare_earth_free=${rareEarthFree}`
  )
  if (!res.ok) throw new Error('Top materials failed')
  return res.json()
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API}/`, {
      signal: AbortSignal.timeout(5000),
    })
    return res.ok
  } catch {
    return false
  }
}
