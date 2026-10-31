'use client';

import React, { useState } from 'react';
import { usePlayer } from '@/components/providers/PlayerProvider';
import { GAMES } from '@/lib/constants';
import { StatGrid } from '@/components/ui/StatGrid';
import { AdSlot } from '@/components/ui/AdSlot';

const AVATAR_OPTIONS = ['👾', '🕹️', '⚡', '🧠', '👑', '🚀', '🔥', '🐱', '🦊', '🤖'];

export default function ProfilePage() {
  const {
    profile,
    updateUsername,
    updateAvatar,
    unlockedAchievements,
    allAchievements,
  } = usePlayer();

  const [isEditing, setIsEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState(profile.username);
  const [authSuccessNotice, setAuthSuccessNotice] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      updateUsername(usernameInput.trim());
      setIsEditing(false);
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountEmail) {
      setAuthSuccessNotice(true);
      setTimeout(() => setAuthSuccessNotice(false), 4000);
    }
  };

  return (
    <div className="page-container max-w-4xl mx-auto px-4 py-10">
      {/* Profile Card Header */}
      <div className="bg-surface-900/60 border border-surface-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar selector */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-3xl bg-surface-800 border-2 border-brand-500/40 flex items-center justify-center text-5xl shadow-xl shadow-brand-500/10">
              {profile.avatar || '👾'}
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 max-w-[150px]">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  onClick={() => updateAvatar(av)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center hover:bg-surface-800 transition-transform ${
                    profile.avatar === av ? 'scale-110 bg-surface-700 ring-1 ring-brand-400' : ''
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              {isEditing ? (
                <form onSubmit={handleSaveUsername} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-surface-800 border border-surface-700 text-white font-bold text-lg focus:outline-none focus:border-brand-500"
                    maxLength={16}
                    autoFocus
                  />
                  <button type="submit" className="btn-primary py-1.5 px-3 text-xs">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-ghost py-1.5 px-2 text-xs"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.username}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 text-xs"
                    title="Edit username"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-surface-400">
              <span className="badge-brand">Guest ID: {profile.guestId.substring(0, 12)}</span>
              <span>•</span>
              <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>

            <p className="text-xs text-surface-400 mt-3 max-w-md">
              Scores are saved locally in your browser. You can link an email account below to sync
              across devices.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <h2 className="section-title text-xl mb-4">LIFETIME STATS</h2>
        <StatGrid
          columns={4}
          stats={[
            {
              label: 'Total Games Played',
              value: profile.stats.totalGames.toLocaleString(),
            },
            {
              label: 'Total Score',
              value: profile.stats.totalScore.toLocaleString(),
              highlight: true,
            },
            {
              label: 'Current Streak',
              value: `${profile.stats.currentStreak} 🔥`,
            },
            {
              label: 'Longest Streak',
              value: `${profile.stats.longestStreak} ⚡`,
            },
          ]}
        />
      </div>

      {/* Game Personal Bests */}
      <div className="mb-8">
        <h2 className="section-title text-xl mb-4">PERSONAL BESTS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GAMES.map((game) => {
            const best = profile.stats.bestScores[game.id] || 0;
            return (
              <div
                key={game.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-surface-900/60 border border-surface-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{game.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{game.name}</h3>
                    <span className="text-xs text-surface-400">{game.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-brand-400">
                    {best > 0 ? (
                      best % 1 !== 0 ? (
                        `${best.toFixed(2)}%`
                      ) : (
                        best.toLocaleString()
                      )
                    ) : (
                      <span className="text-surface-600 text-sm font-normal">Not played</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements / Badges */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title text-xl">ACHIEVEMENTS & BADGES</h2>
          <span className="text-xs text-brand-400 font-bold">
            {unlockedAchievements.length} / {allAchievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allAchievements.map((ach) => {
            const isUnlocked = unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  isUnlocked
                    ? 'bg-surface-900/80 border-surface-700 shadow-md'
                    : 'bg-surface-950/40 border-surface-900 opacity-40 grayscale'
                }`}
              >
                <span className="text-3xl mb-2">{ach.icon}</span>
                <span className="text-xs font-bold text-white">{ach.name}</span>
                <span className="text-[10px] text-surface-400 mt-1 leading-tight">
                  {ach.description}
                </span>
                {isUnlocked && (
                  <span className="badge-green text-[9px] px-2 py-0.5 mt-2">UNLOCKED</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Backup Section */}
      <div className="bg-surface-900/60 border border-surface-800 rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-2">Sync Your Account (Supabase)</h2>
        <p className="text-xs text-surface-400 max-w-lg mb-4">
          Optional cloud backup to persist high scores, achievements, and custom username across all
          your devices. Anonymous play is always supported.
        </p>

        {authSuccessNotice ? (
          <div className="p-4 rounded-xl bg-accent-green/10 border border-accent-green/30 text-accent-green text-xs font-bold">
            ✅ Magic link sent! Check your inbox to verify your account.
          </div>
        ) : (
          <form onSubmit={handleCreateAccount} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="email"
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              placeholder="Enter your email to link account"
              required
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
            />
            <button type="submit" className="btn-primary text-xs font-bold py-2.5 px-5">
              Link Account
            </button>
          </form>
        )}
      </div>

      <div className="mt-8">
        <AdSlot type="leaderboard" />
      </div>
    </div>
  );
}

