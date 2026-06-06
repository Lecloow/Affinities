export type UserID = string

export interface User {
  id: UserID;
  firstName: string;
  lastName: string;
  email: string;
  class: string;
}

export interface UserStats {
  userId: UserID;
  totalPoints: number;
  bonusPoints: number;
  guesses: Guess[];
}

export interface Hint {
  id: string;
  userId: UserID;
  day: number;
  hintNumber: number;
  difficulty: string;
  type: string;
  content: string;
  revealTime: string;
  revealed: boolean;
}

export interface Candidate {
  id: UserID;
  firstName: string;
  lastName: string;
}

export interface Match {
  id: number;
  userId: UserID;
  day: number;
  firstName: string;
  lastName: string;
  revealTime: string;
  revealed: boolean;
}

export interface Guess {
  id: number;
  userId: UserID;
  day: number;
  hintNumber: number;
  guessedUserId: UserID;
  isCorrect: boolean;
  pointsEarned: number;
  createdAt: string;
}

export interface UserStats {
  userId: UserID;
  totalPoints: number;
  bonusPoints: number;
  guesses: Guess[];
  pointsForNextGuess: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: UserID;
  firstName: string;
  lastName: string;
  class: string;
  totalPoints: number;
  bonusPoints: number;
  updatedAt: string | null;
}

export interface RevealCode {
  code: string;
  exchanged: boolean;
  partnerExchanged: boolean;
}