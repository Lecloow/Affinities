import { LoginResponse, ApiError, HintsResponse, CandidatesResponse, GuessResponse, LeaderboardResponse, RevealCodeResponse, ExchangeCodeResponse, UserStatsResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiService {
  // helper centralisé pour fetch + gestion d'erreur
  private static async request(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return await response.json(); // ✅ succès
      }

      // erreur : on essaye de parser JSON sinon texte
      let message: string;
      try {
        const data = await response.json();
        message = data?.detail || data?.message || `Erreur ${response.status}`;
      } catch {
        message = await response.text() || `Erreur ${response.status}`;
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
    const formData = new FormData();
    formData.append('password', password);
    return this.request(`${API_BASE_URL}/login`, { method: 'POST', body: formData });
  }

  static async getHints(userId: string): Promise<HintsResponse> {
    return this.request(`${API_BASE_URL}/hints/${userId}`);
  }

  static async revealHint(userId: string, day: number, hintNumber: number): Promise<void> {
    return this.request(`${API_BASE_URL}/hints/reveal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, day, hint_number: hintNumber }),
    });
  }

  static async revealAllHints(userId: string, day: number) {
    return this.request(`${API_BASE_URL}/hints/reveal-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, day }),
    });
  }

  static async getCandidates(userId: string): Promise<CandidatesResponse> {
    return this.request(`${API_BASE_URL}/candidates/${userId}`);
  }

  static async submitGuess(userId: string, day: number, hintNumber: number, guessedUserId: string): Promise<GuessResponse> {
    return this.request(`${API_BASE_URL}/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, day, hint_number: hintNumber, guessed_user_id: guessedUserId }),
    });
  }

  static async getLeaderboard(): Promise<LeaderboardResponse> {
    return this.request(`${API_BASE_URL}/leaderboard`);
  }

  static async getRevealCode(userId: string, day: number): Promise<RevealCodeResponse> {
    return this.request(`${API_BASE_URL}/reveal-code/${userId}/${day}`);
  }

  static async exchangeCode(userId: string, day: number, partnerCode: string): Promise<ExchangeCodeResponse> {
    return this.request(`${API_BASE_URL}/exchange-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, day, partner_code: partnerCode }),
    });
  }

  static async getUserStats(userId: string): Promise<UserStatsResponse> {
    return this.request(`${API_BASE_URL}/user-stats/${userId}`);
  }
}

