import pytest
from pydantic import ValidationError

from backend.app.models import RbfScenarioRequest
from backend.app.services.rbf import build_rbf_scenario


def test_rbf_payments_stop_at_repayment_cap():
    request = RbfScenarioRequest(
        monthly_revenue=100_000,
        monthly_growth_rate=0,
        investment_amount=250_000,
        repayment_cap_multiple=1.5,
        revenue_share_percent=0.1,
        months=60,
        post_money_valuation=2_500_000,
        exit_value=20_000_000,
    )

    scenario = build_rbf_scenario(request)

    assert scenario.total_repayment_cap == 375_000
    assert scenario.total_paid == 375_000
    assert scenario.months_to_repay == 38
    assert scenario.amortization[-1].payment == 5_000
    assert scenario.amortization[-1].remaining_cap == 0


def test_equity_comparison_uses_post_money_ownership_loss():
    request = RbfScenarioRequest(
        monthly_revenue=80_000,
        monthly_growth_rate=0.02,
        investment_amount=1_000_000,
        repayment_cap_multiple=2,
        revenue_share_percent=0.08,
        months=72,
        post_money_valuation=5_000_000,
        exit_value=50_000_000,
    )

    scenario = build_rbf_scenario(request)

    assert scenario.equity_comparison.ownership_lost_percent == 20
    assert scenario.equity_comparison.founder_exit_cost == 10_000_000
    assert scenario.equity_comparison.rbf_total_cost == 2_000_000


def test_post_money_valuation_must_cover_investment():
    with pytest.raises(ValidationError):
        RbfScenarioRequest(
            monthly_revenue=80_000,
            monthly_growth_rate=0.02,
            investment_amount=1_000_000,
            repayment_cap_multiple=2,
            revenue_share_percent=0.08,
            months=72,
            post_money_valuation=500_000,
            exit_value=50_000_000,
        )
