import { useTranslation } from "react-i18next";
import Button from "./Button";

type WidgetProps = {
  score: number;
  onClick?: () => void;
};

export default function CodedWidget({ score, onClick }: WidgetProps) {
  const { t } = useTranslation();

  return (
      <div
          className="flex flex-col gap-[10px] p-[12px] rounded-[12px] justify-center items-center min-w-[10rem]"
          style={{ backgroundColor: "#6973db", color: "#F5F5F5" }}
      >
        <p className="m-[0px]" >{t("home.leaderboardWidget")}</p>
        <p className="m-[2px] text-[30px] leading-none" style={{ fontWeight: 600 }} >{score} pts</p>

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