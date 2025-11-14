import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import type { HomeStackParamList } from "../App";

type DetailRoute = RouteProp<HomeStackParamList, "PostDetail">;

export default function PostDetailScreen() {
    const route = useRoute<DetailRoute>();
    const { item } = route.params;

    if (!item.link) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <WebView
            source={{ uri: item.link }}
            startInLoadingState
            renderLoading={() => (
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ActivityIndicator size="large" />
                </View>
            )}
        />
    );
}
