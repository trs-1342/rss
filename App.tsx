import React from "react";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./screens/HomeScreen";
import AddFeedScreen from "./screens/AddFeedScreen";
import SettingsScreen from "./screens/SettingsScreen";
import ArchivedScreen from "./screens/ArchivedScreen";
import PostDetailScreen from "./screens/PostDetailScreen";
import { FeedProvider, FeedItem } from "./context/FeedContext";
import {
  AppThemeProvider,
  useAppTheme,
} from "./context/ThemeContext";

export type HomeStackParamList = {
  HomeMain: undefined;
  AddFeed: undefined;
  PostDetail: { item: FeedItem };
};

export type RootTabParamList = {
  ArchivedTab: undefined;
  HomeTab: undefined;
  SettingsTab: undefined;
};

const HomeStack =
  createNativeStackNavigator<HomeStackParamList>();
const Tab =
  createBottomTabNavigator<RootTabParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: "RSS Reader" }}
      />
      <HomeStack.Screen
        name="AddFeed"
        component={AddFeedScreen}
        options={{ title: "Yeni Feed Ekle" }}
      />
      <HomeStack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: "Detay" }}
      />
    </HomeStack.Navigator>
  );
}

function AppNavigation() {
  const { navTheme, statusBarStyle } = useAppTheme();

  return (
    <>
      <StatusBar barStyle={statusBarStyle} />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ color, size }) => {
              if (route.name === "HomeTab") {
                return (
                  <Ionicons
                    name="home-outline"
                    size={size}
                    color={color}
                  />
                );
              } else if (route.name === "ArchivedTab") {
                return (
                  <Ionicons
                    name="archive-outline"
                    size={size}
                    color={color}
                  />
                );
              } else {
                return (
                  <Ionicons
                    name="settings-outline"
                    size={size}
                    color={color}
                  />
                );
              }
            },
            tabBarLabel:
              route.name === "HomeTab"
                ? "Anasayfa"
                : route.name === "ArchivedTab"
                  ? "Arşivler"
                  : "Ayarlar",
          })}
        >
          <Tab.Screen
            name="HomeTab"
            component={HomeStackNavigator}
          />
          <Tab.Screen
            name="ArchivedTab"
            component={ArchivedScreen}
          />
          <Tab.Screen
            name="SettingsTab"
            component={SettingsScreen}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <FeedProvider>
          <AppNavigation />
        </FeedProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}
