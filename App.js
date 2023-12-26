import React from 'react';
import {NavigationContainer} from '@react-navigation/native'
import StackNavigation from './Navigation.js/StackNavigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler'

function App() {
  return ( 
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StackNavigation/>
      </NavigationContainer>
    </GestureHandlerRootView>
   );
}

export default App; 