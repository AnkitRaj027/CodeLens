from app.engine.python.parser import PythonASTAnalyzer
from app.engine.cpp.parser import CppASTAnalyzer
from app.schemas.analysis import StaticAnalysisResponse, StaticAnalysisRequest

python_analyzer = PythonASTAnalyzer()
cpp_analyzer = CppASTAnalyzer()


class AnalysisService:
    @staticmethod
    def analyze_code(request: StaticAnalysisRequest) -> StaticAnalysisResponse:
        lang = request.language.lower().strip()
        if lang in ["cpp", "c++", "c", "cc", "cxx", "h", "hpp"]:
            return cpp_analyzer.analyze(request.code)
        else:
            return python_analyzer.analyze(request.code)
