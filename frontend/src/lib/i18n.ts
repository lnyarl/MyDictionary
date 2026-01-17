import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

const DEFAULT_LANGUAGE = "ko";
const SUPPORTED_LANGUAGES = ["ko", "en"];

i18n
	.use(HttpBackend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng: DEFAULT_LANGUAGE,
		supportedLngs: SUPPORTED_LANGUAGES,
		debug: false,

		interpolation: {
			escapeValue: false,
		},

		backend: {
			loadPath: "/locales/{{lng}}/{{ns}}.json",
		},

		ns: ["common"],
		defaultNS: "common",

		detection: {
			order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
			caches: ["localStorage", "cookie"],
		},
	});

export default i18n;
