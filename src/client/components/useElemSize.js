import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export function useElemSize() {
  const elemRef = useRef(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  useEffect(() => {
    const elem = elemRef.current
    if (!elem) return
    setWidth(elem.offsetWidth)
    setHeight(elem.offsetHeight)
    const observer = new ResizeObserver(entries => {
      setWidth(elem.offsetWidth)
      setHeight(elem.offsetHeight)
    })
    observer.observe(elem)
    return () => {
      observer.disconnect()
    }
  }, [])
  return [elemRef, width, height]
}
