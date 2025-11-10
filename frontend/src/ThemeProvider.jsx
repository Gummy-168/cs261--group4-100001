import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({ theme: "system", setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

const VALID = ["system", "light", "dark"];
const KEY = "mm-theme";

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(KEY);
    return VALID.includes(saved) ? saved : "system";
  });

useEffect(() => {
  localStorage.setItem(KEY, theme);
  const root = document.documentElement;
  root.setAttribute("data-theme-preference", theme);
}, [theme]);


  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
