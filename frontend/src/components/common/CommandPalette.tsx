"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Terminal, 
  History, 
  BookOpen, 
  Trophy, 
  Layers, 
  ArrowRight
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { name: "Launch Code Complexity IDE", href: "/analyzer", category: "IDE & Analysis", icon: Terminal },
    { name: "Open Analysis History Archive", href: "/history", category: "Archive", icon: History },
    { name: "Take Complexity Quiz Challenge", href: "/practice", category: "Practice Arena", icon: Trophy },
    { name: "Explore Algorithm Comparison Matrix", href: "/algorithms", category: "Benchmarks", icon: Layers },
    { name: "Learn Big-O Asymptotic Fundamentals", href: "/learn/big-o-fundamentals", category: "Curriculum", icon: BookOpen },
    { name: "Learn Recurrence Relations & Master Theorem", href: "/learn/recurrence-relations-master-theorem", category: "Curriculum", icon: BookOpen },
    { name: "Learn Space-Time Tradeoffs & Hash Maps", href: "/learn/space-time-tradeoffs-hashmaps", category: "Curriculum", icon: BookOpen },
  ];

  const filtered = query
    ? actions.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()))
    : actions;

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-xl bg-[#111113] border border-[#27272A] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input */}
        <div className="px-4 py-3.5 border-b border-[#27272A] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#71717A]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Type a command or search algorithms..."
            className="flex-1 bg-transparent text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none font-mono"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#71717A] bg-[#18181B] border border-[#27272A] rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto p-2 divide-y divide-[#18181B]">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="w-full text-left px-3 py-2.5 rounded-md hover:bg-[#18181B] flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-[#18181B] border border-[#27272A] text-[#71717A] group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#F4F4F5]">{item.name}</div>
                      <div className="text-[10px] text-[#71717A] font-mono">{item.category}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#71717A] group-hover:text-[#F4F4F5] group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-[#71717A] font-mono">
              No commands found matching "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
