"use client";

import React, { useState, useEffect, useRef } from "react";
import { StaticAnalysisResult, AIExplanationResult } from "@/types/analysis";
import { api } from "@/lib/api";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Brain, 
  TrendingUp, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Lightbulb,
  MessageSquare,
  FileText,
  User,
  Bot,
  Trash2
} from "lucide-react";

interface AITutorPanelProps {
  code: string;
  language: string;
  result: StaticAnalysisResult;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({ code, language, result }) => {
  const [activeSubTab, setActiveSubTab] = useState<"proof" | "chat">("proof");
  const [mode, setMode] = useState<string>("intermediate");
  const [isLoadingExplanation, setIsLoadingExplanation] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<AIExplanationResult | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([
    "How can I optimize this further?",
    "What happens if the input is already sorted?",
    `Show equivalent optimal implementation in ${language === "python" ? "C++" : "Python"}`,
    "Explain worst-case auxiliary space"
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const fetchExplanation = async (targetMode = mode) => {
    setIsLoadingExplanation(true);
    try {
      const res = await api.post<AIExplanationResult>("/ai/explain", {
        code,
        language,
        time_complexity: result.time_complexity,
        space_complexity: result.space_complexity,
        confidence: result.confidence,
        deterministic_findings: result.deterministic_summary,
        mode: targetMode,
      });
      setExplanation(res.data);
    } catch (e) {
      console.error("Failed to load AI explanation", e);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  useEffect(() => {
    fetchExplanation(mode);
  }, [code, result.time_complexity, mode]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isSendingChat]);

  const handleSendMessage = async (msgText = inputMessage) => {
    if (!msgText.trim() || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: msgText.trim()
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsSendingChat(true);

    try {
      const history = chatMessages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.post<{ answer: string; suggested_followups: string[] }>("/ai/chat", {
        code,
        language,
        time_complexity: result.time_complexity,
        space_complexity: result.space_complexity,
        confidence: result.confidence,
        messages: history,
        question: userMsg.content
      });

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: res.data.answer
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      if (res.data.suggested_followups && res.data.suggested_followups.length > 0) {
        setSuggestedFollowups(res.data.suggested_followups);
      }
    } catch (err) {
      console.error("Chat request failed", err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an issue connecting to the AI Tutor. Please verify your connection or try again."
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
  };

  return (
    <div className="bg-[#111113] rounded-lg border border-[#27272A] p-5 sm:p-6 space-y-6 shadow-sm">
      {/* Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4 font-mono">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#18181B] border border-[#27272A] flex items-center justify-center text-blue-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F4F4F5] flex items-center gap-2">
              <span>AST-Grounded AI Tutor</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Ground Truth Verified
              </span>
            </h3>
            <p className="text-[10px] text-[#71717A]">
              Static bounds enforced as immutable truth
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Proof vs Chat */}
        <div className="flex items-center bg-[#18181B] p-1 rounded-md border border-[#27272A] text-xs">
          <button
            onClick={() => setActiveSubTab("proof")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeSubTab === "proof"
                ? "bg-[#27272A] text-[#F4F4F5] shadow-sm"
                : "text-[#71717A] hover:text-[#A1A1AA]"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Pedagogical Proof</span>
          </button>
          <button
            onClick={() => setActiveSubTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeSubTab === "chat"
                ? "bg-[#27272A] text-[#F4F4F5] shadow-sm"
                : "text-[#71717A] hover:text-[#A1A1AA]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Chat</span>
            {chatMessages.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                {chatMessages.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: STRUCTURED PROOF */}
      {activeSubTab === "proof" && (
        <div className="space-y-5">
          {/* Mode Selector Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider">Explanation Persona:</span>
            <div className="flex items-center gap-1 bg-[#18181B] p-1 rounded-md border border-[#27272A] text-xs font-mono overflow-x-auto no-scrollbar w-full sm:w-auto">
              {[
                { id: "beginner", label: "Beginner", icon: BookOpen },
                { id: "intermediate", label: "University", icon: GraduationCap },
                { id: "advanced", label: "Senior", icon: Brain },
                { id: "dsa_student", label: "Interview", icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = mode === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMode(tab.id)}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-all flex-1 sm:flex-none ${
                      isActive
                        ? "bg-[#27272A] text-[#F4F4F5] shadow-sm"
                        : "text-[#71717A] hover:text-[#A1A1AA]"
                    }`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading state */}
          {isLoadingExplanation ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#71717A] font-mono text-xs gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span>Synthesizing pedagogical breakdown...</span>
            </div>
          ) : explanation ? (
            <div className="space-y-5">
              {/* Summary Box */}
              <div className="p-4 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#A1A1AA] leading-relaxed space-y-1">
                <span className="text-[10px] uppercase font-mono font-semibold text-blue-400 tracking-wider block">
                  Pedagogical Overview ({mode.toUpperCase()})
                </span>
                <p className="text-[#F4F4F5] text-xs leading-relaxed">{explanation.summary}</p>
              </div>

              {/* Step-by-Step Reasoning */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F4F4F5] flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Step-by-Step Complexity Proof
                </h4>
                <div className="space-y-2">
                  {explanation.step_by_step_reasoning.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#A1A1AA] leading-relaxed font-mono">
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* N Doubling Scaling Card */}
              <div className="p-4 rounded-md bg-[#18181B] border border-[#27272A] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Input Scaling Analysis (What if N doubles?)</span>
                </div>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {explanation.what_happens_if_n_doubles}
                </p>
              </div>

              {/* Learning Takeaway */}
              <div className="p-4 rounded-md bg-[#18181B] border border-[#27272A] flex items-start gap-3 text-xs">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#F4F4F5] block mb-0.5 font-mono">Core Principle:</span>
                  <span className="text-[#A1A1AA]">{explanation.learning_takeaway}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* VIEW 2: INTERACTIVE LIVE CHAT */}
      {activeSubTab === "chat" && (
        <div className="space-y-4">
          {/* Chat Control Toolbar */}
          <div className="flex items-center justify-between text-xs font-mono text-[#71717A] border-b border-[#27272A] pb-2">
            <span>Conversing about active {language} code snippet ({result.time_complexity})</span>
            {chatMessages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Chat</span>
              </button>
            )}
          </div>

          {/* Conversation Message Viewport */}
          <div className="min-h-[260px] max-h-[420px] overflow-y-auto space-y-3.5 pr-1 font-mono text-xs">
            {chatMessages.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-[#71717A]">
                <Bot className="w-8 h-8 text-blue-400 opacity-60" />
                <p className="text-xs text-[#F4F4F5] font-semibold">Start chatting with your AST-grounded AI Tutor</p>
                <p className="text-[11px] max-w-sm">
                  Ask questions about line mechanics, dynamic programming alternatives, or how to reduce auxiliary space.
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 items-start ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-[#18181B] text-amber-400 border border-[#27272A]"
                  }`}>
                    {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`p-3.5 rounded-lg border max-w-[85%] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600/10 border-blue-500/30 text-[#F4F4F5]"
                      : "bg-[#18181B] border-[#27272A] text-[#A1A1AA]"
                  }`}>
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}
                  </div>
                </div>
              ))
            )}

            {isSendingChat && (
              <div className="flex gap-3 items-center text-[#71717A] text-xs">
                <div className="w-6 h-6 rounded bg-[#18181B] border border-[#27272A] flex items-center justify-center text-amber-400 shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>Reasoning with Mistral AI...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Quick Question Chips */}
          <div className="space-y-1.5 pt-2 border-t border-[#27272A]">
            <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">
              Suggested Questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedFollowups.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isSendingChat}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[#18181B] hover:bg-[#202024] border border-[#27272A] text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors disabled:opacity-50 text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar */}
          <div className="flex items-center gap-2 pt-2 font-mono">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask anything about this code or complexity..."
              className="flex-1 px-3.5 py-2 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-blue-500/50 transition-all font-mono"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isSendingChat || !inputMessage.trim()}
              className="px-4 py-2 rounded-md bg-[#F4F4F5] text-[#09090B] hover:bg-white font-medium text-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSendingChat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
