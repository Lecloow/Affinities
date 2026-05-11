import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Credits from "../components/Credits";
import Button from "../components/Button";
import TextInput from "../components/TextInput"
import { ApiService } from "../services/ApiService";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const handleLogin = async () => {
    setError("");

    if (!inputValue.trim()) {
      setError("Please enter a password");
      return;
    }
    setIsLoading(true);

    try {
      const user = await ApiService.login(inputValue);

      console.log("Login successful:", user);
      navigate("/app");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1 style={{fontWeight:600}} className="text-[50px] text-[#1B2027]">
          {t("header")}
        </h1>
        <h2 style={{fontWeight: 560}} className="text-[16px] bg-clip-text text-transparent bg-[linear-gradient(93deg,_#2E263A_24.76%,_#796E8F_35.87%,_#493B63_47.48%,_#69657B_57.57%,_#2E263A_75.24%)]">
          {t("caption")}
        </h2>

        <TextInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("login.placeholder")}
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <Button
            text={isLoading ? "Loading..." : t("login.button")}
            backgroundColor="#FF6CA7"
            onClick={handleLogin}
            minWidthClass={"20rem"}
        />
        <Credits className="mt-[2.5rem]"/>
      </div>
  );
}