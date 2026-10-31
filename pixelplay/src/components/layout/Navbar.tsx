'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSound } from '@/components/providers/SoundProvider';
import { usePlayer } from '@/components/providers/PlayerProvider';

export function Navbar() {
  const pathname = usePathname();
  const { isMuted, toggleMute } = useSound();
  const { profile } = usePlayer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Games', href: '/games' },
    { label: 'Daily Challenge', href: '/daily' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Profile', href: '/profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-950/80 backdrop-blur-md border-b border-surface-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group font-black tracking-wider text-xl"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 via-brand-600 to-accent-purple flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <span className="w-3.5 h-3.5 bg-white rounded-sm transform rotate-45 group-hover:rotate-90 transition-transform duration-300"></span>
            </div>
            <span className="text-white font-extrabold tracking-tight">
              PIXEL<span className="text-brand-400">PLAY</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-surface-800 text-white font-semibold shadow-inner'
                      : 'text-surface-300 hover:text-white hover:bg-surface-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right utility buttons */}
          <div className="flex items-center gap-3">
            {/* Sound toggle button */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-surface-900 hover:bg-surface-800 border border-surface-800 text-surface-300 hover:text-white transition-colors"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? (
                <span className="text-base select-none">🔇</span>
              ) : (
                <span className="text-base select-none">🔊</span>
              )}
            </button>

            {/* Quick Profile Pill */}
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-900 hover:bg-surface-800 border border-surface-800 transition-colors"
            >
              <span className="text-base">{profile.avatar || '👾'}</span>
              <span className="text-xs font-semibold text-surface-200 max-w-[100px] truncate">
                {profile.username || 'Guest'}
              </span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-surface-900 text-surface-300 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-950 border-b border-surface-800 px-4 pt-2 pb-5 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-surface-300 hover:text-white hover:bg-surface-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

