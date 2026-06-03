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

let tokenData: { expiresAt: number } | null = null;

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

const matches: Match[] = [
  {
    id: 1,
    userId: "101",
    day: 1,
    firstName: "Alice",
    lastName: "Dupont",
    revealTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    revealed: false
  },
  {
    id: 2,
    userId: "102",
    day: 1,
    firstName: "Bob",
    lastName: "Martin",
    revealTime: new Date(Date.now() +  3 * 60 * 60 * 1000).toISOString(),
    revealed: false
  }
];

const hints: Hint[] = [
  {
    id: "1",
    userId: "999",
    day: 1,
    hintNumber: 1,
    difficulty: "easy",
    content: "Prénom 6 lettres",
    revealTime: new Date(Date.now() - 1000).toISOString(),
    revealed: false
  },
  {
    id: "2",
    userId: "999",
    day: 1,
    hintNumber: 2,
    difficulty: "easy",
    content: "Prénom 6 lettres",
    revealTime: new Date(Date.now() +  60 * 60 * 1000).toISOString(),
    revealed: false
  },
  {
    id: "3",
    userId: "999",
    day: 1,
    hintNumber: 3,
    difficulty: "easy",
    content: "Prénom 6 lettres",
    revealTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    revealed: false
  },
  {
    id: "4",
    userId: "999",
    day: 2,
    hintNumber: 1,
    difficulty: "easy",
    content: "Prénom 6 lettres",
    revealTime: new Date(Date.now() - 1000).toISOString(),
    revealed: false
  },
  {
    id: "5",
    userId: "999",
    day: 2,
    hintNumber: 2,
    difficulty: "easy",
    content: "Prénom 6 lettres",
    revealTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    revealed: false
  },
  {
    id: "6",
    userId: "999",
    day: 2,
    hintNumber: 3,
    difficulty: "easy",
    content: "Prénom 6 lettres",
    revealTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    revealed: false
  },
];

const revealCode: RevealCode[] = [
  {
    code: "DEMO",
    exchanged: false,
    partnerExchanged: false
  },
  {
    code: "Test",
    exchanged: false,
    partnerExchanged: false
  }
];

export class DemoApiService {

  static async login(): Promise<User> {
    await delay(150);

    tokenData = { expiresAt: Date.now() + 30 * 60 * 1000 };

    return DEMO_USER;
  }

  static async logout(): Promise<void> {
    tokenData = null;
  }

  private static isTokenValid(): boolean {
    if (!tokenData) return false;
    return Date.now() < tokenData.expiresAt;
  }

  private static requireAuth() {
    if (!this.isTokenValid()) {
      tokenData = null;
      const error = new Error("UNAUTHORIZED");
      (error as any).statusCode = 401;
      throw error;
    }
  }

  static async getUserStats(): Promise<UserStats> {
    await delay(80);

    this.requireAuth();

    return {
      userId: "999",
      totalPoints: state.points,
      bonusPoints: 0,
      guesses: state.guesses,
      pointsForNextGuess: 100
    };
  }

  static async getCandidates(): Promise<Candidate[]> {
    await delay(80);
    this.requireAuth();
    return state.candidates;
  }

  static async getMatches(): Promise<Match[]> {
    await delay(80);
    this.requireAuth();
    return matches;
  }

  static async getHints(): Promise<Hint[]> {
    await delay(80);
    this.requireAuth();

    return hints
  }

  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    await delay(80);
    this.requireAuth();
    return [];
  }

  static async getRevealCode(): Promise<RevealCode[]> {
    await delay(80);
    this.requireAuth();

    return revealCode
  }

  static async revealAllHints(day: number): Promise<{ day: number; hintsRevealed: number[] }> {
    await delay(80);
    this.requireAuth();

    const now = Date.now();
    const dayHints = hints.filter(h => h.day === day);

    const hintsRevealed: number[] = [];
    for (const hint of dayHints) {
      const revealTime = new Date(hint.revealTime).getTime();

      if (now >= revealTime && !hint.revealed) {
        hint.revealed = true;
        hintsRevealed.push(hint.hintNumber);

        const nextHint = dayHints.find(h => h.hintNumber === hint.hintNumber + 1);
        if (nextHint) {
          nextHint.revealTime = new Date(now).toISOString();
        } else {
          const match = matches.find(m => m.day === day);
          if (match) {
            match.revealTime = new Date(now).toISOString();
          }
        }
      }
    }

    return { day, hintsRevealed };
  }

  static async exchangeRevealCode(): Promise<{ success: boolean }> {
    await delay(80);
    this.requireAuth();
    return { success: true };
  }

  static async revealMatch(day: number): Promise<{ success: boolean }> {
    await delay(80);
    this.requireAuth();

    const match = matches[day - 1];
    if (match) match.revealed = true;

    return { success: true };
  }

  static async guess(
      hintNumber: number,
      guessedUserId: UserID
  ): Promise<Guess> {
    await delay(120);

    this.requireAuth();

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