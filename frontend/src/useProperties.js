import { useEffect, useState } from 'react'
import { api } from './api.js'
import { properties as mock } from './data.js'
// Falls back to mock data only when the API is unreachable, so the UI still previews without a backend.
export function useProperties(query = 'limit=100') {
  const [s, setS] = useState({ properties: [], loading: true })
  useEffect(() => {
    api('/properties?' + query).then((d) => setS({ properties: d.properties, loading: false }))
      .catch(() => { console.warn('API unavailable, using mock data'); setS({ properties: mock, loading: false }) })
  }, [query])
  return s
}
export function useProperty(id) {
  const [s, setS] = useState({ property: null, loading: true })
  useEffect(() => {
    setS({ property: null, loading: true })
    api('/properties/' + id).then((d) => setS({ property: d.property, loading: false }))
      .catch(() => setS({ property: mock.find((x) => x.id === id) || null, loading: false }))
  }, [id])
  return s
}
