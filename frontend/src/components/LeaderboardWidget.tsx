import { useTranslation } from "react-i18next";
import Button from "./Button";

type WidgetProps = {
  score: number;
  onClick?: () => void;
};

export default function LeaderboardWidget({ score, onClick }: WidgetProps) {
  const { t } = useTranslation();

  return (
      <div
          className="flex flex-col gap-2.5 p-3 rounded-xl justify-center items-center w-full"
          style={{ backgroundColor: "#6973db", color: "#F5F5F5" }}
      >
        <p className="m-0" >{t("home.leaderboardWidget")}</p>
        <p className="m-0.5 text-[30px] leading-none" style={{ fontWeight: 600 }} >{score} pts</p>

        <Button
            text={t("home.leaderboardButton")}
            backgroundColor="#ffffff"
            foregroundColor="#667eea"
            onClick={onClick}
            width=""
        />
      </div>
  );
}