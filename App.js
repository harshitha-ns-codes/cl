import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import {
  Cormorant_400Regular,
  Cormorant_500Medium,
  Cormorant_600SemiBold,
} from '@expo-google-fonts/cormorant';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import colors from './src/theme/colors';
import { GlobalDevBanner } from './src/components/dev/GlobalDevBanner';
import { AppErrorBoundary } from './src/components/dev/AppErrorBoundary';
import { getTabBarHeight } from './src/navigation/tabBarMetrics';

import OnboardingScreen from './src/screens/Auth/OnboardingScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import SignupScreen from './src/screens/Auth/SignupScreen';
import CommuteScreen from './src/screens/Auth/CommuteScreen';
import InterestsScreen from './src/screens/Auth/InterestsScreen';
import { LearnNavigator } from './src/navigation/LearnNavigator';
import HomeScreen from './src/screens/HomeScreen';
import NotesScreen from './src/screens/NotesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.creamMuted,
    text: colors.textPrimary,
    border: colors.border,
  },
};

function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);
  const tabBarHeight = getTabBarHeight(insets.bottom);

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.creamMuted,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: bottomInset,
          height: tabBarHeight,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginBottom: 0 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home-outline',
            Learn: 'book-outline',
            Notes: 'document-text-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size - 2} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Learn" component={LearnNavigator} />
      <Tabs.Screen name="Notes" component={NotesScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Cormorant_400Regular,
    Cormorant_500Medium,
    Cormorant_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // Expo Go (__DEV__): open Main tabs first so Learn/Home edits are visible without onboarding. Production uses Onboarding.

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <AppErrorBoundary>
      <View style={{ flex: 1 }}>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName={__DEV__ ? 'Main' : 'Onboarding'}
            screenOptions={{
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
              headerShadowVisible: false,
              headerTitleStyle: { fontWeight: '600', color: colors.textPrimary, fontSize: 17 },
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Commute" component={CommuteScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Interests"
              component={InterestsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
        <GlobalDevBanner />
      </View>
      </AppErrorBoundary>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
