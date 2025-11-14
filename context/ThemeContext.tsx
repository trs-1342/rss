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

// İlk okuma - import sonrası
console.log('İlk Appearance.getColorScheme():', Appearance.getColorScheme());

export const AppThemeProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    // Lazy initialization ile ilk değer
    const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
        const current = Appearance.getColorScheme();
        console.log('useState içinde okuma:', current);
        return current === "dark" ? "dark" : "light";
    });

    const [mode, setMode] = useState<ThemeMode>("system");

    useEffect(() => {
        // İlk okuma
        const current = Appearance.getColorScheme();
        console.log('useEffect içinde okuma:', current);
        console.log('Mevcut systemTheme state:', systemTheme);

        if (current) {
            setSystemTheme(current);
        }

        // Dinleyici
        const listener = Appearance.addChangeListener(
            ({ colorScheme }) => {
                console.log('Tema değişti:', colorScheme);
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

    console.log('Render - mode:', mode, 'systemTheme:', systemTheme, 'effectiveTheme:', effectiveTheme);

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