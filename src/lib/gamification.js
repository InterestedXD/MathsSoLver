// Gamification utilities for XP and leveling system

export const GAMIFICATION_CONFIG = {
  XP_PER_CORRECT_ANSWER: 10,
  XP_PER_DAILY_CHALLENGE: 50,
  BASE_XP_FOR_LEVEL: 100,
  XP_MULTIPLIER_PER_LEVEL: 1.2,
};

export function calculateLevel(xp) {
  let level = 1;
  let xpRequired = GAMIFICATION_CONFIG.BASE_XP_FOR_LEVEL;

  while (xp >= xpRequired) {
    xp -= xpRequired;
    level++;
    xpRequired = Math.floor(GAMIFICATION_CONFIG.BASE_XP_FOR_LEVEL * Math.pow(GAMIFICATION_CONFIG.XP_MULTIPLIER_PER_LEVEL, level - 1));
  }

  return { level, xpInCurrentLevel: xp, xpToNextLevel: xpRequired };
}

export function getXPForNextLevel(level) {
  return Math.floor(GAMIFICATION_CONFIG.BASE_XP_FOR_LEVEL * Math.pow(GAMIFICATION_CONFIG.XP_MULTIPLIER_PER_LEVEL, level - 1));
}

export function awardXP(currentXP, amount) {
  return currentXP + amount;
}

export function saveUserProgress(xp, level) {
  localStorage.setItem('userXP', xp.toString());
  localStorage.setItem('userLevel', level.toString());
}

export function loadUserProgress() {
  const xp = parseInt(localStorage.getItem('userXP') || '0');
  const level = parseInt(localStorage.getItem('userLevel') || '1');
  return { xp, level };
}
