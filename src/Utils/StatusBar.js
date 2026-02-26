//import liraries
import React from 'react';
import { View, StatusBar, Platform } from 'react-native';
import propTypes from 'prop-types';
import { Colors } from '../Themes/Themes';
// import StatusBarSizeIOS from 'react-native-status-bar-size';
import normalize from '../Utils/Dimen';

const MyStatusBar = ({ backgroundColor, barStyle, height, ...props }) => (
  <View style={[{ backgroundColor }]}>
    <StatusBar
      translucent
      backgroundColor={backgroundColor}
      {...props}
      barStyle={barStyle}
      hidden={false}
    />
  </View>
);

export default MyStatusBar;
MyStatusBar.propTypes = {
  backgroundColor: propTypes.string,
  barStyle: propTypes.string,
  height: propTypes.number,
};

MyStatusBar.defaultProps = {
  backgroundColor: Colors.white,
  barStyle: 'light-content',
  height: normalize(20),
};
