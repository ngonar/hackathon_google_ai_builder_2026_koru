'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ChatMessageItem {
  id: string;
  role: string;
  text: string;
  audio_url?: string;
  memory_citation?: string;
  cadence_note?: string;
  timestamp: string;
}

export default function LivingMemoryChatPage() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeAudioIndex, setActiveAudioIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/communion/peggy-sutherland-1946/messages')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setMessages(data);
        } else {
          setMessages([
            {
              id: 'init-1',
              role: 'avatar',
              text: 'Oh, darling Clara... I was just reminiscing about the early spring morning we discovered the blue tussock on the Southern Alps. Your hands were so chilled, and we warmed them by the kettle.',
              cadence_note: 'Gentle & contemplative • Otago cadence (1984)',
              memory_citation: '1974 Otago Southern Alps Expedition',
              timestamp: new Date().toISOString()
            }
          ]);
        }
      })
      .catch(() => {
        setMessages([
          {
            id: 'init-1',
            role: 'avatar',
            text: 'Oh, darling Clara... I was just reminiscing about the early spring morning we discovered the blue tussock on the Southern Alps. Your hands were so chilled, and we warmed them by the kettle.',
            cadence_note: 'Gentle & contemplative • Otago cadence (1984)',
            memory_citation: '1974 Otago Southern Alps Expedition',
            timestamp: new Date().toISOString()
          }
        ]);
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userText = inputText;
    setInputText("");
    setIsSending(true);

    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/communion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorial_id: 'peggy-sutherland-1946',
          message: userText,
          user_name: 'Clara',
          include_audio: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        const avatarMsg: ChatMessageItem = {
          id: `avatar-${Date.now()}`,
          role: 'avatar',
          text: data.reply_text,
          memory_citation: data.memory_citations?.join(", "),
          cadence_note: data.cadence_info,
          audio_url: data.audio_base64 ? `data:audio/wav;base64,${data.audio_base64}` : undefined,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, avatarMsg]);

        // Auto play audio if provided
        if (avatarMsg.audio_url) {
          const audio = new Audio(avatarMsg.audio_url);
          audio.play().catch(() => {});
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsSending(false);
    }
  };

  const playMessageAudio = (audioUrl?: string, index?: number) => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    setActiveAudioIndex(index ?? null);
    audio.onended = () => setActiveAudioIndex(null);
    audio.play();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] w-full">
      {/* Top Presence Banner */}
      <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="/static/peggy_avatar.png" 
              alt="Margaret"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-secondary-container"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#34A853] ring-1 ring-surface-container-lowest" />
          </div>
          <div>
            <h2 className="font-headline text-base text-primary font-medium leading-none">
              Margaret "Peggy" Sutherland
            </h2>
            <span className="font-label text-[11px] text-on-surface-variant">
              In Loving Conversation
            </span>
          </div>
        </div>

        <span className="font-label text-xs text-secondary font-semibold bg-secondary-container/60 px-2.5 py-1 rounded-full">
          Otago Memory Vault
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id || idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-xs text-sm leading-relaxed ${
                  isUser
                    ? 'bg-primary text-on-primary rounded-tr-xs'
                    : 'bg-surface-container-lowest text-primary border border-outline-variant/30 rounded-tl-xs'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-outline-variant/20">
                    <span className="font-headline text-xs font-semibold text-secondary">
                      Peggy
                    </span>
                    {msg.audio_url && (
                      <button
                        onClick={() => playMessageAudio(msg.audio_url, idx)}
                        className="flex items-center gap-1 text-[11px] text-secondary font-semibold hover:underline"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {activeAudioIndex === idx ? 'pause' : 'volume_up'}
                        </span>
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                )}

                <p className={!isUser ? 'font-headline italic text-base' : 'font-body'}>
                  {msg.text}
                </p>

                {!isUser && msg.memory_citation && (
                  <div className="mt-2.5 pt-2 border-t border-outline-variant/20 flex items-center gap-1 text-[10px] text-secondary font-medium">
                    <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                    <span>Woven from: {msg.memory_citation}</span>
                  </div>
                )}
              </div>

              <span className="font-label text-[10px] text-on-surface-variant/70 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-on-surface-variant text-xs italic font-body px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce delay-100" />
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce delay-200" />
            <span>Peggy is gathering memories...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="pt-3 shrink-0">
        <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-2xl border border-outline-variant/30 shadow-xs">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Share a memory or ask Peggy a question..."
            className="flex-1 bg-transparent px-3 py-1.5 text-sm font-body text-primary placeholder:text-on-surface-variant/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
