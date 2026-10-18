import json
import os
import math
from typing import List, Optional, Tuple
from google import genai
from app.core.config import settings
from app.models.memorial import Memorial, MemoryItem, ChatMessage, Tribute

class MemoryVault:
    def __init__(self):
        self.memorials_file = os.path.join(settings.DATA_DIR, "memorials.json")
        self.memories_file = os.path.join(settings.DATA_DIR, "memories.json")
        self.messages_file = os.path.join(settings.DATA_DIR, "messages.json")
        self.tributes_file = os.path.join(settings.DATA_DIR, "tributes.json")
        
        self.client: Optional[genai.Client] = None
        if settings.GEMINI_API_KEY:
            try:
                self.client = genai.Client()
            except Exception as e:
                print(f"Warning: Could not initialize Google GenAI Client: {e}")
        
        self._initialize_storage()

    def _initialize_storage(self):
        if not os.path.exists(self.memorials_file):
            self._seed_default_data()
        else:
            # Check if empty
            try:
                with open(self.memorials_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if not data:
                        self._seed_default_data()
            except Exception:
                self._seed_default_data()

    def _seed_default_data(self):
        # Margaret "Peggy" Sutherland (from Google Stitch designs)
        peggy_id = "peggy-sutherland-1946"
        
        peggy = Memorial(
            id=peggy_id,
            full_name="Margaret Sutherland",
            nickname="Peggy",
            birth_year=1946,
            passing_year=2023,
            location="Dunedin, Aotearoa",
            avatar_url="/static/peggy_avatar.png",
            profile_photo_url="/static/peggy_profile.png",
            user_relation="Granddaughter",
            user_name="Clara",
            biography=(
                "Margaret 'Peggy' Sutherland was an avid botanist, gardener, and beloved matriarch. "
                "Known for her deep laughter, gentle maternal warmth, and endless pots of lavender tea. "
                "She spent decades studying alpine flora across Otago and the Southern Alps."
            ),
            personality_traits=[
                "Warm & Contemplative",
                "Deeply Nurturing",
                "Gentle Humor",
                "Poetic Observer of Nature",
                "Reassuring & Grounding"
            ],
            signature_sayings=[
                "Oh, darling...",
                "The earth always knows how to heal itself, my dear.",
                "Let's put the kettle on and let the quiet do the talking."
            ],
            accent_description="Otago accent with natural southern lilt, gentle maternal timbre, calibrated from cassette captures (1978–2022).",
            voice_timbre_pct=98.2,
            fidelity_score_pct=96.0,
            voice_name="Aoede",
            audio_memos_count=42,
            letters_count=184,
            journals_count=5,
            memory_echoes=[
                "🌿 1974 Otago expedition",
                "☕ Secret to lavender tea",
                "📖 Recite Wendell Berry",
                "🤍 I miss your advice"
            ],
            warmth_level=88,
            presence_level=95,
            southern_lilt=82
        )
        
        memories = [
            MemoryItem(
                memorial_id=peggy_id,
                title="1974 Otago Southern Alps Expedition",
                category="story",
                date_str="November 1974",
                content=(
                    "An early spring morning hike on the foothills of the Southern Alps where we found "
                    "the rare blue tussock. The air was crisp, freezing cold, and we huddled around "
                    "a tiny kerosene stove warming our fingers on enamel mugs of black tea."
                ),
                tags=["Otago", "Mountains", "Blue Tussock", "Nature", "Tea"]
            ),
            MemoryItem(
                memorial_id=peggy_id,
                title="The Secret to Lavender Jasmine Tea",
                category="journal",
                date_str="Spring 1992",
                content=(
                    "Never boil the lavender directly in the kettle. Steep dried English lavender with "
                    "fresh jasmine blossoms for exactly four minutes, then add a droplet of manuka honey. "
                    "Peggy always served this whenever Clara felt anxious before school exams."
                ),
                tags=["Lavender Tea", "Jasmine", "Comfort", "Ritual", "Gardening"]
            ),
            MemoryItem(
                memorial_id=peggy_id,
                title="Favorite Poem: The Peace of Wild Things by Wendell Berry",
                category="audio_memo",
                date_str="Winter 2004",
                content=(
                    "'When despair for the world grows in me and I wake in the night at the least sound... "
                    "I come into the peace of wild things who do not tax their lives with forethought of grief.' "
                    "Peggy recorded reciting this onto a cassette tape for Clara when she moved away to university."
                ),
                tags=["Poetry", "Wendell Berry", "Peace", "Cassette", "University"]
            ),
            MemoryItem(
                memorial_id=peggy_id,
                title="Sitting in the Sunlit Conservatory",
                category="milestone",
                date_str="Autumn 2018",
                content=(
                    "Sitting quietly in the conservatory surrounded by potted silver ferns and flowering jasmine, "
                    "with morning light pouring through the glass panes. She would watch the fantails (piwakawaka) "
                    "dance outside the window."
                ),
                tags=["Conservatory", "Ferns", "Jasmine", "Morning Light", "Piwakawaka"]
            )
        ]
        
        messages = [
            ChatMessage(
                memorial_id=peggy_id,
                role="avatar",
                text="Oh, darling Clara... I was just reminiscing about the early spring morning we discovered the blue tussock on the Southern Alps. Your hands were so chilled, and we warmed them by the kettle.",
                cadence_note="Gentle & contemplative • Otago cadence (1984)"
            )
        ]
        
        tributes = [
            Tribute(
                memorial_id=peggy_id,
                author="Clara Sutherland",
                relation="Granddaughter",
                message="Thinking of your warm laughter today, Nana Peggy. Your garden is in full bloom.",
                candle_lit=True
            ),
            Tribute(
                memorial_id=peggy_id,
                author="Duncan Sutherland",
                relation="Son",
                message="Your wisdom remains our compass every single day.",
                candle_lit=True
            )
        ]
        
        self.save_memorial(peggy)
        self.save_memories(memories)
        self.save_messages(messages)
        self.save_tributes(tributes)

    def get_all_memorials(self) -> List[Memorial]:
        try:
            with open(self.memorials_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [Memorial(**m) for m in data]
        except Exception:
            return []

    def get_memorial(self, memorial_id: str) -> Optional[Memorial]:
        for m in self.get_all_memorials():
            if m.id == memorial_id:
                return m
        return None

    def save_memorial(self, memorial: Memorial):
        all_m = [m for m in self.get_all_memorials() if m.id != memorial.id]
        all_m.append(memorial)
        with open(self.memorials_file, "w", encoding="utf-8") as f:
            json.dump([m.model_dump() for m in all_m], f, indent=2)

    def get_memories_for_memorial(self, memorial_id: str) -> List[MemoryItem]:
        try:
            with open(self.memories_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [MemoryItem(**item) for item in data if item.get("memorial_id") == memorial_id]
        except Exception:
            return []

    def save_memories(self, new_memories: List[MemoryItem]):
        existing = []
        if os.path.exists(self.memories_file):
            try:
                with open(self.memories_file, "r", encoding="utf-8") as f:
                    existing = json.load(f)
            except Exception:
                existing = []
        
        existing_ids = {m["id"] for m in existing}
        for item in new_memories:
            if item.id in existing_ids:
                existing = [m for m in existing if m["id"] != item.id]
            existing.append(item.model_dump())
            
        with open(self.memories_file, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=2)

    def get_messages_for_memorial(self, memorial_id: str) -> List[ChatMessage]:
        try:
            with open(self.messages_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [ChatMessage(**msg) for msg in data if msg.get("memorial_id") == memorial_id]
        except Exception:
            return []

    def save_messages(self, new_messages: List[ChatMessage]):
        existing = []
        if os.path.exists(self.messages_file):
            try:
                with open(self.messages_file, "r", encoding="utf-8") as f:
                    existing = json.load(f)
            except Exception:
                existing = []
        
        for msg in new_messages:
            existing.append(msg.model_dump())
            
        with open(self.messages_file, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=2)

    def get_tributes_for_memorial(self, memorial_id: str) -> List[Tribute]:
        try:
            with open(self.tributes_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [Tribute(**t) for t in data if t.get("memorial_id") == memorial_id]
        except Exception:
            return []

    def save_tributes(self, tributes: List[Tribute]):
        existing = []
        if os.path.exists(self.tributes_file):
            try:
                with open(self.tributes_file, "r", encoding="utf-8") as f:
                    existing = json.load(f)
            except Exception:
                existing = []
        for t in tributes:
            existing.append(t.model_dump())
        with open(self.tributes_file, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=2)

    def embed_text(self, text: str) -> Optional[List[float]]:
        if not self.client:
            return None
        try:
            res = self.client.models.embed_content(
                model=settings.EMBEDDING_MODEL,
                contents=text
            )
            if res.embeddings and len(res.embeddings) > 0:
                return res.embeddings[0].values
        except Exception as e:
            print(f"Embedding failed: {e}")
        return None

    def search_memories(self, memorial_id: str, query: str, top_k: int = 3) -> List[MemoryItem]:
        memories = self.get_memories_for_memorial(memorial_id)
        if not memories:
            return []
            
        query_vec = self.embed_text(query)
        if not query_vec:
            # Fallback to keyword matching
            q_lower = query.lower()
            scored = []
            for mem in memories:
                score = 0
                for word in q_lower.split():
                    if word in mem.title.lower() or word in mem.content.lower() or any(word in t.lower() for t in mem.tags):
                        score += 1
                scored.append((score, mem))
            scored.sort(key=lambda x: x[0], reverse=True)
            return [item for _, item in scored[:top_k]]

        # Cosine similarity matching
        def cosine_sim(a: List[float], b: List[float]) -> float:
            dot = sum(x * y for x, y in zip(a, b))
            norm_a = math.sqrt(sum(x * x for x in a))
            norm_b = math.sqrt(sum(y * y for y in b))
            if norm_a == 0 or norm_b == 0:
                return 0.0
            return dot / (norm_a * norm_b)

        scored_memories = []
        for mem in memories:
            if not mem.embedding:
                mem.embedding = self.embed_text(f"{mem.title}\n{mem.content}")
                if mem.embedding:
                    self.save_memories([mem])
            
            if mem.embedding:
                sim = cosine_sim(query_vec, mem.embedding)
                scored_memories.append((sim, mem))
            else:
                scored_memories.append((0.0, mem))
                
        scored_memories.sort(key=lambda x: x[0], reverse=True)
        return [item for _, item in scored_memories[:top_k]]

memory_vault = MemoryVault()
