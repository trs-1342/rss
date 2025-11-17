import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import {
    DarkTheme,
    DefaultTheme,
    Theme,
} from "@react-navigation/native";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    navTheme: Theme;
    statusBarStyle: "light-content" | "dark-content";
    systemTheme: "light" | "dark";
};

const ThemeContext = createContext<
    ThemeContextValue | undefined
>(undefined);

const THEME_STORAGE_KEY = "rssReaderApp:themeMode";

export const AppThemeProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
        Appearance.getColorScheme() ?? "light"
    );

    const [mode, setModeState] = useState<ThemeMode>("system");

    // Mode değişince AsyncStorage'a yaz
    const setMode = (next: ThemeMode) => {
        setModeState(next);
        AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => { });
    };

    // İlk açılışta kayıtlı modu ve sistem temasını oku
    useEffect(() => {
        const init = async () => {
            try {
                const saved = await AsyncStorage.getItem(
                    THEME_STORAGE_KEY
                );
                if (saved === "light" || saved === "dark" || saved === "system") {
                    setModeState(saved);
                }
            } catch {
                // boşver
            }

            const current = Appearance.getColorScheme();
            if (current) {
                setSystemTheme(current);
            }
        };

        init();

        const listener = Appearance.addChangeListener(
            ({ colorScheme }) => {
                if (colorScheme) {
                    setSystemTheme(colorScheme);
                }
            }
        );
        return () => {
            listener.remove();
        };
    }, []);

    const effectiveTheme: "light" | "dark" =
        mode === "system" ? systemTheme : mode;

    const navTheme =
        effectiveTheme === "dark" ? DarkTheme : DefaultTheme;

    const statusBarStyle =
        effectiveTheme === "dark"
            ? "light-content"
            : "dark-content";

    return (
        <ThemeContext.Provider
            value={{
                mode,
                setMode,
                navTheme,
                statusBarStyle,
                systemTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error(
            "useAppTheme must be used within AppThemeProvider"
        );
    }
    return ctx;
};
