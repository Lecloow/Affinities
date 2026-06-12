import { useTranslation } from "react-i18next";
import { Api } from "@/api";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import type { LeaderboardEntry } from "@/utils/types";
import { Button, Credits, Tag, Popup } from "@/components";

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const goBack = () => navigate("/home");
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const intervalRef = useRef<number | null>(null);
  const REFRESH_MS = 20000; //20s
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const fetchLeaderboard = async () => {
    try {
      const leaderboard = await Api.getLeaderboard();
      console.log(leaderboard);
      setLeaderboard(leaderboard);
    } catch (err) {
      setError((err instanceof Error) ? err.message : "Unknown error");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          setCurrentUserId(parsed.id);
        }
        await fetchLeaderboard();
      } catch (err) {
        console.error(err);
        setError("Unknown error");
      }
    };

    void fetchData();
  }, []);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      void fetchLeaderboard();
    }, REFRESH_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return (
      <div>
        <div className="bg-white flex flex-col w-full items-center mt-5 min-h-screen">
          <div className="flex flex-row justify-center items-center gap-[4.9rem]">
            <Button
              onClick={goBack}
              style={{width: "2.5rem", padding: "0px"}}
            >
              <ChevronLeftIcon className="w-[1.4rem] h-[1.4rem]" />
            </Button>
            <h1 className="text-[30px]" style={{ fontWeight: 400 }}>{t("leaderboard.title")}</h1>
          </div>
          <div className="flex flex-col gap-2.5 p-10">
            {Array.isArray(leaderboard) && leaderboard.map(({ rank, userId, firstName, lastName, class: userClass, totalPoints }) => {
              const isCurrentUser = userId === currentUserId;

              return(
                  <div key={rank} className="flex flex-col px-6 gap-2.5 items-center w-full">
                    <div
                        className="flex flex-row gap-24 rounded-lg justify-between w-full"
                        style={{
                          backgroundColor: isCurrentUser ? "#FFD700" : "#ffffff",
                          fontWeight: "400",
                          color: isCurrentUser ? "#000" : "inherit"
                        }}>
                      <span className="text-[16px] flex items-center px-3 rounded-lg whitespace-nowrap shrink-0" >
                        {rank === 1 && "🥇 "}
                        {rank === 2 && "🥈 "}
                        {rank === 3 && "🥉 "}
                        {rank > 3 && `${rank} `}
                        {firstName} {lastName}
                      </span>
                      <span className="text-[12px] rounded-lg whitespace-nowrap shrink-0 flex items-center">
                        {userClass}
                      </span>

                      <Tag content={`${totalPoints} ${t("points")}`} />
                    </div>

                  </div>
              );
          })}
          </div>
        </div>
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