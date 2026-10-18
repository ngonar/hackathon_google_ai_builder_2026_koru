import base64
import struct
import math
from typing import Optional, List, Tuple
from google import genai
from google.genai import types
from app.core.config import settings
from app.models.memorial import VisemeFrame

def pcm_to_wav(pcm_data: bytes, sample_rate: int = 24000, channels: int = 1, bits_per_sample: int = 16) -> bytes:
    """Wraps raw 16-bit PCM audio in a valid RIFF/WAV container."""
    byte_rate = sample_rate * channels * (bits_per_sample // 8)
    block_align = channels * (bits_per_sample // 8)
    data_size = len(pcm_data)
    chunk_size = 36 + data_size
    
    header = struct.pack(
        '<4sI4s4sIHHIIHH4sI',
        b'RIFF', chunk_size, b'WAVE',
        b'fmt ', 16, 1, channels,
        sample_rate, byte_rate, block_align, bits_per_sample,
        b'data', data_size
    )
    return header + pcm_data

class VoiceEngine:
    def __init__(self):
        self.client: Optional[genai.Client] = None
        if settings.GEMINI_API_KEY:
            try:
                self.client = genai.Client()
            except Exception as e:
                print(f"Failed to initialize VoiceEngine Google GenAI Client: {e}")

    def synthesize_speech(self, text: str, voice_name: str = "Aoede") -> Tuple[Optional[str], Optional[str], List[VisemeFrame]]:
        """
        Synthesizes speech using Google Gemini TTS.
        Returns:
            audio_base64: Base64-encoded WAV audio string
            mime_type: 'audio/wav'
            visemes: List of VisemeFrame objects for synchronized avatar animation
        """
        if not self.client:
            visemes = self._generate_visemes_from_text(text)
            return None, None, visemes
            
        try:
            response = self.client.models.generate_content(
                model=settings.TTS_MODEL,
                contents=text,
                config=types.GenerateContentConfig(
                    response_modalities=['AUDIO'],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name=voice_name
                            )
                        )
                    )
                )
            )
            
            raw_pcm = None
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    raw_pcm = part.inline_data.data
                    break
                    
            if raw_pcm:
                wav_bytes = pcm_to_wav(raw_pcm, sample_rate=24000)
                audio_b64 = base64.b64encode(wav_bytes).decode('utf-8')
                visemes = self._generate_visemes_from_audio(raw_pcm, text)
                return audio_b64, "audio/wav", visemes
                
        except Exception as e:
            print(f"Error in Gemini TTS synthesis: {e}")
            
        # Fallback to simulated visemes if audio generation is throttled
        visemes = self._generate_visemes_from_text(text)
        return None, None, visemes

    def _generate_visemes_from_audio(self, pcm_data: bytes, text: str, sample_rate: int = 24000) -> List[VisemeFrame]:
        """
        Calculates mouth aperture from RMS energy envelopes of audio frames,
        synchronizing realistic speech visemes.
        """
        visemes = []
        frame_duration_ms = 40  # 25 fps avatar animation
        samples_per_frame = int(sample_rate * (frame_duration_ms / 1000.0))
        num_samples = len(pcm_data) // 2
        
        words = text.split()
        total_duration_ms = int((num_samples / sample_rate) * 1000)
        
        step_bytes = samples_per_frame * 2
        current_time_ms = 0
        
        viseme_cycle = ['aa', 'oh', 'ee', 'oo', 'mm']
        v_idx = 0
        
        for i in range(0, len(pcm_data), step_bytes):
            chunk = pcm_data[i:i + step_bytes]
            if len(chunk) < 4:
                break
                
            # Compute RMS volume of frame
            shorts = struct.unpack(f'<{len(chunk)//2}h', chunk)
            sum_sq = sum(s * s for s in shorts)
            rms = math.sqrt(sum_sq / len(shorts))
            
            # Normalize aperture between 0.0 and 1.0 with noise threshold
            normalized_aperture = min(1.0, max(0.0, (rms - 300) / 4500.0))
            
            # Select viseme phoneme shape based on energy
            if normalized_aperture < 0.05:
                shape = 'sil'
            else:
                shape = viseme_cycle[v_idx % len(viseme_cycle)]
                v_idx += 1
                
            visemes.append(VisemeFrame(
                time_ms=current_time_ms,
                viseme=shape,
                aperture=round(normalized_aperture, 3)
            ))
            current_time_ms += frame_duration_ms
            
        return visemes

    def _generate_visemes_from_text(self, text: str) -> List[VisemeFrame]:
        """Synthesizes text-timed viseme cues when running in audio-fallback mode."""
        visemes = []
        words = text.split()
        time_ms = 0
        
        for word in words:
            # Word onset
            visemes.append(VisemeFrame(time_ms=time_ms, viseme="sil", aperture=0.0))
            time_ms += 60
            
            # Vowels / consonants
            for ch in word.lower():
                if ch in 'aeiou':
                    visemes.append(VisemeFrame(time_ms=time_ms, viseme="aa", aperture=0.85))
                elif ch in 'o':
                    visemes.append(VisemeFrame(time_ms=time_ms, viseme="oh", aperture=0.75))
                elif ch in 'mbfp':
                    visemes.append(VisemeFrame(time_ms=time_ms, viseme="mm", aperture=0.1))
                else:
                    visemes.append(VisemeFrame(time_ms=time_ms, viseme="ee", aperture=0.5))
                time_ms += 80
                
            # Inter-word micro pause
            visemes.append(VisemeFrame(time_ms=time_ms, viseme="sil", aperture=0.0))
            time_ms += 100
            
        return visemes

voice_engine = VoiceEngine()
