from backend.app.services import market_data


def test_fred_returns_mock_when_api_key_missing(monkeypatch):
    monkeypatch.delenv("FRED_API_KEY", raising=False)

    indicator = market_data._fetch_fred_ten_year_rate()

    assert indicator.source == "mock"
    assert "FRED_API_KEY" in indicator.note


def test_world_bank_returns_mock_when_request_fails(monkeypatch):
    def raise_error(*args, **kwargs):
        raise market_data.requests.RequestException("offline")

    monkeypatch.setattr(market_data.requests, "get", raise_error)

    indicator = market_data._fetch_world_bank_gdp_growth()

    assert indicator.source == "mock"
    assert "World Bank" in indicator.note
