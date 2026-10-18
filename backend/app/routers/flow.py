from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from app.services.google_flow import (
    google_flow_service,
    FlowScene,
    FlowAvatarVariant,
    FlowCharacterProfile
)

router = APIRouter(prefix="/api/flow", tags=["Google Flow Avatar Studio"])

class GenerateVariantRequest(BaseModel):
    scene_id: str = Field(default="conservatory", description="ID of the environment scene preset")
    expression: str = Field(default="Maternal Serenity & Warmth", description="Facial & emotional expression")
    custom_tone: Optional[str] = Field(default=None, description="Optional custom lighting, camera framing, or nuance")
    style_fidelity: Optional[float] = Field(default=98.5, description="Veo & Imagen 3 subject consistency threshold")

class SetActiveAvatarRequest(BaseModel):
    variant_id: str = Field(..., description="ID of avatar variant to set as active for communion")

@router.get("/scenes", response_model=List[FlowScene])
def get_scenes():
    """Retrieve all available Serene Memorial Sanctuary 3D scene presets for Google Flow avatar generation."""
    return google_flow_service.get_scenes()

@router.get("/variants", response_model=List[FlowAvatarVariant])
def get_variants():
    """Retrieve all generated character avatar variants with fidelity scores and scene bindings."""
    return google_flow_service.get_variants()

@router.post("/generate", response_model=FlowAvatarVariant, status_code=status.HTTP_201_CREATED)
def generate_variant(req: GenerateVariantRequest):
    """
    Generate a new high-fidelity avatar variant using Google Flow (Veo & Imagen 3 character consistency engine).
    Preserves Margaret 'Peggy' Sutherland's facial anchors, silver hair, hazel eyes, and serene voice profile.
    """
    variant = google_flow_service.generate_avatar(
        scene_id=req.scene_id,
        expression=req.expression,
        custom_tone=req.custom_tone,
        style_fidelity=req.style_fidelity or 98.5
    )
    return variant

@router.post("/set-active", response_model=FlowAvatarVariant)
def set_active_avatar(req: SetActiveAvatarRequest):
    """
    Set the active avatar variant used across communion, live avatar sessions, and memory vaults.
    """
    variant = google_flow_service.set_active_avatar(req.variant_id)
    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Avatar variant '{req.variant_id}' not found."
        )
    return variant

@router.get("/profile", response_model=FlowCharacterProfile)
def get_character_profile():
    """
    Retrieve full Google Flow character consistency profile, active avatar, scenes, and generated variants.
    """
    scenes = google_flow_service.get_scenes()
    variants = google_flow_service.get_variants()
    active_var = next((v for v in variants if v.is_active), variants[0] if variants else None)
    active_url = active_var.image_url if active_var else "/static/peggy_avatar.png"

    return FlowCharacterProfile(
        character_id="flow-char-peggy-sutherland",
        character_name="Margaret 'Peggy' Sutherland",
        version="2.0-veo-consistency",
        scenes=scenes,
        variants=variants,
        active_avatar_url=active_url
    )

@router.get("/export")
def export_character_bundle() -> Dict[str, Any]:
    """
    Export the complete character profile and scene bundle JSON for Google Flow Studio / Veo 2 / Imagen 3 character consistency pipelines.
    """
    return google_flow_service.export_character_bundle()
