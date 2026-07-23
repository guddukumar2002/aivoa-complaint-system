import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import patch

from app.main import app
from app.db.base import Base, get_db

# Setup in-memory SQLite database for fast isolated tests
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(name="session", scope="function")
def db_session_fixture():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(name="client", scope="function")
def client_fixture(session):
    def override_get_db():
        try:
            yield session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_auth_workflow(client):
    # 1. Register a test user
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "testagent@aivoa.com",
            "full_name": "Test Agent",
            "password": "securepassword123",
        },
    )
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == "testagent@aivoa.com"
    assert user_data["full_name"] == "Test Agent"
    assert "id" in user_data

    # 2. Authenticate to get token
    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "testagent@aivoa.com",
            "password": "securepassword123",
        },
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"


def test_complaints_crud_and_ai_mock(client):
    # Setup - Register & Auth
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "agent@aivoa.com",
            "full_name": "Agent Aivoa",
            "password": "password123",
        },
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": "agent@aivoa.com", "password": "password123"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a complaint
    complaint_payload = {
        "title": "Lipitral batch 10A issue",
        "description": "Patient John Doe reported severe hives and headache after taking Lipitral.",
        "category": "product_quality",
    }
    create_resp = client.post("/api/v1/complaints", json=complaint_payload, headers=headers)
    assert create_resp.status_code == 201
    comp_data = create_resp.json()
    assert comp_data["title"] == "Lipitral batch 10A issue"
    assert comp_data["category"] == "product_quality"
    assert comp_data["status"] == "open"
    comp_id = comp_data["id"]

    # 2. Get the complaint
    get_resp = client.get(f"/api/v1/complaints/{comp_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Lipitral batch 10A issue"

    # 3. Update the complaint status
    update_resp = client.put(
        f"/api/v1/complaints/{comp_id}",
        json={"status": "in_progress", "priority": "high"},
        headers=headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "in_progress"
    assert update_resp.json()["priority"] == "high"

    # 4. Test Mocked AI Pipeline Run
    mock_pipeline_output = {
        "complaint_id": comp_id,
        "pipeline_status": "completed",
        "is_valid": True,
        "is_duplicate": False,
        "duplicate_of": None,
        "similarity_score": 0.0,
        "validation_issues": [],
        "extraction": {
            "title": "Lipitral batch 10A issue",
            "description": "Patient John Doe reported severe hives and headache after taking Lipitral.",
            "keywords": ["Lipitral", "hives", "headache"],
            "entities": ["John Doe", "Lipitral"],
        },
        "completeness": {
            "score": 0.85,
            "missing_fields": ["expiry_date"],
            "reasoning": "Missing expiry date.",
        },
        "summary": "Summary details",
        "risk": {
            "sentiment": "negative",
            "sentiment_score": 0.9,
            "risk_level": "high",
            "suggested_category": "product_quality",
            "suggested_priority": "high",
        },
        "root_cause_analysis": {
            "root_cause": "Possible allergen",
            "contributing_factors": [],
        },
        "capa": {
            "corrective_actions": [],
            "preventive_actions": [],
            "timeline_days": 10,
        },
        "suggested_response": "Draft response",
        "explanations": {
            "extraction": "Extracted details.",
            "validation": "Valid complaint.",
            "completeness": "Score is 0.85.",
            "duplicate_detection": "Unique.",
            "summary": "Summary created.",
            "risk_classification": "High risk.",
            "root_cause": "RCA completed.",
            "capa": "CAPA generated.",
        },
        "errors": [],
    }

    with patch("app.application.services.langgraph_service.complaint_graph.invoke") as mock_invoke:
        mock_invoke.return_value = {
            "final_output": mock_pipeline_output,
            "errors": [],
        }

        pipeline_resp = client.post(
            "/api/v1/ai/pipeline",
            json={
                "complaint_id": comp_id,
                "title": "Lipitral batch 10A issue",
                "description": "Patient John Doe reported severe hives and headache after taking Lipitral.",
                "category": "product_quality",
            },
            headers=headers,
        )
        assert pipeline_resp.status_code == 200
        output_data = pipeline_resp.json()
        assert output_data["pipeline_status"] == "completed"
        assert output_data["completeness"]["score"] == 0.85

    # 5. Delete the complaint
    delete_resp = client.delete(f"/api/v1/complaints/{comp_id}", headers=headers)
    assert delete_resp.status_code == 204
