export interface Quiz {
  id: number
  title: string
  description: string
  timeLimitSeconds?: number
  isPublished: boolean
  createdAt: string
  questions?: Question[]
}

export interface Question {
  id: number
  quizId: number
  type: 'mcq' | 'short' | 'code'
  prompt: string
  codeSnippet?: string
  options?: string[]
  correctAnswer?: string
  position: number
  createdAt?: string
}

export interface Attempt {
  id: number
  quizId: number
  startedAt: string
  submittedAt?: string | null
  score?: number | null
  answers: { questionId: number; value: string }[]
  quiz: {
    id: number
    title: string
    description: string
    timeLimitSeconds?: number
    isPublished: boolean
    createdAt: string
    questions: Question[]
  }
}

export interface GradingDetail {
  questionId: number
  correct: boolean
  expected?: string
}

export interface SubmitResult {
  score: number
  details: GradingDetail[]
}

export interface QuestionFormData {
  type: 'mcq' | 'short'
  prompt: string
  codeSnippet: string
  options: string[]
  correctAnswer: string
}
