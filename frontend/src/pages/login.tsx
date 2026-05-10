import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import Credits from "../components/Credits";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1 style={{fontWeight:700}} className="text-[50px] text-[#1B2027]">
          {t("header")}
        </h1>
        <h2 style={{fontWeight: 560}} className="text-[16px] bg-clip-text text-transparent bg-[linear-gradient(93deg,_#2E263A_24.76%,_#796E8F_35.87%,_#493B63_47.48%,_#69657B_57.57%,_#2E263A_75.24%)]">
          {t("caption")}
        </h2>
        <Button
            text={t("login.button")}
            backgroundColor="#FF6CA7"
            onClick={() => navigate("/app")}
            minWidthClass={"20rem"}
        />
        {/*<div className="size-[2.5rem]"></div>*/}
        <Credits className="mt-[2.5rem]"/>
      </div>
  );
}