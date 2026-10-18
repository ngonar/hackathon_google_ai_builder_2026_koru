'use client';

import React, { useState, useEffect } from 'react';

interface TributeItem {
  id: string;
  author: string;
  relation: string;
  message: string;
  candle_lit: boolean;
  created_at: string;
}

export default function TributeWallPage() {
  const [tributes, setTributes] = useState<TributeItem[]>([]);
  const [author, setAuthor] = useState('');
  const [relation, setRelation] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalCandles, setTotalCandles] = useState(148);

  useEffect(() => {
    fetch('/api/memorials/peggy-sutherland-1946/tributes')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setTributes(data);
          setTotalCandles(148 + data.filter((t: any) => t.candle_lit).length);
        } else {
          setTributes([
            {
              id: 't-1',
              author: 'Clara Sutherland',
              relation: 'Granddaughter',
              message: 'Thinking of your warm laughter today, Nana Peggy. Your lavender plants are growing tall.',
              candle_lit: true,
              created_at: new Date().toISOString()
            },
            {
              id: 't-2',
              author: 'Duncan Sutherland',
              relation: 'Son',
              message: 'Your quiet wisdom remains our family compass every single day.',
              candle_lit: true,
              created_at: new Date(Date.now() - 86400000).toISOString()
            }
          ]);
        }
      })
      .catch(() => {
        setTributes([
          {
            id: 't-1',
            author: 'Clara Sutherland',
            relation: 'Granddaughter',
            message: 'Thinking of your warm laughter today, Nana Peggy. Your lavender plants are growing tall.',
            candle_lit: true,
            created_at: new Date().toISOString()
          }
        ]);
      });
  }, []);

  const handleAddTribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const newTributeData = {
      memorial_id: 'peggy-sutherland-1946',
      author,
      relation: relation || 'Loved One',
      message,
      candle_lit: true
    };

    try {
      const res = await fetch('/api/memorials/peggy-sutherland-1946/tributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTributeData)
      });

      if (res.ok) {
        const saved = await res.json();
        setTributes(prev => [saved, ...prev]);
        setTotalCandles(prev => prev + 1);
        setAuthor('');
        setRelation('');
        setMessage('');
      }
    } catch (err) {
      console.error('Error adding tribute:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Wall Header & Candle Count */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex items-center justify-between">
        <div>
          <span className="font-label text-xs uppercase tracking-wider text-secondary font-semibold">
            Community Memorial
          </span>
          <h1 className="font-headline text-2xl text-primary font-semibold mt-0.5">
            Memory Wall & Guestbook
          </h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Honoring Margaret "Peggy" Sutherland with candles and words of love.
          </p>
        </div>

        <div className="flex flex-col items-center bg-amber-50 border border-amber-200/60 px-4 py-2 rounded-xl">
          <span className="material-symbols-outlined text-amber-600 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            candle
          </span>
          <span className="font-headline text-lg font-bold text-amber-800 mt-0.5">
            {totalCandles}
          </span>
          <span className="font-label text-[10px] text-amber-700/80 uppercase">Candles Lit</span>
        </div>
      </section>

      {/* Tribute Entry Form */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30">
        <h2 className="font-headline text-base text-primary font-medium mb-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-secondary text-[18px]">edit_note</span>
          <span>Leave a Tribute or Light a Candle</span>
        </h2>

        <form onSubmit={handleAddTribute} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label text-xs font-semibold text-primary">Your Name</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., Sarah Davies"
                className="w-full mt-1 px-3 py-1.5 text-sm rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="font-label text-xs font-semibold text-primary">Relationship</label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="e.g., Family Friend"
                className="w-full mt-1 px-3 py-1.5 text-sm rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>

          <div>
            <label className="font-label text-xs font-semibold text-primary">Heartfelt Tribute</label>
            <textarea
              rows={2}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share a loving remembrance, blessing, or gratitude..."
              className="w-full mt-1 px-3 py-1.5 text-sm rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-label text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary active:scale-[0.99] transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
            <span>{isSubmitting ? 'Inscribing tribute...' : 'Kindle Candle & Post Tribute'}</span>
          </button>
        </form>
      </section>

      {/* Tributes Feed */}
      <section className="space-y-3">
        {tributes.map((t) => (
          <article
            key={t.id}
            className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-outline-variant/30 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold text-xs">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-headline text-sm font-semibold text-primary leading-none">
                    {t.author}
                  </h4>
                  <span className="font-label text-[10px] text-secondary font-medium">
                    {t.relation}
                  </span>
                </div>
              </div>

              {t.candle_lit && (
                <div className="flex items-center gap-1 text-amber-700 font-label text-xs">
                  <span className="material-symbols-outlined text-[16px] text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                    candle
                  </span>
                  <span>Candle Lit</span>
                </div>
              )}
            </div>

            <p className="font-headline italic text-xs sm:text-sm text-primary leading-relaxed mt-1">
              "{t.message}"
            </p>

            <span className="font-label text-[10px] text-on-surface-variant/70 self-end">
              {new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </article>
        ))}
      </section>
    </div>
  );
}
