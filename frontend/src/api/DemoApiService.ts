import type { User, Hint, LeaderboardEntry, Guess, UserStats, Candidate, RevealCode, UserID, Match, ApiError } from "../utils/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let tokenData: { expiresAt: number } | null = null;

const DEMO_USER: User = {
  id: "999",
  firstName: "Dev",
  lastName: "User",
  email: "dev.demo@example.com",
  class: "DemoClass",
};

const state = {
  points: 0,
  guesses: [] as Guess[],

  candidates: [
    { id: "101", firstName: "Alice", lastName: "Dupont" },
    { id: "102", firstName: "Bob", lastName: "Martin" },
    { id: "103", firstName: "Charlie", lastName: "Durand" },
  ] as Candidate[],
};

const matches: Match[] = [
  {
    id: 1,
    userId: "101",
    day: 1,
    firstName: "Alice",
    lastName: "Dupont",
    revealTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    revealed: false,
  },
  {
    id: 2,
    userId: "102",
    day: 2,
    firstName: "Bob",
    lastName: "Martin",
    revealTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    revealed: false,
  },
];

const leaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "101",
    firstName: "Alice",
    lastName: "Dupont",
    class: "Terminale A",
    totalPoints: 300,
    bonusPoints: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    rank: 2,
    userId: "102",
    firstName: "Bob",
    lastName: "Martin",
    class: "Terminale B",
    totalPoints: 200,
    bonusPoints: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    rank: 3,
    userId: "999",
    firstName: "Dev",
    lastName: "User",
    class: "Terminale W",
    totalPoints: 0,
    bonusPoints: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    rank: 4,
    userId: "103",
    firstName: "Charlie",
    lastName: "Durand",
    class: "Terminale C",
    totalPoints: 0,
    bonusPoints: 0,
    updatedAt: new Date().toISOString(),
  },
];    

const hints: Hint[] = [
  {
    id: "1",
    userId: "999",
    day: 1,
    hintNumber: 1,
    type: "letterInFirstName",
    content: "5",
    revealTime: new Date(Date.now() - 1000).toISOString(),
    revealed: false,
  },
  {
    id: "2",
    userId: "999",
    day: 1,
    hintNumber: 2,
    type: "firstLetterOfFirstName",
    content: "A",
    revealTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    revealed: false,
  },
  {
    id: "3",
    userId: "999",
    day: 1,
    hintNumber: 3,
    type: "class",
    content: "Terminale A",
    revealTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    revealed: false,
  },
  {
    id: "4",
    userId: "999",
    day: 2,
    hintNumber: 1,
    type: "numberOfVowel",
    content: "1",
    revealTime: new Date(Date.now() - 1000).toISOString(),
    revealed: false,
  },
  {
    id: "5",
    userId: "999",
    day: 2,
    hintNumber: 2,
    type: "firstLetterOfLastName",
    content: "M",
    revealTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    revealed: false,
  },
  {
    id: "6",
    userId: "999",
    day: 2,
    hintNumber: 3,
    type: "firstName",
    content: "Bob",
    revealTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    revealed: false,
  },
];

const revealCode: RevealCode[] = [
  {
    code: "DEMO",
    exchanged: false,
    partnerExchanged: false,
  },
  {
    code: "Test",
    exchanged: false,
    partnerExchanged: false,
  },
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
      const error = new Error("UNAUTHORIZED") as ApiError;
      error.statusCode = 401;
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
      guesses: [...state.guesses],
      pointsForNextGuess: 100,
    };
  }

  static async getCandidates(): Promise<Candidate[]> {
    await delay(80);
    this.requireAuth();
    return [...state.candidates];
  }

  static async getMatches(): Promise<Match[]> {
    await delay(80);
    this.requireAuth();
    return matches.map((m) => ({ ...m }));
  }

  static async getHints(): Promise<Hint[]> {
    await delay(80);
    this.requireAuth();

    return hints.map((h) => ({ ...h }));
  }

  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    await delay(80);
    this.requireAuth();
    return leaderboard.map((l) => ({ ...l }));
  }

  static async getRevealCode(): Promise<RevealCode[]> {
    await delay(80);
    this.requireAuth();

    return revealCode.map((c) => ({ ...c }));
  }

  static async revealAllHints(
    day: number,
  ): Promise<{ day: number; hintsRevealed: number[] }> {
    await delay(80);
    this.requireAuth();

    const now = Date.now();
    const dayHints = hints
      .filter((h) => h.day === day)
      .sort((a, b) => a.hintNumber - b.hintNumber);

    // Only reveal ONE hint per click: the first unrevealed hint whose
    // revealTime has passed. Setting the next hint's revealTime to "now"
    // means the user has to click again to reveal it.
    const candidate = dayHints.find(
      (h) => !h.revealed && new Date(h.revealTime).getTime() <= now,
    );

    if (!candidate) {
      return { day, hintsRevealed: [] };
    }

    candidate.revealed = true;

    const nextHint = dayHints.find(
      (h) => h.hintNumber === candidate.hintNumber + 1,
    );
    if (nextHint) {
      nextHint.revealTime = new Date(now).toISOString();
    } else {
      const match = matches.find((m) => m.day === day);
      if (match) {
        match.revealTime = new Date(now).toISOString();
      }
    }

    return { day, hintsRevealed: [candidate.hintNumber] };
  }

  static async exchangeRevealCode(
    day: number,
    code: string,
  ): Promise<{ success: boolean }> {
    await delay(80);
    this.requireAuth();

    const entry = revealCode[day - 1];
    if (!entry) return { success: false };

    if (entry.code.toLowerCase() === code.trim().toLowerCase()) {
      entry.exchanged = true;
      return { success: true };
    }
    return { success: false };
  }

  static async revealMatch(day: number): Promise<{ success: boolean }> {
    await delay(80);
    this.requireAuth();

    const match = matches.find((m) => m.day === day);
    if (match) match.revealed = true;

    return { success: true };
  }

  static async guess(
    day: number,
    hintNumber: number,
    guessedUserId: UserID,
  ): Promise<Guess> {
    await delay(120);

    this.requireAuth();

    const isCorrect = matches[day - 1].userId === guessedUserId;
    
    const guess: Guess = {
      id: state.guesses.length + 1,
      userId: "999",
      day: day,
      hintNumber,
      guessedUserId,
      isCorrect,
      pointsEarned: isCorrect ? 100 : 0,
      createdAt: new Date().toISOString(),
    };

    state.guesses.push(guess);

    if (isCorrect) state.points += 100;

    return guess;
  }
}
