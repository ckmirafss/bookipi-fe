'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Plus, Check, Copy, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuestionCard } from './question-card'
import { api } from '@/lib/api'
import type { QuestionFormData } from '@/lib/types'

function makeQuestion(): QuestionFormData {
  return { type: 'mcq', prompt: '', codeSnippet: '', options: ['', '', '', ''], correctAnswer: '' }
}

function isQuestionValid(q: QuestionFormData): boolean {
  if (!q.prompt.trim() || !q.correctAnswer.trim()) return false
  if (q.type === 'mcq') {
    const filled = q.options.filter((o) => o.trim())
    return filled.length >= 2 && filled.includes(q.correctAnswer)
  }
  return true
}

export function QuizBuilder() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<QuestionFormData[]>([makeQuestion()])
  const [savedQuizId, setSavedQuizId] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const saveQuiz = useMutation({
    mutationFn: async () => {
      const quiz = await api.createQuiz({ title: title.trim(), description: description.trim() })
      for (const q of questions) {
        const codeSnippet = q.codeSnippet.trim() || undefined
        if (q.type === 'mcq') {
          await api.addQuestion(quiz.id, {
            type: 'mcq',
            prompt: q.prompt.trim(),
            codeSnippet,
            options: q.options.filter((o) => o.trim()),
            correctAnswer: q.correctAnswer,
          })
        } else {
          await api.addQuestion(quiz.id, {
            type: 'short',
            prompt: q.prompt.trim(),
            codeSnippet,
            correctAnswer: q.correctAnswer.trim(),
          })
        }
      }
      await api.publishQuiz(quiz.id)
      return quiz.id
    },
    onSuccess: setSavedQuizId,
  })

  const updateQuestion = useCallback(
    (idx: number, patch: Partial<QuestionFormData>) =>
      setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q))),
    [],
  )

  const updateOption = useCallback(
    (qIdx: number, optIdx: number, value: string) =>
      setQuestions((prev) =>
        prev.map((q, i) => {
          if (i !== qIdx) return q
          const options = [...q.options]
          options[optIdx] = value
          return { ...q, options }
        }),
      ),
    [],
  )

  const addOption = useCallback(
    (qIdx: number) =>
      setQuestions((prev) =>
        prev.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ''] } : q)),
      ),
    [],
  )

  const removeOption = useCallback(
    (qIdx: number, optIdx: number) =>
      setQuestions((prev) =>
        prev.map((q, i) => {
          if (i !== qIdx) return q
          const options = q.options.filter((_, j) => j !== optIdx)
          const correctAnswer = q.correctAnswer === q.options[optIdx] ? '' : q.correctAnswer
          return { ...q, options, correctAnswer }
        }),
      ),
    [],
  )

  const copyId = () => {
    if (savedQuizId === null) return
    navigator.clipboard.writeText(String(savedQuizId)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const reset = () => {
    setSavedQuizId(null)
    setTitle('')
    setDescription('')
    setQuestions([makeQuestion()])
    saveQuiz.reset()
  }

  const canSubmit =
    title.trim() !== '' &&
    description.trim() !== '' &&
    questions.length > 0 &&
    questions.every(isQuestionValid)

  if (savedQuizId !== null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-screen p-6 bg-muted/30">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-8 space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Quiz Created!</h2>
              <p className="text-muted-foreground">Share this ID so others can take your quiz</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-mono font-bold tracking-wide">{savedQuizId}</span>
              <Button variant="ghost" size="icon" onClick={copyId} aria-label="Copy quiz ID">
                {copied ? (
                  <CheckCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <Link href={`/play?quizId=${savedQuizId}`}>
                <Button className="w-full">Take This Quiz</Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={reset}>
                Create Another Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Create a New Quiz</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. JavaScript Basics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saveQuiz.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this quiz about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={saveQuiz.isPending}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <QuestionCard
              key={idx}
              question={q}
              index={idx}
              canRemove={questions.length > 1}
              disabled={saveQuiz.isPending}
              onUpdate={(patch) => updateQuestion(idx, patch)}
              onRemove={() => setQuestions((prev) => prev.filter((_, i) => i !== idx))}
              onOptionChange={(optIdx, value) => updateOption(idx, optIdx, value)}
              onAddOption={() => addOption(idx)}
              onRemoveOption={(optIdx) => removeOption(idx, optIdx)}
            />
          ))}

          <Button
            variant="outline"
            onClick={() => setQuestions((prev) => [...prev, makeQuestion()])}
            disabled={saveQuiz.isPending}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        </div>

        {saveQuiz.isError && (
          <p className="text-sm text-destructive text-center">
            {(saveQuiz.error as Error).message}
          </p>
        )}

        <Button
          className="w-full"
          size="lg"
          disabled={!canSubmit || saveQuiz.isPending}
          onClick={() => saveQuiz.mutate()}
        >
          {saveQuiz.isPending ? 'Saving…' : 'Save & Publish Quiz'}
        </Button>
      </div>
    </div>
  )
}
