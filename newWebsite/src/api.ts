import { User, Hint, LeaderboardEntry, UserStats, Candidate, RevealCode} from './types';

const API_BASE_URL = "http://localhost:8080".replace(/\/$/, '') //import.meta.env.VITE_API_BASE_URL;

export class ApiService {
  private static async request(url: string, options?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}/${url.replace(/^\//, '')}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options?.headers,
      },
    });

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  static async login(password: string): Promise<User> {
    return this.request(`/login`, {
      method: 'POST',
      body: new URLSearchParams({ password }).toString(),
    })
  }

  static async getCandidates(): Promise<Candidate[]> {
    return this.request(`/me/candidates`);
  }

  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.request(`/leaderboard`);
  }

  static async getUserStats(): Promise<UserStats> {
    return this.request(`/me/stats`);
  }

  static async getHints(): Promise<Hint[]> {
    return this.request(`/me/hints`)
  }

  static async getRevealCode(day: number): Promise<RevealCode> {
    return this.request(`/me/code/${day}`);
  }

  static async RevealHint(day: number, hintNumber: number): Promise<{ success: boolean }> {
    return this.request(`/me/hints/${day}/${hintNumber}/reveal`, {
      method: 'POST',
    });
  }

  static async RevealAllHints(day: number): Promise<{ success: boolean; message: string }> {
    return this.request(`/me/hints/${day}/reveal-all`, {
      method: 'POST',
    });
  }
}