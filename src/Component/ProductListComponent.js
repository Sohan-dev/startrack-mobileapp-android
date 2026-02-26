import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import ImagePath from '../themes/ImagePath';
import Colors from '../themes/Colors';
import normalise from '../utils/helpers/dimen';
import PropTypes from 'prop-types';

export default function ProductListComponent(props) {
  function onPress() {
    if (props.onPress) {
      props.onPress();
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      style={{
        width: '100%',
        alignSelf: 'center',
        marginTop: props.marginTop,
        marginBottom: props.marginBottom,
      }}
      onPress={() => {
        onPress();
      }}>
      <View
        style={{
          width: '95%',
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: Colors.white,
          padding: normalise(10),
          borderRadius: normalise(5),
          elevation: normalise(4),
          paddingTop: normalise(12),
          paddingBottom: normalise(12),
        }}>
        {/* <Image style={{ height: normalise(40), width: normalise(30)}} source={!props.image ? ImagePath.defaultProduct : { uri: props.image }}
                    resizeMode={'contain'} /> */}

        <View style={{width: '45%'}}>
          {/* <Text
            style={{color: Colors.themeColorLight, fontSize: normalise(10)}}>
            Name
          </Text> */}
          <Text
            style={{
              marginTop: normalise(2),
              width: '100%',
              fontSize: normalise(14),
              fontWeight: 'bold',
              color: Colors.darkgrey,
            }}
            numberOfLines={2}>
            {props.name}
          </Text>
        </View>

        <View style={{width: '40%'}}>
          <Text
            style={{color: Colors.themeColorLight, fontSize: normalise(10)}}>
            Rate
          </Text>
          <Text
            style={{marginTop: normalise(2), width: '100%'}}
            numberOfLines={2}>
            ₹{props.rate}
            {props.unit ? `/ ${props.unit}` : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

ProductListComponent.propTypes = {
  marginTop: PropTypes.number,
  marginBottom: PropTypes.number,
  name: PropTypes.string,
  image: PropTypes.string,
  unit: PropTypes.number,
  rate: PropTypes.number,
  onPress: PropTypes.func,
};

ProductListComponent.defaultProps = {
  marginTop: normalise(0),
  marginBottom: 0,
  name: '',
  image: '',
  unit: 0,
  rate: 0,
  onPress: null,
};
