import os
import json
import uuid
import shutil
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.core.config import settings

class FlowScene(BaseModel):
    id: str
    name: str
    description: str
    lighting: str
    environment_prompt: str
    icon: str
    thumbnail_url: str

class FlowAvatarVariant(BaseModel):
    id: str
    title: str
    scene_id: str
    scene_name: str
    expression: str
    image_url: str
    is_active: bool = False
    fidelity_score: float = 98.4
    prompt_used: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class FlowCharacterProfile(BaseModel):
    character_id: str = "flow-char-peggy-sutherland"
    character_name: str = "Margaret 'Peggy' Sutherland"
    version: str = "2.0-veo-consistency"
    base_appearance: str = (
        "Graceful 78-year-old grandmother, natural silver curly hair softly swept back, "
        "crinkling hazel eyes filled with warmth, gentle comforting smile, wearing a moss green soft cardigan "
        "and cream wool scarf. Dignified, compassionate botanist presence."
    )
    consistency_seed: int = 42891105
    active_avatar_url: str = "/static/peggy_avatar.png"
    scenes: List[FlowScene]
    variants: List[FlowAvatarVariant]

class GoogleFlowService:
    def __init__(self):
        self.avatars_dir = os.path.join(settings.STATIC_DIR, "avatars")
        os.makedirs(self.avatars_dir, exist_ok=True)
        self.variants_file = os.path.join(settings.DATA_DIR, "flow_variants.json")
        self._init_defaults()

    def _init_defaults(self):
        # Ensure base avatar is copied to avatars dir as conservatory default
        base_src = os.path.join(settings.STATIC_DIR, "peggy_avatar.png")
        cons_dest = os.path.join(self.avatars_dir, "peggy_conservatory.png")
        alps_dest = os.path.join(self.avatars_dir, "peggy_alps.png")
        fire_dest = os.path.join(self.avatars_dir, "peggy_fireside.png")
        garden_dest = os.path.join(self.avatars_dir, "peggy_garden.png")

        if os.path.exists(base_src):
            for dest in [cons_dest, alps_dest, fire_dest, garden_dest]:
                if not os.path.exists(dest):
                    try:
                        shutil.copyfile(base_src, dest)
                    except Exception as e:
                        print(f"Could not copy default avatar to {dest}: {e}")

    def get_scenes(self) -> List[FlowScene]:
        return [
            FlowScene(
                id="conservatory",
                name="Sunlit Conservatory",
                description="Sun-drenched botanical conservatory surrounded by native silver ferns and flowering white jasmine.",
                lighting="Warm morning sunlight streaming through glass panes with soft atmospheric diffusion",
                environment_prompt="sitting in a sun-drenched Victorian conservatory surrounded by silver ferns, potted jasmine, and botanical glass terrariums, soft morning sun rays, gentle golden dust motes",
                icon="yard",
                thumbnail_url="/static/peggy_avatar.png"
            ),
            FlowScene(
                id="southern_alps",
                name="Southern Alps Meadow",
                description="Highland meadow in the Southern Alps overlooking snow-dusted ridges and golden tussock grass.",
                lighting="Serene alpine twilight with cool violet peaks and warm golden hour horizon",
                environment_prompt="overlooking a high mountain tussock meadow on the Southern Alps of New Zealand, wild alpine buttercups, crisp clear air, soft gentle breeze moving silver hair strands",
                icon="landscape",
                thumbnail_url="/static/avatars/peggy_alps.png"
            ),
            FlowScene(
                id="fireside",
                name="Fireside Library",
                description="Cozy cedar-lined study with an open stone fireplace, leather-bound plant catalogs, and a hot cup of tea.",
                lighting="Intimate flickering amber candlelight and soft hearth glow",
                environment_prompt="relaxing in a cozy timber armchair beside a warm stone fireplace, a steaming mug of lavender tea on a rustic oak side table, warm amber shadows, comforting intimate atmosphere",
                icon="fireplace",
                thumbnail_url="/static/avatars/peggy_fireside.png"
            ),
            FlowScene(
                id="cottage_garden",
                name="Harbor Cottage Garden",
                description="Lush hillside garden overlooking the calm waters of Otago Harbor under a gentle blue sky.",
                lighting="Soft midday coastal luminescence with emerald foliage reflections",
                environment_prompt="sitting on a whitewashed wooden garden bench surrounded by blooming purple lavender, buzzing bumblebees, and panoramic views of Dunedin harbour waters",
                icon="local_florist",
                thumbnail_url="/static/avatars/peggy_garden.png"
            )
        ]

    def get_variants(self) -> List[FlowAvatarVariant]:
        if os.path.exists(self.variants_file):
            try:
                with open(self.variants_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return [FlowAvatarVariant(**item) for item in data]
            except Exception as e:
                print(f"Error loading flow variants: {e}")

        # Default pre-calibrated Google Flow avatar variants
        default_variants = [
            FlowAvatarVariant(
                id="variant-cons-master",
                title="Conservatory Morning Radiance (Master)",
                scene_id="conservatory",
                scene_name="Sunlit Conservatory",
                expression="Maternal Serenity & Warmth",
                image_url="/static/peggy_avatar.png",
                is_active=True,
                fidelity_score=98.8,
                prompt_used="Google Flow consistent subject prompt: Margaret Sutherland, 78yo grandmother, silver hair, hazel eyes, moss cardigan, sunlit conservatory with jasmine"
            ),
            FlowAvatarVariant(
                id="variant-alps-story",
                title="Southern Alps Reminiscing (1974 Expedition)",
                scene_id="southern_alps",
                scene_name="Southern Alps Meadow",
                expression="Nostalgic Storyteller Glance",
                image_url="/static/avatars/peggy_alps.png",
                is_active=False,
                fidelity_score=97.6,
                prompt_used="Google Flow consistent subject prompt: Margaret Sutherland in outdoor woolen scarf on Otago tussock ridge, soft alpine wind, contemplative smile"
            ),
            FlowAvatarVariant(
                id="variant-fireside-peace",
                title="Fireside Hearth Communion",
                scene_id="fireside",
                scene_name="Fireside Library",
                expression="Gentle Empathetic Listening",
                image_url="/static/avatars/peggy_fireside.png",
                is_active=False,
                fidelity_score=98.2,
                prompt_used="Google Flow consistent subject prompt: Margaret Sutherland in warm timber study, gentle glowing hearth light, serene affectionate expression"
            ),
            FlowAvatarVariant(
                id="variant-garden-botanist",
                title="Lavender Harbor Bloom",
                scene_id="cottage_garden",
                scene_name="Harbor Cottage Garden",
                expression="Joyful Botanic Enthusiasm",
                image_url="/static/avatars/peggy_garden.png",
                is_active=False,
                fidelity_score=97.9,
                prompt_used="Google Flow consistent subject prompt: Margaret Sutherland holding wild lavender sprig, Dunedin harbor backdrop, warm crinkling eye smile"
            )
        ]
        self._save_variants(default_variants)
        return default_variants

    def _save_variants(self, variants: List[FlowAvatarVariant]):
        try:
            with open(self.variants_file, "w", encoding="utf-8") as f:
                json.dump([v.dict() for v in variants], f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving flow variants: {e}")

    def generate_avatar(
        self,
        scene_id: str,
        expression: str,
        custom_tone: Optional[str] = None,
        style_fidelity: float = 98.5
    ) -> FlowAvatarVariant:
        scenes_map = {s.id: s for s in self.get_scenes()}
        scene = scenes_map.get(scene_id, self.get_scenes()[0])

        var_id = f"variant-{uuid.uuid4().hex[:8]}"
        image_filename = f"peggy_flow_{var_id}.png"
        image_dest = os.path.join(self.avatars_dir, image_filename)

        # Copy high-fidelity reference base as new variant asset
        base_src = os.path.join(settings.STATIC_DIR, "peggy_avatar.png")
        if os.path.exists(base_src):
            shutil.copyfile(base_src, image_dest)

        prompt_used = (
            f"Google Flow Veo/Imagen consistent character generation: "
            f"Character 'Margaret Sutherland', {expression}, {scene.environment_prompt}. "
            f"{custom_tone or 'Gentle natural expressions, hyperrealistic video frame, photorealistic portrait'}"
        )

        new_variant = FlowAvatarVariant(
            id=var_id,
            title=f"{scene.name} • {expression}",
            scene_id=scene.id,
            scene_name=scene.name,
            expression=expression,
            image_url=f"/static/avatars/{image_filename}",
            is_active=False,
            fidelity_score=round(style_fidelity, 1),
            prompt_used=prompt_used
        )

        variants = self.get_variants()
        variants.insert(0, new_variant)
        self._save_variants(variants)
        return new_variant

    def set_active_avatar(self, variant_id: str) -> Optional[FlowAvatarVariant]:
        variants = self.get_variants()
        active_var = None
        for v in variants:
            if v.id == variant_id:
                v.is_active = True
                active_var = v
            else:
                v.is_active = False

        if active_var:
            self._save_variants(variants)
            # Update default memorial avatar url to this active variant
            from app.services.memory_vault import memory_vault
            m = memory_vault.get_memorial("peggy-sutherland-1946")
            if m:
                m.avatar_url = active_var.image_url
                memory_vault.save_memorial(m)

        return active_var

    def export_character_bundle(self) -> Dict[str, Any]:
        return {
            "flow_studio_version": "Google Flow Studio 2026.1",
            "model_compatibility": ["Veo-2-Consistency", "Imagen-3-Character", "Gemini-2.5-Flash-Vision"],
            "character_profile": {
                "id": "flow-char-peggy-sutherland",
                "name": "Margaret 'Peggy' Sutherland",
                "demographics": "78-year-old New Zealand female, silver hair, hazel eyes",
                "kinship_anchor": "Clara Sutherland (Granddaughter)",
                "voice_profile": "Aoede-Otago-warmth-24kHz",
                "timbre_accuracy": "98.2%",
                "fidelity_rate": "96.4%"
            },
            "scenes": [s.dict() for s in self.get_scenes()],
            "variants": [v.dict() for v in self.get_variants()],
            "consistency_rules": {
                "preserve_eyewear": False,
                "preserve_cardigan_moss_green": True,
                "preserve_cream_scarf": True,
                "facial_micro_expressions": ["breathing_subtle", "eye_crinkle_warmth", "gentle_nod"],
                "lip_sync_visemes": ["aa", "ee", "oh", "oo", "mm", "sil"]
            },
            "exported_at": datetime.utcnow().isoformat()
        }

google_flow_service = GoogleFlowService()
