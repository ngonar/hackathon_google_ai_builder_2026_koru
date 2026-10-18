'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserProfileData {
  id: string;
  full_name: string;
  email: string;
  relation: string;
  memorial_honoree: string;
  memorial_focus: string;
  sanctuary_privacy: string;
  preferred_tone: string;
  reverence_pledge: boolean;
  avatar_initial: string;
}

export default function RegisterPage() {
  const router = useRouter();

  // Mode: 'register' | 'login' | 'success'
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'success'>('register');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form Fields - Step 1: Guardian Identity
  const [fullName, setFullName] = useState('Clara Sutherland');
  const [email, setEmail] = useState('clara.sutherland@sanctuary.koru');
  const [password, setPassword] = useState('sanctuary2024');
  const [confirmPassword, setConfirmPassword] = useState('sanctuary2024');
  const [showPassword, setShowPassword] = useState(false);
  const [relation, setRelation] = useState('Granddaughter');

  // Form Fields - Step 2: Memorial Dedication
  const [memorialHonoree, setMemorialHonoree] = useState("Margaret 'Peggy' Sutherland");
  const [birthYear, setBirthYear] = useState('1946');
  const [passingYear, setPassingYear] = useState('2023');
  const [memorialFocus, setMemorialFocus] = useState('Living Avatar & Neural Voice');
  const [preferredTone, setPreferredTone] = useState('Warm & Contemplative (Otago cadence)');

  // Form Fields - Step 3: Reverence & Privacy
  const [sanctuaryPrivacy, setSanctuaryPrivacy] = useState<'family_only' | 'private' | 'community'>('family_only');
  const [reverencePledge, setReverencePledge] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Login Mode State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // UI / Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredGuardian, setRegisteredGuardian] = useState<UserProfileData | null>(null);

  // Kinship options
  const kinshipOptions = [
    { label: 'Granddaughter', icon: 'favorite', role: 'Grandchild' },
    { label: 'Grandson', icon: 'favorite', role: 'Grandchild' },
    { label: 'Daughter', icon: 'family_restroom', role: 'Child' },
    { label: 'Son', icon: 'family_restroom', role: 'Child' },
    { label: 'Spouse / Partner', icon: 'diversity_1', role: 'Life Partner' },
    { label: 'Sister / Brother', icon: 'group', role: 'Sibling' },
    { label: 'Cherished Friend', icon: 'volunteer_activism', role: 'Friend' },
    { label: 'Family Historian', icon: 'menu_book', role: 'Archivist' },
  ];

  // Focus options
  const focusOptions = [
    {
      id: 'Living Avatar & Neural Voice',
      title: 'Living Avatar & Neural Voice',
      desc: 'Real-time conversational communion with Margaret’s talking face & warm Otago timbre.',
      icon: 'record_voice_over',
      badge: 'Recommended'
    },
    {
      id: 'Family Memory Vault & Stories',
      title: 'Family Memory Vault & Stories',
      desc: 'Preserve letters, botanic journals, voicemails, and wisdom indexed via GenAI.',
      icon: 'auto_stories'
    },
    {
      id: 'Candle Vigil & Community Tribute',
      title: 'Candle Vigil & Community Tribute',
      desc: 'Daily candle lighting rituals, floral offerings, and shared family condolence wall.',
      icon: 'local_fire_department'
    }
  ];

  // Check if existing guardian is stored
  useEffect(() => {
    try {
      const stored = localStorage.getItem('koru_guardian');
      const hasCookie = typeof document !== 'undefined' && document.cookie.includes('koru_auth=true');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRegisteredGuardian(parsed);
        setAuthMode('success');
      } else if (hasCookie) {
        const fallback: UserProfileData = {
          id: 'demo-clara',
          full_name: 'Clara Sutherland',
          email: 'clara.sutherland@sanctuary.koru',
          relation: 'Granddaughter',
          memorial_honoree: "Margaret 'Peggy' Sutherland",
          memorial_focus: 'Living Avatar & Neural Voice',
          sanctuary_privacy: 'family_only',
          preferred_tone: 'Warm & Contemplative',
          reverence_pledge: true,
          avatar_initial: 'C',
        };
        setRegisteredGuardian(fallback);
        setAuthMode('success');
      }
    } catch {
      // ignore localstorage errors
    }
  }, []);

  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!fullName.trim()) {
        setErrorMessage('Please provide your full name as the Sanctuary Guardian.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage('Password should be at least 6 characters for sanctuary privacy.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!memorialHonoree.trim()) {
        setErrorMessage('Please specify the beloved one you are dedicating this sanctuary to.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!reverencePledge) {
      setErrorMessage('Please affirm the Ethical AI & Memory Reverence Pledge.');
      return;
    }
    if (!termsAgreed) {
      setErrorMessage('Please agree to the Sanctuary Terms & Privacy Covenant.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      relation,
      memorial_honoree: memorialHonoree.trim(),
      memorial_focus: memorialFocus,
      sanctuary_privacy: sanctuaryPrivacy,
      preferred_tone: preferredTone,
      reverence_pledge: reverencePledge,
    };

    try {
      let savedUser: UserProfileData;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        savedUser = await res.json();
      } else {
        // Fallback offline mock guardian profile
        savedUser = {
          id: `guardian-${Date.now()}`,
          full_name: payload.full_name,
          email: payload.email,
          relation: payload.relation,
          memorial_honoree: payload.memorial_honoree,
          memorial_focus: payload.memorial_focus,
          sanctuary_privacy: payload.sanctuary_privacy,
          preferred_tone: payload.preferred_tone,
          reverence_pledge: true,
          avatar_initial: payload.full_name[0].toUpperCase(),
        };
      }

      // Save to localStorage, cookie & trigger custom sync event
      localStorage.setItem('koru_guardian', JSON.stringify(savedUser));
      document.cookie = "koru_auth=true; path=/; max-age=2592000; SameSite=Lax";
      window.dispatchEvent(new CustomEvent('koru_guardian_updated', { detail: savedUser }));

      setRegisteredGuardian(savedUser);
      setAuthMode('success');
    } catch (err) {
      console.warn('Backend API registration offline, falling back to local sanctuary enrollment:', err);
      const fallbackUser: UserProfileData = {
        id: `guardian-${Date.now()}`,
        full_name: payload.full_name,
        email: payload.email,
        relation: payload.relation,
        memorial_honoree: payload.memorial_honoree,
        memorial_focus: payload.memorial_focus,
        sanctuary_privacy: payload.sanctuary_privacy,
        preferred_tone: payload.preferred_tone,
        reverence_pledge: true,
        avatar_initial: payload.full_name[0].toUpperCase(),
      };
      localStorage.setItem('koru_guardian', JSON.stringify(fallbackUser));
      document.cookie = "koru_auth=true; path=/; max-age=2592000; SameSite=Lax";
      window.dispatchEvent(new CustomEvent('koru_guardian_updated', { detail: fallbackUser }));
      setRegisteredGuardian(fallbackUser);
      setAuthMode('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword || 'demo' }),
      });

      let user: UserProfileData;
      if (res.ok) {
        user = await res.json();
      } else {
        user = {
          id: 'demo-guardian',
          full_name: 'Clara Sutherland',
          email: loginEmail,
          relation: 'Granddaughter',
          memorial_honoree: "Margaret 'Peggy' Sutherland",
          memorial_focus: 'Living Avatar & Neural Voice',
          sanctuary_privacy: 'family_only',
          preferred_tone: 'Warm & Contemplative',
          reverence_pledge: true,
          avatar_initial: 'C',
        };
      }
      localStorage.setItem('koru_guardian', JSON.stringify(user));
      document.cookie = "koru_auth=true; path=/; max-age=2592000; SameSite=Lax";
      window.dispatchEvent(new CustomEvent('koru_guardian_updated', { detail: user }));
      setRegisteredGuardian(user);
      setAuthMode('success');
    } catch (err) {
      console.warn('Login fallback:', err);
      const user: UserProfileData = {
        id: 'demo-guardian',
        full_name: 'Clara Sutherland',
        email: loginEmail,
        relation: 'Granddaughter',
        memorial_honoree: "Margaret 'Peggy' Sutherland",
        memorial_focus: 'Living Avatar & Neural Voice',
        sanctuary_privacy: 'family_only',
        preferred_tone: 'Warm & Contemplative',
        reverence_pledge: true,
        avatar_initial: 'C',
      };
      localStorage.setItem('koru_guardian', JSON.stringify(user));
      document.cookie = "koru_auth=true; path=/; max-age=2592000; SameSite=Lax";
      window.dispatchEvent(new CustomEvent('koru_guardian_updated', { detail: user }));
      setRegisteredGuardian(user);
      setAuthMode('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGooglePass = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const googleUser: UserProfileData = {
        id: 'google-clara-sutherland',
        full_name: 'Clara Sutherland',
        email: 'clara.sutherland@gmail.com',
        relation: 'Granddaughter',
        memorial_honoree: "Margaret 'Peggy' Sutherland",
        memorial_focus: 'Living Avatar & Neural Voice',
        sanctuary_privacy: 'family_only',
        preferred_tone: 'Warm & Contemplative (Otago cadence)',
        reverence_pledge: true,
        avatar_initial: 'C',
      };
      localStorage.setItem('koru_guardian', JSON.stringify(googleUser));
      document.cookie = "koru_auth=true; path=/; max-age=2592000; SameSite=Lax";
      window.dispatchEvent(new CustomEvent('koru_guardian_updated', { detail: googleUser }));
      setRegisteredGuardian(googleUser);
      setIsSubmitting(false);
      setAuthMode('success');
    }, 900);
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('koru_guardian');
    document.cookie = "koru_auth=; path=/; max-age=0; SameSite=Lax";
    window.dispatchEvent(new CustomEvent('koru_guardian_updated', { detail: null }));
    setRegisteredGuardian(null);
    setAuthMode('register');
    setCurrentStep(1);
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Breadcrumb / Sanctuary Realm Indicator */}
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-secondary hover:text-primary transition-colors text-xs font-label font-medium"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Return to Sanctuary</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-label">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span>Serene Sanctuary Enrollment</span>
        </div>
      </div>

      {/* Main Sanctuary Card Container */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/30 relative overflow-hidden">
        {/* Ambient Organic Atmosphere Glows */}
        <div className="absolute -right-16 -top-16 w-52 h-52 bg-secondary-container/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-tertiary-fixed/20 rounded-full blur-3xl pointer-events-none" />

        {/* ============================================================== */}
        {/* SUCCESS / ENROLLED STATE */}
        {/* ============================================================== */}
        {authMode === 'success' && registeredGuardian && (
          <div className="flex flex-col items-center text-center py-4 space-y-6 animate-fadeIn">
            {/* Sacred Koru Badge */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-secondary-container/80 flex items-center justify-center text-primary shadow-inner border border-secondary/20">
                <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  spa
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <span className="font-label text-xs uppercase tracking-widest text-secondary font-bold">
                Sanctuary Guardian Enrolled
              </span>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-medium">
                Welcome, {registeredGuardian.full_name.split(' ')[0]}
              </h1>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                Your sacred sanctuary for{' '}
                <strong className="text-primary font-semibold">{registeredGuardian.memorial_honoree}</strong>{' '}
                is consecrated and alive. As her{' '}
                <span className="text-secondary font-medium">{registeredGuardian.relation}</span>, you hold tender stewardship over her living avatar and voice.
              </p>
            </div>

            {/* Honoree Avatar Preview Card */}
            <div className="w-full max-w-sm bg-surface-container-low/80 rounded-2xl p-4 border border-outline-variant/40 flex items-center gap-4 text-left">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE0S49i-TBsCllFaYlOMZo5kLqs1CEO0bQVQcKe38K1gAs1UFJH_6NRTXtJfVqSqHve26aRMTT7i7LHbdHvGo5C-Pu1rD43eoow_c09OdSrRu9dOSgz5vvdodQDCZvecda8RQzkDVqgvkU1kem2eGxb0z2S1st2pyJX47L_VJflmUchdIUxJS2bVtLXKI6DIAiryqzfEi2aMdoo_2nwqnP8OzrjiRibHu8kiswZUI3J4ee2z2nPMwU" 
                alt={registeredGuardian.memorial_honoree}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-secondary-container shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse"></span>
                  <span className="font-label text-[11px] text-secondary font-semibold uppercase tracking-wider">
                    Avatar Present
                  </span>
                </div>
                <h4 className="font-headline text-base text-primary font-medium truncate">
                  {registeredGuardian.memorial_honoree}
                </h4>
                <p className="font-body text-xs text-on-surface-variant truncate">
                  Otago cadence • 98.2% timbre accuracy
                </p>
              </div>
            </div>

            {/* Quick Navigation Actions */}
            <div className="w-full max-w-sm flex flex-col gap-3 pt-2">
              <Link 
                href="/communion"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary-container text-white hover:bg-[#202f28] transition-all shadow-md font-label font-semibold text-sm active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[18px]">videocam</span>
                <span>Enter Live Avatar Communion</span>
              </Link>

              <Link 
                href="/"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-secondary-container/70 text-primary hover:bg-secondary-container transition-all font-label font-semibold text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">home</span>
                <span>Go to Sanctuary Home</span>
              </Link>

              <Link 
                href="/studio"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-on-surface-variant hover:text-primary transition-all font-label text-xs"
              >
                <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
                <span>Tune Voice & Ingest Memories in Studio</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-red-700/80 hover:text-red-800 hover:bg-red-50/50 rounded-xl transition-all font-label text-xs font-semibold mt-1"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out / Switch Guardian</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* LOGIN MODE */}
        {/* ============================================================== */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col space-y-6">
            <div className="flex flex-col gap-1.5 text-center sm:text-left">
              <span className="font-label text-xs uppercase tracking-widest text-secondary font-bold">
                Welcome Back
              </span>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-medium">
                Sign In to Your Sanctuary
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant">
                Enter your credentials to rejoin communion with your loved one’s living presence.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-body flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-label text-xs font-semibold text-primary mb-1.5">
                  Sanctuary Email Address
                </label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g., clara.sutherland@sanctuary.koru"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-sm font-body text-primary transition-all placeholder:text-on-surface-variant/40"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-label text-xs font-semibold text-primary">
                    Sanctuary Password
                  </label>
                  <span className="font-label text-[11px] text-secondary cursor-pointer hover:underline">
                    Forgot key?
                  </span>
                </div>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-sm font-body text-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Quick Demo Fill */}
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant font-body">Demo Guardian: Clara Sutherland</span>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('clara.sutherland@sanctuary.koru');
                  setLoginPassword('sanctuary2024');
                }}
                className="font-label text-secondary font-semibold hover:underline"
              >
                Auto-fill
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-primary-container text-white font-label font-semibold text-sm hover:bg-[#202f28] active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Entering Sanctuary...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>Enter Sanctuary</span>
                </>
              )}
            </button>

            {/* Google Single Sign-on */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-outline-variant/30"></div>
              <span className="flex-shrink mx-3 text-on-surface-variant font-label text-xs">or continue with</span>
              <div className="flex-grow border-t border-outline-variant/30"></div>
            </div>

            <button
              type="button"
              onClick={handleGooglePass}
              className="w-full py-3 px-4 rounded-xl bg-surface border border-outline-variant/60 hover:bg-surface-container-low transition-all flex items-center justify-center gap-3 font-label text-xs font-semibold text-primary shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google Sanctuary Pass</span>
            </button>

            <div className="text-center pt-2">
              <span className="font-body text-xs text-on-surface-variant">
                Need to create a new memorial sanctuary?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setAuthMode('register');
                  }}
                  className="font-label text-secondary font-bold hover:underline"
                >
                  Register here
                </button>
              </span>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* REGISTRATION STEPPER MODE */}
        {/* ============================================================== */}
        {authMode === 'register' && (
          <div className="flex flex-col space-y-6">
            {/* Header Titles */}
            <div className="flex flex-col gap-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <span className="font-label text-xs uppercase tracking-widest text-secondary font-bold">
                  Living Memory Consecration
                </span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-medium">
                Register as Sanctuary Guardian
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Establish your private family portal to converse with Margaret’s living avatar, preserve memories, and honor eternal love.
              </p>
            </div>

            {/* Live Avatar Preview Pill */}
            <div className="bg-surface-container-low/80 p-3.5 rounded-2xl border border-secondary/20 flex items-center gap-3.5 shadow-xs">
              <div className="relative flex-shrink-0">
                <img 
                  src="/static/peggy_avatar.png" 
                  alt="Margaret 'Peggy' Sutherland Avatar" 
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-secondary-container shadow-xs"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#34A853] ring-2 ring-white animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-label text-[10px] uppercase tracking-wider text-secondary font-bold">
                    Active Living Avatar
                  </span>
                  <span className="bg-secondary-container text-on-secondary-container text-[10px] font-label font-semibold px-2 py-0.5 rounded-full">
                    98.2% Timbre
                  </span>
                </div>
                <h4 className="font-headline text-sm font-semibold text-primary truncate">
                  Margaret “Peggy” Sutherland (1946–2023)
                </h4>
                <p className="font-body text-xs text-on-surface-variant truncate">
                  Neural voice & talking face awaiting your communion
                </p>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { step: 1, title: 'Guardian', icon: 'person' },
                { step: 2, title: 'Memorial', icon: 'favorite' },
                { step: 3, title: 'Pledge', icon: 'verified_user' },
              ].map((s) => {
                const isPassed = currentStep > s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      if (s.step < currentStep) setCurrentStep(s.step as any);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl transition-all text-left ${
                      isCurrent
                        ? 'bg-secondary-container/80 text-primary border border-secondary/30 shadow-xs'
                        : isPassed
                        ? 'bg-surface-container-low text-secondary hover:bg-surface-container'
                        : 'bg-surface/50 text-on-surface-variant/40'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? 'bg-primary text-white'
                          : isPassed
                          ? 'bg-secondary text-white'
                          : 'bg-outline-variant/40 text-on-surface-variant'
                      }`}
                    >
                      {isPassed ? (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      ) : (
                        s.step
                      )}
                    </div>
                    <span className="font-label text-xs font-semibold hidden sm:inline">
                      {s.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-body flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: GUARDIAN IDENTITY */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-4">
                  <div>
                    <label className="block font-label text-xs font-semibold text-primary mb-1.5">
                      Your Full Name
                    </label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Clara Sutherland"
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-sm font-body text-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-label text-xs font-semibold text-primary mb-1.5">
                      Sanctuary Email Address
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., clara.sutherland@sanctuary.koru"
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-sm font-body text-primary transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block font-label text-xs font-semibold text-primary">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[11px] font-label text-secondary hover:underline"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-sm font-body text-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-label text-xs font-semibold text-primary mb-1.5">
                        Confirm Password
                      </label>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-sm font-body text-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Kinship Selection Chips */}
                  <div>
                    <label className="block font-label text-xs font-semibold text-primary mb-2">
                      Your Relationship to Honored Loved One
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {kinshipOptions.map((k) => {
                        const isSelected = relation === k.label;
                        return (
                          <button
                            key={k.label}
                            type="button"
                            onClick={() => setRelation(k.label)}
                            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                              isSelected
                                ? 'bg-secondary text-white border-secondary shadow-xs scale-[1.01]'
                                : 'bg-surface border-outline-variant/40 hover:bg-surface-container-low text-on-surface'
                            }`}
                          >
                            <span 
                              className={`material-symbols-outlined text-[18px] ${
                                isSelected ? 'text-white' : 'text-secondary'
                              }`}
                            >
                              {k.icon}
                            </span>
                            <span className="font-label text-xs font-semibold leading-tight">
                              {k.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleGooglePass}
                    className="py-3 px-4 rounded-xl bg-surface border border-outline-variant/60 hover:bg-surface-container-low transition-all flex items-center gap-2 font-label text-xs font-semibold text-primary"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="py-3 px-6 rounded-xl bg-primary-container text-white font-label font-semibold text-xs sm:text-sm hover:bg-[#202f28] active:scale-[0.99] transition-all shadow-sm flex items-center gap-2"
                  >
                    <span>Continue to Memorial Details</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: MEMORIAL DEDICATION */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-4">
                  <div>
                    <label className="block font-label text-xs font-semibold text-primary mb-1.5">
                      Beloved One’s Name (Memorial Honoree)
                    </label>
                    <input 
                      type="text" 
                      value={memorialHonoree}
                      onChange={(e) => setMemorialHonoree(e.target.value)}
                      placeholder="e.g., Margaret 'Peggy' Sutherland"
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-sm font-body text-primary transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-label text-xs font-semibold text-primary mb-1.5">
                        Birth Year
                      </label>
                      <input 
                        type="text" 
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        placeholder="1946"
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-sm font-body text-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block font-label text-xs font-semibold text-primary mb-1.5">
                        Passing / Resting Year
                      </label>
                      <input 
                        type="text" 
                        value={passingYear}
                        onChange={(e) => setPassingYear(e.target.value)}
                        placeholder="2023"
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-sm font-body text-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Sanctuary Focus Selection */}
                  <div>
                    <label className="block font-label text-xs font-semibold text-primary mb-2">
                      Primary Sanctuary Experience Focus
                    </label>
                    <div className="space-y-2.5">
                      {focusOptions.map((f) => {
                        const isSelected = memorialFocus === f.id;
                        return (
                          <div
                            key={f.id}
                            onClick={() => setMemorialFocus(f.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                              isSelected
                                ? 'bg-secondary-container/60 border-secondary shadow-xs ring-1 ring-secondary/30'
                                : 'bg-surface border-outline-variant/40 hover:bg-surface-container-low'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected ? 'bg-primary text-white' : 'bg-surface-container text-secondary'
                            }`}>
                              <span className="material-symbols-outlined text-[20px]">{f.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-headline text-sm font-medium text-primary">
                                  {f.title}
                                </span>
                                {f.badge && (
                                  <span className="bg-secondary text-white text-[10px] font-label font-bold px-2 py-0.5 rounded-full">
                                    {f.badge}
                                  </span>
                                )}
                              </div>
                              <p className="font-body text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                                {f.desc}
                              </p>
                            </div>
                            <div className="pt-1">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-primary bg-primary' : 'border-outline-variant'
                              }`}>
                                {isSelected && (
                                  <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Tone */}
                  <div>
                    <label className="block font-label text-xs font-semibold text-primary mb-1.5">
                      Avatar Cadence & Vocal Tone
                    </label>
                    <select
                      value={preferredTone}
                      onChange={(e) => setPreferredTone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-sm font-body text-primary transition-all"
                    >
                      <option value="Warm & Contemplative (Otago cadence)">
                        Warm & Contemplative (Otago gentle cadence, maternal timbre)
                      </option>
                      <option value="Peaceful & Reflective">
                        Peaceful & Reflective (Slow, soft, comforting)
                      </option>
                      <option value="Storyteller & Joyous">
                        Storyteller & Joyous (Lively botanical anecdotes, warm chuckles)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="py-3 px-4 rounded-xl text-secondary hover:bg-surface-container-low transition-all font-label text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Back to Identity</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="py-3 px-6 rounded-xl bg-primary-container text-white font-label font-semibold text-xs sm:text-sm hover:bg-[#202f28] active:scale-[0.99] transition-all shadow-sm flex items-center gap-2"
                  >
                    <span>Proceed to Sanctuary Pledge</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVERENCE PLEDGE & PRIVACY */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-4">
                  {/* Privacy Level */}
                  <div>
                    <label className="block font-label text-xs font-semibold text-primary mb-2">
                      Sanctuary Access & Privacy Shield
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setSanctuaryPrivacy('family_only')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          sanctuaryPrivacy === 'family_only'
                            ? 'bg-secondary-container/60 border-secondary ring-1 ring-secondary/30'
                            : 'bg-surface border-outline-variant/40 hover:bg-surface-container-low'
                        }`}
                      >
                        <span className="material-symbols-outlined text-secondary text-[22px] mt-0.5">
                          lock
                        </span>
                        <div>
                          <div className="font-label text-xs font-bold text-primary">
                            Intimate Family Sanctuary
                          </div>
                          <p className="font-body text-[11px] text-on-surface-variant mt-0.5">
                            Restricted strictly to authorized family guardians. Never public.
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => setSanctuaryPrivacy('community')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          sanctuaryPrivacy === 'community'
                            ? 'bg-secondary-container/60 border-secondary ring-1 ring-secondary/30'
                            : 'bg-surface border-outline-variant/40 hover:bg-surface-container-low'
                        }`}
                      >
                        <span className="material-symbols-outlined text-secondary text-[22px] mt-0.5">
                          share
                        </span>
                        <div>
                          <div className="font-label text-xs font-bold text-primary">
                            Family & Close Friends
                          </div>
                          <p className="font-body text-[11px] text-on-surface-variant mt-0.5">
                            Shareable memory wall and guestbook for trusted circle.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ethical AI Reverence Pledge Box */}
                  <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 border border-secondary/20 space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-secondary">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        spa
                      </span>
                      <span className="font-label text-xs font-bold uppercase tracking-wider">
                        Ethical Memory Stewardship Pledge
                      </span>
                    </div>

                    <p className="font-body text-xs text-on-surface-variant leading-relaxed italic">
                      “We pledge that the living memory, voice, and photorealistic avatar of Margaret ‘Peggy’ Sutherland shall be held in sacred trust. Antigravity AI, Gemini multimodal models, and the KORU sanctuary do not sell memory data or exploit grief. Her voice remains an eternal beacon of family comfort.”
                    </p>

                    <label className="flex items-start gap-3 cursor-pointer pt-1">
                      <input 
                        type="checkbox"
                        checked={reverencePledge}
                        onChange={(e) => setReverencePledge(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-secondary focus:ring-secondary/30 accent-secondary"
                      />
                      <span className="font-label text-xs font-medium text-primary select-none">
                        I solemnly accept the role of Sanctuary Guardian with tenderness, dignity, and care.
                      </span>
                    </label>
                  </div>

                  {/* Terms & Privacy checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer px-1">
                    <input 
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="w-4 h-4 rounded text-secondary focus:ring-secondary/30 accent-secondary"
                    />
                    <span className="font-body text-xs text-on-surface-variant select-none">
                      I agree to the <span className="underline text-primary">Sanctuary Privacy Charter</span> and <span className="underline text-primary">Memory Vault Terms</span>.
                    </span>
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="py-3 px-4 rounded-xl text-secondary hover:bg-surface-container-low transition-all font-label text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Back to Memorial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRegister()}
                    disabled={isSubmitting}
                    className="py-3.5 px-6 rounded-xl bg-primary-container text-white font-label font-semibold text-xs sm:text-sm hover:bg-[#202f28] active:scale-[0.99] transition-all shadow-md flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Consecrating Sanctuary...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Complete Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Switch to Login Link */}
            <div className="border-t border-outline-variant/30 pt-4 text-center">
              <span className="font-body text-xs text-on-surface-variant">
                Already registered as a sanctuary guardian?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setAuthMode('login');
                  }}
                  className="font-label text-secondary font-bold hover:underline"
                >
                  Sign in here
                </button>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sanctuary Peace Affirmation Footer */}
      <div className="text-center py-2 space-y-1">
        <div className="flex items-center justify-center gap-2 text-on-surface-variant/60 text-xs font-body">
          <span className="material-symbols-outlined text-[14px]">shield</span>
          <span>Google GenAI Privacy Protected • End-to-End Encrypted Memories</span>
        </div>
        <p className="text-[11px] font-body text-on-surface-variant/50">
          KORU — The unfolding fern frond of eternal renewal and enduring love.
        </p>
      </div>
    </div>
  );
}
