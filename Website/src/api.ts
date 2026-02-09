import { LoginResponse, ApiError, HintsResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiService {
  static async login(password: string): Promise<LoginResponse> {
    try {
      const formData = new FormData();
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        body: formData,  // Pas de Content-Type, FormData le gère automatiquement
      });

      if (!response.ok) {
        const text = await response.text();
        throw {
          status: response.status,
          message: text || `Erreur ${response.status}`,
        } as ApiError;
      }

      const data = (await response.json()) as LoginResponse;
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw {
          status: 0,
          message: error.message,
        } as ApiError;
      }
      throw error;
    }
  }

  static async getHints(userId: string): Promise<HintsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/hints/${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const text = await response.text();
        throw {
          status: response.status,
          message: text || `Erreur ${response.status}`,
        } as ApiError;
      }

      const data = (await response.json()) as HintsResponse;
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw {
          status: 0,
          message: error.message,
        } as ApiError;
      }
      throw error;
    }
  }

  static async revealHint(userId: string, day: number, hintNumber: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/hints/reveal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          day: day,
          hint_number: hintNumber,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw {
          status: response.status,
          message: text || `Erreur ${response.status}`,
        } as ApiError;
      }

      await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw {
          status: 0,
          message: error.message,
        } as ApiError;
      }
      throw error;
    }
  }

  static async revealAllHints(userId: string, day: number): Promise<{revealed_count: number}> {
    try {
      const response = await fetch(`${API_BASE_URL}/hints/reveal-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          day: day,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw {
          status: response.status,
          message: text || `Erreur ${response.status}`,
        } as ApiError;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw {
          status: 0,
          message: error.message,
        } as ApiError;
      }
      throw error;
    }
  }
}