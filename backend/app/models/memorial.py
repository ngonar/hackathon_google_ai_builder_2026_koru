from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid
from datetime import datetime

class VisemeFrame(BaseModel):
    time_ms: int
    viseme: str  # e.g., 'sil', 'aa', 'ee', 'oh', 'oo', 'mm'
    aperture: float  # 0.0 to 1.0 (mouth open amount)

class MemoryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    memorial_id: str
    title: str
    category: str = "story"  # story, letter, audio_memo, journal, milestone
    content: str
    date_str: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    audio_url: Optional[str] = None
    embedding: Optional[List[float]] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class Memorial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    nickname: Optional[str] = None
    birth_year: int
    passing_year: int
    location: str
    avatar_url: str
    profile_photo_url: Optional[str] = None
    user_relation: str = "Grandchild"  # e.g. Clara is Granddaughter
    user_name: str = "Clara"
    biography: str
    personality_traits: List[str] = Field(default_factory=list)
    signature_sayings: List[str] = Field(default_factory=list)
    accent_description: str = "Otago accent with natural southern lilt, gentle maternal timbre"
    voice_timbre_pct: float = 98.2
    fidelity_score_pct: float = 96.0
    voice_name: str = "Aoede"  # Google GenAI TTS voice (Aoede, Kore, etc.)
    audio_memos_count: int = 42
    letters_count: int = 184
    journals_count: int = 5
    memory_echoes: List[str] = Field(default_factory=list)
    warmth_level: int = 88
    presence_level: int = 95
    southern_lilt: int = 82
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    memorial_id: str
    role: str  # "user" or "avatar"
    text: str
    audio_url: Optional[str] = None
    memory_citation: Optional[str] = None
    cadence_note: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class CommunionRequest(BaseModel):
    memorial_id: str
    message: str
    user_name: Optional[str] = "Clara"
    include_audio: bool = True
    voice_name: Optional[str] = None

class CommunionResponse(BaseModel):
    reply_text: str
    audio_base64: Optional[str] = None
    audio_mime: Optional[str] = None
    emotion: str = "gentle_warmth"
    memory_citations: List[str] = Field(default_factory=list)
    cadence_info: str = "Otago cadence (1984)"
    visemes: List[VisemeFrame] = Field(default_factory=list)

class AcousticCalibrationUpdate(BaseModel):
    warmth: Optional[int] = None
    presence: Optional[int] = None
    southern_lilt: Optional[int] = None
    voice_name: Optional[str] = None

class Tribute(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    memorial_id: str
    author: str
    relation: str
    message: str
    candle_lit: bool = True
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
