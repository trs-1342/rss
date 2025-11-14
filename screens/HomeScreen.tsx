import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type {
    NativeStackScreenProps,
} from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../App";
import { useFeed } from "../context/FeedContext";

type Props = NativeStackScreenProps<
    HomeStackParamList,
    "HomeMain"
>;

export default function HomeScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const {
        selectedSource,
        items,
        loading,
        toggleArchive,
        toggleRead,
    } = useFeed();

    const visibleItems = items.filter((it) => !it.archived);

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
            edges={["top", "left", "right"]}
        >
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                    <Text
                        style={[styles.title, { color: colors.text }]}
                    >
                        {selectedSource?.name ?? "RSS Reader"}
                    </Text>
                    {selectedSource ? (
                        <Text
                            style={[
                                styles.subtitle,
                                { color: colors.text },
                            ]}
                            numberOfLines={1}
                        >
                            {selectedSource.url}
                        </Text>
                    ) : (
                        <Text
                            style={[
                                styles.subtitle,
                                { color: colors.text },
                            ]}
                        >
                            Henüz RSS kaynağı eklenmedi.
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate("AddFeed")}
                >
                    <Ionicons
                        name="add"
                        size={22}
                        color="#fff"
                    />
                </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator size="large" />}

            {!loading &&
                visibleItems.length === 0 &&
                selectedSource && (
                    <Text
                        style={[styles.info, { color: colors.text }]}
                    >
                        Bu kaynak için gösterilecek öğe bulunamadı.
                    </Text>
                )}

            {!loading &&
                (!selectedSource || visibleItems.length > 0) && (
                    <FlatList
                        data={visibleItems}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{
                            gap: 12,
                            paddingBottom: 24,
                        }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.item,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: colors.border,
                                        opacity: item.read ? 0.7 : 1,
                                    },
                                ]}
                                onPress={() =>
                                    navigation.navigate("PostDetail", {
                                        item,
                                    })
                                }
                            >
                                <View style={styles.itemHeaderRow}>
                                    <Text
                                        style={[
                                            styles.itemTitle,
                                            { color: colors.text },
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {item.title}
                                    </Text>
                                </View>

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
                                            name={
                                                item.archived
                                                    ? "archive"
                                                    : "archive-outline"
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
                                            Arşivle
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
                                            {item.read
                                                ? "Okunmadı yap"
                                                : "Okundu"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
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
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
    },
    subtitle: {
        fontSize: 13,
        marginTop: 4,
    },
    info: {
        fontSize: 14,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 999,
        backgroundColor: "#007AFF",
        alignItems: "center",
        justifyContent: "center",
    },
    item: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
    },
    itemHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    itemMeta: {
        fontSize: 11,
        marginBottom: 8,
    },
    itemActionRow: {
        flexDirection: "row",
        gap: 16,
        marginTop: 4,
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
