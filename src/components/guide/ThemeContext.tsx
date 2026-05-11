import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type Theme = 'dark' | 'warm';
const KEY = 'flare-theme';

interface Ctx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeCtx = createContext<Ctx>({ theme: 'dark', toggle: () => {}, setTheme: () => {} });

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem(KEY) as Theme) || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    document.documentElement.classList.add('theme-switching');
    setThemeState(t);
    window.setTimeout(() => document.documentElement.classList.remove('theme-switching'), 650);
  }, []);
  const toggle = useCallback(() => {
    document.documentElement.classList.add('theme-switching');
    setThemeState((t) => (t === 'dark' ? 'warm' : 'dark'));
    window.setTimeout(() => document.documentElement.classList.remove('theme-switching'), 650);
  }, []);

  return <ThemeCtx.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => useContext(ThemeCtx);
