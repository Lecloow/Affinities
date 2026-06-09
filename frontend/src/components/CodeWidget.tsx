import { useTranslation } from "react-i18next";
import Button from "./Button";
import TextInput from "./TextInput.tsx";
import type { RevealCode } from "../services/types.ts"
import Markdown from "../components/Markdown";

type WidgetProps = {
  exchangeCode: RevealCode;
  inputCode: string;
  setInputCode: (value: string) => void;
  onClick?: () => void;
};

export default function CodeWidget({ exchangeCode, inputCode, setInputCode, onClick }: WidgetProps) {
  const { t } = useTranslation();

  return (
      <div
          className="flex flex-col gap-2.5 p-3 rounded-xl items-center min-w-40"
          style={{ backgroundColor: "#ececf6", color: "#000000" }}
      >
        <p className="m-0 text-[18px]" style={{fontWeight: 600}} >{t("home.codeWidget.title")}</p>

        <span className="text-[25px] p-3 rounded-lg whitespace-nowrap shrink-0" style={{backgroundColor: "#F990DA", color:"#ffffff"}}>{exchangeCode.code}</span>
        {/*TODO: Change to a gradient*/}

        {exchangeCode.partnerExchanged ?
          (exchangeCode.exchanged ?
              <Markdown content={t("home.codeWidget.bothExchanged")}/>
            :
              <Markdown content={t("home.codeWidget.exchanged")}/>
          )
          :
            <>
              <Markdown content={t("home.codeWidget.explanation")}/>
              <TextInput
                  value={inputCode}
                  width="100%"
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder={t("home.codeWidget.textInput")}
              />
              <Button
                  text={t("home.codeWidget.button")}
                  backgroundColor="#FF6CA7"
                  foregroundColor="#ffffff"
                  onClick={onClick}
                  width="100%"
              />
            </>
        }
      </div>
  );
}