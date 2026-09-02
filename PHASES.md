# CodeLens Execution Studio — Architecture & Roadmap

## 1. Core Architecture

```text
SOURCE CODE
     ↓
    AST (Python AST & ASTNodeVisual with Line Ranges)
     ↓
    CFG (Control Flow Graph with Branch Decisions & Back-Edges)
     ↓
EXECUTION ENGINE (Deterministic State Stepper & Tracer)
     ↓
 ┌───────────────┬───────────────┬──────────────────────┬──────────────────────┐
 │ Call Stack    │ Variables     │ Algorithm Data State │ Step Explanation     │
 └───────────────┴───────────────┴──────────────────────┴──────────────────────┘
                     ↓
             Unified Execution Step Sequence (ExecutionStep[])
                     ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│ SYNCHRONIZED VISUALIZATION LAYER                                             │
│  - Code Panel with line highlighting (Active, Executed, Pending)             │
│  - Active Tab View:                                                          │
│     * Algorithm Animation Canvas (Merge Sort, Binary Search, Arrays, etc.)   │
│     * Real Control Flow Graph (CFG) (decision branches YES/NO)               │
│     * Rich AST Tree View (node states: Pending, Current, Executed + Result)  │
│  - Bottom Telemetry Grid:                                                    │
│     * Call Stack Frame Viewer (Recursion depth, local variables, push/pop)   │
│     * Live Variables & Memory State (Changed badges: old -> new)             │
│     * "Explain This Step" (Deterministic plain-English breakdown)            │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Phase Status

- [x] **Phase 1: Architecture Inspection & Multi-Phase Specification**
- [x] **Phase 2: Unified Execution Model & Source Code Synchronization**
  - Created centralized `ExecutionStep` / `StackFrame` / `VariableChange` schema.
  - Synchronized active line decoration, auto-scroll, and gutter highlighting in Monaco Editor.
- [x] **Phase 3: Next-Gen AST Tree View**
  - Runtime execution states (`Pending`, `Current`, `Executed`) on each AST node.
  - Real-time evaluated result badges (e.g. `ASSIGN: mid = len(arr) // 2 → Result: mid = 3`).
  - Auto-scroll and focus on active node.
- [x] **Phase 4: True Control Flow Graph (CFG)**
  - Real CFG graph model with sequential statements, conditional decisions (`YES`/`NO`), loop headers, and back-edges.
  - Real-time condition evaluation badges (`7 <= 1 -> FALSE`).
- [x] **Phase 5: Dedicated Call Stack Visualizer**
  - Interactive stack frames for recursion and function calls (`merge_sort([38, 27])`).
  - Frame parameters, local variables, and depth counters.
- [x] **Phase 6: Live Memory & Variables State Tracker**
  - Changed variable indicators (`old → new` delta badge with animations).
  - Beginner vs Developer telemetry view modes.
- [x] **Phase 7: Real Algorithm Data Structure Visualizer**
  - Visual arrays, pointer arrows (`low`, `mid`, `high`), Merge Sort partitions, and comparisons.
- [x] **Phase 8: Step-by-Step Explainer ("Explain This Step")**
  - Mathematical computation breakdown (`7 // 2 = 3`) and algorithmic impact.
- [x] **Phase 9: Unified Playback Controls & Granularity**
  - Play, Pause, Step Next, Step Prev, Reset, Speed (0.5x, 1x, 2x), and Granularity (Statement, Expression, Algorithm).
- [x] **Phase 10: Professional UI/UX Redesign**
  - Cohesive dark developer tool layout.
- [x] **Phase 11: Error Handling & Verification**
  - All 34/34 backend tests pass, 12/12 Next.js routes compile with zero errors.
