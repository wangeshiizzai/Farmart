def test_create_animal(client, user_token):
    res = client.post(
        "/animals",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"name": "Cow", "price": 200}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Cow"

def test_list_animals(client):
    res = client.get("/animals")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
