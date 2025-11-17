import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Keyboard
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

    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const { colors } = useTheme();
    const {
        sources,
        selectedSource,
        items,
        loading,
        toggleArchive,
        toggleRead,
        selectSource,
        homeViewMode,
    } = useFeed();

    const [expandedId, setExpandedId] = useState<string | undefined>(
        undefined
    );

    const [search, setSearch] = useState("");

    const [filterMode, setFilterMode] = useState<"all" | "unread" | "read">("all");

    const cycleFilterMode = () => {
        setFilterMode((prev) =>
            prev === "all" ? "unread" : prev === "unread" ? "read" : "all"
        );
    };

    const filterLabel =
        filterMode === "all"
            ? "Hepsi"
            : filterMode === "unread"
                ? "Okunmamış"
                : "Okunmuş";

    const handleSearchChange = (text: string) => {
        setSearch(text);

        const trimmed = text.trim().toLowerCase();
        if (trimmed.length === 0) {
            return; // arama boşsa kartlarla oynamıyoruz
        }

        // En alakalı kaynağı bul: adı veya URL'i arama metnini içeriyorsa
        const match = sources.find((src) =>
            src.name.toLowerCase().includes(trimmed) ||
            src.url.toLowerCase().includes(trimmed)
        );

        if (match) {
            // Bu kaynağı seç ve kartını aç
            selectSource(match.id);
            setExpandedId(match.id);
        }
    };


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


    // const visibleItems = items.filter((it) => {
    //     if (it.archived) return false;
    //     if (search.trim().length === 0) return true;
    //     return it.title.toLowerCase().includes(search.toLowerCase());
    // });

    const visibleItems = items.filter((it) => {
        // Arşivlenmişleri gösterme
        if (it.archived) return false;

        // Filtre modu
        if (filterMode === "unread" && it.read) return false;
        if (filterMode === "read" && !it.read) return false;

        // Arama
        if (search.trim().length > 0) {
            const text = it.title?.toLowerCase() ?? "";
            if (!text.includes(search.toLowerCase())) return false;
        }

        return true;
    });


    // --------- SINGLE MODE (eski davranış) -----------
    if (homeViewMode === "single") {
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

                <View style={styles.searchRow}>
                    <TextInput
                        placeholder="Başlıkta ara..."
                        placeholderTextColor={colors.text}
                        value={search}
                        onChangeText={handleSearchChange}
                        style={[
                            styles.searchInput,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                color: colors.text,
                            },
                        ]}
                    />

                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            { borderColor: colors.border, backgroundColor: colors.card },
                        ]}
                        onPress={cycleFilterMode}
                    >
                        <Ionicons
                            name="filter-outline"
                            size={16}
                            color={colors.text}
                        />
                        <Text
                            style={[
                                styles.filterButtonText,
                                { color: colors.text },
                            ]}
                        >
                            {filterLabel}
                        </Text>
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
                            keyboardDismissMode="on-drag"
                            keyboardShouldPersistTaps="handled"
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
            </SafeAreaView>
        );
    }

    // --------- ALL MODE (tüm kaynaklar kart) -----------
    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
            edges={["top", "left", "right"]}
        >
            <View style={styles.headerRow}>
                <Text
                    style={[styles.title, { color: colors.text }]}
                >
                    Kaynaklar
                </Text>

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

            <View style={styles.searchRow}>
                <TextInput
                    placeholder="Başlıkta ara..."
                    placeholderTextColor={colors.text}
                    value={search}
                    onChangeText={handleSearchChange}
                    style={[
                        styles.searchInput,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            color: colors.text,
                        },
                    ]}
                />

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        { borderColor: colors.border, backgroundColor: colors.card },
                    ]}
                    onPress={cycleFilterMode}
                >
                    <Ionicons
                        name="filter-outline"
                        size={16}
                        color={colors.text}
                    />
                    <Text
                        style={[
                            styles.filterButtonText,
                            { color: colors.text },
                        ]}
                    >
                        {filterLabel}
                    </Text>
                </TouchableOpacity>
            </View>


            {/* <TextInput
                placeholder="Kaynaklar içinde ara..."
                placeholderTextColor={colors.text}
                value={search}
                onChangeText={setSearch}
                style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    color: colors.text,
                    marginBottom: 12,
                }}
            /> */}


            {sources.length === 0 ? (
                <Text
                    style={[styles.info, { color: colors.text }]}
                >
                    Henüz RSS kaynağı eklenmedi. Sağ üstten
                    ekleyebilirsin.
                </Text>
            ) : (
                <FlatList
                    data={sources}
                    keyExtractor={(src) => src.id}
                    contentContainerStyle={{
                        gap: 12,
                        paddingBottom: 24,
                    }}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    // renderItem={({ item: src }) => {
                    //     const hasSearch = search.trim().length > 0;

                    //     // Bu kaynağa ait RSS postlarını al
                    //     const srcItems = visibleItems.filter((it) => it.sourceId === src.id);

                    //     // Arama yapılıyorsa ve bu kaynakta eşleşen post varsa kartı otomatik aç
                    //     const isExpandedBySearch = hasSearch && srcItems.length > 0;

                    //     // Normal durumda user'ın tıkladığı kartlar expandedId ile kontrol edilir
                    //     const isExpanded = isExpandedBySearch || expandedId === src.id;

                    //     // İstersen seçili kaynağı ayrı stillendirmek için kullanabilirsin
                    //     const isSelected = selectedSource?.id === src.id;

                    renderItem={({ item: src }) => {
                        const isSelected = selectedSource?.id === src.id;
                        const isExpanded = expandedId === src.id;

                        const srcItems =
                            isSelected && isExpanded
                                ? visibleItems
                                : [];



                        return (
                            <View
                                style={[
                                    styles.sourceCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                {/* Üst başlık satırı */}
                                <TouchableOpacity
                                    style={styles.sourceHeader}
                                    onPress={() => {
                                        if (expandedId === src.id) {
                                            setExpandedId(undefined);
                                            return;
                                        }
                                        // Kart açılırken bu kaynağı seç ve feed'i yükle
                                        selectSource(src.id);
                                        setExpandedId(src.id);
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={[
                                                styles.sourceTitle,
                                                { color: colors.text },
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {src.name}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.sourceUrl,
                                                { color: colors.text },
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {src.url}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name={
                                            isExpanded
                                                ? "chevron-up-outline"
                                                : "chevron-down-outline"
                                        }
                                        size={18}
                                        color={colors.text}
                                    />
                                </TouchableOpacity>

                                {/* Kart açıldığında RSS öğeleri */}
                                {isExpanded && (
                                    <View style={styles.sourceBody}>
                                        {loading && (
                                            <ActivityIndicator
                                                size="small"
                                            />
                                        )}

                                        {!loading &&
                                            srcItems.length === 0 && (
                                                <Text
                                                    style={{
                                                        color: colors.text,
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    Bu kaynak için gösterilecek
                                                    öğe bulunamadı.
                                                </Text>
                                            )}

                                        {!loading &&
                                            srcItems.length > 0 && (
                                                <View style={styles.itemsInsideCard}>
                                                    {srcItems.map((item) => (
                                                        <TouchableOpacity
                                                            key={item.id}
                                                            style={[
                                                                styles.item,
                                                                {
                                                                    backgroundColor:
                                                                        colors.background,
                                                                    borderColor:
                                                                        colors.border,
                                                                    opacity: item.read
                                                                        ? 0.7
                                                                        : 1,
                                                                },
                                                            ]}
                                                            onPress={() =>
                                                                navigation.navigate(
                                                                    "PostDetail",
                                                                    { item }
                                                                )
                                                            }
                                                        >
                                                            <View
                                                                style={
                                                                    styles.itemHeaderRow
                                                                }
                                                            >
                                                                <Text
                                                                    style={[
                                                                        styles.itemTitle,
                                                                        {
                                                                            color:
                                                                                colors.text,
                                                                        },
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
                                                                        {
                                                                            color:
                                                                                colors.text,
                                                                        },
                                                                    ]}
                                                                    numberOfLines={1}
                                                                >
                                                                    {item.pubDate}
                                                                </Text>
                                                            )}

                                                            <View
                                                                style={
                                                                    styles.itemActionRow
                                                                }
                                                            >
                                                                <TouchableOpacity
                                                                    style={
                                                                        styles.iconButton
                                                                    }
                                                                    onPress={() =>
                                                                        toggleArchive(
                                                                            item.id
                                                                        )
                                                                    }
                                                                >
                                                                    <Ionicons
                                                                        name={
                                                                            item.archived
                                                                                ? "archive"
                                                                                : "archive-outline"
                                                                        }
                                                                        size={16}
                                                                        color={
                                                                            colors.text
                                                                        }
                                                                    />
                                                                    <Text
                                                                        style={[
                                                                            styles.iconButtonText,
                                                                            {
                                                                                color:
                                                                                    colors.text,
                                                                            },
                                                                        ]}
                                                                    >
                                                                        Arşivle
                                                                    </Text>
                                                                </TouchableOpacity>

                                                                <TouchableOpacity
                                                                    style={
                                                                        styles.iconButton
                                                                    }
                                                                    onPress={() =>
                                                                        toggleRead(
                                                                            item.id
                                                                        )
                                                                    }
                                                                >
                                                                    <Ionicons
                                                                        name={
                                                                            item.read
                                                                                ? "eye-off-outline"
                                                                                : "eye-outline"
                                                                        }
                                                                        size={16}
                                                                        color={
                                                                            colors.text
                                                                        }
                                                                    />
                                                                    <Text
                                                                        style={[
                                                                            styles.iconButtonText,
                                                                            {
                                                                                color:
                                                                                    colors.text,
                                                                            },
                                                                        ]}
                                                                    >
                                                                        {item.read
                                                                            ? "Okunmadı"
                                                                            : "Okundu"}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}
                                    </View>
                                )}
                            </View>
                        );
                    }}
                />
            )}

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
    sourceCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 10,
    },
    sourceHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sourceTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    sourceUrl: {
        fontSize: 12,
        marginTop: 2,
    },
    sourceBody: {
        marginTop: 8,
    },
    itemsInsideCard: {
        gap: 8,
    },
    item: {
        padding: 10,
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
        fontSize: 14,
        fontWeight: "600",
    },
    itemMeta: {
        fontSize: 11,
        marginBottom: 6,
    },
    itemActionRow: {
        flexDirection: "row",
        gap: 12,
    },
    iconButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    iconButtonText: {
        fontSize: 11,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        gap: 4,
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: "500",
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

});
