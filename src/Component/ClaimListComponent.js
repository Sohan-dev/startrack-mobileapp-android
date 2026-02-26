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

import {Colors} from '../Themes/Themes';
import normalise from '../Utils/Dimen';
import PropTypes from 'prop-types';

export default function ClaimListComponent(props) {
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
        marginTop: normalise(10),
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
        

        <View style={{width: '45%'}}>
         <View style={{flexDirection:'row'}}>
         <Text
            style={{
              marginTop: normalise(2),
              // width: '100%',
              fontSize: normalise(14),
              fontWeight: 'bold',
              color: Colors.darkgrey,
            }}
            >
            Ticket No. :
          </Text>
          <Text
            style={{
              marginTop: normalise(2),
              width: '100%',
              fontSize: normalise(14),
              fontWeight: 'bold',
              color: Colors.darkgrey,
            }}
            numberOfLines={2}>
            {props.ticketNo}
          </Text>
          </View>
          <View style={{flexDirection:'row'}}>
          <Text
            style={{
              marginTop: normalise(2),
              // width: '100%',
              fontSize: normalise(14),
              fontWeight: 'bold',
              color: Colors.darkgrey,
            }}
            >
            Date :
          </Text>
          <Text
            style={{
              marginTop: normalise(2),
              width: '100%',
              fontSize: normalise(14),
              fontWeight: 'bold',
              color: Colors.darkgrey,
            }}
            numberOfLines={2}>
            {props.date}
          </Text>
          </View>
        </View>

        <View style={{width: '40%',alignItems:'center'}}>
          <Text
            style={{color: Colors.black, fontSize: normalise(14),fontWeight:'bold'}}>
            Amount
          </Text>
          <Text
            style={{marginTop: normalise(2), width: '100%',color: Colors.black, fontSize: normalise(14),textAlign:'center',fontWeight:'bold'}}
            numberOfLines={2}>
            ₹{props.amount}
           
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

ClaimListComponent.propTypes = {
  marginTop: PropTypes.number,
  marginBottom: PropTypes.number,
  name: PropTypes.string,
  image: PropTypes.string,
  unit: PropTypes.number,
  rate: PropTypes.number,
  onPress: PropTypes.func,
};

ClaimListComponent.defaultProps = {
  marginTop: normalise(10),
  marginBottom: 0,
  ticketNo: '',
  date: '',
  amount: '',
  onPress: null,
};
