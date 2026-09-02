from abc import ABC, abstractmethod
from app.schemas.analysis import StaticAnalysisResponse


class BaseAnalyzer(ABC):
    @abstractmethod
    def analyze(self, source_code: str) -> StaticAnalysisResponse:
        """Parse source code and return deterministic complexity analysis"""
        pass
