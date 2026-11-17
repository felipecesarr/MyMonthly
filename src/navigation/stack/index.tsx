import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LogIn from '../../app/screens/zzz/logIn';
import Onboarding from '../../app/screens/zzz/onboarding';
import Register from '../../app/screens/zzz/register';
import { hasCompletedOnboarding } from '../../lib/onboarding-state';

export type RootStackParamList = {
  Onboarding: undefined;
  LogIn: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function MyStack() {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'LogIn' | null>(null);

  useEffect(() => {
    let active = true;
    void hasCompletedOnboarding().then((complete) => {
      if (active) setInitialRoute(complete ? 'LogIn' : 'Onboarding');
    });
    return () => {
      active = false;
    };
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAF8' }}>
        <ActivityIndicator color="#171717" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        animation: 'fade_from_bottom',
        contentStyle: { backgroundColor: '#FAFAF8' },
        headerShown: false,
      }}
    >
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="LogIn" component={LogIn} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}
