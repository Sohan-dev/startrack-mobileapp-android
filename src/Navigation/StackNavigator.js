import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../Screens/Auth/LoginScreen';
import { useSelector } from 'react-redux';
import {
  ADVANCE_PAY_NAVIGATION,
  APPROVER_NAVIGATION,
  DASHBOARD_NAVIGATION,
  DEVICE_AUTH,
  EXPENSE_NAVIGATION,
  PROFILE_NAVIGATION,
} from './route_names';
import Splash from '../Screens/Auth/Splash';
import Dashboard from '../Screens/Home/Dashboard';
import AddExpenseScreen from '../Screens/Home/AddExpenseScreen';
import ExpenseCard from '../Screens/Home/MyExpenses';
import ProfileScreen from '../Screens/Home/ProfileScreen';
import EditExpenseScreen from '../Screens/Home/EditExpenseScreen';
import PendingApprovalsScreen from '../Screens/Approver/PendingApprovalsScreen';
import AllExpensesScreen from '../Screens/Approver/AllExpensesScreen';
import RequestAdvanceScreen from '../Screens/AdvancePay/RequestAdvanceScreen';
import MyAdvancesScreen from '../Screens/AdvancePay/MyAdvancesScreen';
import PendingAdvancesScreen from '../Screens/AdvancePay/PendingAdvancesScreen';
import EmployeeListScreen from '../Screens/Home/EmployeeListScreen';
import NotificationScreen from '../Screens/Home/NotificationScreen';

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
          component={AddExpenseScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={DASHBOARD_NAVIGATION.app_grid_my_expence}
          component={ExpenseCard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={PROFILE_NAVIGATION.app_profile_screen}
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={EXPENSE_NAVIGATION.my_expense_edit_screen}
          component={EditExpenseScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={APPROVER_NAVIGATION.approver_pending_expense}
          component={PendingApprovalsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={APPROVER_NAVIGATION.approver_all_expense_history}
          component={AllExpensesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ADVANCE_PAY_NAVIGATION.proceed_to_req_advance_pay}
          component={RequestAdvanceScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ADVANCE_PAY_NAVIGATION.my_advance_pay_list}
          component={MyAdvancesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ADVANCE_PAY_NAVIGATION.proceed_to_check_pending_advance}
          component={PendingAdvancesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={DASHBOARD_NAVIGATION.app_grid_employee_list}
          component={EmployeeListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={DASHBOARD_NAVIGATION.app_notification_list}
          component={NotificationScreen}
          options={{ headerShown: false }}
        />
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
