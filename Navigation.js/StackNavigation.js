import React from 'react';
import {Dimensions, View,Text,StyleSheet,Image,StatusBar} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import RegOrLog from '../Pages/RegOrLog';
import Authentication from '../Pages/Authentication';
import DrawerContent from '../MainPages/MainDrawerPages/DrawerContent';
// import FantasyPointSystem from '../MainPages/MainDrawerPages/FantasyPointSystem';
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
// import BallViewCompleted from '../MainPages/MainTabPages/MyContests/BallViewCompleted';
import AddEmail from '../MainPages/MainTabPages/AddEmail';
import ReferAndWinExtension from '../MainPages/MainTabPages/ReferAndWinExtension';
import Withdraw from '../MainPages/MainTabPages/Withdraw';
// import ContestDetailLeaderboard from '../MainPages/ContestDetailLeaderboard';
// import LiveLeaderboard from '../MainPages/MainTabPages/MyContests/LiveLeaderboard';
import Notification from '../MainPages/Notification';
import HelpAndSuppport from '../MainPages/MainDrawerPages/HelpAndSuppport';
import Home from '../MainPages/Home';
import MyContestsTabNavigator from '../MainPages/MainTabPages/MyContests/MyContestsTabNavigator';
import More from '../MainPages/MainTabPages/More';
import Header_Home from '../Headers/Header_Home';
import PaymentGateway from '../MainPages/MainTabPages/PaymentGateway';
import MyContestsMatchDisplayOnClickCompletedPage from '../MainPages/MainTabPages/MyContests/MyContestsMatchDisplayOnClickCompletedPage'
// import ScreenForMyContestTabNavigator from '../MainPages/MainTabPages/MyContests/ScreenForMyContestTabNavigator';
import WebViewForRules from '../MainPages/WebViewForRules';

import ContestDetailNavigation from '../MainPages/ContestDetailNavigation';

import Toast from 'react-native-toast-message';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';


const width = Dimensions.get('window').width;

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
// const Stack = createStackNavigator();

function MainTabNavigator({ navigation }) {
  const tabItems = [
    { name: 'Home', component: Home, icon: 'home-outline' },
    { name: 'MyContests', component: MyContestsTabNavigator, icon: 'trophy-outline' },
    { name: 'Wallet', component: Wallet, icon: 'wallet-outline' },
    { name: 'Refer', component: ReferAndWin, icon: 'gift-outline' },
  ];
  return (<>
    <StatusBar animated={true} backgroundColor='#002487' />
    <Header_Home navigation={() => navigation.openDrawer()} navigation2={() => navigation.navigate('Notification')} />
    <Tab.Navigator initialRouteName='Home' screenOptions={{ tabBarShowLabel: false, headerShown: false, tabBarStyle: { height: 56 } }}>
      {tabItems.map((item) => <Tab.Screen key={item.name} name={item.name} component={item.component} options={{tabBarIcon: ({ focused }) => (
        <View style={styles.MainContainer2}>
          <Icon2 name={item.icon} size={26} color={focused ? '#1141c1' : '#969696'} />
          <Text style={{ color: focused ? '#1141c1' : '#969696', fontFamily: 'Poppins-Medium', fontSize: 10 }}>{item.name}</Text>
        </View>
      ),}}/>)}
    </Tab.Navigator>
  </>);
}


function MainDrawernavigation() {
  const user = auth().currentUser;
  const DrawerDesign = (iconName,drawerName) =>
  <View style={styles.MainContainer}>
    <Icon name={iconName} size={28} color='#121212'/>  
    <Text style={{color:'#121212',fontFamily:'Poppins-Medium',fontSize:13,paddingLeft:12}}>{drawerName}</Text>        
  </View>
  return ( 
    <Drawer.Navigator initialRouteName='MainTab' drawerContent={props => <DrawerContent {...props}/>} screenOptions={{swipeEnabled:false,title:'',headerShown:false,drawerStyle:{width:width/1.15}}}>
      <Drawer.Screen name='MainTab' component={MainTabNavigator} options={{drawerItemStyle:{display:'none'}}}/>
      <Drawer.Screen name='Profile' component={Profile} options={{drawerStyle:{width:width/1.15},drawerItemStyle:{width:width,marginLeft:-1,marginRight:0,height:100},drawerIcon:()=>(
        <View style={styles.MainProfileContainer}>
          <Image source={{uri:user.photoURL}} style={styles.ProfileImage}></Image>
          <Text style={styles.Name}>{user.displayName}</Text>
          <Icon name='chevron-forward-outline' size={30} color='#ffffff'/>  
        </View>
      )}}/>
      <Drawer.Screen name='MyBalance' component={Wallet} options={{drawerIcon:()=>DrawerDesign('wallet-outline','My Balance')}}/>
      <Drawer.Screen name='ReferAndWin' component={ReferAndWin} options={{drawerIcon:()=>DrawerDesign('people-outline','Refer And Redeem')}}/>
      <Drawer.Screen name='HowToPlay' component={HowToPlay} options={{drawerIcon:()=>DrawerDesign('game-controller-outline','How To Play')}}/>
      {/* <Drawer.Screen name='Fantasy Point System' component={FantasyPointSystem} options={{drawerIcon:()=>DrawerDesign('cash-outline','Ball24 Fantasy Point System')}}/> */}
      <Drawer.Screen name='Follow us on social media' component={FollowUs} options={{drawerIcon:()=>DrawerDesign('thumbs-up-outline','Follow us on social media')}}/> 
      <Drawer.Screen name='Feedback' component={Feedback} options={{drawerIcon:()=>DrawerDesign('newspaper-outline','Feedback')}}/> 
      <Drawer.Screen name='More' component={More} options={{drawerIcon:()=>DrawerDesign('ellipsis-vertical','More')}}/> 
    </Drawer.Navigator>          
  );
}


function MainStackNavigation(){
  return(
    <BottomSheetModalProvider>
    {/* <StatusBar animated={true} backgroundColor='#002487' /> */}
    <Stack.Navigator initialRouteName='Drawer' screenOptions={{contentStyle: { backgroundColor: '#ffffff' },headerShown:false,animation:'slide_from_right',statusBarColor:'#1a1a1a',orientation:'portrait_up'}}>
      <Stack.Screen name='ContestSelection' component={ContestSelection} options={{detachPreviousScreen:'true'}}/>
      <Stack.Screen name='ContestDetailNavigation' component={ContestDetailNavigation}/>

      <Stack.Screen name='Drawer' component={MainDrawernavigation} options={{detachPreviousScreen:true,animation:'fade',statusBarColor:'#002487'}}/>
      <Stack.Screen name='AddCash' component={AddCash}/>
      <Stack.Screen name='PaymentGateway' component={PaymentGateway}/>
      <Stack.Screen name='Transactions' component={Transactions}/>
      <Stack.Screen name='SetCreator' component={SetCreator}/>
      {/* <Stack.Screen name='ContestDetailLeaderboard' component={ContestDetailLeaderboard} options={{animation:'fade'}}/> */}
      {/* <Stack.Screen name='LiveLeaderboard' component={LiveLeaderboard} options={{animation:'fade'}}/> */}
      {/* <Stack.Screen name='ScreenForMyContestTabNavigator' component={ScreenForMyContestTabNavigator} options={{animation:'fade'}}/> */}
      <Stack.Screen name='MyMatchCompleted' component={MyContestsMatchDisplayOnClickCompletedPage} options={{animation:'fade'}}/>
      <Stack.Screen name='AddEmail' component={AddEmail}/>
      <Stack.Screen name='ReferAndWinExtension' component={ReferAndWinExtension}/>
      <Stack.Screen name='Withdraw' component={Withdraw}/>
      <Stack.Screen name='Notification' component={Notification} options={{animation:'fade'}}/>
      <Stack.Screen name='WebViewRules' component={WebViewForRules} options={{animation:'fade'}}/>
      
      <Stack.Screen name='BallEdit' component={BallEditPage}/>
      {/* <Stack.Screen name='BallViewCompleted' component={BallViewCompleted}/> */}
      <Stack.Screen name='HelpAndSupport' component={HelpAndSuppport}/>

    </Stack.Navigator>
    </BottomSheetModalProvider>
  )
}

function StackNavigation(){
  const user = auth().currentUser;
  return(<>
    <Stack.Navigator screenOptions={{contentStyle:{backgroundColor:'#ffffff'},orientation:'portrait',headerShown:false,animation:'slide_from_right'}} >
      <Stack.Screen name='RegOrLog' component={RegOrLog}/>
      {(!user || !user.displayName) &&<Stack.Screen name='Authentication' component={Authentication}/>}
      <Stack.Screen name='MainStackNavigation' component={MainStackNavigation} options={{detachPreviousScreen:true}} />
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
  top:-1,
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
  color:'#ffffff',
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



// const config = {
//   animation: 'spring',
//   config: {
//     duration:200,
//     // easing:Easing.cubic,
//     stiffness: 1000,
//     damping: 50,
//     mass: 3,
//     overshootClamping: true,
//     restDisplacementThreshold: 0.01,
//     restSpeedThreshold: 0.01,
//   },
// };
// const closeConfig = {
//   animation:'timing',
//   config: {
//     duration:100,
//     easing:Easing.linear
//   }
// }


// {/* <Stack.Navigator initialRouteName='Drawer' screenOptions={{
//   // cardStyleInterpolator: ({ current, layouts }) => {
//   //     return {
//   //       cardStyle: {
//   //         transform: [
//   //           {
//   //             translateX: current.progress.interpolate({
//   //               inputRange: [0, 1],
//   //               outputRange: [layouts.screen.width, 0],
//   //             }),
//   //           },
//   //         ],
//   //       },
//   //     }
//   //   }, transitionSpec: {open:config,close:closeConfig},
//     headerShown:false,contentStyle: { backgroundColor: '#ffffff' }}}>
// {/* <Stack.Navigator initialRouteName='Drawer' screenOptions={{contentStyle:{backgroundColor:'#ffffff'}}}> */}
//   <Stack.Screen name='ContestSelection' component={ContestSelection} options={{detachPreviousScreen:true,
//   animation:'slide_from_right',
//   }}/>
//   <Stack.Screen name='ContestDetailNavigation' component={ContestDetailNavigation} options={{
//   animation:'slide_from_right',
//   }}/>

//   <Stack.Screen name='Drawer' component={MainDrawernavigation} options={{detachPreviousScreen:true,
//     animation:'fade'
//     }}/>
//   <Stack.Screen name='AddCash' component={AddCash} options={{
//   // animation:'slide_from_right',
//   }}/>
//   <Stack.Screen name='PaymentGateway' component={PaymentGateway} options={{
//   // animation:'slide_from_right',
//   }}/>
//   <Stack.Screen name='Transactions' component={Transactions} options={{animation:'slide_from_right'}}/>
//   <Stack.Screen name='SetCreator' component={SetCreator} options={{detachPreviousScreen:true,
//   // animation:'slide_from_right',
//   }}/>
//   <Stack.Screen name='ContestDetailLeaderboard' component={ContestDetailLeaderboard} options={{
//     // animation:'fade'
//     }}/>
//   <Stack.Screen name='LiveLeaderboard' component={LiveLeaderboard} options={{
//     // animation:'fade'
//     }}/>
//   <Stack.Screen name='ScreenForMyContestTabNavigator' component={ScreenForMyContestTabNavigator} options={{
//     // animation:'fade'
//     }}/>
//   <Stack.Screen name='MyMatchCompleted' component={MyContestsMatchDisplayOnClickCompletedPage} options={{
//     // animation:'fade'
//     }}/>
//   <Stack.Screen name='AddEmail' component={AddEmail} options={{
//   // animation:'slide_from_right',
//   }}/>
//   <Stack.Screen name='ReferAndWinExtension' component={ReferAndWinExtension} options={{animation:'slide_from_right'}}/>
//   <Stack.Screen name='Withdraw' component={Withdraw} options={{animation:'slide_from_right'}}/>
//   <Stack.Screen name='Notification' component={Notification} options={{
//     // animation:'fade'
//     }}/>
//   <Stack.Screen name='WebViewRules' component={WebViewForRules} options={{
//     // animation:'fade'
//     }}/>
  
//   <Stack.Screen name='BallEdit' component={BallEditPage} options={{animation:'slide_from_right'}}/>
//   <Stack.Screen name='BallViewCompleted' component={BallViewCompleted} options={{animation:'slide_from_right'}}/>
//   <Stack.Screen name='HelpAndSupport' component={HelpAndSuppport} options={{animation:'slide_from_right'}}/>

// </Stack.Navigator> */}