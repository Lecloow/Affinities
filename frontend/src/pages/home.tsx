import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();
  return (
      <div>
        <h1>{t("Bienvenue dans l’app 🔥")}</h1>
        <p>{t("Ici tu mets ton vrai contenu plus tard")}</p>
      </div>
  );
}