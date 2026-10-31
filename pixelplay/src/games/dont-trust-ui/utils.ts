export const SUCCESS_MESSAGES = [
  'Okay, you got me.',
  'Not bad, human.',
  'You are learning.',
  "I'll get you next time.",
  'Lucky guess... right?',
  "You're smarter than you look.",
  'Fine. You win this one.',
  'Level 10? Respect.',
  'Sharp eyes!',
  'You saw right through that.',
];

export const FAILURE_MESSAGES = [
  'Nice try.',
  'You trusted me?',
  'That was definitely not the button.',
  'Did you even read the instructions?',
  'The UI sends its regards.',
  'Classic mistake.',
  'I literally told you not to.',
  'Rule #1: NEVER trust the button color.',
  'Bamboozled again!',
  'Trust issues loading...',
];

export function getRandomSuccessMessage(): string {
  return SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
}

export function getRandomFailureMessage(): string {
  return FAILURE_MESSAGES[Math.floor(Math.random() * FAILURE_MESSAGES.length)];
}

export function calculateScore(reactionTimeMs: number, streak: number): number {
  const base = 100;
  const speedBonus = reactionTimeMs < 2000 ? 1.5 : reactionTimeMs < 4000 ? 1.2 : 1.0;
  const streakMultiplier = 1 + Math.min(streak, 10) * 0.15;
  return Math.round(base * speedBonus * streakMultiplier);
}

