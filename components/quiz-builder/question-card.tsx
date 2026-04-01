'use client'

import { Trash2, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { QuestionFormData } from '@/lib/types'

interface QuestionCardProps {
  question: QuestionFormData
  index: number
  canRemove: boolean
  disabled?: boolean
  onUpdate: (patch: Partial<QuestionFormData>) => void
  onRemove: () => void
  onOptionChange: (optIdx: number, value: string) => void
  onAddOption: () => void
  onRemoveOption: (optIdx: number) => void
}

export function QuestionCard({
  question,
  index,
  canRemove,
  disabled = false,
  onUpdate,
  onRemove,
  onOptionChange,
  onAddOption,
  onRemoveOption,
}: QuestionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Question {index + 1}</CardTitle>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onUpdate({ type: 'mcq', correctAnswer: '' })}
                disabled={disabled}
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                  question.type === 'mcq'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ type: 'short', options: [], correctAnswer: '' })}
                disabled={disabled}
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                  question.type === 'short'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                Short Answer
              </button>
            </div>
          </div>
          {canRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              disabled={disabled}
              className="text-destructive hover:text-destructive h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Question prompt</Label>
          <Textarea
            placeholder="Enter your question..."
            value={question.prompt}
            onChange={(e) => onUpdate({ prompt: e.target.value })}
            rows={2}
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5">
          <Label>
            Code snippet{' '}
            <span className="text-muted-foreground font-normal text-xs">(optional, display only)</span>
          </Label>
          <Textarea
            placeholder={`function example() {\n  // shown alongside question\n}`}
            value={question.codeSnippet}
            onChange={(e) => onUpdate({ codeSnippet: e.target.value })}
            rows={3}
            className="font-mono text-sm"
            disabled={disabled}
          />
        </div>

        {question.type === 'mcq' ? (
          <div className="space-y-2">
            <Label>
              Answer choices{' '}
              <span className="text-muted-foreground font-normal text-xs">
                (select the correct one)
              </span>
            </Label>
            {question.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={question.correctAnswer === opt && opt.trim() !== ''}
                  onChange={() => opt.trim() && onUpdate({ correctAnswer: opt })}
                  disabled={disabled}
                  className="h-4 w-4 accent-primary shrink-0"
                  aria-label={`Mark option ${optIdx + 1} as correct`}
                />
                <Input
                  placeholder={`Option ${optIdx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    if (question.correctAnswer === opt) {
                      onUpdate({ correctAnswer: e.target.value })
                    }
                    onOptionChange(optIdx, e.target.value)
                  }}
                  disabled={disabled}
                  className="flex-1"
                />
                {question.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveOption(optIdx)}
                    disabled={disabled}
                    className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddOption}
              disabled={disabled}
              className="gap-1 mt-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add option
            </Button>
            {question.correctAnswer && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                Correct answer:{' '}
                <span className="font-medium text-foreground">{question.correctAnswer}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label>Correct answer</Label>
            <Input
              placeholder="e.g. let"
              value={question.correctAnswer}
              onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">Case-insensitive, whitespace is ignored</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
