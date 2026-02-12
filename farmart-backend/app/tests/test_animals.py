def test_create_animal(client, auth_headers):
    res = client.post(
        "/animals",
        json={
            "name": "Goat",
            "price": 120.0,
            "quantity": 5
        },
        headers=auth_headers
    )
    assert res.status_code == 201


def test_list_animals(client):
    res = client.get("/animals")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
