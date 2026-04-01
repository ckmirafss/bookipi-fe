'use client'

import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StartScreenProps {
  quizIdInput: string
  onChange: (value: string) => void
  onStart: () => void
  isPending: boolean
  error: string | null
}

export function StartScreen({ quizIdInput, onChange, onStart, isPending, error }: StartScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen p-6 bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <CardTitle>Take a Quiz</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="quizId">Quiz ID</Label>
            <Input
              id="quizId"
              type="number"
              placeholder="Enter quiz ID"
              value={quizIdInput}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && quizIdInput && onStart()}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <Button className="w-full" disabled={!quizIdInput || isPending} onClick={onStart}>
            {isPending ? 'Loading…' : 'Start Quiz'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
