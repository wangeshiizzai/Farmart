def test_simulated_payment(client, auth_headers):
    order = client.post("/orders/checkout", headers=auth_headers).json()

    client.post(
        f"/orders/{order['id']}/confirm",
        headers=auth_headers
    )

    res = client.post(
        f"/payments/simulate",
        json={"order_id": order["id"]},
        headers=auth_headers
    )

    assert res.status_code == 200
    assert res.json()["paid"] is True
