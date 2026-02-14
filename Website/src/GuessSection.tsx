import { useState } from "react";
import { DayHints, CandidatesResponse, UserStatsResponse } from "./types";

interface Props {
  day: DayHints;
  candidates: CandidatesResponse;
  userStats: UserStatsResponse | null;
  onGuess: (day: number, hintNumber: number, guessedUserId: string) => void;
}

export function GuessSection({
  day,
  candidates,
  userStats,
  onGuess,
}: Props) {
  const [selectedUser, setSelectedUser] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    onGuess(day.day, 1, selectedUser);
  };

  return (
    <div className="guess-section">
      <h3>🎯 Deviner mon âme sœur</h3>

      <form onSubmit={handleSubmit}>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Choisir une personne</option>
          {candidates.candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.first_name} {c.last_name}
            </option>
          ))}
        </select>

        <button type="submit">Valider</button>
      </form>
    </div>
  );
}
