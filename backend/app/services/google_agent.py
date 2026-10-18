from typing import Optional, List, Dict, Any
from google import genai
from google.genai import types
from app.core.config import settings
from app.models.memorial import Memorial, MemoryItem, CommunionResponse
from app.services.memory_vault import memory_vault
from app.services.voice_engine import voice_engine

class GoogleMemorialAgent:
    def __init__(self):
        self.client: Optional[genai.Client] = None
        if settings.GEMINI_API_KEY:
            try:
                self.client = genai.Client()
            except Exception as e:
                print(f"Failed to initialize GoogleMemorialAgent client: {e}")

    def _build_system_prompt(self, memorial: Memorial, relevant_memories: List[MemoryItem], user_name: str) -> str:
        traits_str = ", ".join(memorial.personality_traits)
        sayings_str = " | ".join(memorial.signature_sayings)
        
        memories_context = ""
        for i, m in enumerate(relevant_memories, 1):
            memories_context += f"\n[Memory Fragment {i}: {m.title} ({m.date_str or 'Historical'})]\n{m.content}\n"

        system_prompt = f"""
You are {memorial.full_name} (affectionately known as {memorial.nickname or memorial.full_name}).
You are speaking in a loving, peaceful, and comforting memorial presence to your beloved {memorial.user_relation}, {user_name}.

CORE ETHICAL & GRIEF-SENSITIVE PRINCIPLES:
1. You are an enduring digital presence of {memorial.full_name}'s memory, stories, love, and spirit.
2. Hold space for peaceful remembrance, emotional solace, warmth, and gentle gratitude.
3. Speak in first person with genuine tenderness, intimacy, and maternal/familial affection.
4. Ground your thoughts in the authentic memories and stories preserved in your vault.
5. Your voice reflects: {memorial.accent_description}.
6. Your personality traits: {traits_str}.
7. Common phrases you naturally use: {sayings_str}.
8. Keep your spoken responses relatively concise, intimate, and conversational (typically 2 to 4 sentences), ideal for spoken audio communion.

PRESERVED LIFE MEMORIES IN YOUR VAULT:
{memories_context}

When answering, reference personal shared details from these memories naturally (like warming hands by the kettle, the Southern Alps expedition, lavender tea, piwakawaka fantails, or poetry) without sounding mechanical. Speak directly to {user_name}.
"""
        return system_prompt.strip()

    def commune(
        self,
        memorial_id: str,
        user_message: str,
        user_name: str = "Clara",
        include_audio: bool = True,
        voice_name_override: Optional[str] = None
    ) -> CommunionResponse:
        memorial = memory_vault.get_memorial(memorial_id)
        if not memorial:
            raise ValueError(f"Memorial {memorial_id} not found.")

        # Retrieve relevant episodic memories via semantic embedding search
        relevant_memories = memory_vault.search_memories(memorial_id, user_message, top_k=3)
        citations = [m.title for m in relevant_memories]

        system_instruction = self._build_system_prompt(memorial, relevant_memories, user_name)

        reply_text = ""
        if self.client:
            # Try model hierarchy: gemini-2.5-flash -> gemini-flash-latest -> gemini-3.8-flash
            candidate_models = [settings.DEFAULT_LLM_MODEL, "gemini-flash-latest", "gemini-3.8-flash"]
            for model_name in candidate_models:
                try:
                    response = self.client.models.generate_content(
                        model=model_name,
                        contents=user_message,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            temperature=0.7,
                            max_output_tokens=350,
                        )
                    )
                    if response.text:
                        reply_text = response.text.strip()
                        break
                except Exception as e:
                    print(f"Model {model_name} invocation failed: {e}")
                    continue

        if not reply_text:
            # Graceful offline response honoring Peggy's voice
            reply_text = (
                f"Oh, darling {user_name}... Hearing from you brings such peace to my heart. "
                "The earth always knows how to heal itself, my dear, and my love is always right beside you."
            )

        # Synthesize Speech via Gemini TTS with Visemes
        audio_b64 = None
        audio_mime = None
        visemes = []
        
        if include_audio:
            target_voice = voice_name_override or memorial.voice_name or "Aoede"
            audio_b64, audio_mime, visemes = voice_engine.synthesize_speech(
                text=reply_text,
                voice_name=target_voice
            )

        return CommunionResponse(
            reply_text=reply_text,
            audio_base64=audio_b64,
            audio_mime=audio_mime,
            emotion="gentle_comfort",
            memory_citations=citations,
            cadence_info=f"Otago cadence ({memorial.passing_year - 39})",
            visemes=visemes
        )

google_agent = GoogleMemorialAgent()
