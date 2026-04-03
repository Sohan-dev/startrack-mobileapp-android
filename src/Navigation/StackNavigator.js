import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import Login from '../Screens/Auth/LoginScreen';
import Splash from '../Screens/Auth/Splash';
import BottomTabNavigator from './BottomTabNavigator';
import { DEVICE_AUTH } from './route_names';

const Stack = createStackNavigator();

export default function StackNavigator() {
  const TokenReducer = useSelector(state => state.TokenReducer);

  if (TokenReducer.loading === true) {
    return <Splash />;
  }

  return TokenReducer.token === null ? (
    // ── Unauthenticated: Login only ──
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={DEVICE_AUTH.proceed_to_auth}
        component={Login}
      />
    </Stack.Navigator>
  ) : (
    // ── Authenticated: Bottom tabs + all nested stacks inside ──
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
      />
    </Stack.Navigator>
  );
}
