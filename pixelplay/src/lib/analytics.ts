import type { GameId } from '@/types';

// ─── Analytics Stubs ─────────────────────────────────────────────────────────
//
// No-op implementations. Structured for easy integration with a real analytics
// service (Mixpanel, PostHog, GA4, etc.) later.

/* eslint-disable @typescript-eslint/no-unused-vars */

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    // Uncomment for dev debugging:
    // console.log('[Analytics]', name, properties);
  }
}

export function trackGameStart(gameId: GameId): void {
  trackEvent('game_start', { gameId });
}

export function trackGameEnd(gameId: GameId, score: number, durationMs: number): void {
  trackEvent('game_end', { gameId, score, durationMs });
}

export function trackShare(gameId: GameId, method: 'web-share' | 'clipboard' | 'failed'): void {
  trackEvent('share', { gameId, method });
}

export function trackDailyChallenge(gameId: GameId, score: number): void {
  trackEvent('daily_challenge', { gameId, score });
}

export function trackPageView(page: string): void {
  trackEvent('page_view', { page });
}

/* eslint-enable @typescript-eslint/no-unused-vars */
