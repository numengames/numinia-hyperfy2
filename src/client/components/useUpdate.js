import { useState } from 'react'

export function useUpdate() {
  const [v, setV] = useState(0)
  return () => setV(v => v + 1)
}
