import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_curriculum_topics_list(client: AsyncClient):
    response = await client.get("/api/v1/curriculum/topics")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    assert data[0]["slug"] == "big-o-fundamentals"


@pytest.mark.asyncio
async def test_curriculum_topic_detail(client: AsyncClient):
    response = await client.get("/api/v1/curriculum/topics/big-o-fundamentals")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Big-O Asymptotic Notation Fundamentals"
    assert "formula" in data


@pytest.mark.asyncio
async def test_history_list_empty_or_populated(client: AsyncClient):
    response = await client.get("/api/v1/history/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
