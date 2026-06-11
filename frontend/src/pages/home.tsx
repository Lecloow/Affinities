import {Trans, useTranslation} from "react-i18next";
import { Api } from "@/api";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import type { Hint, Match, Candidate, RevealCode } from "../services/types.ts";
import { useNavigate } from "react-router-dom";
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';
import {toLocalDateTimeString, toRelativeTime} from "../utils/time";
import { Button, CodeWidget, Credits, GuessWidget, LeaderboardWidget, Popup, SegmentedControl, Tag } from "@/components";

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
  const [exchangeCode, setExchangeCode] = useState<RevealCode[]>([]);
  const [inputCode, setInputCode] = useState("");
  const [showGuessResult, setShowGuessResult] = useState(false);
  const [guessResultMessage, setGuessResultMessage] = useState("");
  const [showCodeResult, setShowCodeResult] = useState(false);
  const [codeResultMessage, setCodeResultMessage] = useState("");

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

  const fetchScoreAndHints = useCallback(async () => {
    try {
      const [hintsData, stats, matches] = await Promise.all([
        Api.getHints(),
        Api.getUserStats(),
        Api.getMatches(),
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

      const candidatesData = await Api.getCandidates();
      setCandidates(candidatesData);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        await Api.logout();
        localStorage.removeItem("userInfo");
        navigate("/");
        return;
      }
      console.error("fetchScoreAndHints error", err);
      setError((err instanceof Error) ? err.message : "Unknown error");
    }
  }, [navigate]);

  const fetchRevealCode = useCallback(async () => {
    try {
      const revealCode = await Api.getRevealCode();
      setExchangeCode(revealCode);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        console.log("Token expired, user will be logged out on next action");
        return;
      }
      console.error("fetchRevealCode error", err);
      setError((err instanceof Error) ? err.message : "Unknown error");
    }
  }, []);

  const revealHint = async () => {
    try {
      await Api.revealAllHints(day);
      await fetchScoreAndHints();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot reveal hints");
    }
  };
  const revealMatch = async () => {
    try {
      await Api.revealMatch(day);
      await fetchScoreAndHints();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot reveal match");
    }
  };

  const handleGuess = async () => {
    try {
      if (selectedCandidate) {
        const result = await Api.guess(day, hintNumber, selectedCandidate.id)
        const message = result.isCorrect
            ? t("home.popup.goodAnswer", {points: result.pointsEarned})
            : filteredHints.filter(h => h.revealed).length === filteredHints.length
                ? t("home.popup.badAnswer_lastHint", {inputCandidate})
                : t("home.popup.badAnswer", {inputCandidate});
        setInputCandidate("");
        setSelectedCandidate(null);
        setGuessResultMessage(message);
        setShowGuessResult(true);
        await fetchScoreAndHints();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Guess failed");
    }
  };

  const handleCodeExchange = async () => {
    try {
      const result = await Api.exchangeRevealCode(day, inputCode);
      const message = result.success ?
          t("home.popup.goodCode")
          : t("home.popup.badCode", { inputCode });
      setInputCode("");
      setCodeResultMessage(message);
      setShowCodeResult(true);
      await fetchRevealCode();
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
  }, [fetchScoreAndHints, fetchRevealCode]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      void fetchScoreAndHints();
      void fetchRevealCode();
    }, REFRESH_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchScoreAndHints, fetchRevealCode]);

  const handleLogout = async () => {
    setError("");
    try {
      await Api.logout();
      localStorage.removeItem('userInfo');
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };
  // TODO: Auto refresh of the token

  const filteredHints = hints.filter(h => h.day === day);
  const hintNumber = filteredHints.filter(h => h.revealed).length
  const count = filteredHints.filter(h => new Date(h.revealTime) <= new Date() && !h.revealed).length;
  if (loading) return <div></div>;
  return (
    <div className="bg-white flex flex-col w-full min-h-screen items-center gap-4 overflow-x-hidden">
      <div className="flex flex-row justify-center items-center gap-6 mt-5 px-4 w-full">
        <h1 className="text-[30px] font-normal">
          {t("home.hey", { name })}
        </h1>

        <Button
          style={{width: "2.5rem", padding: "0px"}}
          onClick={handleLogout}
        >
          <ArrowLeftEndOnRectangleIcon className="w-[1.4rem] h-[1.4rem]" />
        </Button>
      </div>

      <div className="flex flex-col pt-8 gap-3 w-full px-4">
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3">

          <LeaderboardWidget score={score} onClick={goToLeaderboard} />
          <SegmentedControl options={options} value={day} onChange={setDay} />

          {filteredHints.map((hint) => (
            <div
                key={`${hint.hintNumber}-${hint.revealed}`}
                className="flex flex-col gap-2.5 w-full"
            >

              <div className="flex flex-row justify-between items-center w-full gap-4">

                <Tag
                  content={`${t("hint")} n°${hint.hintNumber}`}
                  revealed={hint.revealed}
                />

                <Tag content={toRelativeTime(hint.revealTime)} />

              </div>

              {hint.revealed && (
                <div className="flex items-center gap-1 flex-wrap w-full">
                  <Trans
                    i18nKey={`hints.${hint.type}`}
                    values={{ content: hint.content }}
                    components={{
                      tag: <Tag revealed={false} />
                    }}
                  />
                </div>
              )}

            </div>
          ))}

          {match && (
            <div className="flex flex-col gap-2.5 w-full mt-4">

              <div className="flex flex-row justify-between items-center w-full gap-4">
                <Tag content={t("reveal")} revealed={match.revealed} />
                <Tag content={toRelativeTime(match.revealTime)} />
              </div>

              {match.revealed && (
                <div className="flex flex-col mt-3 w-full p-3 rounded-xl items-center justify-center bg-[#f1f1f1]">
                  <h1 className="text-base">{t("home.yourMatch")}</h1>
                  <p className="text-[25px] text-black leading-none">
                    {match.firstName} {match.lastName}
                  </p>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      <div className="pt-4 pb-4">
        {match && new Date(toLocalDateTimeString(match.revealTime)) < new Date() ? (
          <Button
            text={match.revealed ? t("home.revealed") : t("home.revealMatch")}
            //backgroundColor={match.revealed ? "#F8ADCB" : "#FF6CA7"}
            style={{backgroundColor: !match.revealed ? "#FF6CA7" : "#F8ADCB" }}
            onClick={() => void revealMatch()}
            disabled={match.revealed}
          />
        ) : (
          <Button
            text={
              count > 0
                ? t("home.revealHint", { count })
                : t("home.noHintsAvailable")
            }
            style={{backgroundColor: count > 0 ? "#FF6CA7" : "#F8ADCB" }}
            onClick={() => void revealHint()}
            disabled={count === 0}
          />
        )}
      </div>

      {hintNumber > 0 && (
        <div className="w-full flex justify-center px-4">
          {match?.revealed ? (
            <CodeWidget
              exchangeCode={exchangeCode[day - 1]}
              inputCode={inputCode}
              setInputCode={setInputCode}
              onClick={handleCodeExchange}
            />
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
      )}

      <Popup
        isOpen={showGuessResult}
        onClose={() => setShowGuessResult(false)}
        content={guessResultMessage}
      />
      <Popup
          isOpen={showCodeResult}
          onClose={() => setShowCodeResult(false)}
          content={codeResultMessage}
      />

      <Popup
          isOpen={error!=""}
          error = {true}
          onClose={() => window.location.reload()}
          content={error}
      />
      <Credits />
    </div>
  );
}