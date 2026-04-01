'use client'

import Link from 'next/link'
import { ArrowLeft, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AntiCheatBanner } from './anti-cheat-banner'
import type { Attempt, SubmitResult } from '@/lib/types'
import type { AntiCheatSummary } from '@/hooks/useAntiCheat'

const TYPE_LABEL: Record<string, string> = {
  mcq: 'Multiple Choice',
  short: 'Short Answer',
  code: 'Code',
}

interface ResultsViewProps {
  attempt: Attempt
  result: SubmitResult
  answers: Record<number, string>
  antiCheat: AntiCheatSummary
  onReset: () => void
}

export function ResultsView({ attempt, result, answers, antiCheat, onReset }: ResultsViewProps) {
  const questions = attempt.quiz.questions
  const totalAuto = result.details.length
  const pct = totalAuto > 0 ? Math.round((result.score / totalAuto) * 100) : 0

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Results</h1>
        </div>

        {/* Score card */}
        <Card>
          <CardContent className="pt-6 pb-6 text-center space-y-3">
            <p className="text-muted-foreground">{attempt.quiz.title}</p>
            <p className="text-6xl font-bold">
              {result.score}
              <span className="text-2xl text-muted-foreground font-normal">/{totalAuto}</span>
            </p>
            <p className="text-xl font-semibold text-muted-foreground">{pct}%</p>
            <Progress value={pct} className="h-3 mt-2" />
          </CardContent>
        </Card>

        {/* Per-question breakdown */}
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const detail = result.details.find((d) => d.questionId === q.id)
            const userAnswer = answers[q.id] ?? ''
            const isCode = q.type === 'code'

            return (
              <Card key={q.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isCode ? (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">–</span>
                        </div>
                      ) : detail?.correct ? (
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <X className="h-3.5 w-3.5 text-red-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">Q{idx + 1}</span>
                        <Badge variant="secondary" className="text-xs">
                          {TYPE_LABEL[q.type] ?? q.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{q.prompt}</p>
                      {detail && !detail.correct && detail.expected && (
                        <p className="text-xs mt-1">
                          <span className="text-muted-foreground">Expected: </span>
                          <span className="font-medium text-foreground">{detail.expected}</span>
                        </p>
                      )}
                      {isCode && (
                        <>
                          {userAnswer ? (
                            <pre className="text-xs mt-2 p-2 rounded bg-muted font-mono whitespace-pre-wrap break-all">
                              {userAnswer}
                            </pre>
                          ) : (
                            <p className="text-xs mt-1 text-muted-foreground italic">
                              No answer submitted
                            </p>
                          )}
                          <p className="text-xs mt-1 text-muted-foreground italic">
                            Not auto-graded
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <AntiCheatBanner antiCheat={antiCheat} />

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onReset}>
            Take Another Quiz
          </Button>
          <Link href="/build" className="flex-1">
            <Button variant="outline" className="w-full">
              Create a Quiz
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
