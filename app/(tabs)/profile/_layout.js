import { Stack } from 'expo-router';

export default function ProfileStack() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ title: 'My Profile', headerShown: false }}
            />
            <Stack.Screen
                name="personalInfo"
                options={{
                    title: 'Personal Info', presentation: 'card',
                    headerBackTitle: "Back",
                }}
            />
            <Stack.Screen 
        name="deleteAccount" 
        options={{ title: 'Delete Account',headerBackTitle: "Back", }} 
        
      /> 
        </Stack>
    );
}