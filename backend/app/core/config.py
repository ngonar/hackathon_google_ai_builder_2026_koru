import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "KORU Memorial Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Google GenAI / Gemini Settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_LLM_MODEL: str = "gemini-2.5-flash"
    TTS_MODEL: str = "gemini-2.5-flash-preview-tts"
    EMBEDDING_MODEL: str = "gemini-embedding-001"
    
    # Storage directories
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    STATIC_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
    
    # Server configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8080"))
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.STATIC_DIR, exist_ok=True)
