import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';

// ─── Screens ──────────────────────────────────────────────────────────────────
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
import ReportGenerationScreen from '../Screens/Report/ReportGenerationScreen';

import {
  ADVANCE_PAY_NAVIGATION,
  APPROVER_NAVIGATION,
  DASHBOARD_NAVIGATION,
  EXPENSE_NAVIGATION,
  PROFILE_NAVIGATION,
} from './route_names';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const PRIMARY = '#E8453C';

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isCenter = route.name === 'AddExpenseTab';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // ── Center FAB ──
        if (isCenter) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.fabWrapper}
              activeOpacity={0.9}>
              <View style={[styles.fab, isFocused && styles.fabActive]}>
                <Icon name="plus" size={28} color="#fff" />
              </View>
            </TouchableOpacity>
          );
        }

        // ── Icon & label map ──
        const iconMap = {
          HomeTab:          isFocused ? 'view-dashboard'     : 'view-dashboard-outline',
          ExpensesTab:      isFocused ? 'file-document'      : 'file-document-outline',
          NotificationsTab: isFocused ? 'bell'               : 'bell-outline',
          ProfileTab:       isFocused ? 'account'            : 'account-outline',
        };

        const labelMap = {
          HomeTab:          'Home',
          ExpensesTab:      'Expenses',
          NotificationsTab: 'Alerts',
          ProfileTab:       'Profile',
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}>
            <View style={styles.tabIconWrap}>
              {isFocused && <View style={styles.activePill} />}
              <Icon
                name={iconMap[route.name] || 'circle-outline'}
                size={22}
                color={isFocused ? PRIMARY : '#9CA3AF'}
              />
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {labelMap[route.name] || route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Individual Tab Stacks ────────────────────────────────────────────────────

// Home stack — Dashboard + all nested screens
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={DASHBOARD_NAVIGATION.app_grid_expense_screen}
        component={Dashboard}
      />
      <Stack.Screen
        name={DASHBOARD_NAVIGATION.app_grid_employee_list}
        component={EmployeeListScreen}
      />
      <Stack.Screen
        name={DASHBOARD_NAVIGATION.app_report_generation}
        component={ReportGenerationScreen}
      />
      <Stack.Screen
        name={ADVANCE_PAY_NAVIGATION.proceed_to_req_advance_pay}
        component={RequestAdvanceScreen}
      />
      <Stack.Screen
        name={ADVANCE_PAY_NAVIGATION.my_advance_pay_list}
        component={MyAdvancesScreen}
      />
      <Stack.Screen
        name={ADVANCE_PAY_NAVIGATION.proceed_to_check_pending_advance}
        component={PendingAdvancesScreen}
      />
      <Stack.Screen
        name={APPROVER_NAVIGATION.approver_pending_expense}
        component={PendingApprovalsScreen}
      />
      <Stack.Screen
        name={APPROVER_NAVIGATION.approver_all_expense_history}
        component={AllExpensesScreen}
      />
    </Stack.Navigator>
  );
}

// Expenses stack
function ExpensesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={DASHBOARD_NAVIGATION.app_grid_my_expence}
        component={ExpenseCard}
      />
      <Stack.Screen
        name={EXPENSE_NAVIGATION.my_expense_edit_screen}
        component={EditExpenseScreen}
      />
    </Stack.Navigator>
  );
}

// Add Expense stack
function AddExpenseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={DASHBOARD_NAVIGATION.app_grid_add_expense_screen}
        component={AddExpenseScreen}
      />
    </Stack.Navigator>
  );
}

// Notifications stack
function NotificationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={DASHBOARD_NAVIGATION.app_notification_list}
        component={NotificationScreen}
      />
    </Stack.Navigator>
  );
}

// Profile stack
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={PROFILE_NAVIGATION.app_profile_screen}
        component={ProfileScreen}
      />
    </Stack.Navigator>
  );
}

// ─── Bottom Tab Navigator ─────────────────────────────────────────────────────

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeTab"          component={HomeStack} />
      <Tab.Screen name="ExpensesTab"      component={ExpensesStack} />
      <Tab.Screen name="AddExpenseTab"    component={AddExpenseStack} />
      <Tab.Screen name="NotificationsTab" component={NotificationsStack} />
      <Tab.Screen name="ProfileTab"       component={ProfileStack} />
    </Tab.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 64,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  activePill: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 3,
  },
  tabLabelActive: {
    color: PRIMARY,
    fontWeight: '700',
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabActive: {
    backgroundColor: '#c73530',
  },
});
