# 🔍 CodeLens: Analyze. Understand. Optimize.

An AI-assisted, production-grade web platform and deterministic algorithm complexity engine that analyzes source code (Python & C++), derives exact asymptotic Time and Space bounds, visually inspects AST hierarchies, and provides grounded pedagogical explanations and optimization tradeoffs.

---

## 🌟 Key Capabilities

### 1. ⚙️ Deterministic Static Analysis Engine (Zero LLM Guesswork)
- **Compiler AST Control-Flow Parsing**: Parses Python & C++ into abstract syntax trees without relying on brittle LLM prompts for Big-O calculation.
- **Loop & Dependent Summations**: Analyzes linear $O(n)$, quadratic nested $O(n^2)$, cubic $O(n^3)$, logarithmic multiplier steps $O(\log n)$, and dependent inner loops ($\sum_{i=1}^n i = O(n^2)$).
- **Recursion Trees & Recurrence Solver**: Automatically solves divide-and-conquer recurrences ($T(n) = T(n/2) + O(1) \rightarrow O(\log n)$), Master Theorem ($T(n) = 2T(n/2) + O(n) \rightarrow O(n \log n)$), and exponential branching trees ($O(2^n)$).
- **Deep Memory Space Breakdown**: Dissects **Auxiliary Heap Memory** (1D arrays $O(n)$, 2D matrix grids $O(n^2)$) vs **Recursion Call Stack Memory** ($O(n)$, $O(\log n)$).

### 2. 🎬 Interactive Code Execution Visualization Studio
- **Unified Execution Synchronization**: Source Code $\leftrightarrow$ AST $\leftrightarrow$ CFG $\leftrightarrow$ Call Stack $\leftrightarrow$ Variables $\leftrightarrow$ Algorithm Canvas.
- **Control Flow Graph (CFG)**: Real control flow graph rendering decision branches (`YES`/`NO`), loop back-edges, and runtime evaluation badges (`7 <= 1 -> FALSE`).
- **Rich AST Tree View**: Node-level execution states (`Pending`, `Current`, `Executed`) with real-time evaluated result badges (`mid = len(arr) // 2 -> Result: mid = 3`).
- **Dedicated Call Stack Panel**: Visualizes recursive function calls (e.g. `merge_sort([38, 27])`) with frame variables and push/pop animations.
- **Live Memory & Variables State Tracker**: Highlights variable deltas (`old → new`) with Beginner and Developer views.
- **Algorithm Visualizer Canvas**: Step-by-step visual data structures (Merge Sort partition trees, Binary Search low/mid/high pointers, 2-pointer matrix grids).
- **"Explain This Step" Engine**: Deterministic plain-English mathematical computation breakdowns for every step.

### 3. 🧠 Grounded AI Pedagogical DSA Tutor
- Injects verified static analysis findings as **immutable ground truth** into the AI context to ensure zero hallucination.
- **Multi-Tier Explanation Modes**:
  - `Beginner`: High school & intuitive analogies.
  - `University`: Formal mathematical proofs and summation bounds.
  - `Senior / Advanced`: Memory layout, cache locality, CPU branch prediction.
  - `DSA Interview`: LeetCode constraint guidelines ($N \le 10^5 \rightarrow O(n \log n)$).
- **$N$ Scaling Analysis**: Quantifies exact operational impacts when $N \rightarrow 2N$ (e.g. $O(n^2) \rightarrow 4\times$ operations).
- **Side-by-Side Optimization Diff**: Suggests algorithmic improvements (e.g. Hash Map frequency indexing) with time vs space tradeoff metrics.

### 3. 📚 Curriculum Center & Interactive Practice Arena
- **Comprehensive DSA Curriculum**: Step-by-step guides on Big-O Fundamentals, Dependent Summations, Master Theorem, and Space-Time Tradeoffs.
- **Interactive Practice Arena**: Quiz challenge bank with instant automated scoring, streak tracking, and structural proofs.
- **Algorithm Comparison Matrix**: Side-by-side comparison of canonical Search, Sort, and Dynamic Programming algorithms with live asymptotic scaling curves.
- **Analysis History Workbench**: Persistent archive of past AST runs with instant reload into the IDE.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS / Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API will be available at: `http://localhost:8000`  
Swagger Documentation: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web IDE will be available at: `http://localhost:3000`

---

## 🧪 Running Automated Tests
CodeLens contains a comprehensive test suite across Python and C++ complexity parsing, recursion solvers, space analyzers, and grounded AI endpoints.

```bash
cd backend
venv\Scripts\pytest -v
```
*(All 33/33 unit tests pass with zero errors)*

---

## 🏗️ Architecture & Technology Stack
- **Backend**: FastAPI, SQLAlchemy Async, SQLite / PostgreSQL, Pydantic v2, Jose JWT, Argon2id Password Hashing.
- **Complexity Engine**: Python AST Visitor Patterns, C++ Regex & Lexical AST Visitor, Symbolic Big-O Algebra Solver.
- **Frontend**: Next.js 14/15 App Router, React 19, TypeScript, Tailwind CSS Dark Design System, Monaco Code Editor, Lucide Icons, Axios.
