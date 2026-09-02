"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Clean LaTeX math symbols into crystal-clear mathematical unicode expressions
export function formatMathExpression(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\xrightarrow\{([^}]+)\}/g, " ──($1)──► ")
    .replace(/\\implies/g, " ⟹ ")
    .replace(/\\iff/g, " ⟺ ")
    .replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, "∑($1 to $2) ")
    .replace(/\\sum_\{([^}]+)\}/g, "∑($1) ")
    .replace(/\\sum/g, "∑")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1) / $2")
    .replace(/\\log_2\(n\)/g, "log₂(n)")
    .replace(/\\log_b\s*a/g, "log_b(a)")
    .replace(/\\log_b\(a\)/g, "log_b(a)")
    .replace(/\\log/g, "log")
    .replace(/\\le/g, "≤")
    .replace(/\\ge/g, "≥")
    .replace(/\\ne/g, "≠")
    .replace(/\\cdot/g, "·")
    .replace(/\\times/g, "×")
    .replace(/\\dots/g, "…")
    .replace(/\\forall/g, "∀")
    .replace(/\\exists/g, "∃")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\left/g, "")
    .replace(/\\right/g, "")
    .replace(/\^2/g, "²")
    .replace(/\^3/g, "³")
    .replace(/\^k/g, "ᵏ")
    .replace(/\^d/g, "ᵈ")
    .replace(/_0/g, "₀")
    .replace(/\\/g, "");
}

// Render formatted inline spans with bold, inline math, and code
function renderInlineContent(text: string): React.ReactNode[] {
  // Regex to match $...$, `...`, and **...**
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$]+\$|`[^`]+`|\*\*[^*]+\*\*)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Block math $$...$$
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const math = formatMathExpression(part.slice(2, -2).trim());
      return (
        <span
          key={index}
          className="my-3 block p-3.5 rounded-md bg-[#09090B] border border-[#27272A] font-mono text-sm text-blue-300 overflow-x-auto shadow-inner text-center font-semibold tracking-wide"
        >
          {math}
        </span>
      );
    }

    // Inline math $...$
    if (part.startsWith("$") && part.endsWith("$")) {
      const math = formatMathExpression(part.slice(1, -1).trim());
      return (
        <span
          key={index}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-[#18181B] text-blue-400 font-mono text-xs border border-[#27272A] font-medium"
        >
          {math}
        </span>
      );
    }

    // Code `...`
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[#18181B] text-[#F4F4F5] font-mono text-xs border border-[#27272A]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold **...**
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="text-[#F4F4F5] font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  if (!content) return null;

  // Split lines into blocks
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inBlockMath = false;
  let mathBuffer: string[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for multiline $$ block
    if (trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length > 2) {
      const math = formatMathExpression(trimmed.slice(2, -2).trim());
      elements.push(
        <div
          key={`blockmath-${index}`}
          className="my-3.5 p-4 rounded-lg bg-[#09090B] border border-[#27272A] font-mono text-sm text-blue-300 overflow-x-auto text-center font-semibold shadow-inner tracking-wide"
        >
          {math}
        </div>
      );
      return;
    } else if (trimmed === "$$") {
      if (inBlockMath) {
        const math = formatMathExpression(mathBuffer.join(" ").trim());
        elements.push(
          <div
            key={`blockmath-${index}`}
            className="my-3.5 p-4 rounded-lg bg-[#09090B] border border-[#27272A] font-mono text-sm text-blue-300 overflow-x-auto text-center font-semibold shadow-inner tracking-wide"
          >
            {math}
          </div>
        );
        mathBuffer = [];
        inBlockMath = false;
      } else {
        inBlockMath = true;
      }
      return;
    }

    if (inBlockMath) {
      mathBuffer.push(line);
      return;
    }

    // Empty line
    if (!trimmed) {
      elements.push(<div key={`space-${index}`} className="h-2" />);
      return;
    }

    // H3 Header: ### Heading
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4
          key={`h3-${index}`}
          className="text-sm sm:text-base font-semibold text-[#F4F4F5] font-mono mt-5 mb-2 pb-1 border-b border-[#27272A] flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          {trimmed.slice(4)}
        </h4>
      );
      return;
    }

    // H4 Header: #### Heading
    if (trimmed.startsWith("#### ")) {
      elements.push(
        <h5
          key={`h4-${index}`}
          className="text-xs sm:text-sm font-semibold text-[#F4F4F5] font-mono mt-3 mb-1 text-zinc-200"
        >
          {trimmed.slice(5)}
        </h5>
      );
      return;
    }

    // Numbered List: 1. Item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={`num-${index}`} className="flex items-start gap-2.5 my-1.5 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed pl-1">
          <span className="px-1.5 py-0.2 rounded bg-[#18181B] text-blue-400 font-mono text-[11px] font-semibold border border-[#27272A] mt-0.5">
            {numMatch[1]}
          </span>
          <div className="flex-1">{renderInlineContent(numMatch[2])}</div>
        </div>
      );
      return;
    }

    // Bullet List: - Item or * Item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <div key={`bullet-${index}`} className="flex items-start gap-2.5 my-1.5 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
          <div className="flex-1">{renderInlineContent(trimmed.slice(2))}</div>
        </div>
      );
      return;
    }

    // Regular Paragraph
    elements.push(
      <p key={`p-${index}`} className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed my-1.5">
        {renderInlineContent(trimmed)}
      </p>
    );
  });

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
