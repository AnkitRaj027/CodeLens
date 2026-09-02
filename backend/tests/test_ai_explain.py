import pytest
from httpx import AsyncClient
from app.services.ai_service import AIService
from app.schemas.ai import AIExplainRequest


@pytest.mark.asyncio
async def test_ai_explanation_quadratic():
    req = AIExplainRequest(
        code="for i in range(n):\n    for j in range(n):\n        print(i, j)",
        language="python",
        time_complexity="O(n²)",
        space_complexity="O(1)",
        confidence="HIGH",
        mode="intermediate"
    )
    res = AIService._generate_deterministic_explanation(req)
    assert res.explanation_mode == "intermediate"
    assert len(res.step_by_step_reasoning) > 0
    assert "quadruple" in res.what_happens_if_n_doubles.lower() or "4x" in res.what_happens_if_n_doubles.lower()
    assert res.optimization.has_optimization is True
    assert res.optimization.optimized_time_complexity == "O(n)"


@pytest.mark.asyncio
async def test_ai_explanation_endpoint(client: AsyncClient):
    payload = {
        "code": "def fib(n):\n    if n<=1: return n\n    return fib(n-1) + fib(n-2)",
        "language": "python",
        "time_complexity": "O(2^n)",
        "space_complexity": "O(n)",
        "confidence": "HIGH",
        "mode": "dsa_student"
    }
    response = await client.post("/api/v1/ai/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["explanation_mode"] == "dsa_student"
    assert "optimization" in data
    assert data["optimization"]["has_optimization"] is True


@pytest.mark.asyncio
async def test_ai_chat_endpoint(client: AsyncClient):
    payload = {
        "code": "def two_sum(arr, target):\n    for i in arr:\n        for j in arr:\n            if i+j==target: return True",
        "language": "python",
        "time_complexity": "O(n²)",
        "space_complexity": "O(1)",
        "confidence": "HIGH",
        "messages": [],
        "question": "How can I optimize this?"
    }
    response = await client.post("/api/v1/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 0

