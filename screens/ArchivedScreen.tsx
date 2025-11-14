import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFeed } from "../context/FeedContext";

export default function ArchivedScreen() {
    const { colors } = useTheme();
    const { selectedSource, items, toggleArchive, toggleRead } =
        useFeed();

    const archivedItems = items.filter((it) => it.archived);

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
            edges={["top", "left", "right"]}
        >
            <Text
                style={[styles.title, { color: colors.text }]}
            >
                Arşivler
            </Text>

            {selectedSource && (
                <Text
                    style={[styles.subtitle, { color: colors.text }]}
                    numberOfLines={1}
                >
                    {selectedSource.name} – {selectedSource.url}
                </Text>
            )}

            {archivedItems.length === 0 ? (
                <Text
                    style={[styles.info, { color: colors.text }]}
                >
                    Henüz arşivlenmiş öğe yok.
                </Text>
            ) : (
                <FlatList
                    data={archivedItems}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        gap: 12,
                        paddingTop: 12,
                        paddingBottom: 24,
                    }}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.item,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.border,
                                    opacity: item.read ? 0.7 : 1,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.itemTitle,
                                    { color: colors.text },
                                ]}
                                numberOfLines={2}
                            >
                                {item.title}
                            </Text>
                            {item.pubDate && (
                                <Text
                                    style={[
                                        styles.itemMeta,
                                        { color: colors.text },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item.pubDate}
                                </Text>
                            )}

                            <View style={styles.itemActionRow}>
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => toggleArchive(item.id)}
                                >
                                    <Ionicons
                                        name="archive-outline"
                                        size={18}
                                        color={colors.text}
                                    />
                                    <Text
                                        style={[
                                            styles.iconButtonText,
                                            { color: colors.text },
                                        ]}
                                    >
                                        Arşivden çıkar
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => toggleRead(item.id)}
                                >
                                    <Ionicons
                                        name={
                                            item.read
                                                ? "eye-off-outline"
                                                : "eye-outline"
                                        }
                                        size={18}
                                        color={colors.text}
                                    />
                                    <Text
                                        style={[
                                            styles.iconButtonText,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {item.read ? "Okunmadı yap" : "Okundu"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
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
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        marginBottom: 8,
    },
    info: {
        fontSize: 14,
    },
    item: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    itemMeta: {
        fontSize: 11,
        marginBottom: 8,
    },
    itemActionRow: {
        flexDirection: "row",
        gap: 16,
    },
    iconButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    iconButtonText: {
        fontSize: 12,
    },
});
