def test_add_to_cart(client, auth_headers):
    animal = client.post(
        "/animals",
        json={"name": "Cow", "price": 500.0, "quantity": 3},
        headers=auth_headers
    ).json()

    res = client.post(
        "/cart/add",
        json={"animal_id": animal["id"], "quantity": 1},
        headers=auth_headers
    )

    assert res.status_code == 200


def test_view_cart(client, auth_headers):
    res = client.get("/cart", headers=auth_headers)
    assert res.status_code == 200
    assert "items" in res.json()
