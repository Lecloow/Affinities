import { useTranslation } from "react-i18next";
import Credits from "../components/Credits";
import Button from "../components/Button.tsx";
import { SegmentedControl } from "../components/SegmentedControl.tsx";
import { ApiService } from "../services/ApiService.ts";
import { useEffect, useState, useRef } from "react";
import type { Hint } from "../services/types.ts";
import { useNavigate } from "react-router-dom";
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/20/solid';

export default function HomePage() {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [hints, setHints] = useState<Hint[]>([]);
  const [day, setDay] = useState(1);

  const uniqueDays = Array.from(new Set(hints.map(h => h.day))).sort((a, b) => a - b);
  const options = uniqueDays.length > 0 ? uniqueDays.map(d => ({ label: `Day ${d}`, value: d })) : [
    { label: t('days.1'), value: 1 },
    { label: t('days.2'), value: 2 },
  ];

  useEffect(() => {
    if (uniqueDays.length > 0 && !uniqueDays.includes(day)) {
      setDay(uniqueDays[0]);
    }
  }, [uniqueDays, day]);


  const isFetchingRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const REFRESH_MS = 20000; //20s

  const fetchHints = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const hintsData = await ApiService.getHints();
      setHints(hintsData);
    } catch (err) {
      console.error("fetchHints error", err);
      setError((err instanceof Error) ? err.message : "Unknown error");
    } finally {
      isFetchingRef.current = false;
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
        await fetchHints();
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
      void fetchHints();
    }, REFRESH_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const userInfo = localStorage.getItem('userInfo');
  //       if (userInfo) {
  //         const parsed = JSON.parse(userInfo);
  //         setName(parsed.firstName);
  //       }
  //       const hintsData = await ApiService.getHints();
  //       setHints(hintsData);
  //     } catch (err) {
  //       setError("Erreur lors du chargement des infos");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //
  //   fetchData();
  // }, []);

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

  const filteredHints = hints.filter(h => h.day === day);

  if (loading) return <div></div>;
  return (
      <div>
        <div className="bg-white flex flex-col w-full items-center min-h-screen">
          <div className="flex flex-row justify-center items-center gap-[4.9rem]">
            <h1 className="text-[30px]" style={{ fontWeight: 400 }}>👋 Salut {name}</h1>
            <Button
                text=""
                backgroundColor="#FF6CA7"
                onClick={handleLogout}
                width="2.5rem"
                rightIcon={<ArrowLeftEndOnRectangleIcon className="w-[23rem] h-[2rem]" />}
            />
          </div>

          <SegmentedControl options={options} value={day} onChange={setDay} />

          <div className=" flex flex-col gap-[10px] p-[2.5rem]">
            {filteredHints.map(({ hintNumber, content, revealTime, revealed }) => (
                <div key={hintNumber} className="flex flex-col px-[1.5rem] gap-[10px] items-center w-full">
                  <div className="flex flex-row gap-[9.5rem] w-full">
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
                  {revealTime}
                </span>
                  </div>
                  <p className="text-[15px] text-black leading-none">{content}</p>
                </div>
            ))}
          </div>

        </div>
        <Credits />
      </div>
  );
}