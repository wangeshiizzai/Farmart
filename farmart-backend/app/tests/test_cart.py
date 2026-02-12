def test_add_to_cart(client, user_token):
    res = client.post(
        "/cart",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"animal_id": 1, "quantity": 2}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["quantity"] == 2

def test_get_cart(client, user_token):
    res = client.get(
        "/cart",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)
