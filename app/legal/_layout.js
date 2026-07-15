import { Stack } from "expo-router";

export default function LegalStack() {
  return (
    <Stack>
      <Stack.Screen name="privacyPolicy" options={{ headerShown: false }} />
      <Stack.Screen name="termsConditions" options={{ headerShown: false }} />
    </Stack>
  );
}