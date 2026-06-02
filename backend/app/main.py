from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.models import MacroContext, RbfScenarioRequest, RbfScenarioResponse
from backend.app.services.market_data import get_macro_context
from backend.app.services.rbf import build_rbf_scenario

app = FastAPI(
    title="Revenue-Based Financing Simulator API",
    version="0.1.0",
    description="Backend math and macro-data API for PoC #80.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/macro-context", response_model=MacroContext)
def macro_context() -> MacroContext:
    return get_macro_context()


@app.post("/api/rbf-scenario", response_model=RbfScenarioResponse)
def rbf_scenario(request: RbfScenarioRequest) -> RbfScenarioResponse:
    return build_rbf_scenario(request)
