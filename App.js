import { LogBox } from 'react-native';

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/Navigation/StackNavigator';
import { getToken } from './src/redux/action/TokenAction';
import { useDispatch } from 'react-redux';
LogBox.ignoreAllLogs();
export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    setTimeout(() => {
      //  initPusher();
      dispatch(getToken());
      //  crashlytics().log('Token feched from local storage');
    }, 1500);
  }, []);
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}
