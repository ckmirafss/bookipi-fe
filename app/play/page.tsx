import type { Metadata } from 'next'
import { QuizPlayer } from '@/components/quiz-player'

export const metadata: Metadata = {
  title: 'Take Quiz',
  description: 'Enter a quiz ID to start answering questions',
}

export default function PlayPage() {
  return <QuizPlayer />
}
