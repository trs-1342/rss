import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Keyboard,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
} from "react-native";
import {
    useTheme,
} from "@react-navigation/native";
import { Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme, ThemeMode } from "../context/ThemeContext";
import { useFeed } from "../context/FeedContext";

export default function SettingsScreen() {
    const { colors } = useTheme();
    const { mode, setMode } = useAppTheme();
    const {
        refreshMinutes,
        setRefreshMinutes,
        sources,
        selectedSource,
        selectSource,
        removeFeedSource,
        homeViewMode,
        setHomeViewMode,
    } = useFeed();

    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", () =>
            setKeyboardVisible(true)
        );
        const hideSub = Keyboard.addListener("keyboardDidHide", () =>
            setKeyboardVisible(false)
        );

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

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

    const ModeButton = ({
        label,
        modeValue,
    }: {
        label: string;
        modeValue: ThemeMode;
    }) => {
        const active = mode === modeValue;
        return (
            <TouchableOpacity
                style={[
                    styles.modeButton,
                    {
                        borderColor: colors.border,
                        backgroundColor: active
                            ? colors.primary ?? "#333"
                            : "transparent",
                    },
                ]}
                onPress={() => setMode(modeValue)}
            >
                <Text
                    style={[
                        styles.modeButtonText,
                        {
                            color: active
                                ? colors.card
                                : colors.text,
                        },
                    ]}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    const HomeViewButton = ({
        label,
        value,
    }: {
        label: string;
        value: "single" | "all";
    }) => {
        const active = homeViewMode === value;
        return (
            <TouchableOpacity
                style={[
                    styles.modeButton,
                    {
                        borderColor: colors.border,
                        backgroundColor: active
                            ? colors.primary ?? "#333"
                            : "transparent",
                    },
                ]}
                onPress={() => setHomeViewMode(value)}
            >
                <Text
                    style={[
                        styles.modeButtonText,
                        {
                            color: active
                                ? colors.card
                                : colors.text,
                        },
                    ]}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        // <SafeAreaView
        //     style={[
        //         styles.container,
        //         { backgroundColor: colors.background },
        //     ]}
        //     edges={["top", "left", "right"]}
        // >
        //     <Text
        //         style={[styles.title, { color: colors.text }]}
        //     >
        //         Ayarlar
        //     </Text>

        //     {/* Tema */}
        //     <Text
        //         style={[styles.subtitle, { color: colors.text }]}
        //     >
        //         Tema
        //     </Text>

        //     <View style={styles.row}>
        //         <ModeButton label="Varsayılan" modeValue="system" />
        //         <ModeButton label="Beyaz" modeValue="light" />
        //         <ModeButton label="Siyah" modeValue="dark" />
        //     </View>

        //     {/* Yenileme süresi */}
        //     <View style={styles.sectionSpacer} />

        //     <Text
        //         style={[styles.subtitle, { color: colors.text }]}
        //     >
        //         Otomatik Yenileme Süresi (dk)
        //     </Text>

        //     <View style={styles.refreshRow}>
        //         <TouchableOpacity
        //             style={[
        //                 styles.refreshButton,
        //                 {
        //                     borderColor: colors.border,
        //                     backgroundColor:
        //                         colors.card,
        //                 },
        //             ]}
        //             onPress={() => changeBy(-1)}
        //         >
        //             <Text
        //                 style={[
        //                     styles.refreshButtonText,
        //                     { color: colors.text },
        //                 ]}
        //             >
        //                 -
        //             </Text>
        //         </TouchableOpacity>

        //         <TextInput
        //             style={[
        //                 styles.refreshInput,
        //                 {
        //                     borderColor: colors.border,
        //                     color: colors.text,
        //                 },
        //             ]}
        //             value={refreshInput}
        //             onChangeText={setRefreshInput}
        //             onBlur={applyRefreshInput}
        //             keyboardType="numeric"
        //         />

        //         <TouchableOpacity
        //             style={[
        //                 styles.refreshButton,
        //                 {
        //                     borderColor: colors.border,
        //                     backgroundColor:
        //                         colors.card,
        //                 },
        //             ]}
        //             onPress={() => changeBy(1)}
        //         >
        //             <Text
        //                 style={[
        //                     styles.refreshButtonText,
        //                     { color: colors.text },
        //                 ]}
        //             >
        //                 +
        //             </Text>
        //         </TouchableOpacity>
        //     </View>

        //     <Text
        //         style={[styles.hint, { color: colors.text }]}
        //     >
        //         Minimum 1, maksimum 120 dakika. Şu an:{" "}
        //         {refreshMinutes} dk.
        //     </Text>

        //     {/* Ana sayfa görünümü */}
        //     <View style={styles.sectionSpacer} />

        //     <Text
        //         style={[styles.subtitle, { color: colors.text }]}
        //     >
        //         Ana sayfa görünümü
        //     </Text>

        //     <View style={styles.row}>
        //         <HomeViewButton
        //             label="Seçili kaynak"
        //             value="single"
        //         />
        //         <HomeViewButton
        //             label="Tüm kaynaklar"
        //             value="all"
        //         />
        //     </View>

        //     {/* RSS Kaynakları */}
        //     <View style={styles.sectionSpacer} />

        //     <Text
        //         style={[styles.subtitle, { color: colors.text }]}
        //     >
        //         RSS Kaynakları
        //     </Text>

        //     {sources.length === 0 ? (
        //         <Text
        //             style={[styles.hint, { color: colors.text }]}
        //         >
        //             Henüz eklenmiş bir RSS kaynağı yok.
        //         </Text>
        //     ) : (
        //         <View style={styles.feedList}>
        //             {sources.map((src) => {
        //                 const active =
        //                     selectedSource?.id === src.id;
        //                 return (
        //                     <View
        //                         key={src.id}
        //                         style={[
        //                             styles.feedRow,
        //                             {
        //                                 backgroundColor: active
        //                                     ? colors.card
        //                                     : "transparent",
        //                                 borderColor: colors.border,
        //                             },
        //                         ]}
        //                     >
        //                         <TouchableOpacity
        //                             style={styles.feedInfo}
        //                             onPress={() => selectSource(src.id)}
        //                         >
        //                             <View
        //                                 style={styles.feedLeftIndicator}
        //                             >
        //                                 <Ionicons
        //                                     name={
        //                                         active
        //                                             ? "radio-button-on-outline"
        //                                             : "radio-button-off-outline"
        //                                     }
        //                                     size={18}
        //                                     color={colors.text}
        //                                 />
        //                             </View>
        //                             <View style={{ flex: 1 }}>
        //                                 <Text
        //                                     style={[
        //                                         styles.feedName,
        //                                         { color: colors.text },
        //                                     ]}
        //                                     numberOfLines={1}
        //                                 >
        //                                     {src.name}
        //                                 </Text>
        //                                 <Text
        //                                     style={[
        //                                         styles.feedUrl,
        //                                         { color: colors.text },
        //                                     ]}
        //                                     numberOfLines={1}
        //                                 >
        //                                     {src.url}
        //                                 </Text>
        //                             </View>
        //                         </TouchableOpacity>

        //                         <TouchableOpacity
        //                             style={styles.feedRemoveButton}
        //                             onPress={() =>
        //                                 removeFeedSource(src.id)
        //                             }
        //                         >
        //                             <Ionicons
        //                                 name="remove-circle-outline"
        //                                 size={22}
        //                                 color="#ff3b30"
        //                             />
        //                         </TouchableOpacity>
        //                     </View>
        //                 );
        //             })}
        //         </View>
        //     )}

        //     {keyboardVisible && (
        //         <TouchableOpacity
        //             style={[
        //                 styles.keyboardButton,
        //                 {
        //                     backgroundColor: colors.card,
        //                     borderColor: colors.border,
        //                 },
        //             ]}
        //             onPress={() => Keyboard.dismiss()}
        //         >
        //             <Ionicons
        //                 name="chevron-down-outline"
        //                 size={18}
        //                 color={colors.text}
        //             />
        //         </TouchableOpacity>
        //     )}

        // </SafeAreaView>

        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
            edges={["top", "left", "right"]}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text
                            style={[styles.title, { color: colors.text }]}
                        >
                            Ayarlar
                        </Text>

                        {/* Tema */}
                        <Text
                            style={[styles.subtitle, { color: colors.text }]}
                        >
                            Tema
                        </Text>

                        <View style={styles.row}>
                            <ModeButton label="Varsayılan" modeValue="system" />
                            <ModeButton label="Beyaz" modeValue="light" />
                            <ModeButton label="Siyah" modeValue="dark" />
                        </View>

                        {/* Yenileme süresi */}
                        <View style={styles.sectionSpacer} />

                        <Text
                            style={[styles.subtitle, { color: colors.text }]}
                        >
                            Otomatik Yenileme Süresi (dk)
                        </Text>

                        <View style={styles.refreshRow}>
                            <TouchableOpacity
                                style={[
                                    styles.refreshButton,
                                    {
                                        borderColor: colors.border,
                                        backgroundColor: colors.card,
                                    },
                                ]}
                                onPress={() => changeBy(-1)}
                            >
                                <Text
                                    style={[
                                        styles.refreshButtonText,
                                        { color: colors.text },
                                    ]}
                                >
                                    -
                                </Text>
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
                                style={[
                                    styles.refreshButton,
                                    {
                                        borderColor: colors.border,
                                        backgroundColor: colors.card,
                                    },
                                ]}
                                onPress={() => changeBy(1)}
                            >
                                <Text
                                    style={[
                                        styles.refreshButtonText,
                                        { color: colors.text },
                                    ]}
                                >
                                    +
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text
                            style={[styles.hint, { color: colors.text }]}
                        >
                            Minimum 1, maksimum 120 dakika. Şu an:{" "}
                            {refreshMinutes} dk.
                        </Text>

                        {/* Ana sayfa görünümü */}
                        <View style={styles.sectionSpacer} />

                        <Text
                            style={[styles.subtitle, { color: colors.text }]}
                        >
                            Ana sayfa görünümü
                        </Text>

                        <View style={styles.row}>
                            <HomeViewButton
                                label="Seçili kaynak"
                                value="single"
                            />
                            <HomeViewButton
                                label="Tüm kaynaklar"
                                value="all"
                            />
                        </View>

                        {/* RSS Kaynakları */}
                        <View style={styles.sectionSpacer} />

                        <Text
                            style={[styles.subtitle, { color: colors.text }]}
                        >
                            RSS Kaynakları

                        </Text>

                        {sources.length === 0 ? (
                            <Text
                                style={[styles.hint, { color: colors.text }]}
                            >
                                Henüz eklenmiş bir RSS kaynağı yok.
                            </Text>
                        ) : (
                            <View style={styles.feedList}>
                                {sources.map((src) => {
                                    const active = selectedSource?.id === src.id;
                                    return (
                                        <View
                                            key={src.id}
                                            style={[
                                                styles.feedRow,
                                                {
                                                    backgroundColor: active
                                                        ? colors.card
                                                        : "transparent",
                                                    borderColor: colors.border,
                                                },
                                            ]}
                                        >
                                            <TouchableOpacity
                                                style={styles.feedInfo}
                                                onPress={() => selectSource(src.id)}
                                            >
                                                <View style={styles.feedLeftIndicator}>
                                                    <Ionicons
                                                        name={
                                                            active
                                                                ? "radio-button-on-outline"
                                                                : "radio-button-off-outline"
                                                        }
                                                        size={18}
                                                        color={colors.text}
                                                    />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text
                                                        style={[
                                                            styles.feedName,
                                                            { color: colors.text },
                                                        ]}
                                                        numberOfLines={1}
                                                    >
                                                        {src.name}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.feedUrl,
                                                            { color: colors.text },
                                                        ]}
                                                        numberOfLines={1}
                                                    >
                                                        {src.url}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.feedRemoveButton}
                                                onPress={() =>
                                                    removeFeedSource(src.id)
                                                }
                                            >
                                                <Ionicons
                                                    name="remove-circle-outline"
                                                    size={22}
                                                    color="#ff3b30"
                                                />
                                            </TouchableOpacity>

                                        </View>
                                    );
                                })}
                            </View>

                        )}
                    </ScrollView>
                </TouchableWithoutFeedback>

                {keyboardVisible && (
                    <TouchableOpacity
                        style={[
                            styles.keyboardButton,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                            },
                        ]}
                        onPress={() => Keyboard.dismiss()}
                    >
                        <Ionicons
                            name="chevron-down-outline"
                            size={18}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                )}
            </KeyboardAvoidingView>

            <View style={styles.footerContainer}>
                <Text style={[styles.footerText, { color: colors.text }]}>
                    RSS Reader App · {new Date().getFullYear()} · geliştiren:{" "}
                    <Text
                        style={[styles.footerLink, { color: colors.primary ?? "#1e90ff" }]}
                        onPress={() => Linking.openURL("https://hattab.vercel.app")}
                    >
                        trs1342
                    </Text>
                </Text>
            </View>

        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
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
        borderRadius: 999,
        borderWidth: 1,
        alignItems: "center",
    },
    modeButtonText: {
        fontSize: 14,
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
    },
    refreshButtonText: {
        fontSize: 20,
        fontWeight: "700",
    },
    refreshInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        textAlign: "center",
        fontSize: 16,
    },
    hint: {
        marginTop: 8,
        fontSize: 12,
    },
    feedList: {
        marginTop: 8,
        gap: 8,
    },
    feedRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 4,
    },
    feedInfo: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        gap: 8,
    },
    feedLeftIndicator: {
        width: 24,
        alignItems: "center",
    },
    feedName: {
        fontSize: 14,
        fontWeight: "600",
    },
    feedUrl: {
        fontSize: 12,
    },
    feedRemoveButton: {
        paddingLeft: 4,
    },
    keyboardButton: {
        position: "absolute",
        right: 16,
        bottom: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        elevation: 3, // Android gölge
    },
    content: {
        paddingBottom: 40,
    },
    footerContainer: {
        marginTop: 16,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "rgba(255,255,255,0.12)", // koyu temada ince çizgi
        alignItems: "center",
    },
    footerText: {
        fontSize: 11,
        opacity: 0.7,
        textAlign: "center",
        letterSpacing: 0.4,
    },
    footerLink: {
        fontSize: 11,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});
