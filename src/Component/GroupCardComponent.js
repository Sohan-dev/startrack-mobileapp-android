import React, {Fragment, useState} from 'react';
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import normalize from '../Utils/Dimen';
import {Colors, Fonts, Icons} from '../Themes/Themes';
import PropTypes from 'prop-types';
import Button from './Button';
const moment = require('moment');
export default function GroupCardComponent(props) {
  function onPressItem() {
    if (props.onPressItem()) {
      props.onPressItem();
    }
  }

  return (
    <TouchableOpacity
      onPress={() => onPressItem()}
      style={{
        width: '100%',
        height: normalize(80),

        marginTop: normalize(10),
        marginBottom: props.marginBottom,
      }}>
      <View
        style={{
          width: '100%',
          height: normalize(2),
          backgroundColor: '#38B54A',
          borderTopLeftRadius: normalize(10),
          borderTopRightRadius: normalize(10),
        }}
      />
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View>
          <Text
            style={{
              marginLeft: normalize(20),
              marginTop: normalize(10),
              fontFamily: Fonts.SourceSansPro_Regular,
              fontSize: normalize(15),
              color: Colors.black,
            }}>
            {props.groupTitle}
          </Text>
          <Text
            style={{
              marginLeft: normalize(20),
              marginTop: normalize(10),
              fontFamily: Fonts.SourceSansPro_Regular,
              fontSize: normalize(15),
              color: Colors.black,
            }}>
            Admin: {props.admin}
          </Text>
        </View>
        {props.notificationCount && (
          <View>
            <Image
              source={Icons.notification_bell}
              style={{
                height: normalize(45),
                width: normalize(45),
                marginRight: normalize(10),
                marginTop: normalize(10),
              }}
            />
            <View
              style={{
                height: normalize(20),
                width: normalize(20),
                backgroundColor: Colors.red,
                borderRadius: normalize(20),
                position: 'absolute',
                right: 12,
                top: 5,
              }}>
              <Text
                style={{
                  alignSelf: 'center',
                  marginTop: normalize(1),
                  fontSize: normalize(12),
                  color: Colors.white,
                  fontFamily: Fonts.SourceSansPro_SemiBold,
                }}>
                {props.notificationCount}
              </Text>
            </View>
          </View>
        )}
      </View>
      <View
        style={{
          width: '100%',
          backgroundColor: '#C4C4C4',
          height: normalize(0.5),
          marginTop: normalize(10),
        }}
      />
    </TouchableOpacity>
  );
}

GroupCardComponent.propTypes = {
  groupTitle: PropTypes.string,
  notificationCount: PropTypes.any,
  admin: PropTypes.any,
};

GroupCardComponent.defaultProps = {
  groupTitle: '',
  notificationCount: null,
  admin: null,
};
