"use client";

import type { AntiCheatSummary } from "@/hooks/useAntiCheat";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { api } from "@/lib/api";
import type { Attempt, SubmitResult } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { QuestionView } from "./question-view";
import { ResultsView } from "./results-view";
import { StartScreen } from "./start-screen";

type Phase =
  | { status: "idle" }
  | { status: "active"; attempt: Attempt; currentIdx: number; answers: Record<number, string> }
  | { status: "done"; attempt: Attempt; result: SubmitResult; answers: Record<number, string>; antiCheat: AntiCheatSummary };

function QuizPlayerInner() {
  const searchParams = useSearchParams();
  const [quizIdInput, setQuizIdInput] = useState(searchParams.get("quizId") ?? "");
  const [phase, setPhase] = useState<Phase>({ status: "idle" });

  // Stable ref so useAntiCheat's getCurrentQuestion never changes identity
  const currentIdxRef = useRef(0);
  useLayoutEffect(() => {
    if (phase.status === "active") currentIdxRef.current = phase.currentIdx;
  });

  const attemptId = phase.status !== "idle" ? phase.attempt.id : null;

  const getCurrentQuestion = useCallback(
    () => `Q${currentIdxRef.current + 1}`,
    [], // stable — reads from ref, no deps needed
  );

  const { getSummary } = useAntiCheat(attemptId, getCurrentQuestion);

  const startMutation = useMutation({
    mutationFn: () => api.startAttempt(Number(quizIdInput)),
    onSuccess: (attempt) => setPhase({ status: "active", attempt, currentIdx: 0, answers: {} }),
  });

  const saveAnswerMutation = useMutation({
    mutationFn: ({ questionId, value }: { questionId: number; value: string }) => {
      if (phase.status !== "active") throw new Error("No active attempt");
      return api.saveAnswer(phase.attempt.id, questionId, value);
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (phase.status !== "active") throw new Error("No active attempt");
      const { attempt, answers } = phase;
      for (const q of attempt.quiz.questions) {
        await api.saveAnswer(attempt.id, q.id, answers[q.id] ?? "");
      }
      return api.submitAttempt(attempt.id);
    },
    onSuccess: (result) => {
      if (phase.status !== "active") return;
      setPhase({
        status: "done",
        attempt: phase.attempt,
        result,
        answers: phase.answers,
        antiCheat: getSummary(),
      });
    },
  });

  // Auto-start when quizId is in the URL
  useEffect(() => {
    const id = searchParams.get("quizId");
    if (id && phase.status === "idle") {
      setQuizIdInput(id);
      startMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAnswer = useCallback((questionId: number, value: string) => {
    setPhase((prev) => {
      if (prev.status !== "active") return prev;
      return { ...prev, answers: { ...prev.answers, [questionId]: value } };
    });
  }, []);

  const navigate = useCallback(
    (direction: "prev" | "next" | "submit") => {
      if (phase.status !== "active") return;
      const { currentIdx, answers, attempt } = phase;
      const currentQ = attempt.quiz.questions[currentIdx];
      const currentAnswer = answers[currentQ.id] ?? "";

      if (currentAnswer) {
        saveAnswerMutation.mutate({ questionId: currentQ.id, value: currentAnswer });
      }

      if (direction === "submit") {
        submitMutation.mutate();
      } else {
        setPhase((prev) => {
          if (prev.status !== "active") return prev;
          return { ...prev, currentIdx: direction === "next" ? currentIdx + 1 : currentIdx - 1 };
        });
      }
    },
    [phase, saveAnswerMutation, submitMutation],
  );

  const reset = useCallback(() => {
    setPhase({ status: "idle" });
    setQuizIdInput("");
  }, []);

  if (phase.status === "idle") {
    return (
      <StartScreen
        quizIdInput={quizIdInput}
        onChange={setQuizIdInput}
        onStart={() => startMutation.mutate()}
        isPending={startMutation.isPending}
        error={startMutation.isError ? (startMutation.error as Error).message : null}
      />
    );
  }

  if (phase.status === "done") {
    return <ResultsView attempt={phase.attempt} result={phase.result} answers={phase.answers} antiCheat={phase.antiCheat} onReset={reset} />;
  }

  const { attempt, currentIdx, answers } = phase;
  const currentQ = attempt.quiz.questions[currentIdx];

  return (
    <QuestionView
      quizTitle={attempt.quiz.title}
      question={currentQ}
      currentIdx={currentIdx}
      totalQ={attempt.quiz.questions.length}
      answer={answers[currentQ.id] ?? ""}
      onAnswerChange={(value) => setAnswer(currentQ.id, value)}
      onPrev={() => navigate("prev")}
      onNext={() => navigate("next")}
      onSubmit={() => navigate("submit")}
      isSubmitting={submitMutation.isPending}
      submitError={submitMutation.isError ? (submitMutation.error as Error).message : null}
      saveError={saveAnswerMutation.isError ? (saveAnswerMutation.error as Error).message : null}
    />
  );
}

export function QuizPlayer() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center min-h-screen" />}>
      <QuizPlayerInner />
    </Suspense>
  );
}
