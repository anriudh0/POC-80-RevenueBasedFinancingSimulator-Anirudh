from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


def test_cors_allows_frontend_origin():
    response = client.options(
        "/api/rbf-scenario",
        headers={
            "Origin": "http://127.0.0.1:3000",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:3000"


def test_cors_allows_other_localhost_ports():
    response = client.options(
        "/api/macro-context",
        headers={
            "Origin": "http://127.0.0.1:3001",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:3001"
