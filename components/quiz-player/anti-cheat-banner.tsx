'use client'

import { ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { AntiCheatSummary } from '@/hooks/useAntiCheat'

function groupByQuestion(events: { question: string }[]): string {
  const counts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.question] = (acc[e.question] ?? 0) + 1
    return acc
  }, {})
  return Object.entries(counts)
    .map(([q, count]) => (count > 1 ? `${q} ×${count}` : q))
    .join(', ')
}

interface AntiCheatBannerProps {
  antiCheat: AntiCheatSummary
}

export function AntiCheatBanner({ antiCheat }: AntiCheatBannerProps) {
  const hasEvents = antiCheat.tabSwitches.length > 0 || antiCheat.pastes.length > 0
  if (!hasEvents) return null

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <span className="font-medium text-sm text-amber-900">Anti-Cheat Summary</span>
        </div>
        <div className="space-y-1 text-sm text-amber-800">
          {antiCheat.tabSwitches.length > 0 && (
            <p>
              {antiCheat.tabSwitches.length} tab switch
              {antiCheat.tabSwitches.length !== 1 ? 'es' : ''}{' '}
              <span className="text-amber-700">({groupByQuestion(antiCheat.tabSwitches)})</span>
            </p>
          )}
          {antiCheat.pastes.length > 0 && (
            <p>
              {antiCheat.pastes.length} paste{antiCheat.pastes.length !== 1 ? 's' : ''}{' '}
              <span className="text-amber-700">({groupByQuestion(antiCheat.pastes)})</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
