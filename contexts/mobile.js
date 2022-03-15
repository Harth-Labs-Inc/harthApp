import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

export const SizeContext = createContext({})
export const MobileContext = createContext(false)

export const ResponsiveProvider = (props) => {
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const isMobile = width <= 768

  const sizeContext = useMemo(() => ({ width }), [width])
  const mobileContext = useMemo(() => ({ isMobile }), [isMobile])

  return (
    <SizeContext.Provider value={sizeContext}>
      <MobileContext.Provider value={mobileContext}>
        {props.children}
      </MobileContext.Provider>
    </SizeContext.Provider>
  )
}

export const useSize = () => useContext(SizeContext)
