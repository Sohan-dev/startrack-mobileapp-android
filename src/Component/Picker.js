import React from 'react';
import {FlatList, SafeAreaView, View} from 'react-native';
import PropTypes from 'prop-types';
import normalize from '../Utils/Dimen';
import Modal from 'react-native-modal';

export default function Picker(props) {
  function onBackdropPress() {
    if (props.onBackdropPress) {
      props.onBackdropPress();
    }
  }

  function _handleLoadMore() {
    if (props._handleLoadMore) {
      props._handleLoadMore();
    }
  }

  return (
    <SafeAreaView>
      <Modal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        backdropTransitionOutTiming={0}
        hideModalContentWhileAnimating={true}
        isVisible={props.modalVisible}
        style={{width: '100%', alignSelf: 'center', margin: 0}}
        animationInTiming={800}
        animationOutTiming={1000}
        onBackButtonPress={() => onBackdropPress()}
        onBackdropPress={() => onBackdropPress()}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#ddd',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: props.backgroundColor,
            borderRadius: normalize(7),
            maxHeight: props.height,
            paddingLeft: normalize(20),
            paddingBottom: normalize(15),
          }}>
          <FlatList
            data={props.dataList}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={props.renderData}
            onEndReachedThreshold={1}
            onEndReached={() => _handleLoadMore()}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

Picker.propTypes = {
  dataList: PropTypes.array,
  modalVisible: PropTypes.bool,
  renderData: PropTypes.func,
  onBackdropPress: PropTypes.func,
  backgroundColor: PropTypes.string,
  height: PropTypes.number,
  _handleLoadMore: PropTypes.func,
};

Picker.defaultProps = {
  dataList: [],
  modalVisible: false,
  renderData: null,
  onBackdropPress: null,
  backgroundColor: 'white',
  height: normalize(400),
  _handleLoadMore: null,
};
