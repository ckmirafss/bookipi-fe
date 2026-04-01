import Link from 'next/link'
import { PlusCircle, PlayCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-muted/30 p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Quiz Maker</h1>
          <p className="text-muted-foreground text-lg">Create and take coding quizzes</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Link
            href="/build"
            className="group flex items-start gap-4 rounded-xl border bg-card p-6 shadow-sm hover:border-primary hover:shadow-md transition-all"
          >
            <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
              <PlusCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Create Quiz</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Build a quiz with multiple choice or short answer questions
              </p>
            </div>
          </Link>

          <Link
            href="/play"
            className="group flex items-start gap-4 rounded-xl border bg-card p-6 shadow-sm hover:border-primary hover:shadow-md transition-all"
          >
            <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
              <PlayCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Take Quiz</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter a quiz ID to start answering questions
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
