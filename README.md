# CodeLens: Analyze. Understand. Optimize.

Production-grade educational & developer platform for deterministic AST-based algorithm complexity analysis and grounded AI tutoring.

## Architecture

- **Backend**: FastAPI, Pydantic v2, SQLAlchemy (Async), Argon2/JWT Authentication, Python AST & Tree-Sitter C++ complexity analysis engine.
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Monaco Editor, Lucide Icons, React Flow visualizer.
- **Database**: PostgreSQL / SQLite with async support.

## Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to access the CodeLens platform.
