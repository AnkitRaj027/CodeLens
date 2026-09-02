"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Layers, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  FileCode
} from "lucide-react";

interface AlgorithmProfile {
  id: string;
  name: string;
  category: string;
  best_time: string;
  average_time: string;
  worst_time: string;
  space_complexity: string;
  stability?: string;
  in_place?: boolean;
  description: string;
  pros: string[];
  cons: string[];
  sample_code: string;
  language: string;
}

interface ScalingPoint {
  n: number;
  operations: Record<string, number>;
}

export default function AlgorithmsPage() {
  const router = useRouter();
  const [algorithms, setAlgorithms] = useState<AlgorithmProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmProfile | null>(null);
  const [scalingPoints, setScalingPoints] = useState<ScalingPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAlgorithms = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<AlgorithmProfile[]>("/benchmarks/matrix");
      setAlgorithms(res.data);
      if (res.data.length > 0) setSelectedAlgo(res.data[0]);
    } catch (e) {
      console.error("Failed to load algorithm matrix", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScaling = async () => {
    try {
      const res = await api.post<{ points: ScalingPoint[] }>("/benchmarks/simulate", {
        complexities: ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
        input_sizes: [10, 50, 100, 500, 1000, 5000, 10000]
      });
      setScalingPoints(res.data.points);
    } catch (e) {
      console.error("Failed to load scaling simulation", e);
    }
  };

  useEffect(() => {
    fetchAlgorithms();
    fetchScaling();
  }, []);

  const categories = ["all", ...Array.from(new Set(algorithms.map((a) => a.category)))];

  const filteredAlgorithms = selectedCategory === "all"
    ? algorithms
    : algorithms.filter((a) => a.category === selectedCategory);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Empirical Benchmark Matrix</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F4F5] font-mono">
            Algorithm Complexity Matrix
          </h1>
        </div>

        <Link
          href="/analyzer"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#F4F4F5] text-[#09090B] hover:bg-white text-xs font-medium shadow-sm transition-all w-fit font-mono"
        >
          <span>Open IDE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#27272A] font-mono text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all capitalize ${
              selectedCategory === cat
                ? "bg-[#18181B] text-[#F4F4F5] border border-[#27272A]"
                : "text-[#71717A] hover:text-[#F4F4F5] hover:bg-[#111113]"
            }`}
          >
            {cat === "all" ? "All Categories" : cat}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Algorithm List Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#111113] rounded-lg border border-[#27272A] overflow-hidden shadow-sm">
            <div className="px-5 py-3 bg-[#111113] border-b border-[#27272A] flex items-center justify-between text-xs font-semibold text-[#71717A] uppercase tracking-wider font-mono">
              <span>Canonical Algorithms</span>
              <span className="text-[10px] text-[#71717A]">Click to inspect</span>
            </div>

            <div className="divide-y divide-[#27272A]">
              {filteredAlgorithms.map((algo) => {
                const isSelected = selectedAlgo?.id === algo.id;
                return (
                  <div
                    key={algo.id}
                    onClick={() => setSelectedAlgo(algo)}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#18181B] border-l-2 border-blue-500"
                        : "hover:bg-[#18181B]/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-xs font-semibold text-[#F4F4F5]">{algo.name}</span>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-[#18181B] border border-[#27272A] text-[#71717A]">
                          {algo.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] line-clamp-1 mt-0.5">
                        {algo.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono">
                      <span className="px-2 py-0.2 rounded bg-[#18181B] border border-[#27272A] text-blue-400 font-bold">
                        Time: {algo.worst_time}
                      </span>
                      <span className="px-2 py-0.2 rounded bg-[#18181B] border border-[#27272A] text-[#71717A]">
                        Space: {algo.space_complexity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asymptotic Scaling Simulation Table */}
          <div className="bg-[#111113] rounded-lg border border-[#27272A] p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Theoretical Operation Scaling Table</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#27272A] text-[#71717A] uppercase text-[10px]">
                    <th className="py-2 px-3">Input N</th>
                    <th className="py-2 px-3 text-emerald-400">O(1)</th>
                    <th className="py-2 px-3 text-teal-400">O(log n)</th>
                    <th className="py-2 px-3 text-blue-400">O(n)</th>
                    <th className="py-2 px-3 text-indigo-400">O(n log n)</th>
                    <th className="py-2 px-3 text-amber-400">O(n²)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A] text-[#A1A1AA]">
                  {scalingPoints.slice(0, 5).map((pt) => (
                    <tr key={pt.n} className="hover:bg-[#18181B]/50">
                      <td className="py-2 px-3 font-semibold text-[#F4F4F5]">N = {pt.n.toLocaleString()}</td>
                      <td className="py-2 px-3 text-emerald-300">{pt.operations["O(1)"]}</td>
                      <td className="py-2 px-3 text-teal-300">{pt.operations["O(log n)"]}</td>
                      <td className="py-2 px-3 text-blue-300">{pt.operations["O(n)"].toLocaleString()}</td>
                      <td className="py-2 px-3 text-indigo-300">{pt.operations["O(n log n)"].toLocaleString()}</td>
                      <td className="py-2 px-3 text-amber-300 font-bold">{pt.operations["O(n²)"].toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Algorithm Deep-Dive Pane */}
        {selectedAlgo && (
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#111113] rounded-lg border border-[#27272A] p-5 space-y-4 shadow-sm sticky top-20">
              <div className="space-y-1 border-b border-[#27272A] pb-3 font-mono">
                <span className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider">
                  Algorithm Breakdown
                </span>
                <h3 className="text-base font-bold text-[#F4F4F5]">{selectedAlgo.name}</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {selectedAlgo.description}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-md bg-[#18181B] border border-[#27272A] space-y-0.5">
                  <span className="text-[10px] text-[#71717A] uppercase">Average Time</span>
                  <div className="font-bold text-blue-400">{selectedAlgo.average_time}</div>
                </div>
                <div className="p-2.5 rounded-md bg-[#18181B] border border-[#27272A] space-y-0.5">
                  <span className="text-[10px] text-[#71717A] uppercase">Worst Time</span>
                  <div className="font-bold text-rose-400">{selectedAlgo.worst_time}</div>
                </div>
                <div className="p-2.5 rounded-md bg-[#18181B] border border-[#27272A] space-y-0.5">
                  <span className="text-[10px] text-[#71717A] uppercase">Space Complexity</span>
                  <div className="font-bold text-purple-400">{selectedAlgo.space_complexity}</div>
                </div>
                <div className="p-2.5 rounded-md bg-[#18181B] border border-[#27272A] space-y-0.5">
                  <span className="text-[10px] text-[#71717A] uppercase">In-Place</span>
                  <div className="font-bold text-emerald-400">{selectedAlgo.in_place ? "Yes" : "No"}</div>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Strengths
                  </span>
                  <ul className="text-[#A1A1AA] space-y-0.5 text-xs">
                    {selectedAlgo.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-semibold text-amber-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Tradeoffs
                  </span>
                  <ul className="text-[#A1A1AA] space-y-0.5 text-xs">
                    {selectedAlgo.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Code Box */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#71717A] flex items-center gap-1 text-xs">
                    <FileCode className="w-3 h-3 text-blue-400" />
                    Implementation ({selectedAlgo.language})
                  </span>
                  <button
                    onClick={() => router.push("/analyzer")}
                    className="flex items-center gap-1 text-blue-400 hover:text-[#F4F4F5] font-semibold"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Test in IDE</span>
                  </button>
                </div>
                <pre className="p-3 rounded-md bg-[#09090B] border border-[#27272A] font-mono text-[10px] text-[#A1A1AA] overflow-x-auto max-h-[160px] leading-relaxed">
                  {selectedAlgo.sample_code}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
