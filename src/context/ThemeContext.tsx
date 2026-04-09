import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import { colorScheme } from 'nativewind';

type ThemeMode = 'light' | 'dark' | 'system';
type ActiveTheme = 'light' | 'dark';

type ThemeContextType = {
  themeMode: ThemeMode;
  activeTheme: ActiveTheme;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const THEME_STORAGE_KEY = '@safetraq_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSystemTheme = (): ActiveTheme => {
  const systemTheme = Appearance.getColorScheme();
  return systemTheme === 'dark' ? 'dark' : 'light';
};

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemTheme, setSystemTheme] = useState<ActiveTheme>(getSystemTheme());

  const activeTheme: ActiveTheme =
    themeMode === 'system' ? systemTheme : themeMode;

  const applyTheme = useCallback((mode: ThemeMode, currentSystem?: ActiveTheme) => {
    const resolvedTheme =
      mode === 'system' ? currentSystem ?? getSystemTheme() : mode;

    colorScheme.set(resolvedTheme);
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const validTheme =
          savedTheme === 'light' ||
          savedTheme === 'dark' ||
          savedTheme === 'system'
            ? savedTheme
            : 'system';

        setThemeModeState(validTheme);
        applyTheme(validTheme, getSystemTheme());
      } catch (error) {
        setThemeModeState('system');
        applyTheme('system', getSystemTheme());
      }
    };

    void loadTheme();
  }, [applyTheme]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: next }) => {
      const nextSystemTheme: ActiveTheme = next === 'dark' ? 'dark' : 'light';
      setSystemTheme(nextSystemTheme);

      if (themeMode === 'system') {
        colorScheme.set(nextSystemTheme);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [themeMode]);

  const setThemeMode = useCallback(
    async (mode: ThemeMode) => {
      setThemeModeState(mode);
      applyTheme(mode, systemTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    },
    [applyTheme, systemTheme],
  );

  const toggleTheme = useCallback(async () => {
    const nextMode: ThemeMode = activeTheme === 'dark' ? 'light' : 'dark';
    await setThemeMode(nextMode);
  }, [activeTheme, setThemeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      activeTheme,
      isDark: activeTheme === 'dark',
      setThemeMode,
      toggleTheme,
    }),
    [themeMode, activeTheme, setThemeMode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }

  return context;
};