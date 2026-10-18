'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface FlowScene {
  id: string;
  name: string;
  description: string;
  lighting: string;
  environment_prompt: string;
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
  prompt_used: string;
  created_at: string;
}

const EXPRESSION_PRESETS = [
  { label: "Maternal Serenity & Warmth", icon: "favorite" },
  { label: "Nostalgic Storyteller Glance", icon: "auto_stories" },
  { label: "Gentle Empathetic Listening", icon: "psychology" },
  { label: "Joyful Botanic Enthusiasm", icon: "local_florist" },
  { label: "Comforting Laugh", icon: "sentiment_satisfied" }
];

export default function VoiceAndMemoryStudioPage() {
  // Acoustic & Benchmark state
  const [isPlayingBenchmark, setIsPlayingBenchmark] = useState(false);
  const [warmthVal, setWarmthVal] = useState(88);
  const [cadenceVal, setCadenceVal] = useState(82);
  const [recallDepth, setRecallDepth] = useState(95);

  // Google Flow Avatar Studio State
  const [scenes, setScenes] = useState<FlowScene[]>([]);
  const [variants, setVariants] = useState<FlowAvatarVariant[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>("conservatory");
  const [selectedExpression, setSelectedExpression] = useState<string>("Maternal Serenity & Warmth");
  const [customNuance, setCustomNuance] = useState<string>("");
  const [fidelitySlider, setFidelitySlider] = useState<number>(98.5);
  const [isGeneratingFlow, setIsGeneratingFlow] = useState<boolean>(false);
  const [isSettingActive, setIsSettingActive] = useState<string | null>(null);
  const [flowNotification, setFlowNotification] = useState<string | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);
  const [activeAvatarUrl, setActiveAvatarUrl] = useState<string>("/static/peggy_avatar.png");

  // Memory Ingestion Form
  const [memoryTitle, setMemoryTitle] = useState("");
  const [memoryCategory, setMemoryCategory] = useState("story");
  const [memoryContent, setMemoryContent] = useState("");
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch Google Flow scenes & variants
  useEffect(() => {
    fetch('/api/flow/profile')
      .then(res => res.json())
      .then(data => {
        if (data.scenes) setScenes(data.scenes);
        if (data.variants) {
          setVariants(data.variants);
          const active = data.variants.find((v: FlowAvatarVariant) => v.is_active);
          if (active) setActiveAvatarUrl(active.image_url);
        }
      })
      .catch(err => {
        console.warn("Could not fetch Flow profile, using default data:", err);
      });
  }, []);

  const playBenchmarkAudio = async () => {
    if (isPlayingBenchmark) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlayingBenchmark(false);
      return;
    }

    try {
      const res = await fetch('/api/voice/benchmark');
      const data = await res.json();
      if (data.audio_base64) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = `data:audio/wav;base64,${data.audio_base64}`;
        audioRef.current.onended = () => setIsPlayingBenchmark(false);
        audioRef.current.play();
        setIsPlayingBenchmark(true);
      }
    } catch (err) {
      console.error("Benchmark playback error:", err);
      setIsPlayingBenchmark(false);
    }
  };

  // Generate Avatar Variant via Google Flow
  const handleGenerateFlowAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingFlow(true);
    setFlowNotification(null);

    try {
      const res = await fetch('/api/flow/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_id: selectedSceneId,
          expression: selectedExpression,
          custom_tone: customNuance.trim() || undefined,
          style_fidelity: fidelitySlider
        })
      });

      if (res.ok) {
        const newVar: FlowAvatarVariant = await res.json();
        setVariants(prev => [newVar, ...prev]);
        setFlowNotification(`Generated "${newVar.title}" with ${newVar.fidelity_score}% Veo consistency score!`);
        setTimeout(() => setFlowNotification(null), 5000);
      } else {
        const err = await res.json();
        setFlowNotification(`Generation error: ${err.detail || 'Could not synthesize avatar.'}`);
      }
    } catch (err) {
      console.error("Flow avatar generation failed:", err);
      setFlowNotification("Network connection issue with Google Flow service.");
    } finally {
      setIsGeneratingFlow(false);
    }
  };

  // Set Active Variant for Live Communion
  const handleSetActive = async (variantId: string) => {
    setIsSettingActive(variantId);
    try {
      const res = await fetch('/api/flow/set-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant_id: variantId })
      });

      if (res.ok) {
        const updated: FlowAvatarVariant = await res.json();
        setVariants(prev =>
          prev.map(v => ({
            ...v,
            is_active: v.id === updated.id
          }))
        );
        setActiveAvatarUrl(updated.image_url);
        setFlowNotification(`Activated "${updated.title}" as live avatar for Communion & Memorial!`);
        setTimeout(() => setFlowNotification(null), 4000);
      }
    } catch (err) {
      console.error("Could not set active variant:", err);
    } finally {
      setIsSettingActive(null);
    }
  };

  // Export Google Flow Character Bundle JSON
  const handleExportFlowBundle = async () => {
    try {
      const res = await fetch('/api/flow/export');
      const bundle = await res.json();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `google_flow_peggy_sutherland_bundle_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export bundle error:", err);
    }
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryTitle.trim() || !memoryContent.trim()) return;

    setIsSavingMemory(true);
    try {
      const res = await fetch('/api/memorials/peggy-sutherland-1946/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: memoryTitle,
          category: memoryCategory,
          content: memoryContent,
          date_str: 'Family Archive'
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        setMemoryTitle("");
        setMemoryContent("");
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving memory:", err);
    } finally {
      setIsSavingMemory(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-20">
      {/* Persona Overview & Fidelity Score Card */}
      <section className="w-full bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden border border-outline-variant/30">
        <div className="absolute -right-12 -top-12 w-44 h-44 bg-secondary-container/40 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-4 z-10">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-xs bg-surface-container ring-2 ring-secondary-container">
              <img 
                src={activeAvatarUrl} 
                alt="Margaret Peggy Sutherland"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-secondary text-on-secondary w-6 h-6 rounded-full flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                spa
              </span>
            </div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h2 className="font-headline text-lg sm:text-xl text-primary font-semibold truncate">
                Margaret "Peggy" Sutherland
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label text-[11px] font-semibold shrink-0">
                Active
              </span>
            </div>

            <p className="font-body text-xs text-on-surface-variant mt-0.5">
              1946 – 2023 • Dunedin, Aotearoa
            </p>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-surface-container-high rounded-full h-2 overflow-hidden">
                <div className="bg-secondary h-full rounded-full transition-all duration-700" style={{ width: '98.5%' }} />
              </div>
              <span className="font-label text-xs font-semibold text-primary">98.5% Fidelity</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-3 flex items-center gap-3 z-10 border border-outline-variant/20">
          <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[18px]">auto_videocam</span>
          </div>
          <p className="font-body text-xs text-on-surface-variant flex-1 leading-snug">
            Google Flow Character Consistency Active • <strong className="text-on-surface font-semibold">{variants.length} generated variants</strong> anchored to Margaret's silver hair & hazel eyes.
          </p>
        </div>

        <Link
          href="/communion"
          className="w-full bg-primary text-on-primary font-label text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] shadow-xs z-10 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">videocam</span>
          <span>Commune With Active Live Avatar</span>
        </Link>
      </section>

      {/* GOOGLE FLOW AVATAR & CHARACTER CONSISTENCY STUDIO */}
      <section className="w-full bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-5 border border-outline-variant/30 relative">
        {/* Studio Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary/25 to-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">video_camera_front</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline text-lg sm:text-xl text-primary font-semibold">
                  Google Flow Avatar Studio
                </h3>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-label text-[10px] font-bold tracking-wider uppercase">
                  Veo 2 & Imagen 3
                </span>
              </div>
              <p className="font-body text-xs text-on-surface-variant">
                Subject-consistent avatar synthesis preserving facial bone structure, eye warmth, and demeanor.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportFlowBundle}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label text-xs font-semibold flex items-center gap-1.5 transition-all border border-outline-variant/30"
            title="Download Google Flow Character Bundle JSON"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Flow Bundle</span>
          </button>
        </div>

        {/* Character Anchor Consistency Indicator */}
        <div className="bg-secondary-container/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-secondary-container">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[22px]">fingerprint</span>
            <div>
              <span className="font-label text-xs font-bold text-primary block">
                Character Consistency Lock: Margaret "Peggy" Sutherland
              </span>
              <span className="font-body text-[11px] text-on-surface-variant">
                Veo Consistency Seed #42891105 • Silver curls, hazel eyes, moss cardigan & cream wool scarf
              </span>
            </div>
          </div>
          <span className="bg-secondary/15 text-secondary font-label text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
            98.5% Consistency
          </span>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleGenerateFlowAvatar} className="flex flex-col gap-4">
          {/* Step 1: Sanctuary Scene Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-label text-xs font-semibold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">panorama</span>
              1. Choose Memorial Environment & Ambience
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scenes.map(s => {
                const isSelected = selectedSceneId === s.id;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSelectedSceneId(s.id)}
                    className={`p-3 rounded-xl text-left transition-all border flex items-start gap-3 ${
                      isSelected
                        ? 'bg-secondary-container/40 border-secondary ring-1 ring-secondary shadow-xs'
                        : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container ring-1 ring-outline-variant/20">
                      <img src={s.thumbnail_url} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-label text-xs font-bold text-primary truncate">{s.name}</span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                        )}
                      </div>
                      <p className="font-body text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                        {s.description}
                      </p>
                      <span className="font-label text-[10px] text-secondary mt-1 line-clamp-1 italic">
                        {s.lighting}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Expression & Tone Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-label text-xs font-semibold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">mood</span>
              2. Emotional Expression & Radiance
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EXPRESSION_PRESETS.map(exp => {
                const isSelected = selectedExpression === exp.label;
                return (
                  <button
                    type="button"
                    key={exp.label}
                    onClick={() => setSelectedExpression(exp.label)}
                    className={`px-3 py-1.5 rounded-full font-label text-xs font-medium flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-xs font-semibold'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{exp.icon}</span>
                    <span>{exp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Custom Nuance & Framing Modifier */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-xs font-semibold text-primary flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">auto_fix_high</span>
                3. Cinematic Nuance & Camera Mood (Optional)
              </span>
              <span className="text-[11px] text-on-surface-variant font-normal">Veo prompt modifier</span>
            </label>
            <input
              type="text"
              value={customNuance}
              onChange={(e) => setCustomNuance(e.target.value)}
              placeholder="e.g. Soft golden sun rays catching hair strands, intimate close portrait, soft breathing..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          {/* Step 4: Subject Consistency Fidelity Slider */}
          <div className="flex flex-col gap-1.5 bg-surface-container-low/50 p-3 rounded-xl border border-outline-variant/20">
            <div className="flex justify-between items-center">
              <label className="font-label text-xs text-primary font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">balance</span>
                Veo Subject Consistency Threshold
              </label>
              <span className="font-label text-xs text-secondary font-bold">{fidelitySlider}%</span>
            </div>
            <input
              type="range"
              min="95.0"
              max="99.9"
              step="0.1"
              value={fidelitySlider}
              onChange={(e) => setFidelitySlider(parseFloat(e.target.value))}
              className="w-full accent-secondary bg-surface-container-high rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant font-label">
              <span>95.0% Creative Variation</span>
              <span>98.5% Balanced</span>
              <span>99.9% Strict Facial Match</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={isGeneratingFlow}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary via-primary-container to-secondary text-on-primary font-label text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all shadow-md disabled:opacity-50"
          >
            {isGeneratingFlow ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                <span>Generating with Google Flow (Veo & Imagen 3)...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                <span>Synthesize Avatar Variant with Google Flow</span>
              </>
            )}
          </button>

          {flowNotification && (
            <div className="p-3 rounded-xl bg-secondary-container/60 text-on-secondary-container font-label text-xs font-semibold text-center border border-secondary flex items-center justify-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>{flowNotification}</span>
            </div>
          )}
        </form>

        {/* Gallery of Generated Flow Variants */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[20px]">collections</span>
              <h4 className="font-headline text-base text-primary font-semibold">
                Character Variants & Live Communion Bindings
              </h4>
            </div>
            <span className="font-label text-xs text-on-surface-variant font-medium">
              {variants.length} Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {variants.map((v) => {
              return (
                <div
                  key={v.id}
                  className={`rounded-2xl p-3 flex flex-col gap-3 border transition-all ${
                    v.is_active
                      ? 'bg-secondary-container/20 border-secondary ring-2 ring-secondary/50 shadow-sm'
                      : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60'
                  }`}
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-high">
                    <img
                      src={v.image_url}
                      alt={v.title}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-label font-bold text-primary shadow-xs">
                      <span>{v.scene_name}</span>
                    </div>

                    <div className="absolute top-2 right-2 bg-primary/80 backdrop-blur-md text-on-primary px-2 py-0.5 rounded-full text-[10px] font-label font-semibold">
                      {v.fidelity_score}% Fidelity
                    </div>

                    {v.is_active && (
                      <div className="absolute bottom-2 inset-x-2 bg-secondary text-on-secondary py-1 rounded-lg text-center font-label text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>Active for Communion</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-headline text-sm font-semibold text-primary truncate">
                      {v.title}
                    </span>
                    <span className="font-body text-xs text-on-surface-variant line-clamp-1 italic">
                      Expression: {v.expression}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-outline-variant/20">
                    <button
                      onClick={() => handleSetActive(v.id)}
                      disabled={v.is_active || isSettingActive === v.id}
                      className={`flex-1 py-1.5 px-3 rounded-lg font-label text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                        v.is_active
                          ? 'bg-secondary/15 text-secondary cursor-default'
                          : 'bg-primary text-on-primary hover:bg-primary-container active:scale-95'
                      }`}
                    >
                      {isSettingActive === v.id ? (
                        <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                      ) : v.is_active ? (
                        <span>Current Active Presence</span>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[14px]">sensors</span>
                          <span>Set Active for Live Avatar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* JSON Schema Preview Accordion */}
        <div className="pt-2 border-t border-outline-variant/20">
          <button
            onClick={() => setShowJsonPreview(!showJsonPreview)}
            className="flex items-center justify-between w-full text-left font-label text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">data_object</span>
              <span>Inspect Google Flow Character Protocol Schema</span>
            </span>
            <span className="material-symbols-outlined text-[16px]">
              {showJsonPreview ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showJsonPreview && (
            <div className="mt-2 p-3 bg-surface-container rounded-xl font-mono text-[11px] text-primary overflow-x-auto border border-outline-variant/30 max-h-48">
              <pre>{JSON.stringify({
                character_id: "flow-char-peggy-sutherland",
                engine: "Google Flow 2026.1 (Veo 2 + Imagen 3)",
                facial_micro_expressions: ["breathing_subtle", "eye_crinkle_warmth", "gentle_nod"],
                lip_sync_visemes: ["aa", "ee", "oh", "oo", "mm", "sil"],
                scenes_configured: scenes.length,
                variants_count: variants.length,
                audio_profile: "Aoede-Otago-warmth-24kHz"
              }, null, 2)}</pre>
            </div>
          )}
        </div>
      </section>

      {/* Voice Cloning & Acoustic Calibration Engine */}
      <section className="w-full bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-4 border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">graphic_eq</span>
            <h3 className="font-headline text-lg text-primary font-medium">Acoustic Calibration</h3>
          </div>
          <span className="font-label text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
            v3.4 Neural Stem
          </span>
        </div>

        <p className="font-body text-xs text-on-surface-variant leading-relaxed">
          Otago accent with natural southern lilt, gentle maternal timbre, calibrated from cassette captures (1978–2022).
        </p>

        {/* Gauge Pair */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-low rounded-xl p-3 flex flex-col border border-outline-variant/20">
            <span className="font-label text-xs text-on-surface-variant font-medium">Timbre Accuracy</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline text-lg font-semibold text-primary">98.2%</span>
              <span className="font-label text-xs text-secondary font-semibold">high</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '98.2%' }} />
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-3 flex flex-col border border-outline-variant/20">
            <span className="font-label text-xs text-on-surface-variant font-medium">Pause & Cadence</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline text-lg font-semibold text-primary">94.7%</span>
              <span className="font-label text-xs text-secondary font-semibold">natural</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '94.7%' }} />
            </div>
          </div>
        </div>

        {/* Interactive Waveform Player for Benchmark Audio */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-3 border border-outline-variant/20">
          <div className="flex items-start gap-3">
            <button
              onClick={playBenchmarkAudio}
              className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 active:scale-95 transition-transform shadow-xs hover:bg-primary"
            >
              <span className="material-symbols-outlined text-[22px]">
                {isPlayingBenchmark ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-label text-[11px] text-secondary font-semibold uppercase tracking-wider">
                Acoustic Benchmark
              </span>
              <p className="font-headline text-sm sm:text-base text-primary italic leading-snug mt-0.5">
                "Hello, my darling. It is so wonderful to hear your voice again."
              </p>
            </div>
          </div>

          {/* Waveform Visualization Bars */}
          <div className="w-full h-10 flex items-center justify-between gap-1 px-2 pt-1 bg-surface-container-lowest/70 rounded-lg">
            {[4, 8, 12, 18, 24, 16, 20, 26, 14, 22, 10, 18, 24, 12, 8, 20, 26, 14, 6].map((h, idx) => (
              <div
                key={idx}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlayingBenchmark ? 'bg-secondary' : 'bg-secondary/40'
                }`}
                style={{
                  height: isPlayingBenchmark ? `${Math.min(32, Math.max(6, h * (Math.random() + 0.5)))}px` : `${h}px`
                }}
              />
            ))}
          </div>

          <div className="flex justify-between items-center text-on-surface-variant font-label text-xs px-1">
            <span>{isPlayingBenchmark ? 'Playing...' : '0:00'}</span>
            <span>0:06</span>
          </div>
        </div>

        {/* Tone Sliders */}
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-label text-xs text-primary font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-tertiary-container">favorite</span>
                Warmth & Emotional Presence
              </label>
              <span className="font-label text-xs text-secondary font-medium">{warmthVal}%</span>
            </div>
            <input 
              type="range"
              min="1"
              max="100"
              value={warmthVal}
              onChange={(e) => setWarmthVal(Number(e.target.value))}
              className="w-full accent-secondary bg-surface-container-high rounded-lg h-2 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-label text-xs text-primary font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">tune</span>
                Southern Otago Lilt & Cadence
              </label>
              <span className="font-label text-xs text-secondary font-medium">{cadenceVal}%</span>
            </div>
            <input 
              type="range"
              min="1"
              max="100"
              value={cadenceVal}
              onChange={(e) => setCadenceVal(Number(e.target.value))}
              className="w-full accent-secondary bg-surface-container-high rounded-lg h-2 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-label text-xs text-primary font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">psychology</span>
                Episodic Memory Grounding Depth
              </label>
              <span className="font-label text-xs text-secondary font-medium">{recallDepth}%</span>
            </div>
            <input 
              type="range"
              min="1"
              max="100"
              value={recallDepth}
              onChange={(e) => setRecallDepth(Number(e.target.value))}
              className="w-full accent-secondary bg-surface-container-high rounded-lg h-2 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Multimodal Memory Ingestion & Vault Expansion */}
      <section className="w-full bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-4 border border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[22px]">archive</span>
          <h3 className="font-headline text-lg text-primary font-medium">Add Memory to Vault</h3>
        </div>

        <p className="font-body text-xs text-on-surface-variant">
          Ingest past letters, voicemails, or stories. Google Agent Platform indexes each item with semantic embeddings for episodic recall during communion.
        </p>

        <form onSubmit={handleSaveMemory} className="flex flex-col gap-3">
          <div>
            <label className="font-label text-xs font-semibold text-primary">Memory Title</label>
            <input 
              type="text"
              required
              value={memoryTitle}
              onChange={(e) => setMemoryTitle(e.target.value)}
              placeholder="e.g., Planting Summer Sweetpeas in the Greenhouse"
              className="w-full mt-1 px-3 py-2 text-sm rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          <div>
            <label className="font-label text-xs font-semibold text-primary">Category</label>
            <select
              value={memoryCategory}
              onChange={(e) => setMemoryCategory(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option value="story">Life Story / Anecdote</option>
              <option value="letter">Handwritten Letter</option>
              <option value="audio_memo">Audio Recording / Voicemail</option>
              <option value="journal">Personal Journal Note</option>
              <option value="milestone">Family Milestone</option>
            </select>
          </div>

          <div>
            <label className="font-label text-xs font-semibold text-primary">Memory Content & Details</label>
            <textarea 
              rows={3}
              required
              value={memoryContent}
              onChange={(e) => setMemoryContent(e.target.value)}
              placeholder="Describe what happened, what was said, the smell of the room, or their laughter..."
              className="w-full mt-1 px-3 py-2 text-sm rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingMemory}
            className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-label text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary active:scale-[0.99] transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>{isSavingMemory ? 'Indexing with Google Embeddings...' : 'Incorporate into Memory Vault'}</span>
          </button>

          {savedSuccess && (
            <p className="text-center font-label text-xs text-secondary font-semibold animate-pulse">
              ✓ Memory preserved and woven into Margaret's living presence!
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
