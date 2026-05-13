import { useTranslation } from "react-i18next";
import Credits from "../components/Credits";
import Button from "../components/Button.tsx";
import {ApiService} from "../services/ApiService.ts";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/20/solid';

export default function HomePage() {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleLogout = async () => {
    setError("");
    try {
      await ApiService.logout();
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
      <div>
        <h1>{t("Bienvenue dans l’app 🔥")}</h1>
        <p>{t("Ici tu mets ton vrai contenu plus tard")}</p>
        <Button
            text=""
            backgroundColor="#FF6CA7"
            onClick={handleLogout}
            width="19.25rem"
            rightIcon={<ArrowLeftEndOnRectangleIcon className="w-[23rem] h-[2rem]" />}
        />
        <Credits/>
      </div>
  );
}