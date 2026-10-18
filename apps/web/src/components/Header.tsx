'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  statusText?: string;
  activePersona?: string;
}

export default function Header({ 
  statusText = "Live Presence", 
  activePersona = "Margaret • In Communion" 
}: HeaderProps) {
  const router = useRouter();
  const [guardianName, setGuardianName] = useState<string | null>(null);
  const [guardianEmail, setGuardianEmail] = useState<string | null>(null);
  const [guardianRelation, setGuardianRelation] = useState<string>("Granddaughter");
  const [guardianInitial, setGuardianInitial] = useState<string>("G");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateGuardian = () => {
      try {
        const stored = localStorage.getItem('koru_guardian');
        const hasCookie = typeof document !== 'undefined' && document.cookie.includes('koru_auth=true');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.full_name) {
            setGuardianName(parsed.full_name);
            setGuardianEmail(parsed.email || 'clara.sutherland@sanctuary.koru');
            setGuardianRelation(parsed.relation || 'Granddaughter');
            setGuardianInitial(parsed.full_name[0].toUpperCase());
            setIsLoggedIn(true);
            return;
          }
        }
        if (hasCookie) {
          setIsLoggedIn(true);
          setGuardianName("Clara Sutherland");
          setGuardianEmail("clara.sutherland@sanctuary.koru");
          setGuardianRelation("Granddaughter");
          setGuardianInitial("C");
          return;
        }
        setIsLoggedIn(false);
        setGuardianName(null);
      } catch {
        setIsLoggedIn(false);
        setGuardianName(null);
      }
    };

    updateGuardian();
    window.addEventListener('koru_guardian_updated', updateGuardian);
    window.addEventListener('storage', updateGuardian);
    return () => {
      window.removeEventListener('koru_guardian_updated', updateGuardian);
      window.removeEventListener('storage', updateGuardian);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn("Logout request error:", e);
    }
    // Delete authentication cookie
    document.cookie = 'koru_auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('koru_guardian');
    setIsLoggedIn(false);
    setGuardianName(null);
    setIsMenuOpen(false);
    window.dispatchEvent(new Event('koru_guardian_updated'));
    router.push('/register');
  };

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(45,64,55,0.06)] border-b border-outline-variant/30 transition-all duration-300">
      <div className="h-16 max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-secondary-fixed shadow-sm group-hover:scale-105 transition-transform">
            <svg 
              viewBox="0 0 24 24" 
              className="w-6 h-6 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round"
            >
              {/* Koru Spiral Fern Motif */}
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10c0 3.314-2.686 6-6 6s-6-2.686-6-6c0-1.657 1.343-3 3-3s3 1.343 3 3" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg sm:text-xl text-primary font-semibold tracking-tight leading-none">
              KORU
            </span>
            <span className="font-label text-xs text-on-surface-variant font-medium mt-0.5">
              {statusText}
            </span>
          </div>
        </Link>

        {/* Presence Badge & User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden xs:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/70 border border-secondary/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse"></span>
            <span className="font-label text-xs sm:text-sm text-on-secondary-container font-semibold whitespace-nowrap">
              {activePersona}
            </span>
          </div>
          
          {isLoggedIn ? (
            <div className="relative flex items-center gap-2" ref={menuRef}>
              {/* Guardian Avatar Pill (Click to open menu) */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="group flex items-center gap-1.5 py-1 px-2 rounded-full hover:bg-secondary-container/40 transition-all border border-transparent hover:border-outline-variant/30"
                aria-label="Guardian Account Menu"
              >
                <div className="w-8 h-8 rounded-full ring-2 ring-primary/30 overflow-hidden flex-shrink-0 bg-secondary-container flex items-center justify-center text-primary font-bold text-xs group-hover:scale-105 transition-transform shadow-xs">
                  {guardianInitial}
                </div>
                <span className="hidden sm:inline font-label text-xs text-primary font-semibold max-w-[110px] truncate">
                  {guardianName || "Guardian"}
                </span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant transition-transform group-hover:translate-y-0.5">
                  {isMenuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Dedicated Quick Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="hidden sm:inline-flex items-center gap-1 py-1.5 px-3 rounded-full bg-surface-container-low hover:bg-error-container/30 text-on-surface-variant hover:text-error font-label text-xs font-semibold border border-outline-variant/30 transition-all active:scale-95"
                title="Sign out of KORU Sanctuary"
              >
                <span className="material-symbols-outlined text-[15px]">logout</span>
                <span>Sign Out</span>
              </button>

              {/* Guardian Profile Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-12 w-64 rounded-2xl bg-surface-container-lowest shadow-xl border border-outline-variant/30 p-3.5 z-50 flex flex-col gap-3 animate-fadeIn">
                  {/* Guardian Info */}
                  <div className="flex items-start gap-3 pb-3 border-b border-outline-variant/20">
                    <div className="w-10 h-10 rounded-full bg-secondary-container text-primary font-bold text-sm flex items-center justify-center shrink-0 ring-2 ring-secondary/30">
                      {guardianInitial}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-headline text-sm font-semibold text-primary truncate">
                        {guardianName || "Sanctuary Guardian"}
                      </span>
                      <span className="font-label text-[11px] text-secondary font-medium">
                        {guardianRelation} of Margaret
                      </span>
                      <span className="font-body text-[10px] text-on-surface-variant truncate mt-0.5">
                        {guardianEmail}
                      </span>
                    </div>
                  </div>

                  {/* Sanctuary Links */}
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-container text-on-surface font-label text-xs transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        admin_panel_settings
                      </span>
                      <span>Guardian Settings & Kinship</span>
                    </Link>

                    <Link
                      href="/studio"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-container text-on-surface font-label text-xs transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        auto_videocam
                      </span>
                      <span>Google Flow Studio</span>
                    </Link>
                  </div>

                  {/* Sign Out Action Button */}
                  <div className="pt-2 border-t border-outline-variant/20">
                    <button
                      onClick={handleSignOut}
                      className="w-full py-2 px-3 rounded-xl bg-error-container/40 hover:bg-error-container text-error font-label text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Sign Out of Sanctuary</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/register"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-primary text-white font-label text-xs font-semibold hover:bg-primary-container active:scale-95 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[15px]">key</span>
              <span>Sign In / Sign Up</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
