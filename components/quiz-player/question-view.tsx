'use client'

import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Question } from '@/lib/types'

interface QuestionViewProps {
  quizTitle: string
  question: Question
  currentIdx: number
  totalQ: number
  answer: string
  onAnswerChange: (value: string) => void
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
  isSubmitting: boolean
  submitError: string | null
  saveError: string | null
}

const TYPE_LABEL: Record<string, string> = {
  mcq: 'Multiple Choice',
  short: 'Short Answer',
  code: 'Code',
}

export function QuestionView({
  quizTitle,
  question,
  currentIdx,
  totalQ,
  answer,
  onAnswerChange,
  onPrev,
  onNext,
  onSubmit,
  isSubmitting,
  submitError,
  saveError,
}: QuestionViewProps) {
  const isLast = currentIdx === totalQ - 1
  const progress = ((currentIdx + 1) / totalQ) * 100

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-lg truncate">{quizTitle}</h1>
            <span className="text-sm text-muted-foreground shrink-0">
              {currentIdx + 1} / {totalQ}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Question {currentIdx + 1}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {TYPE_LABEL[question.type] ?? question.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base">{question.prompt}</p>

            {question.codeSnippet && (
              <pre className="rounded-lg bg-muted p-4 text-sm font-mono overflow-x-auto whitespace-pre">
                {question.codeSnippet}
              </pre>
            )}

            {question.type === 'mcq' && question.options && (
              <RadioGroup value={answer} onValueChange={onAnswerChange} className="space-y-2">
                {question.options.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => onAnswerChange(opt)}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      answer === opt ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <RadioGroupItem value={opt} id={`opt-${i}`} />
                    <Label htmlFor={`opt-${i}`} className="cursor-pointer flex-1">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === 'short' && (
              <div className="space-y-1.5">
                <Label htmlFor="short-answer">Your answer</Label>
                <Input
                  id="short-answer"
                  placeholder="Type your answer..."
                  value={answer}
                  onChange={(e) => onAnswerChange(e.target.value)}
                />
              </div>
            )}

            {question.type === 'code' && (
              <div className="space-y-1.5">
                <Label htmlFor="code-answer">Your code</Label>
                <Textarea
                  id="code-answer"
                  placeholder="Write your code here..."
                  value={answer}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">This question is not auto-graded</p>
              </div>
            )}
          </CardContent>
        </Card>

        {saveError && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Answer not saved: {saveError}
          </div>
        )}

        {submitError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {submitError}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={currentIdx === 0 || isSubmitting}
            className="flex-1 gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>
          {isLast ? (
            <Button onClick={onSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Submitting…' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={onNext} disabled={isSubmitting} className="flex-1 gap-2">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
