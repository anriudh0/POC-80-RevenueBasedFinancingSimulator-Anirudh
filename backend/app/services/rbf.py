from __future__ import annotations

from math import pow

from backend.app.models import (
    AmortizationPoint,
    EquityComparison,
    RbfScenarioRequest,
    RbfScenarioResponse,
)


def build_rbf_scenario(request: RbfScenarioRequest) -> RbfScenarioResponse:
    total_cap = request.investment_amount * request.repayment_cap_multiple
    remaining_cap = total_cap
    cumulative_paid = 0.0
    amortization: list[AmortizationPoint] = []
    months_to_repay: int | None = None

    for month in range(1, request.months + 1):
        revenue = request.monthly_revenue * pow(1 + request.monthly_growth_rate, month - 1)
        payment = min(remaining_cap, revenue * request.revenue_share_percent)
        cumulative_paid += payment
        remaining_cap = max(total_cap - cumulative_paid, 0.0)

        amortization.append(
            AmortizationPoint(
                month=month,
                revenue=round(revenue, 2),
                payment=round(payment, 2),
                cumulative_paid=round(cumulative_paid, 2),
                remaining_cap=round(remaining_cap, 2),
            )
        )

        if remaining_cap <= 0 and months_to_repay is None:
            months_to_repay = month
            break

    effective_apr = _estimate_effective_apr(
        principal=request.investment_amount,
        payments=[point.payment for point in amortization],
    )

    ownership_lost = request.investment_amount / request.post_money_valuation
    equity_cost = ownership_lost * request.exit_value
    equity_comparison = EquityComparison(
        ownership_lost_percent=round(ownership_lost * 100, 2),
        founder_exit_cost=round(equity_cost, 2),
        rbf_total_cost=round(total_cap, 2),
        rbf_premium_over_principal=round(total_cap - request.investment_amount, 2),
    )

    return RbfScenarioResponse(
        source="calculated",
        total_repayment_cap=round(total_cap, 2),
        months_to_repay=months_to_repay,
        total_paid=round(cumulative_paid, 2),
        effective_apr_percent=effective_apr,
        amortization=amortization,
        equity_comparison=equity_comparison,
    )


def _estimate_effective_apr(principal: float, payments: list[float]) -> float | None:
    if not payments or sum(payments) <= principal:
        return None

    low = 0.0
    high = 1.0

    for _ in range(100):
        midpoint = (low + high) / 2
        present_value = sum(payment / pow(1 + midpoint, month) for month, payment in enumerate(payments, 1))

        if present_value > principal:
            low = midpoint
        else:
            high = midpoint

    monthly_rate = (low + high) / 2
    apr = (pow(1 + monthly_rate, 12) - 1) * 100
    return round(apr, 2)
