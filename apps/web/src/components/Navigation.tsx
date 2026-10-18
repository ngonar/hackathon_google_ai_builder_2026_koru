'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Sanctuary', href: '/', icon: 'home' },
    { label: 'Communion', href: '/communion', icon: 'videocam', highlight: true },
    { label: 'Studio', href: '/studio', icon: 'graphic_eq' },
    { label: 'Chat', href: '/chat', icon: 'forum' },
    { label: 'Life Story', href: '/life-story', icon: 'auto_stories' },
    { label: 'Tributes', href: '/tribute', icon: 'favorite' },
  ];

  if (pathname === '/register') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-outline-variant/30 py-2 px-3 safe-area-pb">
      <div className="max-w-md sm:max-w-xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                item.highlight && !isActive
                  ? 'text-primary font-medium hover:bg-secondary-container/40'
                  : isActive
                  ? 'text-primary font-bold bg-secondary-container/60 shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span 
                className={`material-symbols-outlined text-[22px] ${
                  isActive ? 'text-primary' : 'text-secondary'
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="font-label text-[11px] tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
