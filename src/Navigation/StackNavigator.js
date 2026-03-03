import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import Login from '../Screens/Auth/Login';
import { useSelector } from 'react-redux';
import { DASHBOARD_NAVIGATION, DEVICE_AUTH } from './route_names';
import Splash from '../Screens/Auth/Splash';
import Dashboard from '../Screens/Home/Dashboard';
import AddExpence from '../Screens/Home/AddExpence';
import AddExpenseCopy from '../Screens/Home/AddExpenseScreen';

const Stack = createStackNavigator();

export default function StackNavigator() {
  const TokenReducer = useSelector(state => state.TokenReducer);
  // const ProfileReducer = useSelector(state => state.ProfileReducer);
  if (TokenReducer.loading === true) {
    return <Splash />;
  } else {
    return TokenReducer.token === null ? (
      <Stack.Navigator>
        <Stack.Screen
          name={DEVICE_AUTH.proceed_to_auth}
          component={Login}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    ) : (
      <Stack.Navigator>
        <Stack.Screen
          name={DASHBOARD_NAVIGATION.app_grid_expense_screen}
          component={Dashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={DASHBOARD_NAVIGATION.app_grid_add_expense_screen}
          component={AddExpenseCopy}
          options={{ headerShown: false }}
        />
        {/* <Stack.Screen
          name={DASHBOARD_NAVIGATION.app_grid_my_expence}
          component={AddExpenseCopy}
          options={{ headerShown: false }}
        /> */}
      </Stack.Navigator>
    );
  }

  // return (
  //   <Stack.Navigator>
  //     <Stack.Screen
  //       name={'Splash'}
  //       component={Splash}
  //       options={{ headerShown: false }}
  //     />
  //     <Stack.Screen
  //       name={DEVICE_AUTH.proceed_to_auth}
  //       component={Login}
  //       options={{ headerShown: false }}
  //     />
  //     <Stack.Screen
  //       name={DASHBOARD_NAVIGATION.app_grid_expense_screen}
  //       component={Dashboard}
  //       options={{ headerShown: false }}
  //     />

  //   </Stack.Navigator>
  // );
}
