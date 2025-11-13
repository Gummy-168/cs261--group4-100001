import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { applyThemePreference, readStoredThemePreference } from "./lib/theme";

const ThemeContext = createContext({ theme: "light", setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const initial = readStoredThemePreference();
    if (typeof document !== "undefined") {
      document.documentElement.dataset.themePreference = initial;
    }
    return initial;
  });

  useEffect(() => {
    applyThemePreference(theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
