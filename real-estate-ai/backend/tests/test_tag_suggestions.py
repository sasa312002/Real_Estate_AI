import pytest
from fastapi.testclient import TestClient
from app.app import app  # assuming main FastAPI app is instantiated here

client = TestClient(app)


def test_suggest_tags_basic():
    resp = client.get('/property/suggest_tags', params={'q': 'House with pool and solar power near school'})
    assert resp.status_code == 200
    data = resp.json()
    tags = {t['tag'] for t in data.get('tags', [])}
    # Expect at least these tags present
    assert 'swimming pool' in tags or 'pool' in tags  # depending on matching
    assert 'solar power' in tags
    assert 'near school' in tags
