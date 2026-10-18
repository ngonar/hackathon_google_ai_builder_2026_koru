'use client';

import React, { useState, useEffect, useRef } from 'react';
import TalkingAvatar from '@/components/TalkingAvatar';
import Link from 'next/link';

interface VisemeFrame {
  time_ms: number;
  viseme: string;
  aperture: number;
}

interface FlowScene {
  id: string;
  name: string;
  description: string;
  lighting: string;
  icon: string;
  thumbnail_url: string;
}

interface FlowAvatarVariant {
  id: string;
  title: string;
  scene_id: string;
  scene_name: string;
  expression: string;
  image_url: string;
  is_active: boolean;
  fidelity_score: number;
}

const SCENE_ICONS: Record<string, string> = {
  conservatory: "yard",
  southern_alps: "landscape",
  fireside: "fireplace",
  cottage_garden: "local_florist"
};

export default function LiveAvatarCommunionPage() {
  const [spokenTranscript, setSpokenTranscript] = useState(
    "Oh, darling Clara... I was just reminiscing about the early spring morning we discovered the blue tussock on the Southern Alps. Your hands were so chilled, and we warmed them by the kettle."
  );
  const [cadenceNote, setCadenceNote] = useState("Gentle & contemplative • Otago cadence (1984)");
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [visemes, setVisemes] = useState<VisemeFrame[]>([]);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isCallingAPI, setIsCallingAPI] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Fragment woven into Peggy's Archive");
  const [isVideoActive, setIsVideoActive] = useState(true);

  // Google Flow Active Scene & Avatar State
  const [activeAvatarSrc, setActiveAvatarSrc] = useState<string>("/static/peggy_avatar.png");
  const [activeSceneName, setActiveSceneName] = useState<string>("Sunlit Conservatory");
  const [activeSceneId, setActiveSceneId] = useState<string>("conservatory");
  const [scenes, setScenes] = useState<FlowScene[]>([]);
  const [variants, setVariants] = useState<FlowAvatarVariant[]>([]);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-NZ';

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          handleSendMessage(text);
        }
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Fetch initial Google Flow active avatar and scenes
  useEffect(() => {
    fetch('/api/flow/profile')
      .then(res => res.json())
      .then(data => {
        if (data.scenes) setScenes(data.scenes);
        if (data.variants) {
          setVariants(data.variants);
          const active = data.variants.find((v: FlowAvatarVariant) => v.is_active);
          if (active) {
            setActiveAvatarSrc(active.image_url);
            setActiveSceneName(active.scene_name);
            setActiveSceneId(active.scene_id);
          } else if (data.active_avatar_url) {
            setActiveAvatarSrc(data.active_avatar_url);
          }
        }
      })
      .catch(err => {
        console.warn("Could not fetch Flow profile:", err);
      });
  }, []);

  // Fetch initial benchmark audio greeting on first load
  useEffect(() => {
    fetch('/api/voice/benchmark')
      .then(res => res.json())
      .then(data => {
        if (data.audio_base64) {
          setAudioBase64(data.audio_base64);
          setVisemes(data.visemes || []);
          setIsAvatarSpeaking(true);
        }
      })
      .catch(err => {
        console.warn("Could not fetch initial voice sample:", err);
      });
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isCallingAPI) return;

    setIsCallingAPI(true);
    setUserInput("");

    try {
      const res = await fetch('/api/communion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorial_id: 'peggy-sutherland-1946',
          message: textToSend,
          user_name: 'Clara',
          include_audio: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSpokenTranscript(data.reply_text);
        setCadenceNote(data.cadence_info || "Gentle & contemplative");
        if (data.audio_base64) {
          setAudioBase64(data.audio_base64);
          setVisemes(data.visemes || []);
          setIsAvatarSpeaking(true);
        }
      }
    } catch (err) {
      console.error("Communion error:", err);
    } finally {
      setIsCallingAPI(false);
    }
  };

  // Switch Scene Ambience dynamically in real time
  const handleSwitchScene = async (sceneId: string) => {
    const targetScene = scenes.find(s => s.id === sceneId);
    if (!targetScene) return;

    // Find the best variant for this scene
    const matchingVariant = variants.find(v => v.scene_id === sceneId) || variants[0];
    if (matchingVariant) {
      setActiveAvatarSrc(matchingVariant.image_url);
      setActiveSceneName(targetScene.name);
      setActiveSceneId(sceneId);

      // Persist active variant on backend
      try {
        await fetch('/api/flow/set-active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variant_id: matchingVariant.id })
        });
      } catch (e) {
        console.warn("Could not sync active variant to server:", e);
      }

      setToastMessage(`Switched environment to ${targetScene.name}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          setIsListening(false);
        }
      } else {
        const promptText = window.prompt("Speak or type to Peggy:", "");
        if (promptText) {
          handleSendMessage(promptText);
        }
      }
    }
  };

  const handleBookmark = () => {
    setToastMessage("Fragment woven into Peggy's Archive");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleReplay = () => {
    if (audioBase64) {
      setIsAvatarSpeaking(true);
      const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
      audio.onended = () => setIsAvatarSpeaking(false);
      audio.play();
    }
  };

  return (
    <div className="flex flex-col w-full space-y-4 pb-20">
      {/* Live Stream Video Stage */}
      <TalkingAvatar
        avatarSrc={activeAvatarSrc}
        userName="Clara"
        isPlaying={isAvatarSpeaking}
        visemes={visemes}
        audioBase64={audioBase64}
        onAudioEnded={() => setIsAvatarSpeaking(false)}
        timbreAccuracy="99.4% Voice Timbre"
        cadenceDescription="Otago cadence (1984)"
        sceneName={activeSceneName}
      />

      {/* Google Flow Quick Ambience Switcher */}
      <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-xs border border-outline-variant/30 flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">
              auto_videocam
            </span>
            <span className="font-label text-xs font-semibold text-primary">
              Google Flow Scene Ambience
            </span>
          </div>
          <Link
            href="/studio"
            className="font-label text-[11px] text-secondary hover:underline flex items-center gap-0.5"
          >
            <span>Studio</span>
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {scenes.map(s => {
            const isSelected = activeSceneId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleSwitchScene(s.id)}
                className={`py-2 px-2.5 rounded-xl font-label text-xs flex items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-secondary text-on-secondary shadow-xs font-semibold'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant/20'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {SCENE_ICONS[s.id] || s.icon || 'yard'}
                </span>
                <span className="truncate">{s.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Spoken Transcript Card */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 text-on-surface">
        <div className="flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-secondary shrink-0 mt-0.5">
            format_quote
          </span>
          <p className="font-headline text-base sm:text-lg text-primary leading-relaxed italic">
            "{spokenTranscript}"
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-outline-variant/30 text-on-surface-variant font-label text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>{cadenceNote}</span>
          </span>

          <button 
            onClick={handleReplay}
            className="text-secondary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">replay</span>
            <span>Listen again</span>
          </button>
        </div>
      </div>

      {/* Memory Prompt Triggers (Quick-Touch Topics) */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-[16px] text-secondary">psychology_alt</span>
            Memory Echoes
          </span>
          <span className="font-label text-xs text-secondary font-medium">Tap to ask Peggy</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { icon: "🌿", text: "1974 Otago expedition" },
            { icon: "☕", text: "Secret to lavender tea" },
            { icon: "📖", text: "Recite Wendell Berry" },
            { icon: "🤍", text: "I miss your advice" },
          ].map((echo) => (
            <button
              key={echo.text}
              disabled={isCallingAPI}
              onClick={() => handleSendMessage(echo.text)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container shadow-xs hover:bg-surface-container-high transition-all text-left whitespace-nowrap shrink-0 group border border-outline-variant/20 active:scale-95 disabled:opacity-50"
            >
              <span className="text-sm">{echo.icon}</span>
              <span className="font-label text-xs text-on-surface group-hover:text-primary font-medium">
                {echo.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Text Question Input */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(userInput); }}
        className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-2xl border border-outline-variant/30 shadow-xs"
      >
        <input 
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type or speak a memory or question for Peggy..."
          className="flex-1 bg-transparent px-3 py-1.5 text-sm font-body text-primary placeholder:text-on-surface-variant/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!userInput.trim() || isCallingAPI}
          className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary-container transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>

      {/* Intimate Floating Communion Action Bar */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-3 shadow-md border border-outline-variant/30 flex flex-col gap-3">
        <div className="flex items-center justify-center gap-1.5 text-center">
          <span className={`w-2 h-2 rounded-full ${isCallingAPI ? 'bg-amber-500 animate-pulse' : 'bg-secondary'}`} />
          <span className="font-label text-xs text-on-surface-variant font-medium">
            {isCallingAPI ? 'Peggy is gently gathering memories...' : 'Continuous communion mode active'}
          </span>
        </div>

        <div className="flex items-center justify-around gap-2">
          {/* Camera/Video Toggle */}
          <button 
            onClick={() => setIsVideoActive(!isVideoActive)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isVideoActive ? 'bg-surface-container text-primary' : 'bg-surface-container-high text-on-surface-variant'
            }`}
            title="Toggle video feed"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isVideoActive ? 'videocam' : 'videocam_off'}
            </span>
          </button>

          {/* Primary Speak Button (Pulsing Mic) */}
          <div className="relative flex items-center justify-center">
            {isListening && (
              <span className="absolute w-16 h-16 rounded-full bg-secondary animate-ping opacity-60 pointer-events-none" />
            )}
            <button
              onClick={toggleMic}
              aria-label="Microphone"
              className={`relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 ${
                isListening 
                  ? 'bg-amber-600 text-on-primary scale-105' 
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[26px]">
                {isListening ? 'graphic_eq' : 'mic'}
              </span>
            </button>
          </div>

          {/* Bookmark Memory Fragment */}
          <button 
            onClick={handleBookmark}
            className="w-12 h-12 rounded-full bg-secondary-container/70 flex items-center justify-center text-on-secondary-container hover:bg-secondary-container transition-colors"
            title="Archive spoken fragment to life story"
          >
            <span className="material-symbols-outlined text-[22px]">bookmark_add</span>
          </button>

          {/* Conclude Communion */}
          <Link 
            href="/"
            className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center hover:bg-error hover:text-on-error transition-all"
            title="Conclude communion and return to sanctuary"
          >
            <span className="material-symbols-outlined text-[22px]">call_end</span>
          </Link>
        </div>
      </div>

      {/* Confirmation Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-2 rounded-full shadow-xl flex items-center gap-2 z-50 font-label text-xs animate-bounce">
          <span className="material-symbols-outlined text-[16px] text-secondary-fixed">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
