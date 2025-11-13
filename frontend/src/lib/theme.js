const VALID_THEMES = ["system", "light", "dark"];
const THEME_STORAGE_KEY = "mm-theme";

const isValidTheme = (val) => VALID_THEMES.includes(val);

export const normalizeTheme = (val) => (isValidTheme(val) ? val : "light");

export const applyThemePreference = (val) => {
  const theme = normalizeTheme(val);
  if (typeof document !== "undefined") {
    document.documentElement.dataset.themePreference = theme;
  }
  if (typeof localStorage !== "undefined") {
    try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch {}
  }
  return theme;
};

export const readStoredThemePreference = () => {
  if (typeof window === "undefined") return "light";

  const fromDataset = document.documentElement.dataset.themePreference;
  if (isValidTheme(fromDataset)) return fromDataset;

  try {
    const prefs = localStorage.getItem("userPreferences");
    if (prefs) {
      const parsed = JSON.parse(prefs);
      if (isValidTheme(parsed?.theme)) return parsed.theme;
    }
  } catch {}

  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidTheme(saved)) return saved;
  } catch {}

  return "light";
};
