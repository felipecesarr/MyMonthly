import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthRoute from './src/navigation/auth';
import AuthProvider from './src/contexts/Auth';
import { MonthProvider } from './src/contexts/MonthContext/index';
import { YearProvider } from './src/contexts/YearContext';
import { RevenueCatProvider } from './src/contexts/RevenueCatContext';
import { configureDailyReminders } from './src/services/notifications';
import { AppQueryProvider } from './src/lib/query-client';

export default function App() {
  useEffect(() => {
    configureDailyReminders().catch((error) => {
      console.warn('Unable to configure daily reminders', error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <AppQueryProvider>
        <NavigationContainer>
          <AuthProvider>
            <RevenueCatProvider>
              <YearProvider>
                <MonthProvider>
                  <AuthRoute />
                </MonthProvider>
              </YearProvider>
            </RevenueCatProvider>
          </AuthProvider>
        </NavigationContainer>
      </AppQueryProvider>
    </SafeAreaProvider>
  );
}
