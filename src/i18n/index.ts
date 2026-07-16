import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import es from "./locales/es.json";
import en from "./locales/en.json";
import de from "./locales/de.json";

export const SUPPORTED_LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
] as const;

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? "es";

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    de: { translation: de },
  },
  lng: ["es", "en", "de"].includes(deviceLanguage) ? deviceLanguage : "es",
  fallbackLng: "es",
  supportedLngs: ["es", "en", "de"],
  interpolation: { escapeValue: false },
});

export default i18n;
