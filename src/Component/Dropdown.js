import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import normalise from '../Utils/Dimen';
import PropTypes from 'prop-types';

import {Colors, Fonts} from '../Themes/Themes';
import Icons from '../Themes/icons';

export default function DropDown(props) {
  return (
    <TouchableOpacity
      style={{
        marginTop: props.marginTop,
        width: props.width,
      }}
      activeOpacity={0.9}
      onPress={props.onPress}>
      {props?.label != '' ? (
        <Text
          style={{
            color: '#595959',
            fontFamily: Fonts.MetropolisMedium,
            fontSize: normalise(13),
          }}>
          {props?.label}
        </Text>
      ) : null}

      <View
        style={{
          position: 'relative',
          flexDirection: 'row',
          height: normalise(40),
          padding: normalise(7),
        }}>
        <ScrollView horizontal={true}>
          <Text
            style={{
              color: '#595959',
              fontFamily: Fonts.SourceSansPro_Regular,
            }}>
            {props?.value == '' ? props.placeholder : props?.value}
          </Text>
        </ScrollView>
        {/* <Image
          source={Icons.down}
          style={{
            height: normalise(10),
            width: normalise(10),
          }}
          resizeMode="contain"
        /> */}
      </View>
    </TouchableOpacity>
  );
}

DropDown.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  marginTop: PropTypes.any,
  width: PropTypes.any,
  onPress: PropTypes.any,
};

DropDown.defaultProps = {
  label: '',
  value: '',
  placeholder: '',
  marginTop: 0,
  width: '100%',
  onPress: () => {},
};
