import React from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import propTypes from 'prop-types';
import { Colors } from '../Themes/Themes';

const MyStatusBar = ({ backgroundColor, barStyle, ...props }) => {
  const insets = useSafeAreaInsets();

  const statusBarHeight =
    Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight ?? 0;

  return (
    <View style={{ backgroundColor, height: statusBarHeight }}>
      <StatusBar
        translucent
        backgroundColor={backgroundColor}
        barStyle={barStyle}
        hidden={false}
        {...props}
      />
    </View>
  );
};

export default MyStatusBar;

MyStatusBar.propTypes = {
  backgroundColor: propTypes.string,
  barStyle: propTypes.string,
};

MyStatusBar.defaultProps = {
  backgroundColor: Colors.white,
  barStyle: 'light-content',
};
