from typing import Optional, List
from pydantic import BaseModel, Field
import uuid
from datetime import datetime

class UserRegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    relation: str = "Granddaughter"  # e.g., Granddaughter, Son, Daughter, Spouse, Sibling, Friend
    memorial_honoree: Optional[str] = "Margaret 'Peggy' Sutherland"
    memorial_focus: Optional[str] = "Living Avatar & Neural Voice"
    reverence_pledge: bool = True
    sanctuary_privacy: Optional[str] = "family_only"  # "family_only", "private", "community"
    preferred_tone: Optional[str] = "Warm & Contemplative"

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    email: str
    relation: str
    memorial_honoree: str = "Margaret 'Peggy' Sutherland"
    memorial_focus: str = "Living Avatar & Neural Voice"
    sanctuary_privacy: str = "family_only"
    preferred_tone: str = "Warm & Contemplative"
    reverence_pledge: bool = True
    avatar_initial: str = "C"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
