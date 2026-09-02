import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_quiz_questions(client: AsyncClient):
    response = await client.get("/api/v1/quiz/questions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    assert "time_options" in data[0]


@pytest.mark.asyncio
async def test_get_random_quiz_question(client: AsyncClient):
    response = await client.get("/api/v1/quiz/random")
    assert response.status_code == 200
    data = response.json()
    assert "code_snippet" in data
    assert "correct_time" in data


@pytest.mark.asyncio
async def test_submit_quiz_answer_correct(client: AsyncClient):
    payload = {
        "question_id": "q1",
        "selected_time": "O(n²)",
        "selected_space": "O(1)"
    }
    response = await client.post("/api/v1/quiz/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_time_correct"] is True
    assert data["is_space_correct"] is True
    assert data["is_fully_correct"] is True
    assert data["score_delta"] == 100


@pytest.mark.asyncio
async def test_submit_quiz_answer_incorrect(client: AsyncClient):
    payload = {
        "question_id": "q1",
        "selected_time": "O(n)",
        "selected_space": "O(n)"
    }
    response = await client.post("/api/v1/quiz/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_time_correct"] is False
    assert data["is_fully_correct"] is False
    assert data["score_delta"] == 0
