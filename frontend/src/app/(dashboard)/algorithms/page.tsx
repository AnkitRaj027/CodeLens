"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Layers, 
  TrendingUp, 
  ArrowRight, 
  Search, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  BarChart3,
  Scale,
  Loader2,
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
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            Empirical Benchmark Sandbox
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Algorithm Comparison Matrix
          </h1>
        </div>

        <Link
          href="/analyzer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all w-fit"
        >
          <span>Open IDE Analyzer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all capitalize ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {cat === "all" ? "All Categories" : cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Comparison Table + Detailed Inspect Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Algorithm List Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <span>Algorithm Matrix</span>
              <span className="text-[10px] text-slate-500">Click to inspect</span>
            </div>

            <div className="divide-y divide-slate-850">
              {filteredAlgorithms.map((algo) => {
                const isSelected = selectedAlgo?.id === algo.id;
                return (
                  <div
                    key={algo.id}
                    onClick={() => setSelectedAlgo(algo)}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-600/10 border-l-4 border-blue-500"
                        : "hover:bg-slate-900/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{algo.name}</span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {algo.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {algo.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-750 text-blue-400 font-bold">
                        Time: {algo.worst_time}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-750 text-slate-300">
                        Space: {algo.space_complexity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asymptotic Scaling Simulation Table */}
          <div className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>Theoretical Operation Scaling Table (N vs Operations)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2 px-3">Input N</th>
                    <th className="py-2 px-3 text-emerald-400">O(1)</th>
                    <th className="py-2 px-3 text-teal-400">O(log n)</th>
                    <th className="py-2 px-3 text-blue-400">O(n)</th>
                    <th className="py-2 px-3 text-indigo-400">O(n log n)</th>
                    <th className="py-2 px-3 text-amber-400">O(n²)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {scalingPoints.slice(0, 5).map((pt) => (
                    <tr key={pt.n} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-bold text-white">N = {pt.n.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-emerald-300">{pt.operations["O(1)"]}</td>
                      <td className="py-2.5 px-3 text-teal-300">{pt.operations["O(log n)"]}</td>
                      <td className="py-2.5 px-3 text-blue-300">{pt.operations["O(n)"].toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-indigo-300">{pt.operations["O(n log n)"].toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-amber-300 font-bold">{pt.operations["O(n²)"].toLocaleString()}</td>
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
            <div className="glass-panel rounded-2xl border border-slate-800/80 p-6 space-y-5 shadow-2xl sticky top-24">
              {/* Header */}
              <div className="space-y-1.5 border-b border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider">
                  Algorithm Breakdown
                </span>
                <h3 className="text-xl font-bold text-white">{selectedAlgo.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedAlgo.description}
                </p>
              </div>

              {/* Complexity Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Average Time</span>
                  <div className="font-mono font-bold text-blue-400">{selectedAlgo.average_time}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Worst Time</span>
                  <div className="font-mono font-bold text-rose-400">{selectedAlgo.worst_time}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Space Complexity</span>
                  <div className="font-mono font-bold text-purple-400">{selectedAlgo.space_complexity}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">In-Place</span>
                  <div className="font-mono font-bold text-emerald-400">{selectedAlgo.in_place ? "Yes" : "No"}</div>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedAlgo.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Limitations
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedAlgo.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-400 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-blue-400" />
                    Implementation ({selectedAlgo.language})
                  </span>
                  <button
                    onClick={() => router.push("/analyzer")}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test in IDE</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#0d1117] border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[180px] leading-relaxed">
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
