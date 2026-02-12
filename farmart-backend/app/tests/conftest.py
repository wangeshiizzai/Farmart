import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app

# -----------------------------
# Configure test database
# -----------------------------
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5433/farmart_test"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db to use test DB
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# -----------------------------
# Fixtures
# -----------------------------
@pytest.fixture(scope="session")
def test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(test_db):
    with TestClient(app) as c:
        yield c

@pytest.fixture
def user_data():
    return {
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User"
    }

@pytest.fixture
def create_user(client, user_data):
    res = client.post("/auth/register", json=user_data)
    return res.json()

@pytest.fixture
def user_token(client, user_data, create_user):
    res = client.post("/auth/login", data={
        "username": user_data["email"],
        "password": user_data["password"]
    })
    return res.json()["access_token"]
