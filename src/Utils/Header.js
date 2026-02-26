import React, {useState} from 'react';
import {View, Image, TouchableOpacity, Text, Platform} from 'react-native';
import {Colors, Icons, Fonts} from '../Themes/Themes';
import normalize from '../Utils/Dimen';
import PropTypes from 'prop-types';
import {useNavigation} from '@react-navigation/native';
import Modal from 'react-native-modal';
import ImageLoader from './imageLoader';
import {getLogout} from '../redux/action/AuthAction';
import {useDispatch, useSelector} from 'react-redux';

export default function Header(props) {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const NotificationReducer = useSelector(state => state.NotificationReducer);

  function onPressMenu() {
    if (props.onPressMenu) {
      props.onPressMenu();
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

  function renderModal() {
    return (
      <Modal
        animationIn={'slideInLeft'}
        animationOut={'slideOutLeft'}
        backdropTransitionOutTiming={0}
        hideModalContentWhileAnimating={true}
        isVisible={visible}
        style={{
          width: '60%',
          alignSelf: 'flex-start',
          margin: 0,
        }}
        animationInTiming={500}
        onBackdropPress={() => setVisible(false)}
        transparent={true}>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.white,
          }}>
          <Image
            source={Icons.topyield}
            resizeMode="contain"
            style={{
              width: normalize(110),
              height: normalize(50),
              marginTop:
                Platform.OS === 'android' ? normalize(10) : normalize(50),
              alignSelf: 'center',
            }}
          />
          <View style={{marginTop: normalize(40)}}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                navigation.navigate('ProfileSummary'), setVisible(!visible);
              }}
              style={{marginBottom: normalize(30), alignSelf: 'center'}}>
              <Text
                style={{
                  fontSize: normalize(15),
                  color: Colors.black,
                  fontFamily: Fonts.SourceSansPro_Regular,
                }}>
                My Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setVisible(!visible), navigation.navigate('Favourite');
              }}
              style={{marginBottom: normalize(30), alignSelf: 'center'}}>
              <Text
                style={{
                  fontSize: normalize(15),
                  color: Colors.black,
                  fontFamily: Fonts.SourceSansPro_Regular,
                }}>
                Favourite
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Settings'), setVisible(!visible);
              }}
              style={{marginBottom: normalize(30), alignSelf: 'center'}}>
              <Text
                style={{
                  fontSize: normalize(15),
                  color: Colors.black,
                  fontFamily: Fonts.SourceSansPro_Regular,
                }}>
                Settings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('InviteFriends'), setVisible(!visible);
              }}
              style={{marginBottom: normalize(30), alignSelf: 'center'}}>
              <Text
                style={{
                  fontSize: normalize(15),
                  color: Colors.black,
                  fontFamily: Fonts.SourceSansPro_Regular,
                }}>
                Invite a Friend
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                dispatch(getLogout()), setVisible(!visible);
              }}
              style={{marginBottom: normalize(30), alignSelf: 'center'}}>
              <Text
                style={{
                  fontSize: normalize(15),
                  color: Colors.red,
                  fontFamily: Fonts.SourceSansPro_Regular,
                }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
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
            onPress={() => navigation.navigate('NotificationList')}>
            <Image
              source={Icons.bell}
              resizeMode="contain"
              style={{
                width: normalize(20),
                height: normalize(20),
                marginTop: normalize(18),
              }}
            />
            {NotificationReducer?.notificationList?.count && (
              <View
                style={{
                  backgroundColor: Colors.red,
                  height: normalize(19),
                  width: normalize(19),
                  borderRadius: normalize(20),
                  alignItems: 'center',
                  position: 'absolute',
                  top: 11,
                  left: 10,
                }}>
                <Text
                  style={{
                    padding: normalize(2),
                    color: Colors.white,
                    fontFamily: Fonts.SourceSansPro_Bold,
                    fontSize: normalize(8),
                  }}>
                  {NotificationReducer?.notificationList?.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setVisible(!visible)}>
            <Image
              source={Icons.menu}
              resizeMode="contain"
              style={{
                width: normalize(15),
                height: normalize(15),
                marginLeft: normalize(25),
                marginTop: normalize(18),
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileSummary')}
            style={{
              marginLeft: normalize(15),
              // marginTop: normalize(10),
            }}>
            {/*  <Image
              source={
                ProfileReducer?.profileDetails?.picture
                  ? {uri: ProfileReducer?.profileDetails?.picture}
                  : Icons.profileAvatar
              }
              resizeMode="cover"
              style={{
                width: normalize(40),
                height: normalize(40),
                marginLeft: normalize(15),
                marginTop: normalize(10),
                borderRadius: normalize(20),
              }}
            /> */}
            <ImageLoader
              fileName={ProfileReducer?.profileDetails?.picture}
              height={normalize(40)}
              width={normalize(40)}
              borderRadius={normalize(40)}
            />
          </TouchableOpacity>
        </View>
      </View>
      {renderModal()}
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
