def test_register(client, user_data):
    res = client.post("/auth/register", json=user_data)
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == user_data["email"]
    assert "id" in data

def test_register_existing_user(client, user_data, create_user):
    # Attempting to register again should fail
    res = client.post("/auth/register", json=user_data)
    assert res.status_code == 400

def test_login(client, user_data, create_user):
    res = client.post("/auth/login", data={
        "username": user_data["email"],
        "password": user_data["password"]
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
