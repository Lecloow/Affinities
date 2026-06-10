import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Api } from "@/api";
import logoImg from "@/assets/logo.png";
import branchImg from "@/assets/branch.png";
import { useEffect } from "react";
import { Button, Credits, Tag, TextInput, Popup } from "@/components";

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
  const timeline = t('timeline', { returnObjects: true }) as Array<{ day: string; desc: string }>;

  const handleLogin = async () => {
    setError("");
    if (!inputValue.trim()) {
      setError("Please enter a password");
      return;
    }
    try {
      const userInfo = await Api.login(inputValue);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  useEffect(() => {
    const autoLogin = async () => {
      const userInfo = localStorage.getItem("userInfo");
      if (!userInfo) return;
      try {
        await Api.getUserStats();
        navigate("/home");
      } catch (err) {
        console.log("AutoLogin failed", err)
      }
    };
    void autoLogin();
  }, [navigate]);

  return (
    <div>
      <div className="bg-white flex flex-col items-center min-h-screen">
        <div className="relative flex flex-col items-center min-h-screen w-full overflow-hidden">
          {/*Flowers*/}
          <div className="absolute -top-25.25 -left-35.5 size-81.75 flex items-center justify-center pointer-events-none">
            <img src={branchImg} alt="" className="size-61 rotate-[63.2deg] object-cover" />
          </div>
          <div className="absolute -top-29.5 -right-28.25 size-86 flex items-center justify-center pointer-events-none">
            <img src={branchImg} alt="" className="size-61 rotate-[-136.61deg] object-cover" />
          </div>
          <div className="absolute -bottom-53.5 -left-39.75 size-82.5 flex items-center justify-center pointer-events-none">
            <img src={branchImg} alt="" className="size-61 rotate-[61.62deg] object-cover" />
          </div>
          <div className="absolute -bottom-43 -right-43 size-85.75 flex items-center justify-center pointer-events-none">
            <img src={branchImg} alt="" className="size-61 rotate-[-39.38deg] object-cover" />
          </div>

          <div className="relative flex flex-col items-center gap-2.5 px-2.5 pt-35 pb-10">

            <img src={logoImg} alt="Logo" className="h-20.75 w-19 object-contain shrink-0" />

            <div className="flex flex-col gap-3.75 items-center w-full">
              <h1
                className="text-[50px] text-[#1b2027] text-center"
                style={{ fontWeight: 600 }}
              >
                {t("header")}
              </h1>

              <div className="w-40 h-0.5" style={{ background: "#000000" }}></div>

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
            <div className="flex flex-col w-full gap-2.5 px-4 py-6 sm:px-10 sm:py-10">
              {timeline.map(({ day, desc }) => (
                <div
                    key={day}
                    className="flex items-center justify-between w-full gap-3"
                >
                  <Tag content={day} />

                  <p className="text-[15px] text-black leading-none flex-1 text-right">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
            {/*FIXME: Fix the gap between the tad and the value*/}
            <div className="flex flex-col gap-6 items-center justify-center pb-15 w-full">
              <TextInput
                value={inputValue}
                width="19.25rem"
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t("login.placeholder")}
              />
              {/*{error && <p className="text-red-500 text-sm mt-1">{error}</p>} TODO: show alert instead bc this suck*/}

              <Button
                backgroundColor="#FF6CA7"
                onClick={handleLogin}
                width="19.25rem"
              >
                {t("login.button")} <HeartIcon/>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Popup
          isOpen={error!=""}
          error = {true}
          onClose={() => window.location.reload()}
          content={error}
      />
      <Credits/>
    </div>
  );
}