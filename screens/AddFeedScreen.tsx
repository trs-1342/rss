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
    const { addFeedSource, loading } = useFeed();

    const [name, setName] = useState("Blog");
    const [url, setUrl] = useState(
        "https://yusufipek.me/tag/blog/rss"
    );

    const handleSave = async () => {
        const ok = await addFeedSource(name, url);
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
});
