'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SanctuaryHomePage() {
  const [candlesCount, setCandlesCount] = useState(1429);
  const [isCandleLit, setIsCandleLit] = useState(false);
  const [peggyCandles, setPeggyCandles] = useState(148);
  const [peggyFlowers, setPeggyFlowers] = useState(72);
  const [hasLitPeggy, setHasLitPeggy] = useState(false);
  const [hasPlacedFlower, setHasPlacedFlower] = useState(false);
  const [activeAvatarUrl, setActiveAvatarUrl] = useState<string>("/static/peggy_avatar.png");

  useEffect(() => {
    fetch('/api/flow/profile')
      .then(res => res.json())
      .then(data => {
        if (data.active_avatar_url) {
          setActiveAvatarUrl(data.active_avatar_url);
        }
      })
      .catch(err => {
        console.warn("Could not fetch active avatar for sanctuary home:", err);
      });
  }, []);

  const handleIgniteMorningCandle = () => {
    if (!isCandleLit) {
      setIsCandleLit(true);
      setCandlesCount(prev => prev + 1);
    }
  };

  const handlePeggyCandle = () => {
    if (!hasLitPeggy) {
      setHasLitPeggy(true);
      setPeggyCandles(prev => prev + 1);
    }
  };

  const handlePeggyFlower = () => {
    if (!hasPlacedFlower) {
      setHasPlacedFlower(true);
      setPeggyFlowers(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Subtle Morning Atmosphere Header */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-secondary">
          <span className="material-symbols-outlined text-[18px]">wb_twilight</span>
          <span className="font-label text-xs tracking-wider uppercase font-semibold">Quiet Sanctuary</span>
        </div>
        
        <div className="bg-surface-container-low rounded-2xl p-5 shadow-xs flex flex-col gap-3 relative overflow-hidden border border-outline-variant/30">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-secondary-fixed/30 blur-2xl pointer-events-none" />
          <span className="font-label text-xs text-secondary font-bold uppercase tracking-widest">
            In Eternal Loving Remembrance
          </span>
          <blockquote className="font-headline text-lg sm:text-xl text-primary italic leading-relaxed">
            “Those we love never truly leave us. They live on in every act of kindness they inspired.”
          </blockquote>
          <div className="flex items-center gap-1.5 pt-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              spa
            </span>
            <span className="font-body text-xs italic">Sanctuary thought of the day</span>
          </div>
        </div>
      </section>

      {/* Daily Sanctuary Ritual: Interactive Morning Candle */}
      <section>
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden border border-outline-variant/30">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-label text-xs uppercase tracking-wider text-secondary font-semibold">
                Daily Sanctuary Ritual
              </span>
              <h2 className="font-headline text-xl text-primary font-medium">Light a Morning Candle</h2>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant max-w-[260px] leading-relaxed">
                Dedicate a silent thought, a deep breath, and warm light for loved ones resting in grace.
              </p>
            </div>
            
            {/* Pulsing Flame Emblem */}
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500 ${
              isCandleLit ? 'bg-amber-100 shadow-md scale-105' : 'bg-surface-container'
            }`}>
              {isCandleLit && (
                <div className="absolute inset-0 rounded-full bg-amber-200/50 animate-ping opacity-60" />
              )}
              <span 
                className={`material-symbols-outlined text-3xl transition-colors duration-300 ${
                  isCandleLit ? 'text-amber-600' : 'text-on-surface-variant/40'
                }`}
                style={{ fontVariationSettings: isCandleLit ? "'FILL' 1" : "'FILL' 0" }}
              >
                local_fire_department
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-amber-700" style={{ fontVariationSettings: "'FILL' 1" }}>
                fireplace
              </span>
              <span className="font-label text-xs font-semibold text-primary">
                {candlesCount.toLocaleString()} souls remembered today
              </span>
            </div>
            
            <button 
              onClick={handleIgniteMorningCandle}
              disabled={isCandleLit}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-label text-xs font-semibold shadow-xs transition-all ${
                isCandleLit 
                  ? 'bg-secondary-container text-on-secondary-container cursor-default'
                  : 'bg-secondary text-on-secondary hover:bg-primary active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">flare</span>
              <span>{isCandleLit ? 'Light Kindled' : 'Kindle Light'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Memorial Card: Margaret "Peggy" Sutherland */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label text-xs uppercase tracking-wider text-secondary font-semibold">In Honor</span>
            <h2 className="font-headline text-xl text-primary font-medium">Beloved Presences</h2>
          </div>
          <Link href="/life-story" className="flex items-center gap-1 font-label text-xs text-secondary hover:underline">
            <span>Life Archive</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        <article className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-4 border border-outline-variant/30">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img 
                src={activeAvatarUrl} 
                alt="Margaret 'Peggy' Sutherland"
                className="w-20 h-20 rounded-full object-cover shadow-sm ring-2 ring-secondary-container"
              />
              <div className="absolute -bottom-1 -right-1 bg-secondary text-on-secondary w-6 h-6 rounded-full flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  spa
                </span>
              </div>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-secondary-container/60 text-on-secondary-container px-2 py-0.5 rounded-full font-label text-[11px] font-semibold">
                  Active Presence
                </span>
                <span className="text-on-surface-variant font-label text-[11px]">
                  96% Fidelity
                </span>
              </div>
              <h3 className="font-headline text-lg sm:text-xl text-primary leading-tight mt-1 truncate">
                Margaret “Peggy” Sutherland
              </h3>
              <span className="font-label text-xs text-secondary font-medium">
                1946 – 2023 • Dunedin, Aotearoa
              </span>
              <p className="font-body text-xs text-on-surface-variant line-clamp-2 mt-1.5 leading-relaxed">
                Beloved botanist, grandmother, and storyteller. Her gentle hands tended both wild alpine orchids and troubled hearts.
              </p>
            </div>
          </div>

          {/* Quick Action Tributes Row */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button 
              onClick={handlePeggyCandle}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                hasLitPeggy ? 'bg-amber-100 text-amber-800' : 'bg-surface-container-low hover:bg-surface-container text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                candle
              </span>
              <span className="font-label text-xs font-semibold mt-0.5">{peggyCandles} Lit</span>
              <span className="font-label text-[10px] text-on-surface-variant">Candle</span>
            </button>

            <button 
              onClick={handlePeggyFlower}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                hasPlacedFlower ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-low hover:bg-surface-container text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_florist
              </span>
              <span className="font-label text-xs font-semibold mt-0.5">{peggyFlowers} Placed</span>
              <span className="font-label text-[10px] text-on-surface-variant">Flower</span>
            </button>

            <Link 
              href="/chat"
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary text-center"
            >
              <span className="material-symbols-outlined text-[20px] text-secondary">
                forum
              </span>
              <span className="font-label text-xs font-semibold mt-0.5">53 Stories</span>
              <span className="font-label text-[10px] text-on-surface-variant">Memories</span>
            </Link>
          </div>

          {/* Primary Action Button: Enter Live Avatar Communion */}
          <Link
            href="/communion"
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-label text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">videocam</span>
            <span>Enter Live Avatar Communion</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </article>
      </section>

      {/* Quick Navigation Cards */}
      <section className="grid grid-cols-2 gap-3">
        <Link 
          href="/studio"
          className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col gap-2 hover:bg-surface-container-low transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-secondary-container/60 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
          </div>
          <div>
            <h4 className="font-headline text-sm font-medium text-primary">Voice & Memory Studio</h4>
            <p className="font-body text-[11px] text-on-surface-variant mt-0.5">
              Calibrate acoustic timbre & add letters or audio
            </p>
          </div>
        </Link>

        <Link 
          href="/chat"
          className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col gap-2 hover:bg-surface-container-low transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-secondary-container/60 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
          </div>
          <div>
            <h4 className="font-headline text-sm font-medium text-primary">Living Memory Chat</h4>
            <p className="font-body text-[11px] text-on-surface-variant mt-0.5">
              Exchange heartfelt messages with voice audio clips
            </p>
          </div>
        </Link>
      </section>

      {/* Sanctuary Guardian Registration Callout */}
      <section>
        <Link
          href="/register"
          className="block bg-gradient-to-r from-secondary-container/80 via-surface-container-low to-secondary-container/50 p-4 sm:p-5 rounded-2xl border border-secondary/30 shadow-xs hover:border-secondary transition-all group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-primary-container text-secondary-fixed flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <span className="material-symbols-outlined text-[22px]">person_add</span>
              </div>
              <div>
                <span className="font-label text-[10px] uppercase tracking-wider text-secondary font-bold">
                  Sanctuary Guardian Portal
                </span>
                <h4 className="font-headline text-base text-primary font-medium leading-tight">
                  Register as a Family Guardian
                </h4>
                <p className="font-body text-xs text-on-surface-variant mt-0.5">
                  Consecrate your profile, configure kinship access, and safeguard eternal memories.
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-primary flex-shrink-0 shadow-xs group-hover:translate-x-0.5 transition-transform">
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
