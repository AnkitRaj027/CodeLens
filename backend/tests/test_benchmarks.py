import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_algorithm_matrix_list(client: AsyncClient):
    response = await client.get("/api/v1/benchmarks/matrix")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    assert data[0]["name"] == "Binary Search"


@pytest.mark.asyncio
async def test_simulate_scaling(client: AsyncClient):
    payload = {
        "complexities": ["O(1)", "O(n)", "O(n²)"],
        "input_sizes": [10, 100, 1000]
    }
    response = await client.post("/api/v1/benchmarks/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "points" in data
    assert len(data["points"]) == 3
    # Check scaling point for n=100
    p100 = data["points"][1]
    assert p100["n"] == 100
    assert p100["operations"]["O(1)"] == 1.0
    assert p100["operations"]["O(n)"] == 100.0
    assert p100["operations"]["O(n²)"] == 10000.0
