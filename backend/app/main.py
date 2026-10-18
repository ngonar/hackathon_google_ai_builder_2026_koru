import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.routers import memorials, communion, memories, voice, auth, flow, life_story

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for KORU: AI Memorial Avatar, Voice Regeneration & Memory Sanctuary"
)

# CORS configuration to allow local Web (e.g. Next.js on 3000) and Mobile (Expo on 8081 / 19000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (avatar images, audio)
if os.path.exists(settings.STATIC_DIR):
    app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Include API Routers
app.include_router(memorials.router)
app.include_router(communion.router)
app.include_router(memories.router)
app.include_router(voice.router)
app.include_router(auth.router)
app.include_router(flow.router)
app.include_router(life_story.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "llm_model": settings.DEFAULT_LLM_MODEL,
        "tts_model": settings.TTS_MODEL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
