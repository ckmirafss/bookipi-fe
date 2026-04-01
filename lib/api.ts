import type { Quiz, Question, Attempt, SubmitResult } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN ?? 'dev-token'

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...BASE_HEADERS, ...options?.headers },
    })
  } catch {
    throw new Error('Cannot reach the server. Make sure the backend is running on ' + API_BASE)
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error((body as { error?: string }).error ?? 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  createQuiz: (data: { title: string; description: string }) =>
    req<Quiz>('/quizzes', { method: 'POST', body: JSON.stringify(data) }),

  publishQuiz: (id: number) =>
    req<Quiz>(`/quizzes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished: true }),
    }),

  addQuestion: (
    quizId: number,
    data: {
      type: 'mcq' | 'short' | 'code'
      prompt: string
      codeSnippet?: string
      options?: string[]
      correctAnswer?: string
    },
  ) =>
    req<Question>(`/quizzes/${quizId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  startAttempt: (quizId: number) =>
    req<Attempt>('/attempts', {
      method: 'POST',
      body: JSON.stringify({ quizId }),
    }),

  saveAnswer: (attemptId: number, questionId: number, value: string) =>
    req<{ ok: boolean }>(`/attempts/${attemptId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, value }),
    }),

  submitAttempt: (attemptId: number) =>
    req<SubmitResult>(`/attempts/${attemptId}/submit`, { method: 'POST' }),

  trackEvent: (attemptId: number, event: string) =>
    req<{ ok: boolean }>(`/attempts/${attemptId}/events`, {
      method: 'POST',
      body: JSON.stringify({ event }),
    }),
}
