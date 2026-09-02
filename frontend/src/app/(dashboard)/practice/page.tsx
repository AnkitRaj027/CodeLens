"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  Trophy, 
  Flame, 
  ArrowRight, 
  RefreshCw, 
  Play, 
  Brain,
  Layers,
  FileCode,
  Loader2
} from "lucide-react";

interface QuizQuestion {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  code_snippet: string;
  language: string;
  time_options: string[];
  space_options: string[];
  correct_time: string;
  correct_space: string;
  explanation: string;
}

interface SubmitResult {
  is_time_correct: boolean;
  is_space_correct: boolean;
  is_fully_correct: boolean;
  correct_time: string;
  correct_space: string;
  explanation: string;
  score_delta: number;
}

export default function PracticePage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<QuizQuestion[]>("/quiz/questions");
      setQuestions(res.data);
    } catch (e) {
      console.error("Failed to load questions", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    if (!selectedTime || !selectedSpace || !currentQuestion) return;
    setIsSubmitting(true);
    try {
      const res = await api.post<SubmitResult>("/quiz/submit", {
        question_id: currentQuestion.id,
        selected_time: selectedTime,
        selected_space: selectedSpace,
      });
      setResult(res.data);
      if (res.data.is_fully_correct) {
        setScore((prev) => prev + res.data.score_delta);
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }
    } catch (e) {
      console.error("Failed to submit answer", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setSelectedTime("");
    setSelectedSpace("");
    setResult(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back
    }
  };

  const handleAnalyzeInIDE = () => {
    if (!currentQuestion) return;
    // We can route to analyzer
    router.push("/analyzer");
  };

  if (isLoading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading practice arena challenge...</span>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-slate-400 text-sm">No questions available right now.</p>
        <button
          onClick={fetchQuestions}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          Reload Questions
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Score & Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" />
            Interactive Assessment Arena
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Complexity Challenge
          </h1>
        </div>

        {/* Score & Streak Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-xs text-white">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Score: <strong className="text-blue-400 font-mono">{score}</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-xs text-white">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Streak: <strong className="text-orange-400 font-mono">{streak}</strong></span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl space-y-0">
        {/* Card Header */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs font-semibold text-white">
              {currentQuestion.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              {currentQuestion.category}
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              {currentQuestion.language}
            </span>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="p-5 bg-[#0d1117] border-b border-slate-800/80">
          <pre className="font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
            {currentQuestion.code_snippet}
          </pre>
        </div>

        {/* Question Choices Form */}
        <div className="p-6 space-y-6 bg-slate-950/40">
          {/* Time Complexity Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Time Complexity:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {currentQuestion.time_options.map((opt) => {
                const isSelected = selectedTime === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => !result && setSelectedTime(opt)}
                    disabled={!!result}
                    className={`p-3 rounded-xl font-mono text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20 scale-102"
                        : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Space Complexity Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Space Complexity:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {currentQuestion.space_options.map((opt) => {
                const isSelected = selectedSpace === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => !result && setSelectedSpace(opt)}
                    disabled={!!result}
                    className={`p-3 rounded-xl font-mono text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 scale-102"
                        : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions & Submit */}
          {!result ? (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleAnalyzeInIDE}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test snippet in IDE</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={!selectedTime || !selectedSpace || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Prediction</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Result & Explanation Feedback */
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <div className={`p-4 rounded-xl border ${
                result.is_fully_correct
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  {result.is_fully_correct ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Correct! +{result.score_delta} Points</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-amber-400" />
                      <span>Partially Correct / Incorrect (+{result.score_delta} Points)</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-slate-300 mt-2 space-y-1">
                  <div>Correct Time: <strong className="font-mono text-white">{result.correct_time}</strong> {result.is_time_correct ? "✓" : "✗"}</div>
                  <div>Correct Space: <strong className="font-mono text-white">{result.correct_space}</strong> {result.is_space_correct ? "✓" : "✗"}</div>
                </div>
              </div>

              {/* Detailed Mathematical Explanation */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-400 block">
                  Proof & Mathematical Explanation:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* Next Challenge Button */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all"
                >
                  <span>Next Challenge</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
