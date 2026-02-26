import React from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import {Colors, Icons} from '../Themes/Themes';
import normalize from '../Utils/Dimen';
import PropTypes from 'prop-types';
// import ImagePath from '../themes/ImagePath';
import {useNavigation} from '@react-navigation/native';

export default function Header(props) {
  const navigation = useNavigation();

  function onPressFilter() {
    if (props.onPressFilter) {
      props.onPressFilter();
    }
  }

  function onPressCard() {
    if (props.onPressCard) {
      props.onPressCard();
    }
  }

  function onPressBell() {
    if (props.onPressCart) {
      props.onPressBell();
    }
  }

  return (
    <View style={{overflow: 'hidden', paddingBottom: normalize(5)}}>
      <View
        style={{
          width: 'auto',
          height: normalize(58),
          backgroundColor: Colors.white,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          shadowColor: '#000',
          shadowOffset: {width: 1, height: 1},
          shadowOpacity: 0.4,
          shadowRadius: 3,
          elevation: 5,
        }}>
        <Image
          source={Icons.topyield}
          resizeMode="contain"
          style={{
            width: normalize(110),
            height: normalize(50),
            marginTop: normalize(5),
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            marginLeft: normalize(50),
          }}>
       

         

          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileSummary')}>
            <Image
              source={Icons.kenny}
              resizeMode="contain"
              style={{
                width: normalize(40),
                height: normalize(40),
                marginLeft: normalize(15),
                marginTop: normalize(10),
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

Header.propTypes = {
  flag: PropTypes.bool,
  onPressFilter: PropTypes.func,
  onPressLike: PropTypes.func,
  dp: PropTypes.string,
  title: PropTypes.string,
  backgroundcolor: PropTypes.string,
  backbutton: PropTypes.bool,
  notification: PropTypes.bool,
  shortOrder: PropTypes.bool,
};

Header.defaultProps = {
  flag: false,
  onPressFilter: null,
  onPressLike: null,
  dp: '',
  title: '',
  backgroundcolor: Colors.white,
  backbutton: true,
  notification: false,
  shortOrder: false,
};
