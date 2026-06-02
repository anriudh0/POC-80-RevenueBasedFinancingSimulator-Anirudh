from __future__ import annotations

import os
from datetime import date
from typing import Any

import requests

from backend.app.models import MacroContext, MacroIndicator

FRED_OBSERVATIONS_URL = "https://api.stlouisfed.org/fred/series/observations"
WORLD_BANK_GDP_GROWTH_URL = "https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.MKTP.KD.ZG"


def get_macro_context() -> MacroContext:
    return MacroContext(
        risk_free_rate=_fetch_fred_ten_year_rate(),
        gdp_growth=_fetch_world_bank_gdp_growth(),
    )


def _fetch_fred_ten_year_rate() -> MacroIndicator:
    api_key = os.getenv("FRED_API_KEY")
    if not api_key:
        return _mock_indicator(
            name="10-Year Treasury Constant Maturity Rate",
            value=4.25,
            unit="percent",
            note="Mock fallback because FRED_API_KEY is not set.",
        )

    params = {
        "series_id": "DGS10",
        "api_key": api_key,
        "file_type": "json",
        "sort_order": "desc",
        "limit": 10,
    }

    try:
        response = requests.get(FRED_OBSERVATIONS_URL, params=params, timeout=8)
        response.raise_for_status()
        observations = response.json().get("observations", [])
        for observation in observations:
            value = observation.get("value")
            if value and value != ".":
                return MacroIndicator(
                    name="10-Year Treasury Constant Maturity Rate",
                    value=float(value),
                    unit="percent",
                    date=observation["date"],
                    source="fred",
                )
    except (requests.RequestException, KeyError, TypeError, ValueError):
        pass

    return _mock_indicator(
        name="10-Year Treasury Constant Maturity Rate",
        value=4.25,
        unit="percent",
        note="Mock fallback because live FRED data could not be loaded.",
    )


def _fetch_world_bank_gdp_growth() -> MacroIndicator:
    params = {"format": "json", "per_page": 10}

    try:
        response = requests.get(WORLD_BANK_GDP_GROWTH_URL, params=params, timeout=8)
        response.raise_for_status()
        payload: list[Any] = response.json()
        observations = payload[1] if len(payload) > 1 else []
        for observation in observations:
            if observation.get("value") is not None:
                return MacroIndicator(
                    name="United States GDP growth",
                    value=round(float(observation["value"]), 2),
                    unit="annual percent",
                    date=str(observation["date"]),
                    source="world_bank",
                )
    except (requests.RequestException, IndexError, TypeError, ValueError):
        pass

    return _mock_indicator(
        name="United States GDP growth",
        value=2.1,
        unit="annual percent",
        note="Mock fallback because live World Bank data could not be loaded.",
    )


def _mock_indicator(name: str, value: float, unit: str, note: str) -> MacroIndicator:
    return MacroIndicator(
        name=name,
        value=value,
        unit=unit,
        date=date.today().isoformat(),
        source="mock",
        note=note,
    )
