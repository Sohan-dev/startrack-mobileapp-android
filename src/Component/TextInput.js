import React, {useState} from 'react';
import {View, Image, TextInput, Platform, TouchableOpacity} from 'react-native';
import {Colors, Icons, Fonts, Images} from '../Themes/Themes';
import normalise from '../Utils/Dimen';
import PropTypes from 'prop-types';

export default function TextInputComponent(props) {
  const [visible, setVisible] = useState(false);

  function onChangeText(text) {
    if (props.onChangeText) {
      props.onChangeText(text);
    }
  }

  function onPressLocation() {
    if (props.onChangeLocation) {
      props.onChangeLocation();
    }
  }

  function onFocus() {
    if (props.onFocus) {
      props.onFocus();
    }
  }

  function onBlur() {
    if (props.onBlur) {
      props.onBlur();
    }
  }

  return (
    <View
      style={{
        marginTop: props.marginTop,
        flexDirection: 'row',
        alignItems: props.alignItems,
        borderWidth: props.borderWidth,
        borderColor: props.borderColor,
        borderRadius: props.borderRadius,
        width: props.width,
        height: props.height,
        alignSelf: props.alignSelf,
        marginLeft: props.marginLeft,
        backgroundColor: '#1B2D37',
      }}>
      {props.sideimage && (
        <Image
          source={props.sideimage}
          style={{
            marginTop: normalise(16),
            marginHorizontal: normalise(5),
            marginLeft: normalise(15),
            height: normalise(15),
            width: normalise(20),
          }}
          resizeMode="contain"
        />
      )}
      <View
        style={{
          width: '65%',
          height: normalise(40),
          marginLeft: normalise(10),
          marginTop: Platform.OS === 'android' ? normalise(1) : 0,
          alignSelf: 'center',
        }}>
        <TextInput
          style={{
            width: '100%',
            height: '100%',
            color: Colors.white,
            fontSize: normalise(12),
          }}
          maxLength={props.maxLength}
          secureTextEntry={visible ? false : props.isSecure}
          onFocus={() => {
            onFocus();
          }}
          onBlur={() => {
            onBlur();
          }}
          multiline={props.multiline}
          autoCapitalize={props.autoCapitalize}
          placeholder={props.placeholder}
          editable={props.editable}
          placeholderTextColor={props.placeholderTextColor}
          keyboardType={props.keyboardType}
          value={props.value}
          returnKeyType={props.returnKeyType}
          onChangeText={text => {
            onChangeText(text);
          }}
        />
      </View>
    </View>
  );
}

TextInputComponent.propTypes = {
  marginTop: PropTypes.number,
  image: PropTypes.string,
  maxLength: PropTypes.number,
  isSecure: PropTypes.bool,
  multiline: PropTypes.bool,
  autoCapitalize: PropTypes.any,
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  tagText: PropTypes.string,
  tagTextColor: PropTypes.string,
  height: PropTypes.any,
  width: PropTypes.any,
  marginLeft: PropTypes.number,
  borderWidth: PropTypes.number,
  keyboardType: PropTypes.string,
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  color: PropTypes.string,
  imageHeight: PropTypes.number,
  imageWidth: PropTypes.number,
  editable: PropTypes.bool,
  borderColor: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  sideimage: PropTypes.any,
  eye: PropTypes.bool,
  location: PropTypes.bool,
  onChangeLocation: PropTypes.func,
  showCardType: PropTypes.bool,
  cardType: PropTypes.string,
  returnKeyType: PropTypes.any,
  alignSelf: PropTypes.string,
};

TextInputComponent.defaultProps = {
  marginTop: 0,
  image: '',
  maxLength: 40,
  isSecure: false,
  multiline: false,
  autoCapitalize: 'none',
  placeholder: '',
  placeholderTextColor: Colors.darkgrey,
  keyboardType: 'default',
  value: '',
  onChangeText: null,
  onChangeLocation: null,
  color: Colors.darkgrey,
  imageHeight: normalise(12),
  imageWidth: normalise(12),
  editable: true,
  borderColor: Colors.borderColor,
  onFocus: null,
  onBlur: null,
  eye: false,
  tagText: '',
  tagTextColor: Colors.darkgrey,
  height: normalise(45),
  width: '90%',
  marginLeft: 0,
  location: false,
  borderRadius: normalise(15),
  borderWidth: 1,
  showCardType: false,
  cardType: '',
  returnKeyType: 'route',
  alignSelf: 'center',
};
