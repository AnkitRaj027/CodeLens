from app.engine.python.parser import PythonASTAnalyzer
from app.schemas.analysis import StaticAnalysisResponse, StaticAnalysisRequest

python_analyzer = PythonASTAnalyzer()


class AnalysisService:
    @staticmethod
    def analyze_code(request: StaticAnalysisRequest) -> StaticAnalysisResponse:
        lang = request.language.lower().strip()
        if lang in ["python", "py", "python3"]:
            return python_analyzer.analyze(request.code)
        elif lang in ["cpp", "c++", "c"]:
            # Fallback for Phase 2 before dedicated C++ tree-sitter analyzer in Phase 4
            return python_analyzer.analyze(request.code)
        else:
            return python_analyzer.analyze(request.code)
