'use client'

import { useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { api } from '@/lib/api'

export interface TabSwitchEvent {
  question: string
}

export interface PasteEvent {
  question: string
}

export interface AntiCheatSummary {
  tabSwitches: TabSwitchEvent[]
  pastes: PasteEvent[]
}

export function useAntiCheat(attemptId: number | null, getCurrentQuestion: () => string) {
  const tabSwitchesRef = useRef<TabSwitchEvent[]>([])
  const pastesRef = useRef<PasteEvent[]>([])

  // Sync the latest callback into a ref after every render — never stale, never causes re-renders
  const getCurrentQuestionRef = useRef(getCurrentQuestion)
  useLayoutEffect(() => {
    getCurrentQuestionRef.current = getCurrentQuestion
  })

  const attemptIdRef = useRef(attemptId)
  useLayoutEffect(() => {
    attemptIdRef.current = attemptId
  })

  const logEvent = useCallback((eventName: string) => {
    if (attemptIdRef.current !== null) {
      api.trackEvent(attemptIdRef.current, eventName).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (attemptId === null) return

    const handleBlur = () => {
      const question = getCurrentQuestionRef.current()
      tabSwitchesRef.current.push({ question })
      logEvent(`tab_blur on ${question}`)
    }

    const handleFocus = () => {
      logEvent('tab_focus')
    }

    const handlePaste = () => {
      const question = getCurrentQuestionRef.current()
      pastesRef.current.push({ question })
      logEvent(`paste_detected on ${question}`)
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('paste', handlePaste)
    }
  }, [attemptId, logEvent])

  const getSummary = (): AntiCheatSummary => ({
    tabSwitches: [...tabSwitchesRef.current],
    pastes: [...pastesRef.current],
  })

  return { getSummary }
}
