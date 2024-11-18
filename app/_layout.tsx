import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider as PaperProvider } from 'react-native-paper';
import {
  CustomPaperLightTheme,
  CustomPaperDarkTheme,
  CustomNavigationLightTheme,
  CustomNavigationDarkTheme,
} from '@/constants/themes';
import { useColorScheme } from '@/hooks/useColorScheme';
import Toast from 'react-native-toast-message';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider theme={colorScheme === 'dark' ? CustomPaperDarkTheme : CustomPaperLightTheme}>
      <ThemeProvider value={colorScheme === 'dark' ? CustomNavigationDarkTheme : CustomNavigationLightTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toast />
      </ThemeProvider>
    </PaperProvider>
  );
}