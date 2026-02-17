import { LoginResponse, ApiError, HintsResponse, CandidatesResponse, GuessResponse, LeaderboardResponse, RevealCodeResponse, ExchangeCodeResponse, UserStatsResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Demo user + mutable mock data used when running without a backend or when password === 'demo'
export const DEMO_USER: LoginResponse = {
  id: 999,
  first_name: 'Dev',
  last_name: 'Demo',
  email: 'dev.demo@example.com',
  currentClass: 'DemoClass'
};

// Mutable demo state so reveal/guess actions persist for the session
const DEMO_STATE = {
  hints: [
    {
      day: 1,
      reveal_time: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // loin dans le futur
      match_revealed: false,
      match_info: null as any,
      hints: [
        { id: 'd1h1', type: 'text', content: 'Son prénom contient 6 lettres', available: true, revealed: false, drop_time: new Date().toISOString() },
        { id: 'd1h2', type: 'text', content: 'Son prénom commence par la lettre : A', available: false, revealed: false, drop_time: new Date().toISOString() },
        { id: 'd1h3', type: 'text', content: 'Il/Elle est dans la classe: TD1', available: false, revealed: false, drop_time: new Date().toISOString() }
      ]
    },
    {
      day: 2,
      reveal_time: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      match_revealed: false,
      match_info: null as any,
      hints: [
        { id: 'd2h1', type: 'text', content: 'Son nom contient 2 lettres', available: true, revealed: false, drop_time: new Date().toISOString() },
        { id: 'd2h2', type: 'text', content: 'Son nom commence par: M', available: false, revealed: false, drop_time: new Date().toISOString() },
        { id: 'd2h3', type: 'text', content: 'Son prénom est: Bob', available: false, revealed: false, drop_time: new Date().toISOString() }
      ]
    }
  ] as any[],

  candidates: [
    { id: '101', first_name: 'Alice', last_name: 'Dupont', currentClass: 'TD1' },
    { id: '102', first_name: 'Bob', last_name: 'Martin', currentClass: 'TD2' },
    { id: '103', first_name: 'Charlie', last_name: 'Durand', currentClass: 'TD3' }
  ] as CandidatesResponse['candidates'],

  correctMatchByDay: { 1: '101', 2: '102' } as Record<number, string>,

  matchInfoByDay: {
    1: { first_name: 'Alice', last_name: 'Dupont', class: 'TD1' },
    2: { first_name: 'Bob', last_name: 'Martin', class: 'TD2' }
  } as Record<number, any>,

  stats: {
    '999': { user_id: '999', total_points: 0, code_exchange_bonus: 0, guesses: [] as any[] }
  } as Record<string, UserStatsResponse>
};

export const isDemoMode = (): boolean => {
  // If no API URL is configured we assume demo mode (static hosting) OR explicit demo password
  return !API_BASE_URL;
};

export class ApiService {
  // helper centralisé pour fetch + gestion d'erreur
  private static async request(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
      });

      const text = await response.text();

      if (response.ok) {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }

      // erreur
      let message: string;
      try {
        const data = JSON.parse(text);
        message = data?.detail || data?.message || `Erreur ${response.status}`;
      } catch {
        message = text || `Erreur ${response.status}`;
      }

      throw { status: response.status, message } as ApiError;

    } catch (err: any) {
      if (err instanceof Error) {
        throw { status: 0, message: err.message } as ApiError;
      }
      throw err;
    }
  }


  static async login(password: string): Promise<LoginResponse> {
    // If API not configured or explicit demo password used - return demo user
    if (isDemoMode() || password === 'demo') {
      // small delay to simulate network
      await new Promise((r) => setTimeout(r, 200));
      // reset demo state on fresh login so demo starts clean
      DEMO_STATE.stats['999'] = { user_id: '999', total_points: 0, code_exchange_bonus: 0, guesses: [] };
      // reset hint reveals to initial state
      DEMO_STATE.hints.forEach(dayEntry => {
        dayEntry.match_revealed = false;
        dayEntry.match_info = null;
        dayEntry.reveal_time = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        dayEntry.hints.forEach((h: any, i: number) => {
          h.revealed = false;
          h.available = i === 0; // seulement le premier dispo au départ
        });
      });
      DEMO_STATE.stats['999'] = { user_id: '999', total_points: 0, code_exchange_bonus: 0, guesses: [] };
      return DEMO_USER;
    }

    const formData = new FormData();
    formData.append('password', password);
    return this.request(`${API_BASE_URL}/login`, { method: 'POST', body: formData });
  }

  static async getHints(userId: string): Promise<HintsResponse> {
    if (isDemoMode() || userId === '999' || userId === 999) {
      await new Promise((r) => setTimeout(r, 100));
      return { days: DEMO_STATE.hints } as HintsResponse;
    }
    return this.request(`${API_BASE_URL}/hints/${userId}`);
  }

  static async revealHint(userId: string, day: number, hintNumber: number): Promise<void> {
    if (isDemoMode() || userId === '999' || userId === 999) {
      await new Promise((r) => setTimeout(r, 150));
      const dayEntry = DEMO_STATE.hints.find(d => d.day === day);
      if (!dayEntry) return;
      const idx = hintNumber - 1;
      const hint = dayEntry.hints[idx];
      if (hint && hint.available && !hint.revealed) {
        hint.revealed = true;
      }
      return;
    }
    return this.request(`${API_BASE_URL}/hints/reveal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, day, hint_number: hintNumber }),
    });
  }

  static async revealAllHints(userId: string, day: number) {
    if (isDemoMode() || userId === '999' || userId === 999) {
      await new Promise((r) => setTimeout(r, 150));
      const dayEntry = DEMO_STATE.hints.find(d => d.day === day);
      if (!dayEntry) return { revealed_count: 0 };

      // Trouve le prochain indice non-révélé disponible
      const nextHint = dayEntry.hints.find((h: any) => h.available && !h.revealed);
      if (nextHint) {
        nextHint.revealed = true;
        // Rend le suivant disponible
        const idx = dayEntry.hints.indexOf(nextHint);
        if (idx + 1 < dayEntry.hints.length) {
          dayEntry.hints[idx + 1].available = true;
        }
        return { revealed_count: 1 };
      }

      // Tous les indices révélés → révèle le match
      if (dayEntry.hints.every((h: any) => h.revealed) && !dayEntry.match_revealed) {
        dayEntry.match_revealed = true;
        dayEntry.match_info = DEMO_STATE.matchInfoByDay[day];
        dayEntry.reveal_time = new Date().toISOString(); // passe dans le passé
        return { revealed_count: 0 };
      }

      return { revealed_count: 0 };
    }
    return this.request(`${API_BASE_URL}/hints/reveal-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, day }),
    });
  }


  static async getCandidates(userId: string): Promise<CandidatesResponse> {
    if (isDemoMode() || userId === '999' || userId === 999) {
      await new Promise((r) => setTimeout(r, 100));
      return { candidates: DEMO_STATE.candidates } as CandidatesResponse;
    }
    return this.request(`${API_BASE_URL}/candidates/${userId}`);
  }

  static async submitGuess(userId: string, day: number, hintNumber: number, guessedUserId: string): Promise<GuessResponse> {
    if (isDemoMode() || userId === '999' || userId === 999) {
      await new Promise((r) => setTimeout(r, 200));

      const correctId = DEMO_STATE.correctMatchByDay[day];
      const isCorrect = String(guessedUserId) === String(correctId);
      const pointsMap: Record<number, number> = { 1: 100, 2: 75, 3: 50 };
      const pointsEarned = isCorrect ? (pointsMap[hintNumber] || 0) : 0;

      // update stats
      const stats = DEMO_STATE.stats['999'];
      const guessRecord = {
        day,
        hint_number: hintNumber,
        guessed_user_id: String(guessedUserId),
        hints_revealed: DEMO_STATE.hints.find(d => d.day === day)?.hints.filter(h => h.revealed).length || 0,
        points_earned: pointsEarned,
        is_correct: isCorrect,
        created_at: new Date().toISOString()
      };
      stats.guesses.push(guessRecord as any);
      if (isCorrect) stats.total_points += pointsEarned;

      return {
        success: true,
        is_correct: isCorrect,
        message: isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse, réessaie avec un autre indice',
        points_earned: pointsEarned
      } as any;
    }

    return this.request(`${API_BASE_URL}/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, day, hint_number: hintNumber, guessed_user_id: guessedUserId }),
    });
  }

  static async getLeaderboard(): Promise<LeaderboardResponse> {
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 100));
      return { entries: [] } as any;
    }
    return this.request(`${API_BASE_URL}/leaderboard`);
  }

  static async getRevealCode(userId: string, day: number): Promise<RevealCodeResponse> {
    if (isDemoMode() || userId === '999' || userId === 999) {
      await new Promise((r) => setTimeout(r, 100));
      return { code: 'DEMO-CODE-123', available: true, exchanged: false, both_exchanged: false } as any;
    }
    return this.request(`${API_BASE_URL}/reveal-code/${userId}/${day}`);
  }

  static async exchangeCode(userId: string, day: number, partnerCode: string): Promise<ExchangeCodeResponse> {
    if (isDemoMode() || userId === '999' || userId === 999) {
      await new Promise((r) => setTimeout(r, 100));
      // simulate success
      return { success: true } as any;
    }
    return this.request(`${API_BASE_URL}/exchange-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, day, partner_code: partnerCode }),
    });
  }

  static async getUserStats(userId: string): Promise<UserStatsResponse> {
    if (isDemoMode() || userId === '999' || userId === 999) {
      await new Promise((r) => setTimeout(r, 100));
      return DEMO_STATE.stats['999'];
    }
    return this.request(`${API_BASE_URL}/user-stats/${userId}`);
  }
}
