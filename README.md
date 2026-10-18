# KORU — AI Memorial Avatar & Living Memory Sanctuary

**KORU** (inspired by the Māori symbol of the unfolding silver fern frond, representing renewal, enduring love, and eternal connection) is an empathetic, privacy-first memorial platform that enables families to preserve, honor, and converse with the living memory, voice, and photorealistic presence of departed loved ones.

Front-end designs are modeled after the **Koru Memorial App** screen designs (`projects/3282919115998906151`) from Google Stitch, implementing the **Serene Memorial Sanctuary** design system.

---

## Key Pillars & Capabilities

1. **Google Agent Platform & Gemini Multimodal Intelligence**:
   - **Reasoning & Persona Grounding**: Powered by Google GenAI (`gemini-2.5-flash`), holding empathetic, grief-sensitive space for peaceful remembrance.
   - **Multimodal Memory Vault**: Ingests past photos, handwritten letters, voicemails, and journals, indexed via Google GenAI Embeddings (`gemini-embedding-001`).
   - **Relationship-Aware Presence**: Recognizes family relationships (e.g. Margaret speaking to her granddaughter Clara) and cites authentic memories.

2. **Neural Voice Regeneration**:
   - Google Gemini native TTS (`gemini-2.5-flash-preview-tts`) producing 24kHz natural audio with custom vocal timbres (e.g., Margaret's gentle southern Otago cadence).
   - Real-time acoustic calibration (warmth, cadence, timbre accuracy gauge).

3. **Dynamic Talking Face Avatar**:
   - High-definition portrait animation featuring natural micro-expressions, subtle breathing cycles, and audio-synchronized viseme lip movements.
   - Frequency waveform bar and live spoken quote cards.

4. **Dual Cross-Platform Presence**:
   - **Web Application** (`apps/web`): Next.js 14+ Memorial Studio and Interactive Sanctuary.
   - **Mobile Application** (`apps/mobile`): React Native (Expo) companion for voice calls, daily morning candle rituals, and on-the-go memory reflections.

---

## Google Stitch Screen Implementations

- **Sanctuary Home** (`/`): Daily ritual candle lighting, featured memorial of Margaret "Peggy" Sutherland (1946–2023), presence status, and quick communion trigger.
- **Live Avatar Communion** (`/communion`): Real-time video frame with animated talking avatar, live spoken transcript card, frequency waveform bar, memory echo triggers ("1974 Otago expedition", "Secret to lavender tea", etc.), pulsing mic button, and bookmark toast.
- **Voice & Memory Regeneration Studio** (`/studio`): Persona fidelity overview (96%), acoustic calibration (98.2% timbre accuracy), benchmark audio player, tone sliders, and memory upload dropzones.
- **Living Memory Chat** (`/chat`): Intimate chat stream with audio playback and memory citations.
- **Memorial Sanctuary & Life Story** (`/life-story`): Biographical milestones and wisdom chapters.
- **Memory Wall & Guestbook** (`/tribute`): Memorial candle lighting, condolences, and community memories.
- **Sanctuary Guardian Registration** (`/register`): Multi-step onboarding to establish guardian identity, relationship kinship, memorial dedication, ethical memory stewardship pledge, and Google Sanctuary Pass.

---

## Project Structure

```
KORU/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── core/config.py    # App & Google GenAI configuration
│   │   ├── models/           # Pydantic schemas (Memorial, Memory, Chat, Viseme)
│   │   ├── services/
│   │   │   ├── google_agent.py   # Google Agent Platform persona orchestrator
│   │   │   ├── memory_vault.py   # Google embeddings & semantic memory search
│   │   │   └── voice_engine.py   # Gemini TTS & viseme extraction
│   │   ├── routers/          # Memorials, Communion, Memories, Voice
│   │   └── main.py           # FastAPI entry point
│   ├── static/               # Avatars and media assets
│   └── run_server.py         # Backend runner
├── apps/
│   ├── web/                  # Next.js 14+ web application (Tailwind CSS, React)
│   │   └── src/
│   │       ├── app/          # App router pages (/, /communion, /studio, /chat, etc.)
│   │       └── components/   # TalkingAvatar, Header, Navigation
│   └── mobile/               # React Native Expo mobile companion
└── stitch_reference/         # Google Stitch design references & assets
```

---

## Quick Start

### 1. Start the Backend API
```powershell
.\start_backend.bat
# Or:
cd backend
python run_server.py
```
Backend runs on `http://127.0.0.1:8000` (docs at `http://127.0.0.1:8000/docs`).

### 2. Start the Web Application
```powershell
.\start_web.bat
# Or:
cd apps/web
npm run dev
```
Web sanctuary runs on `http://localhost:3000`.

### 3. Start the Mobile Application
```powershell
.\start_mobile.bat
# Or:
cd apps/mobile
npx expo start
```
