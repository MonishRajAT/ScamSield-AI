from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.analysis import router as analysis_router

app = FastAPI(
    title="ScamShield AI",
    description="AI-powered scam message detection and explanation system.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)

@app.get("/")
async def root():
    return {
        "message": "welcome to ScamSield-AI."
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ScamShield AI",
        "version": "1.0.0",
    }