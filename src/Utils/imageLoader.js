import React, {useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Animated,
  Image,
  StatusBar,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import {Colors, Fonts, Icons} from '../Themes/Themes';
// import ImagePath from '../../themes/ImagePath';
import normalise from '../Utils/Dimen';
import constants from '../Utils/constants';

export default function ImageLoader(props) {
  const [loading, setLoading] = useState(
    props?.fileName !== 'null' ? true : false,
  );
  //   const [loading, setLoading] = useState(true);

  return (
    <View
      style={{
        // alignItems: 'center',
        marginTop: props.marginTop,
        // justifyContent: 'center',
        height: props.height,
        width: props.width,
        borderRadius: props.borderRadius,
        marginLeft: props.marginLeft,
        marginBottom: props.marginBottom,
        alignSelf: props.alignSelf,
      }}>
      {loading && (
        <ActivityIndicator
          size={'small'}
          color={Colors.black}
          style={{
            alignSelf: 'center',
            position: 'absolute',
            top: '45%',
          }}
        />
      )}
      {props.fileName ? (
        <Image
          source={{
            uri: props.fileName,
          }}
          style={{
            height: props.height,
            width: props.width,
            borderRadius: props.borderRadius,

            alignSelf: 'center',
          }}
          resizeMode="cover"
          onLoad={() => {
            setLoading(true);
          }}
          onLoadEnd={() => {
            setLoading(false);
          }}
        />
      ) : (
        <Image
          source={Icons.profileAvatar}
          resizeMode="contain"
          style={{
            height: props.height,
            width: props.width,
            borderRadius: normalise(52),
          }}
        />
      )}
    </View>
  );
}

ImageLoader.propTypes = {
  fileName: PropTypes.string,
  borderRadius: PropTypes.number,
  height: PropTypes.any,
  width: PropTypes.any,
  marginTop: PropTypes.number,
  loaderMargin: PropTypes.number,
  marginLeft: PropTypes.number,
  alignSelf: PropTypes.any,
  marginBottom: PropTypes.any,
};

ImageLoader.defaultProps = {
  fileName: null,
  borderRadius: null,
  height: null,
  width: null,
  marginTop: null,
  loaderMargin: normalise(20),
  marginLeft: null,
  alignSelf: null,
  marginBottom: null,
};
