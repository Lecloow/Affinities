import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Credits from "../components/Credits";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import { ApiService } from "../services/ApiService";
import logoImg from "../assets/logo.png";

// Figma assets (valides 7 jours — à remplacer par tes assets locaux ensuite)
const imgBranch = "https://www.figma.com/api/mcp/asset/8ce565a9-074b-46e4-be07-893182871152";
const imgDivider = "https://www.figma.com/api/mcp/asset/a1f30848-4934-4b88-b8d8-bdb3a417fb4c";

const TIMELINE = [
  { day: "Mardi", desc: "Remplir le Forms pour participer à l'évènement" },
  { day: "Mercredi", desc: "Résultats du concours de gateaux" },
  { day: "Jeudi et Vendredi", desc: "Découverte des âmes soeurs" },
];

const HeartIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#F5F5F5">
      <path d="M8 13.7C7.7 13.5 1 9.3 1 5.5 1 3.6 2.6 2 4.5 2c1 0 2 .5 2.7 1.3L8 4.2
      l.8-.9C9.5 2.5 10.5 2 11.5 2 13.4 2 15 3.6 15 5.5c0 3.8-6.7 8-7 8.2z"/>
    </svg>
);

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!inputValue.trim()) {
      setError("Please enter a password");
      return;
    }
    try {
      const user = await ApiService.login(inputValue);
      console.log("Login successful:", user);
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
      <div className="bg-white flex flex-col items-center w-full min-h-screen">
        {/* Main container — calé sur iPhone 16 Pro comme dans Figma */}
        <div className="relative flex flex-col items-center w-full max-w-[402px] overflow-hidden">

          {/* ── Branches décoratives ── */}
          {/* Top-left */}
          <div className="absolute top-[-101px] left-[-142px] size-[327px] flex items-center justify-center pointer-events-none">
            <img src={imgBranch} alt="" className="size-[244px] rotate-[63.2deg] object-cover" />
          </div>
          {/* Top-right */}
          <div className="absolute top-[-118px] left-[171px] size-[344px] flex items-center justify-center pointer-events-none">
            <img src={imgBranch} alt="" className="size-[244px] rotate-[-136.61deg] object-cover" />
          </div>
          {/* Bottom-left */}
          <div className="absolute top-[758px] left-[-159px] size-[330px] flex items-center justify-center pointer-events-none">
            <img src={imgBranch} alt="" className="size-[244px] rotate-[61.62deg] object-cover" />
          </div>
          {/* Bottom-right */}
          <div className="absolute top-[703px] left-[231px] size-[343px] flex items-center justify-center pointer-events-none">
            <img src={imgBranch} alt="" className="size-[244px] rotate-[-39.38deg] object-cover" />
          </div>

          {/* ── Content ── */}
          <div className="relative flex flex-col items-center gap-[10px] w-full px-[10px] pt-[140px] pb-[40px]">

            <img src={logoImg} alt="Logo" className="h-[83px] w-[76px] object-contain shrink-0" />

            <div className="flex flex-col gap-[15px] items-center w-full">
              <h1
                  className="text-[50px] text-[#1b2027] text-center"
                  style={{ fontWeight: 600 }}
              >
                {t("header")}
              </h1>

              <img src={imgDivider} alt="" className="w-[100px]" />
              {/*No not an image 😭*/}

              <h2
                  className="text-[16px] text-center bg-clip-text text-transparent"
                  style={{
                    fontWeight: 530,
                    maxWidth: "256px",
                    backgroundImage:
                        "linear-gradient(93deg, #2E263A 24.76%, #796E8F 35.87%, #493B63 47.48%, #69657B 57.57%, #2E263A 75.24%)",
                  }}
              >
                {t("caption")}
              </h2>
            </div>

            <div className="w-full flex flex-col gap-[10px] p-[2.5rem]">
              {TIMELINE.map(({ day, desc }) => (
                  <div key={day} className="flex gap-[10px] items-center w-full">
                <span
                    className="text-[16px] font-bold text-[#1e1e1e] p-[8px] rounded-[8px] whitespace-nowrap shrink-0"
                    style={{ backgroundColor: "#ececf6" }}
                >
                  {day}
                </span>
                    <p className="text-[15px] text-black leading-none">{desc}</p>
                  </div>
              ))}
            </div>

            <div className="flex flex-col gap-[1.5rem] items-center justify-center pb-[60px] w-full">
                <TextInput
                    value={inputValue}
                    width="19.25rem"
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={t("login.placeholder")}
                />
                {/*{error && <p className="text-red-500 text-sm mt-1">{error}</p>} TODO: show alert instead bc this suck*/}

              <Button
                  text={t("login.button")}
                  backgroundColor="#FF6CA7"
                  onClick={handleLogin}
                  width="19.25rem"
                  rightIcon={<HeartIcon/>}
              />
            </div>

          </div>
        </div>

        <Credits/>
      </div>
  );
}