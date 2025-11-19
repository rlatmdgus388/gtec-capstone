// components/pwa-elements-loader.tsx
"use client"

import { useEffect } from "react"
import { defineCustomElements } from "@ionic/pwa-elements/loader"

export function PwaElementsLoader() {
  useEffect(() => {
    // 웹에서만 실행되면서 pwa-camera-modal 같은 웹 컴포넌트를 등록해 줌
    defineCustomElements(window)
  }, [])

  return null
}
