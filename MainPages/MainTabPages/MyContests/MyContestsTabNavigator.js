import { StyleSheet, Text} from 'react-native'
import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {width} from '../../../Dimensions';
import LinearGradient from 'react-native-linear-gradient';
import ScreenForMyContestTabNavigator from './ScreenForMyContestTabNavigator';

const Tab = createMaterialTopTabNavigator();

export default function MyContestsTabNavigator({navigation}) {

  return (<>
    <LinearGradient colors={['#1141c1', '#002487']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.container}>
      <Tab.Navigator initialRouteName='Upcoming' screenOptions={{tabBarStyle:{elevation:0,height:46,backgroundColor:'transparent'},lazy:true}}>
        <Tab.Screen name='Upcoming' component={ScreenForMyContestTabNavigator} initialParams={{mode:'U',status:'Upcoming',emptyLine:"You haven't participated in any upcoming contest yet."}} options={{tabBarIcon:({focused})=><Text style={[styles.TabBarText,{color:focused?'#fafbff':'#dedede'}]}>Upcoming</Text>,tabBarIndicatorStyle:styles.tabBarIndicatorStyle}}/>
        <Tab.Screen name='Live' component={ScreenForMyContestTabNavigator} initialParams={{mode:'L',status:'Live',emptyLine:"There are no live matches yet."}} options={{tabBarIcon:({focused})=><Text style={[styles.TabBarText,{color:focused?'#fafbff':'#dedede'}]}>Live</Text>,tabBarIndicatorStyle:styles.tabBarIndicatorStyle}}/>
        <Tab.Screen name='Completed' component={ScreenForMyContestTabNavigator} initialParams={{mode:'C',status:'Completed',emptyLine:"There are no completed matches yet."}} options={{tabBarIcon:({focused})=><Text style={[styles.TabBarText,{color:focused?'#fafbff':'#dedede'}]}>Completed</Text>,tabBarIndicatorStyle:styles.tabBarIndicatorStyle}}/>
      </Tab.Navigator>
    </LinearGradient>
  </>)
}

const styles = StyleSheet.create({
  container: {
    height: 46,
    flex: 1,
  },
  TabBarText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    width: width / 3,
    alignSelf: 'center',
    textAlign: 'center',
  },
  tabBarIndicatorStyle: {
    backgroundColor: '#fafbff',
    height: 3.5,
    width: width / 3.5,
    marginLeft: width / 42,
    borderRadius: 5,
    marginBottom: 3,
  }
});