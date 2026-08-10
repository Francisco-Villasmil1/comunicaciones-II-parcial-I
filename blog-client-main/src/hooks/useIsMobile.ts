import { useEffect, useState } from 'react'

export const MOBILE_MAX_WIDTH = 450
export const TABLET_MAX_WIDTH = 850

type DeviceType = 'mobile' | 'tablet' | 'desktop'

type BreakpointState = {
  width: number
  deviceType: DeviceType
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

const getBreakpointState = (width: number): BreakpointState => {
  if (width <= MOBILE_MAX_WIDTH) {
    return {
      width,
      deviceType: 'mobile',
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    }
  }

  if (width <= TABLET_MAX_WIDTH) {
    return {
      width,
      deviceType: 'tablet',
      isMobile: false,
      isTablet: true,
      isDesktop: false,
    }
  }

  return {
    width,
    deviceType: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }
}

const getCurrentWidth = () =>
  typeof window !== 'undefined' ? window.innerWidth : TABLET_MAX_WIDTH + 1

export function useIsMobile() {
  const [state, setState] = useState<BreakpointState>(() =>
    getBreakpointState(getCurrentWidth()),
  )

  useEffect(() => {
    const onResize = () => setState(getBreakpointState(window.innerWidth))

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return state
}
