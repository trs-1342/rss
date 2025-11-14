import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Button,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import type {
    NativeStackScreenProps,
} from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../App";
import { useFeed } from "../context/FeedContext";

type Props = NativeStackScreenProps<
    HomeStackParamList,
    "AddFeed"
>;

export default function AddFeedScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const { addOrLoadFeed, loading } = useFeed();

    const [url, setUrl] = useState(
        "https://yusufipek.me/tag/blog/rss"
    );

    const handleSave = async () => {
        const trimmed = url.trim();
        if (!trimmed) {
            return;
        }

        const ok = await addOrLoadFeed(trimmed);
        if (ok) {
            navigation.goBack();
        }
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
                Yeni Feed Ekle
            </Text>
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

            <Text
                style={[styles.hint, { color: colors.text }]}
            >
                Örnek: https://yusufipek.me/tag/blog/rss
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        gap: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    hint: {
        fontSize: 12,
        marginTop: 8,
    },
});
