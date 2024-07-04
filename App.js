import React, { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native'
import StackNavigation from './Navigation.js/StackNavigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import SplashScreen from 'react-native-splash-screen';

function App() {
  useEffect(()=>{
    SplashScreen.hide();
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