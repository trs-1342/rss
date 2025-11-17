import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Button,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import type {
    NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import type { HomeStackParamList } from "../App";
import { useFeed } from "../context/FeedContext";

type Props = NativeStackScreenProps<
    HomeStackParamList,
    "AddFeed"
>;

type SuggestedFeedKind = "site" | "yt";

type SuggestedFeed = {
    id: string;
    name: string;
    url: string;
    kind: SuggestedFeedKind;
};

const SUGGESTED_FEEDS: SuggestedFeed[] = [
    {
        id: "trs1342",
        name: "trs-1342",
        url: "https://hattab.vercel.app/hsounds/rss.xml",
        kind: "site",
    },
    {
        id: "webtekno",
        name: "Webtekno",
        url: "https://www.webtekno.com/rss.xml",
        kind: "site",
    },
    {
        id: "teknoseyir",
        name: "TeknoSeyir",
        url: "https://teknoseyir.com/feed",
        kind: "site",
    },
    {
        id: "baris-ozcan",
        name: "Barış Özcan (YouTube)",
        url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCv6jcPwFujuTIwFQ11jt1Yw",
        kind: "yt",
    },
    {
        id: "yusuf-ipek",
        name: "Yusuf İpek (YouTube)",
        url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCWpk9PSGHoJW1hZT4egxTNQ",
        kind: "yt",
    },
    {
        id: "ruhi-cenet",
        name: "Ruhi Çenet (YouTube)",
        url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCWpk9PSGHoJW1hZT4egxTNQ",
        kind: "yt",
    }
];

export default function AddFeedScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const { addFeedSource, loading } = useFeed();

    const [name, setName] = useState("RSS BAĞLANTISI BAŞLIĞI");
    const [url, setUrl] = useState("");
    const [suggested, setSuggested] = useState<SuggestedFeed[]>(
        SUGGESTED_FEEDS
    );

    const handleSave = async () => {
        const ok = await addFeedSource(name, url);
        if (ok) {
            navigation.goBack();
        }
    };

    const handleUseSuggestion = async (feed: SuggestedFeed) => {
        const ok = await addFeedSource(feed.name, feed.url);
        if (ok) {
            navigation.goBack();
        }
    };

    const handleHideSuggestion = (id: string) => {
        setSuggested((prev) => prev.filter((s) => s.id !== id));
    };

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
            contentContainerStyle={{ paddingBottom: 32 }}
        >
            <Text
                style={[styles.title, { color: colors.text }]}
            >
                Yeni RSS Kaynağı
            </Text>

            <Text
                style={[styles.label, { color: colors.text }]}
            >
                Kaynak Adı
            </Text>
            <TextInput
                style={[
                    styles.input,
                    {
                        borderColor: colors.border,
                        color: colors.text,
                    },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Örn: Kişisel Blog"
                placeholderTextColor={colors.border}
            />

            <Text
                style={[styles.label, { color: colors.text }]}
            >
                RSS URL
            </Text>
            <TextInput
                style={[
                    styles.input,
                    {
                        borderColor: colors.border,
                        color: colors.text,
                    },
                ]}
                value={url}
                onChangeText={setUrl}
                placeholder="RSS adresi gir"
                autoCapitalize="none"
                keyboardType="url"
                placeholderTextColor={colors.border}
            />

            <Button
                title={loading ? "Yükleniyor..." : "Kaydet"}
                onPress={handleSave}
                disabled={loading}
            />

            {/* Önerilen RSS bağlantıları */}
            <View style={styles.sectionSpacer} />
            <Text
                style={[styles.suggestTitle, { color: colors.text }]}
            >
                Önerilen RSS bağlantıları
            </Text>

            {suggested.length === 0 ? (
                <Text
                    style={[styles.suggestHint, { color: colors.text }]}
                >
                    Tüm önerileri kaldırdın.
                </Text>
            ) : (
                <View style={styles.suggestList}>
                    {suggested.map((feed) => (
                        <View
                            key={feed.id}
                            style={[
                                styles.suggestRow,
                                {
                                    borderColor: colors.border,
                                    backgroundColor: colors.card,
                                },
                            ]}
                        >
                            {/* Sol: eksi / kaldır */}
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() =>
                                    handleHideSuggestion(feed.id)
                                }
                            >
                                <Ionicons
                                    name="remove-circle-outline"
                                    size={22}
                                    color="#ff3b30"
                                />
                            </TouchableOpacity>

                            {/* Orta: link + (site/yt) */}
                            <View style={styles.suggestTextContainer}>
                                <Text
                                    style={[
                                        styles.suggestUrl,
                                        { color: colors.text },
                                    ]}
                                    numberOfLines={1}
                                >
                                    <Text style={{ fontWeight: "bold" }}>{feed.name}</Text>: {feed.url} (
                                    {feed.kind === "yt"
                                        ? "yt"
                                        : "site"}
                                    )
                                </Text>
                            </View>

                            {/* Sağ: artı / ekle */}
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() =>
                                    handleUseSuggestion(feed)
                                }
                            >
                                <Ionicons
                                    name="add-circle-outline"
                                    size={22}
                                    color="#34c759"
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 8,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    sectionSpacer: {
        height: 24,
    },
    suggestTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    suggestHint: {
        fontSize: 12,
        opacity: 0.7,
    },
    suggestList: {
        gap: 8,
    },
    suggestRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    iconButton: {
        padding: 4,
    },
    suggestTextContainer: {
        flex: 1,
        paddingHorizontal: 8,
    },
    suggestUrl: {
        fontSize: 13,
        fontWeight: "500",
    },
});
