'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface VisemeFrame {
  time_ms: number;
  viseme: string;
  aperture: number;
}

interface TalkingAvatarProps {
  avatarSrc?: string;
  userName?: string;
  isPlaying?: boolean;
  visemes?: VisemeFrame[];
  audioBase64?: string | null;
  onAudioEnded?: () => void;
  timbreAccuracy?: string;
  cadenceDescription?: string;
  sceneName?: string;
}

export default function TalkingAvatar({
  avatarSrc = "/static/peggy_avatar.png",
  userName = "Clara",
  isPlaying = false,
  visemes = [],
  audioBase64 = null,
  onAudioEnded,
  timbreAccuracy = "99.4% Voice Timbre",
  cadenceDescription = "Otago cadence (1984)",
  sceneName = "Sunlit Conservatory"
}: TalkingAvatarProps) {
  // Motion Engine States
  const [isLivingMode, setIsLivingMode] = useState(true);
  const [mouthAperture, setMouthAperture] = useState(0.0);
  const [currentViseme, setCurrentViseme] = useState("sil");
  const [isBlinking, setIsBlinking] = useState(false);
  const [gazeOffset, setGazeOffset] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0, rotate: 0 });
  const [fpsCounter, setFpsCounter] = useState(60);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gazeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  // Natural Random Blinking Engine (Every 2.8 - 4.6 seconds)
  const scheduleNextBlink = useCallback(() => {
    if (!isLivingMode) return;
    const nextBlinkDelay = Math.random() * 2200 + 2600; // 2.6s - 4.8s
    blinkTimeoutRef.current = setTimeout(() => {
      setIsBlinking(true);
      // Realistic eyelid closure duration: 160ms total
      setTimeout(() => {
        setIsBlinking(false);
        // Occasionally double blink (15% chance, like thoughtful grandma)
        if (Math.random() < 0.18) {
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => {
              setIsBlinking(false);
              scheduleNextBlink();
            }, 140);
          }, 180);
        } else {
          scheduleNextBlink();
        }
      }, 160);
    }, nextBlinkDelay);
  }, [isLivingMode]);

  useEffect(() => {
    scheduleNextBlink();
    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, [scheduleNextBlink]);

  // Subtle Gaze Micro-Saccades (Eyes shifting thoughtfully)
  useEffect(() => {
    if (!isLivingMode) return;
    gazeIntervalRef.current = setInterval(() => {
      // Natural subtle shift: -1.2px to +1.2px
      const shiftX = (Math.random() - 0.5) * 2.2;
      const shiftY = (Math.random() - 0.5) * 1.4;
      setGazeOffset({ x: shiftX, y: shiftY });
    }, 2800);

    return () => {
      if (gazeIntervalRef.current) clearInterval(gazeIntervalRef.current);
    };
  }, [isLivingMode]);

  // Continuous 60 FPS Procedural Life Movement Loop
  useEffect(() => {
    let startTime = Date.now();
    let frameCount = 0;
    let lastFpsCheck = Date.now();

    const updateLivingPhysics = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      // FPS tracking
      frameCount++;
      if (now - lastFpsCheck >= 1000) {
        setFpsCounter(frameCount);
        frameCount = 0;
        lastFpsCheck = now;
      }

      if (isLivingMode) {
        // Continuous multi-octave organic head sway & breathing
        // Abdominal breathing rhythm ~4.2s cycle
        const breathPitch = Math.sin(elapsed * 1.5) * 1.4;
        const subtleRoll = Math.sin(elapsed * 0.7) * 0.65 + Math.cos(elapsed * 0.4) * 0.35;
        const subtleYaw = Math.cos(elapsed * 0.9) * 0.8;

        // When speaking: add speech cadence nodding & expressive gesture
        let speechPitchNod = 0;
        let speechRoll = 0;
        if (isPlaying && mouthAperture > 0.05) {
          speechPitchNod = Math.sin(elapsed * 4.5) * 2.5 + (mouthAperture * 2.0);
          speechRoll = Math.cos(elapsed * 3.2) * 0.9;
        }

        setHeadTilt({
          x: breathPitch + speechPitchNod,
          y: subtleYaw,
          rotate: subtleRoll + speechRoll
        });
      } else {
        setHeadTilt({ x: 0, y: 0, rotate: 0 });
      }

      animFrameRef.current = requestAnimationFrame(updateLivingPhysics);
    };

    animFrameRef.current = requestAnimationFrame(updateLivingPhysics);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isLivingMode, isPlaying, mouthAperture]);

  // Audio Playback & Real-time Viseme Lip Sync
  useEffect(() => {
    if (!audioBase64) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = `data:audio/wav;base64,${audioBase64}`;

    audio.onended = () => {
      setMouthAperture(0.0);
      setCurrentViseme("sil");
      if (onAudioEnded) onAudioEnded();
    };

    audio.play().catch((err) => {
      console.warn("Autoplay blocked or audio play failed:", err);
    });

    const syncMouth = () => {
      if (!audio.paused && !audio.ended) {
        const currentTimeMs = audio.currentTime * 1000;
        if (visemes && visemes.length > 0) {
          let closest = visemes[0];
          for (const frame of visemes) {
            if (frame.time_ms <= currentTimeMs) {
              closest = frame;
            } else {
              break;
            }
          }
          setMouthAperture(closest.aperture);
          setCurrentViseme(closest.viseme);
        } else {
          // Acoustic energy oscillation fallback
          const osc = Math.sin(currentTimeMs / 75) * 0.35 + 0.45;
          setMouthAperture(osc);
          setCurrentViseme(osc > 0.5 ? "aa" : "ee");
        }
        requestAnimationFrame(syncMouth);
      } else {
        setMouthAperture(0.0);
        setCurrentViseme("sil");
      }
    };

    requestAnimationFrame(syncMouth);

    return () => {
      audio.pause();
    };
  }, [audioBase64, visemes, onAudioEnded]);

  // Compute realistic mouth geometry according to phonemes
  const getMouthShape = () => {
    let width = 30;
    let height = 3;
    let borderRadius = "40%";
    let teethVisible = false;

    if (mouthAperture > 0.05) {
      switch (currentViseme) {
        case "aa": // Wide open vertical jaw
          width = 30 + mouthAperture * 10;
          height = 7 + mouthAperture * 15;
          borderRadius = "45% 45% 55% 55%";
          teethVisible = true;
          break;
        case "ee": // Wide lateral stretch smile
          width = 34 + mouthAperture * 14;
          height = 5 + mouthAperture * 8;
          borderRadius = "50% 50% 45% 45%";
          teethVisible = true;
          break;
        case "oh": // Rounded circular aperture
          width = 24 + mouthAperture * 8;
          height = 8 + mouthAperture * 14;
          borderRadius = "50%";
          teethVisible = true;
          break;
        case "oo": // Tight rounded lips
          width = 18 + mouthAperture * 6;
          height = 7 + mouthAperture * 10;
          borderRadius = "50%";
          break;
        case "mm": // Closed pressed lips
          width = 30;
          height = 2;
          borderRadius = "50%";
          break;
        default:
          width = 28 + mouthAperture * 10;
          height = 4 + mouthAperture * 10;
          borderRadius = "45%";
          teethVisible = mouthAperture > 0.4;
      }
    }

    return { width, height, borderRadius, teethVisible };
  };

  const mouthShape = getMouthShape();

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-[#1a2620] aspect-[3/4] max-h-[520px] select-none border border-secondary/30 group">
      {/* 1. Procedural Living Avatar Motion Stage Container */}
      <div 
        className="relative w-full h-full overflow-hidden transition-transform duration-100 ease-out"
        style={{
          transform: isLivingMode 
            ? `translate3d(${headTilt.y * 0.4}px, ${headTilt.x * 0.6}px, 0) rotate(${headTilt.rotate}deg)` 
            : 'none'
        }}
      >
        {/* Margaret Sutherland Portrait Canvas with Continuous Breathing */}
        <div 
          className={`w-full h-full transition-transform duration-700 ease-in-out ${
            isLivingMode ? 'animate-living-breathe' : ''
          }`}
        >
          <img
            src={avatarSrc}
            alt="Margaret 'Peggy' Sutherland living memorial avatar"
            className="w-full h-full object-cover object-center transform scale-[1.03]"
          />
        </div>

        {/* 2. Procedural Lifelike Eyelid Blinking Overlays */}
        {/* Left Eye Eyelid (Margaret's right side) */}
        <div
          className="absolute pointer-events-none transition-all duration-100 ease-out"
          style={{
            top: '36.8%',
            left: `${41.4 + (isLivingMode ? gazeOffset.x * 0.2 : 0)}%`,
            transform: 'translate(-50%, -50%)',
            width: '28px',
            height: isBlinking ? '16px' : '0px',
            backgroundColor: '#cca393',
            backgroundImage: 'linear-gradient(180deg, rgba(204,163,147,0.95) 0%, rgba(168,126,112,0.98) 85%, rgba(68,40,30,0.85) 100%)',
            borderRadius: '50% 50% 30% 30%',
            opacity: isBlinking ? 1 : 0,
            boxShadow: '0 1px 3px rgba(45,20,15,0.4)',
            filter: 'blur(0.4px)'
          }}
        />

        {/* Right Eye Eyelid (Margaret's left side) */}
        <div
          className="absolute pointer-events-none transition-all duration-100 ease-out"
          style={{
            top: '36.8%',
            left: `${58.6 + (isLivingMode ? gazeOffset.x * 0.2 : 0)}%`,
            transform: 'translate(-50%, -50%)',
            width: '28px',
            height: isBlinking ? '16px' : '0px',
            backgroundColor: '#cca393',
            backgroundImage: 'linear-gradient(180deg, rgba(204,163,147,0.95) 0%, rgba(168,126,112,0.98) 85%, rgba(68,40,30,0.85) 100%)',
            borderRadius: '50% 50% 30% 30%',
            opacity: isBlinking ? 1 : 0,
            boxShadow: '0 1px 3px rgba(45,20,15,0.4)',
            filter: 'blur(0.4px)'
          }}
        />

        {/* 3. Anatomical Viseme Mouth & Jaw Articulation Overlay */}
        {mouthAperture > 0.05 && (
          <div
            className="absolute pointer-events-none transition-all duration-75 ease-out flex flex-col items-center justify-center overflow-hidden"
            style={{
              top: `${55.2 + (mouthShape.height > 8 ? 0.3 : 0)}%`,
              left: '50.0%',
              transform: 'translate(-50%, -50%)',
              width: `${mouthShape.width}px`,
              height: `${mouthShape.height}px`,
              backgroundColor: '#300f0d',
              backgroundImage: 'radial-gradient(ellipse at center, #451512 0%, #200806 100%)',
              borderRadius: mouthShape.borderRadius,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.65), 0 0 2px rgba(180,90,80,0.3)',
              borderTop: '1px solid rgba(195,120,110,0.5)',
              borderBottom: '1px solid rgba(160,80,70,0.4)',
              filter: 'blur(0.4px)'
            }}
          >
            {/* Subtle Upper Teeth Highlight glimpse */}
            {mouthShape.teethVisible && (
              <div 
                className="w-4/5 h-[2px] bg-[#f8f5ee] opacity-80 rounded-b-xs shadow-xs mb-auto mt-[0.5px]"
              />
            )}
            {/* Soft Lower Lip Shadow */}
            <div className="w-full h-[1px] bg-rgba(80,25,20,0.6) mt-auto" />
          </div>
        )}

        {/* 4. Ambient Sanctuary Particles (Sunlit Floating Dust Motes) */}
        {isLivingMode && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[60%] left-[25%] w-2 h-2 rounded-full bg-amber-100/50 blur-[1px] animate-mote-1" />
            <div className="absolute top-[45%] right-[30%] w-2.5 h-2.5 rounded-full bg-amber-200/40 blur-[1px] animate-mote-2" />
            <div className="absolute top-[70%] right-[18%] w-1.5 h-1.5 rounded-full bg-amber-50/60 blur-[0.5px] animate-mote-3" />
          </div>
        )}
      </div>

      {/* Ambient Gradient Overlays for Cinematic Warmth & Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141f19]/95 via-transparent to-[#141f19]/35 pointer-events-none" />

      {/* Top Live Presence Metadata Bar */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/85 backdrop-blur-md shadow-sm border border-outline-variant/30">
            <span className={`w-2 h-2 rounded-full ${isLivingMode ? 'bg-[#34A853] animate-ping' : 'bg-secondary'}`} />
            <span className="font-label text-xs text-primary font-semibold tracking-wide">
              {isLivingMode ? 'Living Avatar Active' : 'Sanctuary Portrait'}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm border border-outline-variant/20 self-start">
            <span className="material-symbols-outlined text-[13px] text-secondary">
              graphic_eq
            </span>
            <span className="font-label text-[11px] text-on-surface-variant font-medium">
              {timbreAccuracy}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm border border-outline-variant/20 self-start">
            <span className="material-symbols-outlined text-[13px] text-secondary">
              auto_videocam
            </span>
            <span className="font-label text-[11px] text-on-surface-variant font-medium">
              Flow: {sceneName}
            </span>
          </div>
        </div>

        {/* Right Control & User View Column */}
        <div className="flex flex-col items-end gap-2">
          {/* User Self-View (Picture-in-Picture) */}
          <div className="relative w-20 h-24 rounded-xl overflow-hidden shadow-lg ring-2 ring-surface-container-lowest/70 backdrop-blur-md bg-surface-container-high flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-secondary/40 to-primary-container flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-3xl opacity-60">person</span>
            </div>
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-primary/80 backdrop-blur-xs flex items-center">
              <span className="font-label text-[9px] text-on-primary font-medium">{userName}</span>
            </div>
          </div>

          {/* Living Motion Mode Switcher Button */}
          <button
            onClick={() => setIsLivingMode(!isLivingMode)}
            className={`px-2 py-1 rounded-full text-[10px] font-label font-bold flex items-center gap-1 shadow-sm backdrop-blur-md transition-all ${
              isLivingMode 
                ? 'bg-secondary text-on-secondary ring-1 ring-secondary-container' 
                : 'bg-surface-container-lowest/80 text-on-surface-variant hover:bg-surface-container'
            }`}
            title="Toggle between living procedural motion and still portrait"
          >
            <span className="material-symbols-outlined text-[12px]">
              {isLivingMode ? 'motion_photos_on' : 'motion_photos_off'}
            </span>
            <span>{isLivingMode ? '60 FPS Live' : 'Still'}</span>
          </button>
        </div>
      </div>

      {/* Frequency Waveform & Cadence Bar Overlay */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 px-3.5 py-2 rounded-full bg-primary/80 backdrop-blur-md border border-secondary-fixed-dim/20 z-10">
        <div className="flex items-center gap-1.5">
          <span className={`w-1 h-3 rounded-full bg-secondary-container ${isPlaying ? 'animate-waveform-1' : 'opacity-40'}`} />
          <span className={`w-1 h-5 rounded-full bg-secondary-container ${isPlaying ? 'animate-waveform-2' : 'opacity-40'}`} />
          <span className={`w-1 h-2 rounded-full bg-secondary-container ${isPlaying ? 'animate-waveform-3' : 'opacity-40'}`} />
          <span className={`w-1 h-6 rounded-full bg-secondary-container ${isPlaying ? 'animate-waveform-4' : 'opacity-40'}`} />
          <span className={`w-1 h-4 rounded-full bg-secondary-container ${isPlaying ? 'animate-waveform-5' : 'opacity-40'}`} />
          <span className={`w-1 h-2.5 rounded-full bg-secondary-container ${isPlaying ? 'animate-waveform-2' : 'opacity-40'}`} />
          <span className="font-label text-[10px] text-secondary-fixed/90 ml-1">
            {isPlaying ? 'Speaking' : isLivingMode ? 'Attentive Listening' : 'Resting'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-secondary-fixed">
          <span className="material-symbols-outlined text-[15px]">spatial_audio</span>
          <span className="font-label text-xs font-medium tracking-tight">
            {cadenceDescription}
          </span>
        </div>
      </div>
    </div>
  );
}
