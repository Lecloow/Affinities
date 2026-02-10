/**
 * Interface représentant un utilisateur
 */
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  currentClass: string;
}

export interface LoginResponse extends User {}

export interface ApiError {
  status: number;
  message: string;
}

export interface Hint {
  id: string;
  type: string;
  content: string | null;
  available: boolean;
  revealed: boolean;
  drop_time: string;
}

export interface MatchInfo {
  first_name: string;
  last_name: string;
  class: string;
}

export interface DayHints {
  day: number;
  date: string;
  hints: Hint[];
  reveal_time: string;
  match_revealed: boolean;
  match_info: MatchInfo | null;
}

export interface HintsResponse {
  days: DayHints[];
}