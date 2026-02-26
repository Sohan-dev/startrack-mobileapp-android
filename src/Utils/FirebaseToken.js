import React from 'react';
import {Platform} from 'react-native';

import messaging from '@react-native-firebase/messaging';
import EncryptedStorage from 'react-native-encrypted-storage';

const DUMMY_TOKEN = '';
var deviceToken = 'deviceToken';

export const getToken = () => {
  return new Promise((resolve, reject) => {
    EncryptedStorage.getItem(deviceToken)
      .then(value => {
        if (value) resolve(value);
        else resolve(DUMMY_TOKEN);
      })
      .catch(error => {
        reject('Token could not be generated');
      });
  });
};

export const generateDeviceToken = () => {
  return new Promise((resolve, reject) => {
    if (Platform.OS === 'ios') {
      messaging()
        .requestPermission()
        .then(() => {
          messaging()
            .getAPNSToken()
            .then(value => {
              // console.log("TOKEN: ",value)
              if (value) {
                //alert("Token:\n"+value)
                EncryptedStorage.setItem(deviceToken, value);
                resolve(value);
              } else {
                EncryptedStorage.getItem(deviceToken)
                  .then(value => {
                    if (value) resolve(value);
                    else resolve(DUMMY_TOKEN);
                  })
                  .catch(error => {
                    reject('Token could not be generated');
                  });
              }
            })
            .catch(() => {
              EncryptedStorage.getItem(deviceToken)
                .then(value => {
                  if (value) resolve(value);
                  else resolve(DUMMY_TOKEN);
                })
                .catch(error2 => {
                  reject('Token could not be generated');
                });
            });
        })
        .catch(error => {
          reject(error);
        });
    } else {
      fcmToken = messaging()
        .getToken()
        .then(value => {
          if (value) {
            EncryptedStorage.setItem(deviceToken, value);
            resolve(value);
          } else {
            EncryptedStorage.getItem(deviceToken)
              .then(value => {
                if (value) resolve(value);
                else resolve(DUMMY_TOKEN);
              })
              .catch(error => {
                reject('Token could not be generated');
              });
          }
        })
        .catch(error => {
          EncryptedStorage.getItem(deviceToken)
            .then(value => {
              if (value) resolve(value);
              else resolve(DUMMY_TOKEN);
            })
            .catch(error => {
              reject('Token could not be generated');
            });
        });
    }
  });
};
