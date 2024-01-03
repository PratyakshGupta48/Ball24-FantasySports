import React, { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native'
import StackNavigation from './Navigation.js/StackNavigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import SplashScreen from 'react-native-splash-screen';
import { Platform } from 'react-native';

function App() {
  useEffect(()=>{
    if(Platform.OS=='android') SplashScreen.hide();
  },[]);
  return ( 
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StackNavigation/>
      </NavigationContainer>
    </GestureHandlerRootView>
   );
}

export default App; 