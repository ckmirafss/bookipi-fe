import { QuizBuilder } from "@/components/quiz-builder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Quiz",
  description: "Build a quiz with multiple choice or short answer questions",
};

export default function BuildPage() {
  return <QuizBuilder />;
}
