
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

export const NotificationListener = () => {
//   messaging().onNotificationOpenedApp(remoteMessage => {
//     // ('Notification caused app to open from background state:',remoteMessage.notification,);
//   });
      
//   messaging().getInitialNotification().then(remoteMessage => {
//     if (remoteMessage) {
//     //   console.log('Notification caused app to open from quit state:',remoteMessage.notification,);
//     }
//   });

//   messaging().onMessage(async remoteMessage => {
//     // console.log('Message on foreground state',remoteMessage)
//   })
}

