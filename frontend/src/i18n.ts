import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: localStorage.getItem("lang") || navigator.language?.startsWith("fr") ? "fr" : "en",
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      detection: { caches: ["localStorage"] },
    });

export default i18n;