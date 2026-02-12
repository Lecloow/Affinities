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

export interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  currentClass: string;
}

export interface CandidatesResponse {
  candidates: Candidate[];
}

export interface GuessResponse {
  success: boolean;
  is_correct: boolean;
  points_earned: number;
  hint_number: number;
  message: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  first_name: string;
  last_name: string;
  currentClass: string;
  total_points: number;
  code_exchange_bonus: number;
  updated_at: string | null;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

export interface RevealCodeResponse {
  available: boolean;
  code?: string;
  exchanged?: boolean;
  both_exchanged?: boolean;
  message?: string;
}

export interface ExchangeCodeResponse {
  success: boolean;
  points_earned: number;
  message: string;
}

export interface UserGuess {
  day: number;
  hint_number: number;
  guessed_user_id: string;
  hints_revealed: number;
  points_earned: number;
  is_correct: boolean;
  created_at: string | null;
}

export interface UserStatsResponse {
  user_id: string;
  total_points: number;
  code_exchange_bonus: number;
  guesses: UserGuess[];
}