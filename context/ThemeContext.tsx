import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";
import {
    DarkTheme,
    DefaultTheme,
    Theme,
} from "@react-navigation/native";
import { useColorScheme } from "react-native";

export type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    navTheme: Theme;
    statusBarStyle: "light-content" | "dark-content";
};

const ThemeContext = createContext<ThemeContextValue | undefined>(
    undefined
);

export const AppThemeProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const systemScheme = useColorScheme(); // "light" | "dark" | null
    const [mode, setMode] = useState<ThemeMode>("system");

    const effectiveScheme =
        mode === "system"
            ? systemScheme ?? "light"
            : mode;

    const navTheme =
        effectiveScheme === "dark" ? DarkTheme : DefaultTheme;

    const statusBarStyle =
        effectiveScheme === "dark"
            ? "light-content"
            : "dark-content";

    return (
        <ThemeContext.Provider
            value={{ mode, setMode, navTheme, statusBarStyle }}
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
