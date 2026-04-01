import { LogBox } from 'react-native';

import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/Navigation/StackNavigator';
import { getToken } from './src/redux/action/TokenAction';
import { useDispatch } from 'react-redux';
import { logScreen } from './src/Utils/useAnalytics';
import { SafeAreaProvider } from 'react-native-safe-area-context';
LogBox.ignoreAllLogs();
export default function App() {
  const dispatch = useDispatch();
  const navigationRef = useRef();
  useEffect(() => {
    setTimeout(() => {
      //  initPusher();
      dispatch(getToken());
      //  crashlytics().log('Token feched from local storage');
    }, 1500);
  }, []);
  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={async () => {
          const currentRoute = navigationRef.getCurrentRoute();
          if (currentRoute?.name) {
            await logScreen(currentRoute.name);
            console.log('📊 Screen tracked:', currentRoute.name);
          }
        }}
      >
        <StackNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
