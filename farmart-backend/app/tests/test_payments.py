def test_create_payment(client, user_token):
    res = client.post(
        "/payments",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"order_id": 1, "amount": 400, "method": "credit_card"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["amount"] == 400

def test_list_payments(client, user_token):
    res = client.get(
        "/payments",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)
