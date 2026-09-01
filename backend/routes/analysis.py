from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.services.analysis_service import analysis_service

router = APIRouter(
    prefix="/api",
    tags=["Analysis"],
)

class AnalysisRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="SMS or message to analyze",
    )

class AnalysisResponse(BaseModel):
    message: str
    risk_level: str
    confidence: float
    probabilities: dict[str, float]
    explanation: dict

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_message(request: AnalysisRequest):
    try:
        result = analysis_service.analyze(request.message)

        return AnalysisResponse(**result)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during analysis.",
        ) from exc