// Client and Server Daily Rate Limiter for LBSA AI Agent

const DAILY_LIMIT = 20;

export interface RateLimitResult {
  allowed: boolean;
  used: number;
  remaining: number;
  limit: number;
  resetDate: string;
}

export function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function getAIRateLimitStatus(userId: string = "guest"): RateLimitResult {
  if (typeof window === "undefined") {
    return { allowed: true, used: 0, remaining: DAILY_LIMIT, limit: DAILY_LIMIT, resetDate: getTodayKey() };
  }

  try {
    const today = getTodayKey();
    const storageKey = `lbsa_ai_usage_${userId}_${today}`;
    const raw = localStorage.getItem(storageKey);
    const used = raw ? parseInt(raw, 10) : 0;

    return {
      allowed: used < DAILY_LIMIT,
      used,
      remaining: Math.max(0, DAILY_LIMIT - used),
      limit: DAILY_LIMIT,
      resetDate: today,
    };
  } catch {
    return { allowed: true, used: 0, remaining: DAILY_LIMIT, limit: DAILY_LIMIT, resetDate: getTodayKey() };
  }
}

export function incrementAIRateLimit(userId: string = "guest"): RateLimitResult {
  if (typeof window === "undefined") {
    return { allowed: true, used: 1, remaining: DAILY_LIMIT - 1, limit: DAILY_LIMIT, resetDate: getTodayKey() };
  }

  try {
    const today = getTodayKey();
    const storageKey = `lbsa_ai_usage_${userId}_${today}`;
    const currentStatus = getAIRateLimitStatus(userId);

    if (!currentStatus.allowed) {
      return currentStatus;
    }

    const newUsed = currentStatus.used + 1;
    localStorage.setItem(storageKey, String(newUsed));

    return {
      allowed: newUsed < DAILY_LIMIT,
      used: newUsed,
      remaining: Math.max(0, DAILY_LIMIT - newUsed),
      limit: DAILY_LIMIT,
      resetDate: today,
    };
  } catch {
    return { allowed: true, used: 1, remaining: DAILY_LIMIT - 1, limit: DAILY_LIMIT, resetDate: getTodayKey() };
  }
}
