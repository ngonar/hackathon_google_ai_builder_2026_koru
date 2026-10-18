from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.voice_engine import voice_engine

router = APIRouter(prefix="/api/voice", tags=["Voice"])

class VoiceTestRequest(BaseModel):
    text: str = "Hello, my darling. It is so wonderful to hear your voice again."
    voice_name: str = "Aoede"

@router.get("/benchmark")
def get_benchmark_sample(voice_name: str = "Aoede"):
    text = "Hello, my darling. It is so wonderful to hear your voice again."
    audio_b64, audio_mime, visemes = voice_engine.synthesize_speech(text, voice_name=voice_name)
    return {
        "text": text,
        "audio_base64": audio_b64,
        "audio_mime": audio_mime,
        "duration_seconds": 4.5,
        "visemes": visemes
    }

@router.post("/test")
def test_voice_sample(req: VoiceTestRequest):
    audio_b64, audio_mime, visemes = voice_engine.synthesize_speech(req.text, voice_name=req.voice_name)
    return {
        "text": req.text,
        "audio_base64": audio_b64,
        "audio_mime": audio_mime,
        "visemes": visemes
    }
