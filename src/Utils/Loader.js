// import React, {useEffect, useRef} from 'react';
// import {
//   ActivityIndicator,
//   SafeAreaView,
//   Dimensions,
//   Animated,
//   Text,
// } from 'react-native';
// import PropTypes from 'prop-types';
// import {Images, Colors, Icons} from '../Themes/Themes';

// export default function Loader(props) {
//   const animate = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.timing(animate, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       {iterations: 1000},
//     ).start(() => {
//       Animated.timing(animate, {
//         toValue: 0,
//         duration: 1000,
//         useNativeDriver: true,
//       }).start();
//     });
//   }, []);

//   return props.visible ? (
//     <Animated.View
//       style={{
//         alignItems: 'center',
//         position: 'absolute',
//         zIndex: 10,
//         top: 290,
//         bottom: 0,
//         left: 0,
//         right: 0,
//       }}>
//       <Animated.Image
//         resizeMode={'contain'}
//         style={{
//           height: 80,
//           width: 80,
//           marginTop: 8,
//           borderRadius: 20,
//           opacity: animate,

//           // transform: [{rotate: SpinValue}, {translateY}],
//         }}
//         source={Icons.logo}
//       />
//       <Text>Loading...</Text>
//     </Animated.View>
//   ) : null;
// }

// Loader.propTypes = {
//   visible: PropTypes.bool,
// };

// Loader.defaultProps = {
//   visible: false,
// };

// {
//   /* <SafeAreaView
//       style={{
//         flex: 1,
//         position: 'absolute',
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         zIndex: 10,
//         top: 0,
//         bottom: 0,
//         left: 0,
//         right: 0,
//         height: Dimensions.get('window').height,
//         width: '100%',
//         alignItems: 'center',
//         justifyContent: 'center',
//       }}>
//       <ActivityIndicator size="large" color={'#e98879'} />
//     </SafeAreaView> */
// }

import React from 'react';
import {ActivityIndicator, SafeAreaView, Dimensions} from 'react-native';
import PropTypes from 'prop-types';
import {Images, Colors, Icons} from '../Themes/Themes';

export default function Loader(props) {
  return props.visible ? (
    <SafeAreaView
      style={{
        flex: 1,
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 10,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: Dimensions.get('window').height,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ActivityIndicator size="large" color={Colors.textYellow} />
    </SafeAreaView>
  ) : null;
}

Loader.propTypes = {
  visible: PropTypes.bool,
};

Loader.defaultProps = {
  visible: false,
};
