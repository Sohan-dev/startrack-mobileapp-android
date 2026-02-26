/* eslint-disable react-native/no-inline-styles */
// import { StyleSheet, Text, View } from 'react-native';
// import React, { useEffect } from 'react';

// export default function Splash(props) {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       props.navigation.replace('Login'); // replace = user can't go back
//     }, 2000); // 2 seconds

//     return () => clearTimeout(timer);
//   }, []);
//   return (
//     <View style={{ flex: 1, justifyContent: 'center' }}>
//       <Text>Splash</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({});

import { View, StyleSheet, Animated, Image } from 'react-native';
import { useEffect, useRef } from 'react';
import { Images } from '../../Themes/Themes';
import { DEVICE_AUTH } from '../../Navigation/route_names';

export default function Splash(props) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
    // Animated.loop(
    //   Animated.sequence([
    //     Animated.timing(scaleAnim, {
    //       toValue: 1.05,
    //       duration: 600,
    //       useNativeDriver: true,
    //     }),
    //     Animated.timing(scaleAnim, {
    //       toValue: 1,
    //       duration: 600,
    //       useNativeDriver: true,
    //     }),
    //   ]),
    // ).start();

    const timer = setTimeout(() => {
      props.navigation.replace(DEVICE_AUTH.proceed_to_auth);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={Images.logo}
        style={[
          styles.logo,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});
