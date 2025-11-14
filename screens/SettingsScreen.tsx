import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { useAppTheme, ThemeMode } from "../context/ThemeContext";
import { useFeed } from "../context/FeedContext";

const ModeButton = ({
    label,
    modeValue,
    current,
    onPress,
}: {
    label: string;
    modeValue: ThemeMode;
    current: ThemeMode;
    onPress: () => void;
}) => {
    const active = current === modeValue;
    return (
        <TouchableOpacity
            style={[
                styles.modeButton,
                active && styles.modeButtonActive,
            ]}
            onPress={onPress}
        >
            <Text
                style={[
                    styles.modeButtonText,
                    active && styles.modeButtonTextActive,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};

export default function SettingsScreen() {
    const { colors } = useTheme();
    const { mode, setMode } = useAppTheme();
    const { refreshMinutes, setRefreshMinutes } = useFeed();

    const [refreshInput, setRefreshInput] = useState<string>(
        String(refreshMinutes)
    );

    const applyRefreshInput = () => {
        const num = parseInt(refreshInput, 10);
        if (Number.isNaN(num)) {
            setRefreshInput(String(refreshMinutes));
            return;
        }
        setRefreshMinutes(num);
        setRefreshInput(String(num));
    };

    const changeBy = (delta: number) => {
        const num =
            parseInt(refreshInput, 10) || refreshMinutes;
        const next = num + delta;
        setRefreshMinutes(next);
        setRefreshInput(String(next));
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
        >
            <Text
                style={[styles.title, { color: colors.text }]}
            >
                Ayarlar
            </Text>

            <Text
                style={[styles.subtitle, { color: colors.text }]}
            >
                Tema
            </Text>

            <View style={styles.row}>
                <ModeButton
                    label="Varsayılan"
                    modeValue="system"
                    current={mode}
                    onPress={() => setMode("system")}
                />
                <ModeButton
                    label="Beyaz"
                    modeValue="light"
                    current={mode}
                    onPress={() => setMode("light")}
                />
                <ModeButton
                    label="Siyah"
                    modeValue="dark"
                    current={mode}
                    onPress={() => setMode("dark")}
                />
            </View>

            <View style={styles.sectionSpacer} />

            <Text
                style={[styles.subtitle, { color: colors.text }]}
            >
                Otomatik Yenileme Süresi (dk)
            </Text>

            <View style={styles.refreshRow}>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={() => changeBy(-1)}
                >
                    <Text style={styles.refreshButtonText}>-</Text>
                </TouchableOpacity>

                <TextInput
                    style={[
                        styles.refreshInput,
                        {
                            borderColor: colors.border,
                            color: colors.text,
                        },
                    ]}
                    value={refreshInput}
                    onChangeText={setRefreshInput}
                    onBlur={applyRefreshInput}
                    keyboardType="numeric"
                />

                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={() => changeBy(1)}
                >
                    <Text style={styles.refreshButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            <Text
                style={[styles.hint, { color: colors.text }]}
            >
                Minimum 1, maksimum 120 dakika. Şu an:{" "}
                {refreshMinutes} dk.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        gap: 8,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#999",
        alignItems: "center",
    },
    modeButtonActive: {
        backgroundColor: "#333",
        borderColor: "#333",
    },
    modeButtonText: {
        fontSize: 14,
        color: "#333",
    },
    modeButtonTextActive: {
        color: "#fff",
        fontWeight: "600",
    },
    sectionSpacer: {
        height: 24,
    },
    refreshRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#999",
    },
    refreshButtonText: {
        fontSize: 20,
        fontWeight: "700",
    },
    refreshInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        textAlign: "center",
        fontSize: 16,
    },
    hint: {
        marginTop: 8,
        fontSize: 12,
    },
});
