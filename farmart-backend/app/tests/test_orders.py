def test_create_order(client, user_token):
    res = client.post(
        "/orders",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"cart_items": [{"animal_id": 1, "quantity": 2}]}
    )
    assert res.status_code == 201
    data = res.json()
    assert "id" in data

def test_list_orders(client, user_token):
    res = client.get(
        "/orders",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)
