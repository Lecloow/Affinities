// src/ProfilePage.tsx
import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { StorageService } from "./storage";
import { ApiService } from "./api";
import {
  HintsResponse,
  DayHints,
  UserStatsResponse,
  CandidatesResponse,
} from "./types";

import { GuessSection } from "./GuessSection";
import { RevealCodeSection } from "./RevealCodeSection";

export default function ProfilePage() {
  const [hintsData, setHintsData] = useState<HintsResponse | null>(null);
  const [userStats, setUserStats] = useState<UserStatsResponse | null>(null);
  const [candidates, setCandidates] = useState<CandidatesResponse | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const user = StorageService.getUser();

  // ─────────────────────────────────────────────
  // Load data
  // ─────────────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [hints, stats, candidates] = await Promise.all([
        ApiService.getHints(user.id),
        ApiService.getUserStats(user.id),
        ApiService.getCandidates(user.id),
      ]);

      setHintsData(hints);
      setUserStats(stats);
      setCandidates(candidates);
      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────

  const handleRevealAll = async (day: number) => {
    if (!user) return;
    await ApiService.revealAllHints(user.id, day);
    await loadData();
  };

  const handleGuess = async (
    day: number,
    hintNumber: number,
    guessedUserId: string
  ) => {
    if (!user) return;
    await ApiService.submitGuess(user.id, day, hintNumber, guessedUserId);
    await loadData();
  };

  const handleExchangeCode = async (day: number, code: string) => {
    if (!user) return;
    await ApiService.exchangeCode(user.id, day, code.toUpperCase());
    await loadData();
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 text-lg text-pink-500">
        Vous n'êtes pas connecté.
      </div>
    );
  }

  if (loading || !hintsData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-500">
        Chargement...
      </div>
    );
  }

  const dayData = hintsData.days.find((d) => d.day === selectedDay) ?? hintsData.days[0];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col relative p-4">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-medium">👋 Salut {user.first_name}</h2>
        <button
          className="bg-pink-500 text-white px-4 py-2 rounded hover:opacity-90 transition"
          onClick={() => {
            StorageService.clearUser();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </header>

      {/* USER SCORE */}
      {userStats && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-400 text-white text-center rounded-lg py-4 mb-4">
          <div className="text-sm font-semibold opacity-90">Score total</div>
          <div className="text-3xl font-extrabold">{userStats.total_points} pts</div>
        </div>
      )}

      {/* DAY SELECTOR */}
      {hintsData.days.length > 1 && (
        <div className="flex gap-2 bg-gray-200 rounded-lg p-1 mb-4">
          {hintsData.days.map((day) => (
            <button
              key={day.day}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                selectedDay === day.day
                  ? "bg-pink-500 text-white shadow"
                  : "text-gray-600 hover:bg-pink-100"
              }`}
              onClick={() => setSelectedDay(day.day)}
            >
              Jour {day.day}
            </button>
          ))}
        </div>
      )}

      {/* HINTS */}
      <div className="space-y-2 mb-4">
        {dayData.hints.map((hint, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              hint.revealed ? "bg-orange-200" : "bg-pink-100 text-gray-600"
            }`}
          >
            <div className="font-semibold mb-1">Indice {index + 1}</div>
            {hint.revealed && <div>{hint.content}</div>}
          </div>
        ))}

        <button
          className="w-full py-3 bg-pink-500 text-white rounded-full font-bold hover:opacity-90 transition"
          onClick={() => handleRevealAll(dayData.day)}
        >
          Révéler les indices
        </button>
      </div>

      {/* GUESS SECTION */}
      {candidates && (
        <GuessSection
          day={dayData}
          candidates={candidates}
          userStats={userStats}
          onGuess={handleGuess}
        />
      )}

      {/* REVEAL CODE */}
      {dayData.match_revealed && (
        <RevealCodeSection
          day={dayData.day}
          onExchange={handleExchangeCode}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ReactDOM Entry
// ─────────────────────────────────────────────
const container = document.getElementById("app");
if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <ProfilePage />
    </React.StrictMode>
  );
}
