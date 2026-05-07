from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.api.deps import get_db
from app.models.base import Base, Usuario
from app.core import security

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_assessments.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_create_evaluation():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # 1. Create a user and get token
    db = TestingSessionLocal()
    user = Usuario(email="eval@example.com", password_hash=security.get_password_hash("pass"), nombre="Eval User")
    db.add(user)
    db.commit()
    db.refresh(user)
    token = security.create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Submit evaluation
    response = client.post(
        "/api/v1/assessments/",
        headers=headers,
        json={"phq9Score": 10, "gad7Score": 5, "text_input": "I have been feeling very sad and anxious lately."},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["phq9Score"] == 10
    assert "nivelRiesgo" in data
    assert data["id_usuario"] == user.id

def test_get_evaluations():
    # User from previous test
    db = TestingSessionLocal()
    user = db.query(Usuario).filter(Usuario.email == "eval@example.com").first()
    token = security.create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/v1/assessments/me", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1
