def test_checkout_creates_order(client, auth_headers):
    animal = client.post(
        "/animals",
        json={"name": "Sheep", "price": 200.0, "quantity": 2},
        headers=auth_headers
    ).json()

    client.post(
        "/cart/add",
        json={"animal_id": animal["id"], "quantity": 1},
        headers=auth_headers
    )

    res = client.post("/orders/checkout", headers=auth_headers)

    assert res.status_code == 201
    assert res.json()["status"] == "PENDING"


def test_confirm_order(client, auth_headers):
    order = client.post("/orders/checkout", headers=auth_headers).json()

    res = client.post(
        f"/orders/{order['id']}/confirm",
        headers=auth_headers
    )

    assert res.status_code == 200
    assert res.json()["status"] == "CONFIRMED"
