from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_rbf_scenario_endpoint():
    response = client.post(
        "/api/rbf-scenario",
        json={
            "monthly_revenue": 100000,
            "monthly_growth_rate": 0,
            "investment_amount": 250000,
            "repayment_cap_multiple": 1.5,
            "revenue_share_percent": 0.1,
            "months": 60,
            "post_money_valuation": 2500000,
            "exit_value": 20000000,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["total_repayment_cap"] == 375000
    assert payload["months_to_repay"] == 38
