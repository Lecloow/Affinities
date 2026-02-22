export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  currentClass: string;
}

export interface Hint {
  id: string;
  type: string;
  content: string | null;
  available: boolean;
  revealed: boolean;
  drop_time: string;
}

export interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  currentClass: string;
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