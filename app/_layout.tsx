// app/_layout.tsx
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { store } from './reduxStore/store/store';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Load custom font
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Wait for fonts to load
  if (!loaded) return null;

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="tabs" />
          <Stack.Screen name="HostelOwnerLogin" />
          <Stack.Screen name="OwnerRegister" />
          <Stack.Screen name="+not-found" />
        </Stack>

        <Toast />
        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}