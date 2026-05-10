import {User, Hint, LeaderboardEntry, Guess, UserStats, Candidate, RevealCode, UserID} from './types';

const API_BASE_URL = "http://localhost:8080".replace(/\/$/, '') //import.meta.env.VITE_API_BASE_URL;

export class ApiService {
  private static async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/${url.replace(/^\//, '')}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  static async login(password: string): Promise<User> {
    return this.request(`/login`, {
      method: 'POST',
      body: JSON.stringify({ password }),
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

  static async revealHint(day: number, hintNumber: number): Promise<{ success: boolean }> {
    return this.request(`/me/hints/${day}/${hintNumber}/reveal`, {
      method: 'POST',
    });
  }

  static async revealAllHints(day: number): Promise<{ success: boolean; message: string }> {
    return this.request(`/me/hints/${day}/reveal-all`, {
      method: 'POST',
    });
  }

  static async getRevealCode(day: number): Promise<RevealCode> {
    return this.request(`/me/code/${day}`);
  }

  static async exchangeRevealCode(day: number, code: string): Promise<{ success: boolean }> {
    return this.request(`/me/code/${day}/exchange`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  static async guess(day: number, hintNumber: number, guessedUser: UserID): Promise<Guess> {
    return this.request(`/me/guess`, {
      method: 'POST',
      body: JSON.stringify({ day, hintNumber, guessedUserId: guessedUser }),
    });
  }
}