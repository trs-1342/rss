// components/SwipeableItemRow.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import { RssItem } from "@/types/rss";

type Props = {
    item: RssItem;
    feedName: string;
    onToggleRead: () => void;
    onToggleArchive: () => void;
};

const SwipeableItemRow: React.FC<Props> = ({ item, feedName, onToggleRead, onToggleArchive }) => {
    const renderLeftActions = () => (
        <RectButton
            onPress={onToggleArchive}
            style={{
                flex: 1,
                backgroundColor: "#b91c1c", // kırmızımsı
                justifyContent: "center",
                paddingHorizontal: 16,
            }}
        >
            <Text style={{ color: "white", fontWeight: "600" }}>Arşivle / Arşivden çıkar</Text>
        </RectButton>
    );

    const renderRightActions = () => (
        <RectButton
            onPress={onToggleRead}
            style={{
                flex: 1,
                backgroundColor: "#15803d", // yeşilimsi
                justifyContent: "center",
                paddingHorizontal: 16,
            }}
        >
            <Text style={{ color: "white", fontWeight: "600" }}>
                {item.isRead ? "Okunmadı yap" : "Okundu yap"}
            </Text>
        </RectButton>
    );

    return (
        <Swipeable renderLeftActions={renderLeftActions} renderRightActions={renderRightActions}>
            <TouchableOpacity
                activeOpacity={0.7}
                style={{
                    paddingVertical: 8,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#333",
                }}
            >
                <Text
                    style={{
                        color: item.isRead ? "#888" : "white",
                        fontSize: 14,
                        fontWeight: item.isRead ? "400" : "600",
                    }}
                    numberOfLines={2}
                >
                    {item.title}
                </Text>
                <Text style={{ color: "#666", fontSize: 12 }}>
                    {feedName} •{" "}
                    {item.pubDate ? new Date(item.pubDate).toLocaleString() : "Tarih yok"}
                </Text>
            </TouchableOpacity>
        </Swipeable>
    );
};

export default SwipeableItemRow;
