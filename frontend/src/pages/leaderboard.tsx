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

export default function LeaderboardPage() {
  return (
      <div>
        <div className="bg-white flex flex-col w-full items-center min-h-screen">
          <div className="flex flex-row justify-center items-center gap-[4.9rem]">
            <h1 className="text-[30px]" style={{ fontWeight: 400 }}>👋 Salut </h1>
          </div>
        </div>
        <Credits />
      </div>
  );
}