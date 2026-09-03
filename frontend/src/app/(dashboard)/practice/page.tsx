"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Flame, 
  ArrowRight, 
  Play, 
  Loader2,
  Sparkles,
  FileCode
} from "lucide-react";

import { DEFAULT_QUIZ_QUESTIONS } from "@/data/defaultData";

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

const STORAGE_KEY_QUESTION = "codelens_practice_question";
const STORAGE_KEY_STATE = "codelens_practice_state";

export default function PracticePage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // 1. Hydrate saved question and progress from storage on initial load
  useEffect(() => {
    try {
      const savedQuestionStr = sessionStorage.getItem(STORAGE_KEY_QUESTION);
      const savedStateStr = sessionStorage.getItem(STORAGE_KEY_STATE);

      if (savedQuestionStr) {
        const savedQ: QuizQuestion = JSON.parse(savedQuestionStr);
        setCurrentQuestion(savedQ);

        if (savedStateStr) {
          const state = JSON.parse(savedStateStr);
          setSelectedTime(state.selectedTime || "");
          setSelectedSpace(state.selectedSpace || "");
          setResult(state.result || null);
          setScore(state.score || 0);
          setStreak(state.streak || 0);
          setSolvedCount(state.solvedCount || 0);
          if (state.selectedLanguage) setSelectedLanguage(state.selectedLanguage);
          if (state.selectedDifficulty) setSelectedDifficulty(state.selectedDifficulty);
        }
        setIsHydrated(true);
        return;
      }
    } catch (err) {
      console.warn("Storage hydration failed", err);
    }

    setIsHydrated(true);
    fetchNewQuestion("python", "all");
  }, []);

  // 2. Persist state to sessionStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (currentQuestion) {
        sessionStorage.setItem(STORAGE_KEY_QUESTION, JSON.stringify(currentQuestion));
      }
      sessionStorage.setItem(
        STORAGE_KEY_STATE,
        JSON.stringify({
          selectedTime,
          selectedSpace,
          result,
          score,
          streak,
          solvedCount,
          selectedLanguage,
          selectedDifficulty,
        })
      );
    } catch (err) {
      console.warn("Storage save failed", err);
    }
  }, [currentQuestion, selectedTime, selectedSpace, result, score, streak, solvedCount, selectedLanguage, selectedDifficulty, isHydrated]);

  const fetchNewQuestion = async (lang = selectedLanguage, diff = selectedDifficulty) => {
    setIsGenerating(true);
    setSelectedTime("");
    setSelectedSpace("");
    setResult(null);

    try {
      const res = await api.post<QuizQuestion>("/quiz/generate", {
        language: lang,
        difficulty: diff === "all" ? undefined : diff,
      });
      setCurrentQuestion(res.data);
      sessionStorage.setItem(STORAGE_KEY_QUESTION, JSON.stringify(res.data));
    } catch (e) {
      console.error("Failed to generate dynamic question, fetching random...", e);
      try {
        const fallback = await api.get<QuizQuestion>("/quiz/random");
        setCurrentQuestion(fallback.data);
        sessionStorage.setItem(STORAGE_KEY_QUESTION, JSON.stringify(fallback.data));
      } catch (err) {
        // Ultimate client-side fallback if server is offline
        const randomFallback = DEFAULT_QUIZ_QUESTIONS[Math.floor(Math.random() * DEFAULT_QUIZ_QUESTIONS.length)];
        setCurrentQuestion(randomFallback);
        sessionStorage.setItem(STORAGE_KEY_QUESTION, JSON.stringify(randomFallback));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    fetchNewQuestion(lang, selectedDifficulty);
  };

  const handleDifficultyChange = (diff: string) => {
    setSelectedDifficulty(diff);
    fetchNewQuestion(selectedLanguage, diff);
  };

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
      setSolvedCount((prev) => prev + 1);
      if (res.data.is_fully_correct) {
        setScore((prev) => prev + res.data.score_delta);
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }
    } catch (e) {
      // Local evaluation fallback
      const timeCorrect = selectedTime === currentQuestion.correct_time;
      const spaceCorrect = selectedSpace === currentQuestion.correct_space;
      const fullyCorrect = timeCorrect && spaceCorrect;
      const localResult: SubmitResult = {
        is_time_correct: timeCorrect,
        is_space_correct: spaceCorrect,
        is_fully_correct: fullyCorrect,
        correct_time: currentQuestion.correct_time,
        correct_space: currentQuestion.correct_space,
        explanation: currentQuestion.explanation,
        score_delta: fullyCorrect ? 25 : timeCorrect || spaceCorrect ? 10 : -5
      };
      setResult(localResult);
      setSolvedCount((prev) => prev + 1);
      if (fullyCorrect) {
        setScore((prev) => prev + localResult.score_delta);
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    fetchNewQuestion();
  };

  const handleTestInIDE = () => {
    if (!currentQuestion) return;
    localStorage.setItem("codelens_transferred_code", currentQuestion.code_snippet);
    localStorage.setItem("codelens_transferred_lang", currentQuestion.language);
    router.push("/analyzer");
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner with Score & Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>AI-Powered Infinite Arena</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F4F5] font-mono">
            Complexity Challenge
          </h1>
        </div>

        {/* Score & Streak Stats */}
        <div className="flex items-center justify-between sm:justify-start gap-2 font-mono text-xs">
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111113] border border-[#27272A] text-[#F4F4F5]">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Score: <strong className="text-blue-400">{score}</strong></span>
          </div>

          <div className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111113] border border-[#27272A] text-[#F4F4F5]">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Streak: <strong className="text-orange-400">{streak}</strong></span>
          </div>
        </div>
      </div>

      {/* Control Strip: Language, Difficulty, Generate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#111113] border border-[#27272A] font-mono text-xs">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex-1 sm:flex-none flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#A1A1AA]">
            <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-[#F4F4F5] focus:outline-none cursor-pointer text-xs w-full"
            >
              <option value="python" className="bg-[#18181B] text-[#F4F4F5]">Python</option>
              <option value="cpp" className="bg-[#18181B] text-[#F4F4F5]">C++</option>
            </select>
          </div>

          {/* Difficulty Selector */}
          <div className="flex-1 sm:flex-none flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#A1A1AA]">
            <span className="text-[#71717A] shrink-0">Level:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => handleDifficultyChange(e.target.value)}
              className="bg-transparent text-[#F4F4F5] focus:outline-none cursor-pointer text-xs w-full"
            >
              <option value="all" className="bg-[#18181B] text-[#F4F4F5]">All Levels</option>
              <option value="Beginner" className="bg-[#18181B] text-[#F4F4F5]">Beginner</option>
              <option value="Intermediate" className="bg-[#18181B] text-[#F4F4F5]">Intermediate</option>
              <option value="Advanced" className="bg-[#18181B] text-[#F4F4F5]">Advanced</option>
            </select>
          </div>
        </div>

        {/* Generate Dynamic Challenge Button */}
        <button
          onClick={() => fetchNewQuestion()}
          disabled={isGenerating}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#18181B] hover:bg-[#202024] active:bg-[#27272A] border border-[#27272A] text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Synthesizing Challenge...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Generate New AI Challenge</span>
            </>
          )}
        </button>
      </div>

      {/* Question Card */}
      {isGenerating ? (
        <div className="p-12 rounded-lg bg-[#111113] border border-[#27272A] flex flex-col items-center justify-center text-[#71717A] font-mono text-xs gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <span>Generating novel algorithmic complexity challenge via Mistral AI...</span>
        </div>
      ) : !currentQuestion ? (
        <div className="p-12 rounded-lg bg-[#111113] border border-[#27272A] text-center space-y-3 font-mono text-xs text-[#71717A]">
          <p>No active challenge loaded.</p>
          <button
            onClick={() => fetchNewQuestion()}
            className="px-4 py-2 rounded-md bg-[#F4F4F5] text-[#09090B] font-medium"
          >
            Generate Challenge
          </button>
        </div>
      ) : (
        <div className="bg-[#111113] rounded-lg border border-[#27272A] overflow-hidden shadow-sm space-y-0">
          {/* Card Header */}
          <div className="px-5 py-3 bg-[#111113] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Challenge #{solvedCount + 1}
              </span>
              <span className="text-xs font-semibold text-[#F4F4F5]">
                {currentQuestion.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-[#18181B] border border-[#27272A] text-blue-400">
                {currentQuestion.difficulty}
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-[#18181B] border border-[#27272A] text-[#71717A]">
                {currentQuestion.category}
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-[#18181B] border border-[#27272A] text-[#71717A]">
                {currentQuestion.language}
              </span>
            </div>
          </div>

          {/* Code Snippet */}
          <div className="p-5 bg-[#09090B] border-b border-[#27272A]">
            <pre className="font-mono text-xs text-[#F4F4F5] overflow-x-auto leading-relaxed">
              {currentQuestion.code_snippet}
            </pre>
          </div>

          {/* Question Choices Form */}
          <div className="p-5 sm:p-6 space-y-5 bg-[#111113]">
            {/* Time Complexity Selection */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#71717A]">
                Select Time Complexity:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {currentQuestion.time_options.map((opt) => {
                  const isSelected = selectedTime === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => !result && setSelectedTime(opt)}
                      disabled={!!result}
                      className={`p-2.5 rounded-md font-mono text-xs font-bold border transition-all text-center ${
                        isSelected
                          ? "bg-[#F4F4F5] text-[#09090B] border-[#F4F4F5] shadow-sm"
                          : "bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:border-[#3F3F46] hover:text-[#F4F4F5] active:bg-[#27272A]"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Space Complexity Selection */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#71717A]">
                Select Space Complexity:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentQuestion.space_options.map((opt) => {
                  const isSelected = selectedSpace === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => !result && setSelectedSpace(opt)}
                      disabled={!!result}
                      className={`p-2.5 rounded-md font-mono text-xs font-bold border transition-all text-center ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                          : "bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:border-[#3F3F46] hover:text-[#F4F4F5] active:bg-[#27272A]"
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
              <div className="pt-3 border-t border-[#27272A] flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                <button
                  onClick={handleTestInIDE}
                  className="flex items-center justify-center gap-1.5 py-2 text-xs text-[#71717A] hover:text-[#F4F4F5] transition-colors font-mono"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Test in IDE Analyzer</span>
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!selectedTime || !selectedSpace || isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 rounded-md bg-[#F4F4F5] text-[#09090B] hover:bg-white font-medium text-xs transition-all disabled:opacity-50 font-mono shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Grading...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Submit Prediction</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-3 border-t border-[#27272A]">
                <div className={`p-3.5 rounded-md border font-mono ${
                  result.is_fully_correct
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {result.is_fully_correct ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Correct Prediction! +{result.score_delta} Pts</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-amber-400" />
                        <span>Analysis Result: Partially Correct (+{result.score_delta} Pts)</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-[#A1A1AA] mt-2 space-y-0.5">
                    <div>Correct Time: <strong className="text-[#F4F4F5]">{result.correct_time}</strong></div>
                    <div>Correct Space: <strong className="text-[#F4F4F5]">{result.correct_space}</strong></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-md bg-[#18181B] border border-[#27272A] space-y-1 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[#71717A] font-mono text-[10px] block">
                    Proof & Asymptotic Mechanism:
                  </span>
                  <p className="text-[#A1A1AA] leading-relaxed font-mono">
                    {result.explanation}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleTestInIDE}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs text-[#71717A] hover:text-[#F4F4F5] transition-colors font-mono"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Open in Analyzer IDE</span>
                  </button>

                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-md bg-[#F4F4F5] text-[#09090B] text-xs font-medium transition-all font-mono hover:bg-white shadow-sm"
                  >
                    <span>Next Challenge</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
