import { useTranslation } from "react-i18next";
import Button from "./Button";
import type {Candidate} from "../services/types.ts";
import TextInput from "./TextInput.tsx";
import ReactMarkdown from "react-markdown";

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
          className="flex flex-col gap-2.5 p-3 rounded-xl items-center min-w-40"
          style={{ backgroundColor: "#ececf6", color: "#000000" }}
      >
        <p className="m-0 text-[18px]" style={{fontWeight: 600}} >{t("home.guessWidget.title")}</p>

        <ReactMarkdown components={{ strong: (props) => <strong style={{fontWeight: "600"}} {...props} /> }}>
          {t("home.guessWidget.explanation", { points })}
        </ReactMarkdown>

        <TextInput
            value={inputCandidate}
            width="100%"
            onChange={(e) => setInputValue(e.target.value)}
                   placeholder={t("home.guessWidget.textInput")
        }/>

        {inputCandidate && filteredCandidates.length > 0 && (
            <div
                className="flex flex-col gap-0 w-full max-h-62.5 overflow-y-auto rounded-lg"
                style={{ backgroundColor: "#ffffff", color: "#000000" }}
            >
              {filteredCandidates.map((candidate, index) => (
                  <div
                      key={candidate.id}
                      className="flex flex-row justify-between items-center p-3 cursor-pointer"
                      style={{
                        borderBottom: index !== filteredCandidates.length - 1 ? "1px solid #D1D1D1" : "none"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => {
                        setInputValue(`${candidate.firstName} ${candidate.lastName}`);
                        setSelectedCandidate?.(candidate);
                      }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[14px] font-500">{candidate.firstName} {candidate.lastName}</span>
                      {/*<span className="text-[11px] opacity-70">{candidate.class}</span>*/}
                    </div>
                  </div>
              ))}
            </div>
        )}

        <Button
            text={t("home.guessWidget.button")}
            backgroundColor="#FF6CA7"
            foregroundColor="#ffffff"
            onClick={onClick}
            width="100%"
        />
      </div>
  );
}