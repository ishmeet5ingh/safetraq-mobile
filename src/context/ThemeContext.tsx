import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { useColorScheme } from 'nativewind';

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
  const {
    colorScheme: nativewindColorScheme,
    setColorScheme,
  } = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemTheme, setSystemTheme] = useState<ActiveTheme>(getSystemTheme());

  const activeTheme: ActiveTheme =
    nativewindColorScheme ?? (themeMode === 'system' ? systemTheme : themeMode);

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
        setColorScheme(validTheme);
      } catch (error) {
        setThemeModeState('system');
        setColorScheme('system');
      }
    };

    void loadTheme();
  }, [setColorScheme]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: next }) => {
      const nextSystemTheme: ActiveTheme = next === 'dark' ? 'dark' : 'light';
      setSystemTheme(nextSystemTheme);

      if (themeMode === 'system') {
        setColorScheme('system');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [setColorScheme, themeMode]);

  const setThemeMode = useCallback(
    async (mode: ThemeMode) => {
      setThemeModeState(mode);
      setColorScheme(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    },
    [setColorScheme],
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
