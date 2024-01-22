
import {requestNotifications} from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestPermission = () => {
  requestNotifications(['alert', 'sound']).then(({status, settings}) => {
    if(status=='granted') GetFCMToken()
  });
}

async function GetFCMToken () {
  let fcmtoken = await AsyncStorage.getItem("fcmtoken")
  if(!fcmtoken){
    const fcmtoken = await messaging().getToken();
    if(fcmtoken) await AsyncStorage.setItem("fcmtoken",fcmtoken);
  }
}