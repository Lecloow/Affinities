import type {
  User,
  Hint,
  LeaderboardEntry,
  Guess,
  UserStats,
  Candidate,
  RevealCode,
  UserID,
  Match
} from "../services/types";

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const DEMO_USER: User = {
  id: "999",
  firstName: "User",
  lastName: "Demo",
  email: "dev.demo@example.com",
  class: "DemoClass"
};

const state = {
  points: 0,
  guesses: [] as Guess[],

  candidates: [
    { id: "101", firstName: "Alice", lastName: "Dupont" },
    { id: "102", firstName: "Bob", lastName: "Martin" },
    { id: "103", firstName: "Charlie", lastName: "Durand" }
  ] as Candidate[],

  correctByDay: {
    1: "101",
    2: "102"
  } as Record<number, UserID>
};

export class DemoApiService {

  static async login(): Promise<User> {
    await delay(150);
    return DEMO_USER;
  }

  static async logout(): Promise<void> {
    await delay(50);
  }

  static async getCandidates(): Promise<Candidate[]> {
    await delay(80);
    return state.candidates;
  }

  static async getMatches(): Promise<Match[]> {
    await delay(80);

    return [
      {
        id: 1,
        userId: "999",
        day: 1,
        firstName: "Alice",
        lastName: "Dupont",
        revealTime: new Date().toISOString(),
        revealed: false
      }
    ];
  }

  static async getHints(): Promise<Hint[]> {
    await delay(80);

    return [
      {
        id: "1",
        userId: "999",
        day: 1,
        hintNumber: 1,
        difficulty: "easy",
        content: "Prénom 6 lettres",
        revealTime: new Date().toISOString(),
        revealed: false
      },
      {
        id: "2",
        userId: "999",
        day: 1,
        hintNumber: 2,
        difficulty: "easy",
        content: "Prénom 6 lettres",
        revealTime: new Date().toISOString(),
        revealed: false
      }
    ];
  }

  static async revealAllHints(): Promise<{ success: boolean; message: string }> {
    await delay(80);
    return { success: true, message: "demo" };
  }

  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    await delay(80);
    return [];
  }

  static async getUserStats(): Promise<UserStats> {
    await delay(80);

    return {
      userId: "999",
      totalPoints: state.points,
      bonusPoints: 0,
      guesses: state.guesses,
      pointsForNextGuess: 100
    };
  }

  static async getRevealCode(): Promise<RevealCode[]> {
    await delay(80);

    return [{
      code: "DEMO",
      exchanged: false,
      partnerExchanged: false
    }];
  }

  static async exchangeRevealCode(): Promise<{ success: boolean }> {
    await delay(80);
    return { success: true };
  }

  static async guess(hintNumber: number, guessedUserId: UserID): Promise<Guess> {
    await delay(120);

    const isCorrect = state.correctByDay[1] === guessedUserId;

    const guess: Guess = {
      id: state.guesses.length + 1,
      userId: "999",
      day: 1,
      hintNumber,
      guessedUserId,
      isCorrect,
      createdAt: new Date().toISOString()
    };

    state.guesses.push(guess);

    if (isCorrect) state.points += 100;

    return guess;
  }
}