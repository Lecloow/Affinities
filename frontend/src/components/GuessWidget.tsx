import { useTranslation } from "react-i18next";
import Button from "./Button";
import type {Candidate} from "../services/types.ts";
import TextInput from "./TextInput.tsx";

type WidgetProps = {
  inputCandidate: string;
  setInputValue: (value: string) => void;
  points: number;
  candidates: Candidate[];
  onClick?: () => void;
};

export default function GuessWidget({ inputCandidate, setInputValue, points, candidates, onClick }: WidgetProps) {  const { t } = useTranslation();

  return (
      <div
          className="flex flex-col gap-[10px] p-[12px] rounded-[12px] justify-center items-center min-w-[10rem]"
          style={{ backgroundColor: "#6973db", color: "#F5F5F5" }}
      >
        <p className="m-[0px] text-[18px]" style={{fontWeight: 600}} >{t("home.guessWidget.title")}</p>
        
        <p className="m-[0px]" >{t("home.guessWidget.explanation")}<b> {points} points!</b></p>

        <TextInput value={inputCandidate} onChange={(e) => setInputValue(e.target.value)}/>
        {/*TODO: List Candidate per name thanks to the input*/}
        <Button
            text={t("home.guessWidget.button")}
            backgroundColor="#ffffff"
            foregroundColor="#667eea"
            onClick={onClick}
            width=""
        />
      </div>
  );
}