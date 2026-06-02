from typing import Literal

from pydantic import BaseModel, Field, model_validator


class RbfScenarioRequest(BaseModel):
    monthly_revenue: float = Field(gt=0, description="Starting monthly revenue.")
    monthly_growth_rate: float = Field(
        ge=-0.5,
        le=1.0,
        description="Expected month-over-month revenue growth, as a decimal.",
    )
    investment_amount: float = Field(gt=0)
    repayment_cap_multiple: float = Field(ge=1.0, le=5.0)
    revenue_share_percent: float = Field(gt=0, le=1.0)
    months: int = Field(default=60, ge=1, le=120)
    post_money_valuation: float = Field(gt=0)
    exit_value: float = Field(gt=0)

    @model_validator(mode="after")
    def valuation_must_cover_investment(self) -> "RbfScenarioRequest":
        if self.post_money_valuation < self.investment_amount:
            raise ValueError("post_money_valuation must be at least investment_amount")
        return self


class AmortizationPoint(BaseModel):
    month: int
    revenue: float
    payment: float
    cumulative_paid: float
    remaining_cap: float


class EquityComparison(BaseModel):
    ownership_lost_percent: float
    founder_exit_cost: float
    rbf_total_cost: float
    rbf_premium_over_principal: float


class RbfScenarioResponse(BaseModel):
    source: Literal["calculated"]
    total_repayment_cap: float
    months_to_repay: int | None
    total_paid: float
    effective_apr_percent: float | None
    amortization: list[AmortizationPoint]
    equity_comparison: EquityComparison


class MacroIndicator(BaseModel):
    name: str
    value: float
    unit: str
    date: str
    source: Literal["fred", "world_bank", "mock"]
    note: str | None = None


class MacroContext(BaseModel):
    risk_free_rate: MacroIndicator
    gdp_growth: MacroIndicator
