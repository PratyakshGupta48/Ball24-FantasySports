import React from 'react';
import {Dimensions, View,Text,StyleSheet,Image,StatusBar} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import RegOrLog from '../Pages/RegOrLog';
import Authentication from '../Pages/Authentication';
import DrawerContent from '../MainPages/MainDrawerPages/DrawerContent';
import FantasyPointSystem from '../MainPages/MainDrawerPages/FantasyPointSystem';
import HowToPlay from '../MainPages/MainDrawerPages/HowToPlay';
import Feedback from '../MainPages/MainDrawerPages/Feedback';
import FollowUs from '../MainPages/MainDrawerPages/FollowUs';
import ReferAndWin from '../MainPages/MainTabPages/ReferAndWin';
import Wallet from '../MainPages/MainTabPages/Wallet';
import Profile from '../MainPages/MainTabPages/Profile';
import ContestSelection from '../MainPages/ContestSelection';
import SetCreator from '../MainPages/SetCreator';
import AddCash from '../MainPages/MainTabPages/AddCash';
import Transactions from '../MainPages/MainTabPages/Transactions';
import BallEditPage from '../MainPages/MainTabPages/MyContests/BallEditPage';
import BallViewCompleted from '../MainPages/MainTabPages/MyContests/BallViewCompleted';
import AddEmail from '../MainPages/MainTabPages/AddEmail';
import ReferAndWinExtension from '../MainPages/MainTabPages/ReferAndWinExtension';
import Withdraw from '../MainPages/MainTabPages/Withdraw';
import ContestDetailLeaderboard from '../MainPages/ContestDetailLeaderboard';
import LiveLeaderboard from '../MainPages/MainTabPages/MyContests/LiveLeaderboard';
import Notification from '../MainPages/Notification';
import HelpAndSuppport from '../MainPages/MainDrawerPages/HelpAndSuppport';
import Home from '../MainPages/Home';
import MyContestsTabNavigator from '../MainPages/MainTabPages/MyContests/MyContestsTabNavigator';
import More from '../MainPages/MainTabPages/More';
import Header_Home from '../Headers/Header_Home';
import PaymentGateway from '../MainPages/MainTabPages/PaymentGateway';
import MyContestsMatchDisplayOnClickCompletedPage from '../MainPages/MainTabPages/MyContests/MyContestsMatchDisplayOnClickCompletedPage'
import ScreenForMyContestTabNavigator from '../MainPages/MainTabPages/MyContests/ScreenForMyContestTabNavigator';
import WebViewForRules from '../MainPages/WebViewForRules';

import ContestDetailNavigation from '../MainPages/ContestDetailNavigation';

import Toast from 'react-native-toast-message';


const width = Dimensions.get('window').width;

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function MainTabNavigator({navigation}) {
  return (<>
    <StatusBar animated={true} backgroundColor='#002487'/>
    <Header_Home navigation={()=>{navigation.openDrawer()}} navigation2={()=>{navigation.navigate('Notification')}}/>
    <Tab.Navigator initialRouteName='Home' screenOptions={{tabBarShowLabel:false,tabBarStyle:{height:56}}}>
      <Tab.Screen name='Home' component={Home} options={{headerShown:false,tabBarIcon:({focused})=>(
        <View style={styles.MainContainer2}>
          <Icon2 name='home-outline' size={26} color={focused?'#1141c1':'#969696'} style={styles.homeicon}/>  
          <Text style={{color:focused?'#1141c1':'#969696',fontFamily:'Poppins-Medium',fontSize:10}}>Home</Text>        
        </View>
      )}}/>
      <Tab.Screen name='MyContests' component={MyContestsTabNavigator} options={{headerShown:false,tabBarIcon:({focused})=>(
        <View style={styles.MainContainer2}>
          <Icon2 name='trophy-outline' size={26} color={focused?'#1141c1':'#969696'} style={styles.homeicon}/>          
          <Text style={{color:focused?'#1141c1':'#969696',fontFamily:'Poppins-Medium',fontSize:10}}>My Matches</Text>        
        </View>
      )}}/>
      <Tab.Screen name='Wallet' component={Wallet} options={{headerShown:false,tabBarIcon:({focused})=>(
        <View style={styles.MainContainer2}>
          <Icon2 name='wallet-outline' size={26} color={focused?'#1141c1':'#969696'} style={styles.homeicon}/>
          <Text style={{color:focused?'#1141c1':'#969696',fontFamily:'Poppins-Medium',fontSize:10}}>Wallet</Text>                  
        </View>
      )}}/>
      <Tab.Screen name='Refer' component={ReferAndWin} options={{headerShown:false,tabBarIcon:({focused})=>(
        <View style={styles.MainContainer2}>
          <Icon2 name="gift-outline" size={26} color={focused?'#1141c1':'#969696'} style={styles.homeicon}/>
          <Text style={{color:focused?'#1141c1':'#969696',fontFamily:'Poppins-Medium',fontSize:10}}>Refer</Text>                  
        </View>
      )}}/>
    </Tab.Navigator></>
  );
}

function MainDrawernavigation() {
  const user = auth().currentUser;
  return ( 
    <Drawer.Navigator initialRouteName='MainTab' drawerContent={props => <DrawerContent {...props}/>} screenOptions={{drawerStyle:{width:width/1.15}}}>
      <Drawer.Screen name='MainTab' component={MainTabNavigator} options={{drawerItemStyle:{display:'none'},headerShown:false}}/>
      <Drawer.Screen name='Profile' component={Profile} options={{swipeEnabled:false,title:' ',headerShown:false,drawerStyle:{width:width/1.15},drawerItemStyle:{width:width,marginLeft:-1,marginRight:0,height:100},drawerIcon:()=>(
        <View style={styles.MainProfileContainer}>
          <Image source={{uri:user.photoURL}} style={styles.ProfileImage}></Image>
          <Text style={styles.Name}>{user.displayName}</Text>
          <Icon name='chevron-forward-outline' size={30} color='#ffffff'/>  
        </View>
      )}}/>
      <Drawer.Screen name='MyBalance' component={Wallet} options={{swipeEnabled:false,title:' ',headerShown:false,drawerIcon:()=>(
        <View style={styles.MainContainer}>
          <Icon name='wallet-outline' size={28} color='#121212'/>  
          <Text style={{color:'#121212',fontFamily:'Poppins-Medium',fontSize:13,paddingLeft:12}}>My Balance</Text>        
        </View>
      )}}/>
      <Drawer.Screen name='ReferAndWin' component={ReferAndWin} options={{swipeEnabled:false,title:' ',headerShown:false,drawerIcon:()=>(
        <View style={styles.MainContainer}>
          <Icon name='people-outline' size={29} color='#121212'/>  
          <Text style={{color:'#121212',fontFamily:'Poppins-Medium',fontSize:13.5,paddingLeft:12}}>Refer And Win</Text>        
        </View>
      )}}/>
      <Drawer.Screen name='HowToPlay' component={HowToPlay} options={{swipeEnabled:false,headerShown:false,title:' ',drawerIcon:()=>(
        <View style={styles.MainContainer}>
          <Icon name='game-controller-outline' size={28} color='#121212'/>  
          <Text style={{color:'#121212',fontFamily:'Poppins-Medium',fontSize:13,paddingLeft:12}}>How To Play</Text>        
        </View>
      )}}/>
      <Drawer.Screen name='Fantasy Point System' component={FantasyPointSystem} options={{swipeEnabled:false,headerShown:false,title:' ',drawerIcon:()=>(
        <View style={styles.MainContainer}>
          <Icon name='cash-outline' size={28} color='#121212'/>  
          <Text style={{color:'#121212',fontFamily:'Poppins-Medium',fontSize:13,paddingLeft:12}}> Dream Fantasy Point System</Text>        
        </View>
      )}}/>
      <Drawer.Screen name='Follow us on social media' component={FollowUs} options={{swipeEnabled:false,headerShown:false,title:' ',drawerIcon:()=>(
        <View style={styles.MainContainer}>
          <Icon name='thumbs-up-outline' size={28} color='#121212'/>  
          <Text style={{color:'#121212',fontFamily:'Poppins-Medium',fontSize:13,paddingLeft:12}}>Follow us on social media</Text>        
        </View>
      )}}/> 
      <Drawer.Screen name='Feedback' component={Feedback} options={{swipeEnabled:false,headerShown:false,title:' ',drawerIcon:()=>(
        <View style={styles.MainContainer}>
          <Icon name='newspaper-outline' size={28} color='#121212'/>  
          <Text style={{color:'#121212',fontFamily:'Poppins-Medium',fontSize:13,paddingLeft:12}}>Feedback</Text>        
        </View>
      )}}/> 
      <Drawer.Screen name='More' component={More} options={{swipeEnabled:true,headerShown:false,title:' ',drawerIcon:()=>(
        <View style={styles.MainContainer}>
          <Icon2 name="dots-vertical" size={28} color='#121212'/>
          <Text style={{color:'#121212',fontFamily:'Poppins-Medium',fontSize:13,paddingLeft:12}}>More</Text>                  
        </View>
      )}}/> 
    </Drawer.Navigator>          
  );
}

function MainStackNavigation(){
  return(
    <Stack.Navigator initialRouteName='Drawer' screenOptions={{contentStyle: { backgroundColor: '#ffffff' },}}>
    {/* <Stack.Navigator initialRouteName='Drawer' screenOptions={{contentStyle:{backgroundColor:'#ffffff'}}}> */}
      <Stack.Screen name='ContestSelection' component={ContestSelection} options={{headerShown:false,detachPreviousScreen:true,animation:'slide_from_right',headerMode:'screen'}}/>
      <Stack.Screen name='ContestDetailNavigation' component={ContestDetailNavigation} options={{headerShown:false,animation:'slide_from_right',headerMode:'screen'}}/>

      <Stack.Screen name='Drawer' component={MainDrawernavigation} options={{headerShown:false,detachPreviousScreen:true,headerMode:'screen',animation:'fade'}}/>
      <Stack.Screen name='AddCash' component={AddCash} options={{headerShown:false,animation:'slide_from_right',headerMode:'screen'}}/>
      <Stack.Screen name='PaymentGateway' component={PaymentGateway} options={{headerShown:false,animation:'fade',headerMode:'screen'}}/>
      <Stack.Screen name='Transactions' component={Transactions} options={{headerShown:false,animation:'fade'}}/>
      <Stack.Screen name='SetCreator' component={SetCreator} options={{headerShown:false,detachPreviousScreen:true,animation:'fade',headerMode:'screen'}}/>
      <Stack.Screen name='ContestDetailLeaderboard' component={ContestDetailLeaderboard} options={{headerShown:false,animation:'fade',headerMode:'screen'}}/>
      <Stack.Screen name='LiveLeaderboard' component={LiveLeaderboard} options={{headerShown:false,animation:'fade',headerMode:'screen'}}/>
      <Stack.Screen name='ScreenForMyContestTabNavigator' component={ScreenForMyContestTabNavigator} options={{headerShown:false,animation:'fade',headerMode:'screen'}}/>
      <Stack.Screen name='MyMatchCompleted' component={MyContestsMatchDisplayOnClickCompletedPage} options={{headerShown:false,animation:'fade',headerMode:'screen'}}/>
      <Stack.Screen name='AddEmail' component={AddEmail} options={{headerShown:false,animation:'fade',headerMode:'screen'}}/>
      <Stack.Screen name='ReferAndWinExtension' component={ReferAndWinExtension} options={{headerShown:false,animation:'fade'}}/>
      <Stack.Screen name='Withdraw' component={Withdraw} options={{headerShown:false,animation:'fade'}}/>
      <Stack.Screen name='Notification' component={Notification} options={{headerShown:false,animation:'fade'}}/>
      <Stack.Screen name='WebViewRules' component={WebViewForRules} options={{headerShown:false,animation:'fade'}}/>
      
      <Stack.Screen name='BallEdit' component={BallEditPage} options={{headerShown:false,animation:'fade'}}/>
      <Stack.Screen name='BallViewCompleted' component={BallViewCompleted} options={{headerShown:false,animation:'fade_from_bottom'}}/>
      <Stack.Screen name='HelpAndSupport' component={HelpAndSuppport} options={{headerShown:false,animation:'fade'}}/>

    </Stack.Navigator>
  )
}

function StackNavigation(){
  const user = auth().currentUser;
  return(<>
    <Stack.Navigator screenOptions={{contentStyle:{backgroundColor:'#ffffff'},orientation:'portrait'}} >
      <Stack.Screen name='RegOrLog' component={RegOrLog} options={{headerShown:false,animation:'fade'}}/>
      {(!user || !user.displayName) &&<Stack.Screen name='Authentication' component={Authentication} options={{headerShown:false,animation:'slide_from_right'}}/>}
      <Stack.Screen name='MainStackNavigation' component={MainStackNavigation} options={{headerShown:false,animation:'slide_from_right',detachPreviousScreen:true}} />
    </Stack.Navigator>
    <Toast/>
    </>
  )
}

export default StackNavigation;

const styles = StyleSheet.create({
MainContainer:{
  flexDirection:'row',
  justifyContent:'center',
  alignItems:'center',
  marginBottom:7,
  marginTop:7,
},
MainProfileContainer:{
  flexDirection:'row',
  justifyContent:'flex-start',
  alignItems:'center',
  backgroundColor:'#121212',
  position:'absolute',
  top:0,
  height:100,
  width:'100%',
  paddingLeft:13
},
ProfileImage:{
  width:55,
  height:55,
  borderRadius:100,
  borderWidth:1,
  borderColor:'#ffffff',
  marginRight:10
},
Name:{
  color:'white',
  fontFamily:'Poppins-SemiBold',
  fontSize:14,
  paddingLeft:3
},
MainContainer2:{
  flexDirection:'column',
  justifyContent:'center',
  alignItems:'center'
},
})