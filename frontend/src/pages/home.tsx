import { useTranslation } from "react-i18next";
import Credits from "../components/Credits";
import Button from "../components/Button.tsx";
import { SegmentedControl } from "../components/SegmentedControl.tsx";
import { ApiService } from "../services/ApiService.ts";
import { useEffect, useState, useRef, useMemo } from "react";
import type { Hint } from "../services/types.ts";
import { useNavigate } from "react-router-dom";
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/20/solid';
import { toRelativeTime } from "../utils/time";
import LeaderboardWidget from "../components/LeaderboardWidget.tsx";

export default function HomePage() {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [hints, setHints] = useState<Hint[]>([]);
  const [day, setDay] = useState(1);
  const [score, setScore] = useState<number>(0);
  const goToLeaderboard = () => navigate("/leaderboard");


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
      const [hintsData, stats] = await Promise.all([
        ApiService.getHints(),
        ApiService.getUserStats(),
      ]);

      setHints(hintsData);
      const daysFromResponse = Array.from(new Set(hintsData.map(h => h.day))).sort((a, b) => a - b);
      setDay(prev => {
        if (daysFromResponse.length === 0) return prev;
        return daysFromResponse.includes(prev) ? prev : daysFromResponse[0];
      });

      setScore(stats.totalPoints);
    } catch (err) {
      console.error("fetchScoreAndHints error", err);
      setError((err instanceof Error) ? err.message : "Unknown error");
    }
  };

  const revealHint = async () => {
    try {
      await ApiService.revealAllHints(day);
      await fetchScoreAndHints();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot reveal hints");
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
        <div className="bg-white flex flex-col w-full items-center min-h-screen gap-[1em]">
          <div className="flex flex-row justify-center items-center gap-[4.9rem]">
            <h1 className="text-[30px]" style={{ fontWeight: 400 }}>👋 Salut {name}</h1>
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

          <div className=" flex flex-col gap-[10px] p-[2.5rem]">
            {filteredHints.map(({ hintNumber, content, revealTime, revealed }) => (
                <div key={hintNumber} className="flex flex-col px-[1.5rem] gap-[10px] items-center w-full">
                  <div className="flex flex-row gap-[9rem] justify-between w-full">
                    <span
                        className="text-[16px] p-[12px] rounded-[8px] whitespace-nowrap shrink-0"
                        style={{ backgroundColor: revealed ? "#FF9A59" : "#F990DA", fontWeight: "400" }}
                    >
                      {t("hint")} n°{hintNumber}
                    </span>
                    <span
                        className="text-[16px] p-[12px] rounded-[8px] whitespace-nowrap shrink-0"
                        style={{ backgroundColor: "#ececf6", fontWeight: "400" }}
                    >
                  {toRelativeTime(revealTime)}
                </span>
                  </div>
                  {revealed && (
                      <p className="text-[15px] text-black leading-none">
                        {content}
                      </p>
                  )}
                </div>
            ))}
          </div>
          <Button
              text={count > 0 ? t("revealHint", { count }) : t("home.noHintsAvailable")}
              backgroundColor={count > 0 ? "#FF6CA7" : "#F8ADCB"}
              onClick={() => { void revealHint(); }}
              width="19.25rem"
              disabled={count === 0}
          />
        </div>
        <Credits />
      </div>
  );
}