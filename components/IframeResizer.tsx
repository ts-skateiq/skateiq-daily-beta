'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function IframeResizer() {
  const pathname = usePathname()

  useEffect(() => {
    const send = () => {
      const h = document.documentElement.scrollHeight
      window.parent.postMessage({ type: 'skateiq-resize', height: h }, '*')
    }

    send()
    const ro = new ResizeObserver(send)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [pathname])

  return null
}
