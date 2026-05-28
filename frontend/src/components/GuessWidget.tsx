import { useTranslation } from "react-i18next";
import Button from "./Button";
import type {Candidate} from "../services/types.ts";
import TextInput from "./TextInput.tsx";

type WidgetProps = {
  inputCandidate: string;
  setInputValue: (value: string) => void;
  setSelectedCandidate?: (candidate: Candidate) => void;
  points: number;
  candidates: Candidate[];
  onClick?: () => void;
};

export default function GuessWidget({ inputCandidate, setInputValue, setSelectedCandidate, points, candidates, onClick }: WidgetProps) {
  const { t } = useTranslation();
  const filteredCandidates = candidates.filter(c =>
      c.firstName.toLowerCase().includes(inputCandidate.toLowerCase()) ||
      c.lastName.toLowerCase().includes(inputCandidate.toLowerCase())
  );

  return (
      <div
          className="flex flex-col gap-[10px] p-[12px] rounded-[12px] justify-center items-center min-w-[10rem]"
          style={{ backgroundColor: "#6973db", color: "#F5F5F5" }}
      >
        <p className="m-[0px] text-[18px]" style={{fontWeight: 600}} >{t("home.guessWidget.title")}</p>

        <p className="m-[0px]" >{t("home.guessWidget.explanation")}<b> {points} points!</b></p>

        <TextInput value={inputCandidate} onChange={(e) => setInputValue(e.target.value)}/>

        {inputCandidate && filteredCandidates.length > 0 && (
            <div
                className="flex flex-col gap-[0px] w-full max-h-[250px] overflow-y-auto rounded-[8px] border-[2px]"
                style={{ backgroundColor: "#ffffff", color: "#000000", borderColor: "#ff8ec4" }}
            >
              {filteredCandidates.map((candidate, index) => (
                  <div
                      key={candidate.id}
                      className="flex flex-row justify-between items-center p-[12px] cursor-pointer"
                      style={{
                        borderBottom: index !== filteredCandidates.length - 1 ? "1.5px solid #ff8ec4" : "none"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => {
                        setInputValue(`${candidate.firstName} ${candidate.lastName}`);
                        setSelectedCandidate(candidate);
                      }}
                  >
                    <div className="flex flex-col gap-[2px]">
                      <span className="text-[14px] font-500">{candidate.firstName} {candidate.lastName}</span>
                      <span className="text-[11px] opacity-70">{candidate.class}</span>
                    </div>
                  </div>
              ))}
            </div>
        )}

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