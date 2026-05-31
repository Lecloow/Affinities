import { useTranslation } from "react-i18next";
import Credits from "../components/Credits";
import Button from "../components/Button.tsx";
import { SegmentedControl } from "../components/SegmentedControl.tsx";
import { ApiService } from "../services/ApiService.ts";
import { useEffect, useState, useRef, useMemo } from "react";
import type { Hint, Match, Candidate } from "../services/types.ts";
import { useNavigate } from "react-router-dom";
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';
import { toRelativeTime } from "../utils/time";
import LeaderboardWidget from "../components/LeaderboardWidget.tsx";
import GuessWidget from "../components/GuessWidget";
import CodeWidget from "../components/CodeWidget";
import Tag from "../components/tag.tsx";

export default function HomePage() {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [hints, setHints] = useState<Hint[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [day, setDay] = useState(1);
  const [score, setScore] = useState<number>(0);
  const [pointsForNextGuess, setPointsForNextGuess] = useState<number>(0);
  const goToLeaderboard = () => navigate("/leaderboard");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [inputCandidate, setInputCandidate] = useState<string>("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const match = matches.length > 0 ? matches.find(m => m.day === day) : null;
  const [exchangeCode, setExchangeCode] = useState("");

  const uniqueDays = useMemo(
      () => Array.from(new Set(hints.map(h => h.day))).sort((a, b) => a - b),
      [hints]
  );

  const options = useMemo(() => {
    if (uniqueDays.length > 0) {
      return uniqueDays.map(d => ({
        label: t(`days.${d}`),
        value: d,
      }));
    }
    return [];
  }, [uniqueDays, t]);

  const intervalRef = useRef<number | null>(null);
  const REFRESH_MS = 20000; //20s

  const fetchScoreAndHints = async () => {
    try {
      const [hintsData, stats, matches] = await Promise.all([
        ApiService.getHints(),
        ApiService.getUserStats(),
        ApiService.getMatches(),
      ]);
      setHints(hintsData);

      setMatches(matches);
      const daysFromResponse = Array.from(new Set(hintsData.map(h => h.day))).sort((a, b) => a - b);
      setDay(prev => {
        if (daysFromResponse.length === 0) return prev;
        return daysFromResponse.includes(prev) ? prev : daysFromResponse[0];
      });
      setScore(stats.totalPoints);
      setPointsForNextGuess(stats.pointsForNextGuess);

      const candidatesData = await ApiService.getCandidates();
      setCandidates(candidatesData);
    } catch (err) {
      console.error("fetchScoreAndHints error", err);
      setError((err instanceof Error) ? err.message : "Unknown error");
    }
  };

  const fetchRevealCode = async () => {
    try {
      const revealCode = await ApiService.getRevealCode(day);
      setExchangeCode(revealCode.code);
    } catch (err) {
      console.error("fetchRevealCode error", err);
      setError((err instanceof Error) ? err.message : "Unknown error");
    }
  }; //TODO: Rework of revealCode

  const revealHint = async () => {
    try {
      await ApiService.revealAllHints(day);
      await fetchScoreAndHints();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot reveal hints");
    }
  };
  const revealMatch = async () => {
    try {
      await ApiService.revealMatch(day);
      await fetchScoreAndHints();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot reveal match");
    }
  };

  const handleGuess = async () => {
    try {
      if (selectedCandidate) {
        await ApiService.guess(filteredHints.filter(h => h.revealed).length, selectedCandidate.id);
        setInputCandidate("");
        setSelectedCandidate(null);
        await fetchScoreAndHints();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Guess failed");
    }
  };

  const handleCodeExchange = async () => {
    try {
      if (selectedCandidate) {
        await ApiService.exchangeRevealCode(day, exchangeCode);
        setExchangeCode("");
        await fetchRevealCode();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Exchange failed");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          setName(parsed.firstName);
        }
        await fetchScoreAndHints();
        await fetchRevealCode();
      } catch (err) {
        console.error(err);
        setError("Unknown error");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      void fetchScoreAndHints();
    }, REFRESH_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleLogout = async () => {
    setError("");
    try {
      await ApiService.logout();
      localStorage.removeItem('userInfo');
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };
  // TODO: Auto refresh of the token and autologout
  const filteredHints = hints.filter(h => h.day === day);
  const count = filteredHints.filter(h => new Date(h.revealTime) <= new Date() && !h.revealed).length;
  if (loading) return <div></div>;
  return (
      <div>
        <div className="bg-white flex flex-col w-full items-center min-h-screen gap-4">
          <div className="flex flex-row justify-center items-center gap-[4.9rem]">
            <h1 className="text-[30px]" style={{ fontWeight: 400 }}>{t("home.hey", {name})}</h1>
            <Button
                text=""
                backgroundColor="#FF6CA7"
                onClick={handleLogout}
                width="2.5rem"
                padding="0px"
                rightIcon={<ArrowLeftEndOnRectangleIcon className="w-[1.4rem] h-[1.4rem]" />}
            />
          </div>

          <LeaderboardWidget score={score} onClick={goToLeaderboard} />

          <SegmentedControl options={options} value={day} onChange={setDay} />

          <div className="flex flex-col pt-8">
            {filteredHints.map(({ hintNumber, content, revealTime, revealed }) => (
              <div key={hintNumber} className="flex flex-col px-6 gap-2.5 items-center w-full">
                <div className="flex flex-row gap-36 justify-between w-full">

                  <Tag content={`${t("hint")} n°${hintNumber}`} revealed={revealed} />
                  <Tag content={toRelativeTime(revealTime)} />

                </div>
                {revealed && (
                    <p className="text-[15px] text-black leading-none">
                      {content}
                    </p>
                )}
              </div>
            ))}
            {match && (
              <div className="flex flex-col px-6 justify-between w-full items-center">
                <div className="flex flex-row gap-36 justify-between w-full">

                  <Tag content={t("reveal")} revealed={match.revealed} />
                  <Tag content={toRelativeTime(match.revealTime)} />

                </div>
                {match.revealed && (
                    <div className="flex flex-col mt-3 w-full p-3 rounded-xl justify-center items-center" style={{ backgroundColor: "#f1f1f1" }}>
                      <h1 className="text-base">{t("home.yourMatch")}</h1>
                      <p className="text-[25px] text-black leading-none">
                        {match.firstName} {match.lastName}
                      </p>
                    </div>
                )}
              </div>
            )}
          </div>



          <div className="pt-4 pb-4">
            {match && new Date(match.revealTime) < new Date() ? (
                <Button
                    text={match.revealed ? t("home.revealed") : t("home.revealMatch")}
                    backgroundColor={match.revealed ? "#F8ADCB" : "#FF6CA7"}
                    onClick={() => { void revealMatch(); }}
                    width="19.25rem"
                    disabled={match.revealed}
                />
            ) :
                <Button
                    text={count > 0 ? t("home.revealHint", { count }) : t("home.noHintsAvailable")}
                    backgroundColor={count > 0 ? "#FF6CA7" : "#F8ADCB"}
                    onClick={() => { void revealHint(); }}
                    width="19.25rem"
                    disabled={count === 0}
                />
            }
        </div>

          {match?.revealed ? (
              <CodeWidget code="Demo Code" onClick={handleCodeExchange} />
            ) : (
              <GuessWidget
                  inputCandidate={inputCandidate}
                  setInputValue={setInputCandidate}
                  setSelectedCandidate={setSelectedCandidate}
                  points={pointsForNextGuess}
                  candidates={candidates}
                  onClick={handleGuess}
              />
          )}

        </div>
        <Credits />
      </div>
  );
}