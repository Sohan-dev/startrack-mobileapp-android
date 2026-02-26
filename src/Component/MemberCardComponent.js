import React, {Fragment, useState, useEffect, useCallback} from 'react';
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
import ImageLoader from '../Utils/imageLoader';

const moment = require('moment');
export default function MemberCardComponent(props) {
  function onPressItem() {
    if (props.onPressItem()) {
      props.onPressItem();
    }
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          flexDirection: 'row',
          paddingTop: normalize(6),
          height: normalize(70),
          backgroundColor: Colors.white,
          marginBottom: props.marginBottom,
          marginLeft: normalize(10),
        }}>
        <ImageLoader
          fileName={props.img}
          height={normalize(50)}
          width={normalize(50)}
          borderRadius={normalize(40)}
        />

        <View style={{flexDirection: 'column'}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text
              style={{
                fontFamily: Fonts.SourceSansPro_Bold,
                fontSize: normalize(15),
                marginLeft: normalize(10),
                color: Colors.black,
              }}>
              {props.name}
            </Text>
            {!props.isAdmin ? (
              <TouchableOpacity
                style={{
                  width: normalize(55),
                  height: normalize(20),
                  backgroundColor: Colors.white,
                  marginLeft: normalize(10),
                  borderRadius: normalize(20),
                  borderColor: '#004B74',
                  borderWidth: normalize(0.5),
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                }}>
                <Image
                  source={Icons.plus}
                  style={{
                    height: normalize(10),
                    width: normalize(10),
                  }}
                />
                <Text
                  style={{
                    color: Colors.black,
                    fontSize: normalize(8),
                  }}>
                  Follow
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  backgroundColor: '#bcccdc',
                  marginLeft: normalize(5),
                  width: normalize(40),
                  alignItems: 'center',
                  borderRadius: normalize(2),
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.SourceSansPro_Bold,
                    padding: normalize(2),
                    fontSize: normalize(12),
                  }}>
                  Admin
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              marginLeft: normalize(10),
              fontSize: normalize(11),
              fontFamily: Fonts.SourceSansPro_Regular,
              color: Colors.black,
            }}>
            {props.userName}
          </Text>
          <View style={{flexDirection: 'row'}}>
            <Image
              source={Icons.leaf}
              style={{
                height: normalize(15),
                width: normalize(15),
                marginLeft: normalize(10),
                marginTop: normalize(5),
              }}
            />
            <Text
              style={{
                marginTop: normalize(5),
                marginLeft: normalize(5),
                fontFamily: Fonts.SourceSansPro_Regular,
                color: Colors.black,
              }}>
              {props.leaf}
            </Text>
            <Image
              source={Icons.location}
              style={{
                height: normalize(15),
                width: normalize(15),
                marginLeft: normalize(10),
                marginTop: normalize(5),
              }}
            />
            <Text
              style={{
                marginTop: normalize(5),
                marginLeft: normalize(5),
                fontFamily: Fonts.SourceSansPro_Regular,
                color: Colors.black,
              }}>
              {props.location}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
MemberCardComponent.propTypes = {
  img: PropTypes.any,
  ratings: PropTypes.number,
  name: PropTypes.string,
  acceptMessage: PropTypes.string,
  serviceList: PropTypes.bool,
  price: PropTypes.any,
  marginBottom: PropTypes.number,
};

MemberCardComponent.defaultProps = {
  img: null,
  name: '',
  ratings: 0,
  acceptMessage: null,
  serviceList: false,
  price: null,
  marginBottom: 0,
};
