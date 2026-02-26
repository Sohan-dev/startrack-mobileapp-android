/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Colors, Fonts } from '../Themes/Themes';
import normalise from '../Utils/Dimen';
import PropTypes from 'prop-types';

export default function Button(props) {
  function onPress() {
    if (props.onPress) {
      props.onPress();
    }
  }

  return (
    <TouchableOpacity
      disabled={props.disabled}
      style={{
        height: props.height,
        width: props.width,
        borderRadius: props.borderRadius,
        backgroundColor: props.backgroundColor,
        alignSelf: props.alignSelf,
        marginTop: props.marginTop,
        marginBottom: props.marginBottom,
        marginHorizontal: props.marginHorizontal,
        borderWidth: props.borderWidth,
        borderColor: props.borderColor,
        marginLeft: props.marginLeft,
        flexDirection: 'row',
        justifyContent: 'space-around',
      }}
      onPress={() => {
        onPress();
      }}
    >
      {props.img !== null && (
        <Image
          source={props.img}
          resizeMode={'contain'}
          style={{
            height: normalise(12),
            width: normalise(12),
            alignSelf: 'center',
          }}
        />
      )}
      <Text
        style={{
          fontFamily: Fonts.SF_Pro_Display_Semibold,
          fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
          color: props.textColor,
          fontSize: props.fontSize,
          marginTop: props.textMarginTop,
          alignSelf: 'center',
        }}
        numberOfLines={2}
      >
        {props.title}
      </Text>
    </TouchableOpacity>
  );
}

Button.propTypes = {
  height: PropTypes.any,
  width: PropTypes.any,
  backgroundColor: PropTypes.string,
  borderRadius: PropTypes.number,
  textColor: PropTypes.string,
  fontSize: PropTypes.any,
  title: PropTypes.string,
  onPress: PropTypes.func,
  alignSelf: PropTypes.string,
  marginTop: PropTypes.number,
  marginBottom: PropTypes.number,
  marginHorizontal: PropTypes.number,
  borderWidth: PropTypes.number,
  borderColor: PropTypes.string,
  marginLeft: PropTypes.number,
  img: PropTypes.any,
};

Button.defaultProps = {
  height: normalise(40),
  backgroundColor: Colors.tealBlue,
  borderRadius: normalise(20),
  textColor: Colors.white,
  fontSize: null,
  title: '',
  onPress: null,
  alignSelf: null,
  marginTop: 0,
  marginBottom: 0,
  marginHorizontal: 0,
  borderWidth: 0,
  borderColor: null,
  marginLeft: 0,
  img: null,
};
