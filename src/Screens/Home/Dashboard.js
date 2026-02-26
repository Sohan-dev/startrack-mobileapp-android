/* eslint-disable react-native/no-inline-styles */
// /* eslint-disable react-native/no-inline-styles */
// import { StyleSheet, Text, View } from 'react-native';
// import React from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import normalise from '../../Utils/Dimen';
// import MyStatusBar from '../../Utils/StatusBar';

// export default function Dashboard() {
//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <MyStatusBar barStyle={'dark-content'} />
//       <View
//         style={{
//           flex: 1,
//           width: '100%',
//           height: '100%',
//           justifyContent: 'center',
//           alignItems: 'center',
//         }}
//       >
//         <Text>Dashboard</Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({});

//client id -

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import MyStatusBar from '../../Utils/StatusBar';
import normalise from '../../Utils/Dimen';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../Themes/Themes';
import { DASHBOARD_NAVIGATION } from '../../Navigation/route_names';

const MENU = [
  {
    id: 1,
    title: 'Add Expense',
    icon: 'plus-circle-outline',
    path: DASHBOARD_NAVIGATION.app_grid_add_expense_screen,
  },
  { id: 2, title: 'My Expenses', icon: 'file-document-outline', path: '' },
  { id: 3, title: 'Employees', icon: 'clock-outline', path: '' },
  { id: 4, title: 'Approved', icon: 'check-circle-outline', path: '' },
  { id: 5, title: 'Rejected', icon: 'close-circle-outline', path: '' },
  { id: 6, title: 'Reports', icon: 'chart-bar', path: '' },
];

export default function Dashboard(props) {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaView style={styles.container}>
      <MyStatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View
        style={{
          height: normalise(40),
          width: '100%',
          backgroundColor: 'tomato',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        <Text
          style={{
            color: Colors.white,
            fontSize: normalise(12),
            marginLeft: normalise(5),
          }}
        >
          StarTrack Automation
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ marginRight: normalise(20) }}
            onPress={() => console.log('object')}
          >
            <Icon name={'account'} size={32} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginRight: normalise(5) }}
            onPress={() => console.log('object')}
          >
            <Icon name={'bell'} size={32} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.grid}>
        {MENU.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => props.navigation.navigate(item?.path)}
          >
            <Icon
              name={item.icon}
              size={36}
              color="#0A3D62"
              style={styles.icon}
            />
            <Text style={styles.title}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
//let’s add Lottie to splash now

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16, // more horizontal space
    paddingTop: 16,
  },
  card: {
    width: '46%', // ⬅️ more gap between columns
    height: 130,
    backgroundColor: '#fff',
    marginHorizontal: '2%',
    marginBottom: 16,
    borderRadius: 14,

    // Android
    elevation: 3,

    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,

    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2f3640',
    textAlign: 'center',
  },
});
