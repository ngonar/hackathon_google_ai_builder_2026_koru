'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface LifeStoryMilestone {
  id: string;
  year: string;
  title: string;
  desc: string;
  category: string;
  quote?: string;
  photo_url?: string;
  tags?: string[];
}

interface CloningArtifact {
  id: string;
  artifact_type: string; // photo, voice, video
  title: string;
  file_url: string;
  file_name: string;
  file_size_kb: number;
  cloning_purpose: string;
  era_context?: string;
  status: string;
  fidelity_score: number;
}

interface CloningSummary {
  total_artifacts: number;
  photos_count: number;
  voice_samples_count: number;
  video_samples_count: number;
  chapters_count: number;
  voice_fidelity: number;
  avatar_fidelity: number;
  veo_consistency_seed: number;
}

export default function LifeStoryPage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'artifacts' | 'synthesis'>('timeline');

  // Life Story State
  const [milestones, setMilestones] = useState<LifeStoryMilestone[]>([]);
  const [artifacts, setArtifacts] = useState<CloningArtifact[]>([]);
  const [summary, setSummary] = useState<CloningSummary>({
    total_artifacts: 4,
    photos_count: 2,
    voice_samples_count: 43,
    video_samples_count: 1,
    chapters_count: 5,
    voice_fidelity: 98.2,
    avatar_fidelity: 96.0,
    veo_consistency_seed: 42891105
  });

  // Chapter Form State
  const [yearInput, setYearInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('milestone');
  const [quoteInput, setQuoteInput] = useState('');
  const [isSubmittingChapter, setIsSubmittingChapter] = useState(false);
  const [chapterSuccess, setChapterSuccess] = useState(false);

  // Upload Artifact State
  const [uploadType, setUploadType] = useState<'photo' | 'voice' | 'video'>('photo');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadPurpose, setUploadPurpose] = useState('');
  const [uploadEra, setUploadEra] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // In-Browser Audio Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Avatar Synthesis State
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStep, setSynthesisStep] = useState(0);
  const [synthesisResult, setSynthesisResult] = useState<any | null>(null);

  // Load Life Story & Cloning data
  useEffect(() => {
    fetch('/api/life-story/peggy-sutherland-1946')
      .then(res => res.json())
      .then(data => {
        if (data.milestones) setMilestones(data.milestones);
        if (data.cloning_artifacts) setArtifacts(data.cloning_artifacts);
        if (data.cloning_summary) setSummary(data.cloning_summary);
      })
      .catch(err => {
        console.warn('Could not fetch life story:', err);
      });
  }, []);

  // Handle Add Chapter / Milestone
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearInput.trim() || !titleInput.trim() || !descInput.trim()) return;

    setIsSubmittingChapter(true);
    try {
      const res = await fetch('/api/life-story/peggy-sutherland-1946/milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: yearInput.trim(),
          title: titleInput.trim(),
          desc: descInput.trim(),
          category: categoryInput,
          quote: quoteInput.trim() || undefined,
          tags: ['Life Story', categoryInput]
        })
      });

      if (res.ok) {
        const newM: LifeStoryMilestone = await res.json();
        setMilestones(prev => [newM, ...prev]);
        setSummary(prev => ({
          ...prev,
          chapters_count: prev.chapters_count + 1
        }));
        setChapterSuccess(true);
        setYearInput('');
        setTitleInput('');
        setDescInput('');
        setQuoteInput('');
        setTimeout(() => setChapterSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error adding milestone:', err);
    } finally {
      setIsSubmittingChapter(false);
    }
  };

  // Live Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedAudioUrl(url);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Could not access microphone for live recording.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle File Upload for Avatar Cloning
  const handleUploadArtifact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;
    if (!selectedFile && !recordedBlob) {
      alert('Please select a file or record a voice memo.');
      return;
    }

    setIsUploading(true);
    setUploadSuccessMsg(null);

    const formData = new FormData();
    if (selectedFile) {
      formData.append('file', selectedFile);
    } else if (recordedBlob) {
      formData.append('file', recordedBlob, `live_recording_${Date.now()}.webm`);
    }

    formData.append('artifact_type', uploadType);
    formData.append('title', uploadTitle.trim());
    formData.append(
      'cloning_purpose',
      uploadPurpose.trim() ||
        (uploadType === 'photo'
          ? 'Veo 2 & Imagen 3 Subject Consistency'
          : uploadType === 'voice'
          ? 'Aoede Voice Timbre & Cadence'
          : 'Facial Motion Dynamics & Eye Saccades')
    );
    if (uploadEra.trim()) {
      formData.append('era_context', uploadEra.trim());
    }

    try {
      const res = await fetch('/api/life-story/peggy-sutherland-1946/upload-artifact', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const newArt: CloningArtifact = await res.json();
        setArtifacts(prev => [newArt, ...prev]);
        setSummary(prev => ({
          ...prev,
          total_artifacts: prev.total_artifacts + 1,
          photos_count: uploadType === 'photo' ? prev.photos_count + 1 : prev.photos_count,
          voice_samples_count: uploadType === 'voice' ? prev.voice_samples_count + 1 : prev.voice_samples_count,
          video_samples_count: uploadType === 'video' ? prev.video_samples_count + 1 : prev.video_samples_count
        }));
        setUploadSuccessMsg(`Successfully ingested "${newArt.title}" into avatar cloning pipeline!`);
        setUploadTitle('');
        setUploadEra('');
        setSelectedFile(null);
        setRecordedAudioUrl(null);
        setRecordedBlob(null);
        setTimeout(() => setUploadSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('Artifact upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Avatar Synthesis Pipeline
  const handleSynthesizeAvatar = async () => {
    setIsSynthesizing(true);
    setSynthesisStep(1);

    setTimeout(() => setSynthesisStep(2), 1200);
    setTimeout(() => setSynthesisStep(3), 2400);

    try {
      const res = await fetch('/api/life-story/peggy-sutherland-1946/synthesize-avatar', {
        method: 'POST'
      });
      const data = await res.json();
      setTimeout(() => {
        setSynthesisStep(4);
        setSynthesisResult(data);
        setIsSynthesizing(false);
      }, 3600);
    } catch (err) {
      console.error('Synthesis failed:', err);
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-20">
      {/* Hero Profile Banner & Avatar Cloning Readiness Dashboard */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-secondary-container/40 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 z-10 text-center sm:text-left">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-secondary-container shadow-md bg-surface-container">
              <img 
                src="/static/peggy_avatar.png" 
                alt="Margaret Peggy Sutherland"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-secondary text-on-secondary w-7 h-7 rounded-full flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold">
                  Margaret "Peggy" Sutherland
                </h1>
                <p className="font-label text-xs sm:text-sm text-secondary font-medium mt-0.5">
                  1946 – 2023 • Dunedin, Aotearoa • Avatar Cloning Studio
                </p>
              </div>

              <Link
                href="/communion"
                className="self-center sm:self-auto px-4 py-2 rounded-xl bg-primary text-on-primary font-label text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-primary-container active:scale-95 transition-all whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">videocam</span>
                <span>Enter Live Communion</span>
              </Link>
            </div>

            <p className="font-headline text-xs sm:text-sm italic text-on-surface-variant mt-2 leading-relaxed max-w-xl">
              "The earth always knows how to heal itself, my dear, and every flower holds a little piece of eternity."
            </p>
          </div>
        </div>

        {/* Multimodal Cloning Readiness Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 z-10">
          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span className="font-label text-[11px] font-bold uppercase tracking-wider">Photos</span>
            </div>
            <span className="font-headline text-lg font-bold text-primary mt-1">
              {summary.photos_count} Stills
            </span>
            <span className="font-label text-[10px] text-on-surface-variant">Veo Seed #42891105</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[16px]">mic</span>
              <span className="font-label text-[11px] font-bold uppercase tracking-wider">Voice</span>
            </div>
            <span className="font-headline text-lg font-bold text-primary mt-1">
              {summary.voice_samples_count} Memos
            </span>
            <span className="font-label text-[10px] text-on-surface-variant">{summary.voice_fidelity}% Timbre</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[16px]">videocam</span>
              <span className="font-label text-[11px] font-bold uppercase tracking-wider">Video</span>
            </div>
            <span className="font-headline text-lg font-bold text-primary mt-1">
              {summary.video_samples_count} Motion
            </span>
            <span className="font-label text-[10px] text-on-surface-variant">468 Mesh Points</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[16px]">auto_stories</span>
              <span className="font-label text-[11px] font-bold uppercase tracking-wider">Chapters</span>
            </div>
            <span className="font-headline text-lg font-bold text-primary mt-1">
              {summary.chapters_count} Indexed
            </span>
            <span className="font-label text-[10px] text-on-surface-variant">Gemini Embeddings</span>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-2xl border border-outline-variant/20 max-w-md mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-2 px-3 rounded-xl font-label text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'timeline'
              ? 'bg-surface-container-lowest text-primary shadow-xs'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">timeline</span>
          <span>Life Chapters</span>
        </button>

        <button
          onClick={() => setActiveTab('artifacts')}
          className={`flex-1 py-2 px-3 rounded-xl font-label text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'artifacts'
              ? 'bg-surface-container-lowest text-primary shadow-xs'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">upload_file</span>
          <span>Upload Media</span>
        </button>

        <button
          onClick={() => setActiveTab('synthesis')}
          className={`flex-1 py-2 px-3 rounded-xl font-label text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'synthesis'
              ? 'bg-surface-container-lowest text-primary shadow-xs'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">psychology</span>
          <span>Clone Engine</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: LIFE STORY CHAPTERS & TIMELINE */}
      {/* ============================================================== */}
      {activeTab === 'timeline' && (
        <div className="flex flex-col gap-6">
          {/* Form to Add New Life Story Chapter */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">post_add</span>
              <div>
                <h2 className="font-headline text-lg text-primary font-semibold">
                  Chronicle a Life Story Chapter
                </h2>
                <p className="font-body text-xs text-on-surface-variant">
                  Add memories, expeditions, and wisdom. Indexed into the episodic memory vault for live communion.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddMilestone} className="flex flex-col gap-3.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-label text-xs font-semibold text-primary">Year / Era</label>
                  <input
                    type="text"
                    required
                    value={yearInput}
                    onChange={(e) => setYearInput(e.target.value)}
                    placeholder="e.g. 1974 or Childhood"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-label text-xs font-semibold text-primary">Chapter Title</label>
                  <input
                    type="text"
                    required
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="e.g. Discovering the Blue Tussock on Southern Alps"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="font-label text-xs font-semibold text-primary">Category</label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
                >
                  <option value="expedition">Expedition / Nature / Adventure</option>
                  <option value="family">Family & Kinship Reminiscence</option>
                  <option value="passion">Gardening / Botany / Creative Craft</option>
                  <option value="education">Education & Early Life</option>
                  <option value="wisdom">Philosophical Wisdom & Life Advice</option>
                  <option value="milestone">Life Milestone</option>
                </select>
              </div>

              <div>
                <label className="font-label text-xs font-semibold text-primary">
                  Narrative Details & Sensory Memories
                </label>
                <textarea
                  rows={3}
                  required
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Describe the moment in detail: what was said, the smell of damp earth, laughter, how tea was served..."
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="font-label text-xs font-semibold text-primary">
                  Signature Quote / Saying (Optional)
                </label>
                <input
                  type="text"
                  value={quoteInput}
                  onChange={(e) => setQuoteInput(e.target.value)}
                  placeholder="e.g. 'Cold mountain air only sharpens the spirit, darling.'"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingChapter}
                className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-label text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary active:scale-[0.99] transition-all shadow-xs disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>{isSubmittingChapter ? 'Embedding into Memory Vault...' : 'Incorporate Chapter into Memory Vault & Avatar'}</span>
              </button>

              {chapterSuccess && (
                <p className="text-center font-label text-xs text-secondary font-bold animate-pulse">
                  ✓ Chapter preserved and indexed with Google Gemini Embeddings!
                </p>
              )}
            </form>
          </section>

          {/* Timeline of Chapters */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">auto_stories</span>
                <h3 className="font-headline text-lg text-primary font-semibold">Life Story Chapters</h3>
              </div>
              <span className="font-label text-xs text-on-surface-variant font-medium">
                {milestones.length} Chapters
              </span>
            </div>

            <div className="relative border-l-2 border-secondary/30 ml-3.5 space-y-6 pt-2">
              {milestones.map((m) => (
                <div key={m.id} className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-secondary ring-4 ring-surface-container-lowest" />
                  <div className="bg-surface-container-low/60 rounded-xl p-4 border border-outline-variant/20 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-label text-xs font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                        {m.year}
                      </span>
                      <span className="font-label text-[10px] uppercase text-on-surface-variant font-semibold">
                        {m.category}
                      </span>
                    </div>

                    <h4 className="font-headline text-base text-primary font-semibold mt-0.5">
                      {m.title}
                    </h4>

                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      {m.desc}
                    </p>

                    {m.quote && (
                      <blockquote className="font-headline text-xs italic text-secondary border-l-2 border-secondary pl-2.5 mt-1">
                        "{m.quote}"
                      </blockquote>
                    )}

                    {m.photo_url && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden mt-1 border border-outline-variant/30">
                        <img src={m.photo_url} alt={m.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: UPLOAD AVATAR CLONING ARTIFACTS (PHOTO, VOICE & VIDEO) */}
      {/* ============================================================== */}
      {activeTab === 'artifacts' && (
        <div className="flex flex-col gap-6">
          {/* Upload Card */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">cloud_upload</span>
              <div>
                <h2 className="font-headline text-lg text-primary font-semibold">
                  Upload Avatar Cloning Artifacts
                </h2>
                <p className="font-body text-xs text-on-surface-variant">
                  Ingest photos for Veo facial consistency, voice memos for Aoede timbre cloning, and videos for gesture dynamics.
                </p>
              </div>
            </div>

            {/* MediaType Selector Chips */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setUploadType('photo')}
                className={`py-2 px-3 rounded-xl font-label text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                  uploadType === 'photo'
                    ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container border-outline-variant/30'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                <span>1. Photos</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadType('voice')}
                className={`py-2 px-3 rounded-xl font-label text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                  uploadType === 'voice'
                    ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container border-outline-variant/30'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">mic</span>
                <span>2. Voice</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadType('video')}
                className={`py-2 px-3 rounded-xl font-label text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                  uploadType === 'video'
                    ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container border-outline-variant/30'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">videocam</span>
                <span>3. Videos</span>
              </button>
            </div>

            <form onSubmit={handleUploadArtifact} className="flex flex-col gap-3.5">
              <div>
                <label className="font-label text-xs font-semibold text-primary">Artifact Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder={
                    uploadType === 'photo'
                      ? 'e.g. Margaret in Dunedin Garden (1982)'
                      : uploadType === 'voice'
                      ? 'e.g. Voicemail Greeting: Preparing Lavender Tea'
                      : 'e.g. Home Movie: Walking Through Alpine Grasslands'
                  }
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-label text-xs font-semibold text-primary">Era / Approximate Year</label>
                  <input
                    type="text"
                    value={uploadEra}
                    onChange={(e) => setUploadEra(e.target.value)}
                    placeholder="e.g. 1974 or 1990s"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>

                <div>
                  <label className="font-label text-xs font-semibold text-primary">Cloning Purpose</label>
                  <input
                    type="text"
                    value={uploadPurpose}
                    onChange={(e) => setUploadPurpose(e.target.value)}
                    placeholder={
                      uploadType === 'photo'
                        ? 'Veo Facial Consistency Anchor'
                        : uploadType === 'voice'
                        ? 'Aoede Timbre & Otago Lilt'
                        : 'Motion Dynamics & Eye Crinkles'
                    }
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </div>

              {/* Upload Input & Live Mic Recorder */}
              {uploadType === 'voice' ? (
                <div className="flex flex-col gap-2 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <span className="font-label text-xs font-semibold text-primary">
                    Select Audio File OR Record Live Voice Memo:
                  </span>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                          setRecordedAudioUrl(null);
                          setRecordedBlob(null);
                        }
                      }}
                      className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-surface-container file:text-primary file:font-semibold"
                    />

                    <span className="text-xs text-on-surface-variant font-medium">or</span>

                    {/* Live Mic Button */}
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`py-1.5 px-3 rounded-lg font-label text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isRecording
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-secondary text-on-secondary hover:bg-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isRecording ? 'stop_circle' : 'mic'}
                      </span>
                      <span>{isRecording ? 'Stop Recording' : 'Record Live Audio'}</span>
                    </button>
                  </div>

                  {recordedAudioUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <audio controls src={recordedAudioUrl} className="h-8 max-w-xs" />
                      <span className="font-label text-[11px] text-secondary font-semibold">
                        ✓ Live Recording Captured
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <label className="font-label text-xs font-semibold text-primary block mb-1">
                    Select {uploadType === 'photo' ? 'Photo / Portrait (.jpg, .png)' : 'Video Clip (.mp4, .mov, .webm)'}
                  </label>
                  <input
                    type="file"
                    required={!selectedFile}
                    accept={uploadType === 'photo' ? 'image/*' : 'video/*'}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-secondary file:text-on-secondary file:font-semibold cursor-pointer"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-label text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary-container active:scale-[0.99] transition-all shadow-xs disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">upload</span>
                <span>{isUploading ? 'Ingesting Media into Cloning Engine...' : 'Ingest into Avatar Cloning Pipeline'}</span>
              </button>

              {uploadSuccessMsg && (
                <p className="text-center font-label text-xs text-secondary font-bold animate-pulse">
                  ✓ {uploadSuccessMsg}
                </p>
              )}
            </form>
          </section>

          {/* Ingested Cloning Artifacts Gallery */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">collections_bookmark</span>
                <h3 className="font-headline text-lg text-primary font-semibold">
                  Ingested Cloning Assets ({artifacts.length})
                </h3>
              </div>
              <span className="font-label text-xs text-secondary font-semibold">
                Google Flow & Gemini Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {artifacts.map((art) => (
                <div
                  key={art.id}
                  className="rounded-xl p-3 bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2.5"
                >
                  <div className="flex items-start gap-3">
                    {/* Media Thumbnail or Icon */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container shrink-0 flex items-center justify-center ring-1 ring-outline-variant/30">
                      {art.artifact_type === 'photo' ? (
                        <img src={art.file_url} alt={art.title} className="w-full h-full object-cover" />
                      ) : art.artifact_type === 'voice' ? (
                        <span className="material-symbols-outlined text-secondary text-2xl">graphic_eq</span>
                      ) : (
                        <span className="material-symbols-outlined text-secondary text-2xl">videocam</span>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-headline text-xs font-bold text-primary truncate">
                          {art.title}
                        </span>
                        <span className="bg-secondary/15 text-secondary text-[10px] font-label font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {art.fidelity_score}%
                        </span>
                      </div>

                      <span className="font-body text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                        {art.cloning_purpose}
                      </span>

                      <div className="flex items-center gap-2 mt-1 text-[10px] font-label text-on-surface-variant">
                        <span className="uppercase font-semibold text-secondary">{art.artifact_type}</span>
                        <span>•</span>
                        <span>{art.file_size_kb} KB</span>
                        {art.era_context && (
                          <>
                            <span>•</span>
                            <span className="italic">{art.era_context}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {art.artifact_type === 'voice' && (
                    <audio controls src={art.file_url} className="w-full h-7 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: AVATAR SYNTHESIS & CLONING ENGINE */}
      {/* ============================================================== */}
      {activeTab === 'synthesis' && (
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-outline-variant/20">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-2xl">psychology</span>
            </div>
            <div>
              <h2 className="font-headline text-lg sm:text-xl text-primary font-semibold">
                Multimodal Avatar Synthesis Pipeline
              </h2>
              <p className="font-body text-xs text-on-surface-variant">
                Fuse all uploaded photos, voice memos, videos, and life story chapters into Margaret's living avatar presence.
              </p>
            </div>
          </div>

          {/* Ingestion Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col">
              <span className="font-label text-xs text-on-surface-variant">Photos Processed</span>
              <span className="font-headline text-xl font-bold text-primary mt-1">{summary.photos_count}</span>
              <span className="font-label text-[10px] text-secondary">Veo Consistency</span>
            </div>
            <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col">
              <span className="font-label text-xs text-on-surface-variant">Voice Memos</span>
              <span className="font-headline text-xl font-bold text-primary mt-1">{summary.voice_samples_count}</span>
              <span className="font-label text-[10px] text-secondary">Aoede 24kHz Timbre</span>
            </div>
            <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col">
              <span className="font-label text-xs text-on-surface-variant">Video Clips</span>
              <span className="font-headline text-xl font-bold text-primary mt-1">{summary.video_samples_count}</span>
              <span className="font-label text-[10px] text-secondary">Blink & Gaze Mesh</span>
            </div>
            <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col">
              <span className="font-label text-xs text-on-surface-variant">Life Chapters</span>
              <span className="font-headline text-xl font-bold text-primary mt-1">{summary.chapters_count}</span>
              <span className="font-label text-[10px] text-secondary">RAG Vector Vault</span>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleSynthesizeAvatar}
            disabled={isSynthesizing}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary via-primary-container to-secondary text-on-primary font-label text-sm sm:text-base font-semibold flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all shadow-md disabled:opacity-50"
          >
            {isSynthesizing ? (
              <>
                <span className="material-symbols-outlined text-[22px] animate-spin">progress_activity</span>
                <span>Synthesizing Avatar Cloning Profile...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
                <span>Synthesize Avatar Cloning Profile with Google Flow & Gemini</span>
              </>
            )}
          </button>

          {/* Live Synthesis Stepper */}
          {isSynthesizing && (
            <div className="p-4 rounded-xl bg-surface-container-low border border-secondary/40 flex flex-col gap-3 animate-fadeIn">
              <span className="font-label text-xs font-bold text-primary uppercase tracking-wider">
                Synthesis Progress
              </span>

              <div className="space-y-2">
                <div className={`flex items-center gap-2 font-label text-xs ${synthesisStep >= 1 ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {synthesisStep > 1 ? 'check_circle' : 'hourglass_top'}
                  </span>
                  <span>1. Aligning facial bone structure & locking Veo consistency seed (#42891105)</span>
                </div>

                <div className={`flex items-center gap-2 font-label text-xs ${synthesisStep >= 2 ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {synthesisStep > 2 ? 'check_circle' : 'hourglass_top'}
                  </span>
                  <span>2. Training Aoede acoustic stems & southern Otago cadence from cassette audio</span>
                </div>

                <div className={`flex items-center gap-2 font-label text-xs ${synthesisStep >= 3 ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {synthesisStep > 3 ? 'check_circle' : 'hourglass_top'}
                  </span>
                  <span>3. Rigging 468-point facial mesh for natural blinking & phoneme viseme lip sync</span>
                </div>

                <div className={`flex items-center gap-2 font-label text-xs ${synthesisStep >= 4 ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {synthesisStep >= 4 ? 'check_circle' : 'hourglass_top'}
                  </span>
                  <span>4. Generating Gemini vector embeddings across all {summary.chapters_count} life story chapters</span>
                </div>
              </div>
            </div>
          )}

          {/* Result Card */}
          {synthesisResult && (
            <div className="p-5 rounded-2xl bg-secondary-container/40 border border-secondary flex flex-col gap-3.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-2xl">verified</span>
                <h3 className="font-headline text-base font-bold text-primary">
                  Avatar Cloning Profile Active & Calibrated!
                </h3>
              </div>

              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                Margaret Sutherland's avatar presence is synchronized. Her facial structure, natural blinking rhythm, Otago vocal timbre, and episodic memories are fully unified.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-label text-xs">
                <div className="bg-surface-container-lowest/80 p-2.5 rounded-xl">
                  <span className="text-on-surface-variant block text-[10px]">Avatar Fidelity</span>
                  <span className="font-bold text-primary text-sm">{synthesisResult.metrics.avatar_fidelity_score}</span>
                </div>
                <div className="bg-surface-container-lowest/80 p-2.5 rounded-xl">
                  <span className="text-on-surface-variant block text-[10px]">Voice Accuracy</span>
                  <span className="font-bold text-primary text-sm">{synthesisResult.metrics.voice_timbre_accuracy}</span>
                </div>
                <div className="bg-surface-container-lowest/80 p-2.5 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-on-surface-variant block text-[10px]">Facial Landmarks</span>
                  <span className="font-bold text-primary text-sm">468 Mesh Points</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/communion"
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-label text-xs font-semibold flex items-center justify-center gap-2 hover:bg-primary-container shadow-xs transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">videocam</span>
                  <span>Commune with Live Avatar</span>
                </Link>

                <Link
                  href="/studio"
                  className="py-3 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label text-xs font-semibold flex items-center gap-1.5 transition-all border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Fine-Tune in Studio</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
