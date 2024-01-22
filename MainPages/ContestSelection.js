import React,{useState,useEffect,useRef,useCallback} from 'react';
import {Text,StyleSheet,StatusBar,View,LayoutAnimation, UIManager, Platform, BackHandler} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Header_ContestSelection from '../Headers/Header_ContestSelection';
import {height,width} from '../Dimensions';
import firestore from '@react-native-firebase/firestore';
import BottomSheet , {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
// import BottomSheetInfo from './BottomSheetInfo';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MySets from './MySets';
import ContestSelectionTab from './ContestSelectionTab';
import MyContestsMatchDisplayOnClickLivePage from './MainTabPages/MyContests/MyContestsMatchDisplayOnClickLivePage';
import FastImage from 'react-native-fast-image';
import WalletBottomSheet from './MainTabPages/WalletBottomSheet';
import Toast from 'react-native-toast-message';

const Tab = createMaterialTopTabNavigator();
  if (Platform.OS === 'android')UIManager.setLayoutAnimationEnabledExperimental(true);
  const customLayoutAnimation = {
    duration: 250,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
  };

function ContestSelection({navigation}) {
  const sheetRef1 = useRef(null);
  function openBottomSheet() {if (sheetRef1.current)sheetRef1.current.snapToIndex(0)}
  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />);

  const {Team1,Team2,MatchId,TeamCode1,TeamCode2,MatchLink,I1,I2,uid} = useRoute().params;
  const initialRouteName = useRoute().params.initialRouteName||'contests'
  const [status,setStatus] = useState(''); 
  const [contestCount,setContestCount] = useState('My Contests');
  const [setCount,setSetCount] = useState('My Sets');
  const [scoreData,setScoreData] = useState(null);
  const showToast = (type,text1,text2) =>{Toast.show({type: type,text1: text1,visibilityTime:2500,position:'top',topOffset:20,text2: text2});setTimeout(() => navigation.goBack(), 2000);}
  const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));

  useEffect(() => {if(scoreData)LayoutAnimation.configureNext(customLayoutAnimation);}, [scoreData]);
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);
      const unsubscribeMatch = firestore().collection('AllMatches').doc(MatchId).onSnapshot(async (documentSnapshot) => {
        await delay(200)
        if (documentSnapshot.data().Status === 'Completed') {
          showToast('error','Contest Completed','The match is completed. Redirecting...')
          setTimeout(() => navigation.replace('Drawer'), 3000);
        }
        setStatus(documentSnapshot.data().Status);
      });
      const unsubscribeMyContests = firestore().collection('users').doc(uid).collection('MyContests').doc(MatchId).onSnapshot(async (documentSnapshot) => {
        await delay(200)
        const data = documentSnapshot.data();
        if (data !== undefined) setContestCount('My Contests (' + data.ContestCount.length + ')');
      });
      const unsubscribeParticipants = firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(uid).onSnapshot(async (documentSnapshot) => {
        await delay(200)
        const data = documentSnapshot.data();
        if (data !== undefined) setSetCount('My Sets (' + data.Count + ')');
      });
      return () => { unsubscribeMatch(); unsubscribeMyContests(); unsubscribeParticipants();backHandler.remove();};
    }, [])
  )

  const handleBackButtonPress = () => {
    navigation.goBack();
    return true;
  };

  useEffect(()=>{
    if ((status == 'Live' || status == 'Upcoming') && MatchLink!=undefined) {
      async function fetchScore() {
        try {
          const response = await fetch('https://get-cricket-score.vercel.app/score?url=' + MatchLink);
          const data = await response.json();
          setScoreData(data);
        } catch (e) {
          fetchScore();
        }
      }
      fetchScore();
      // if (status === 'Live') {
      //   const scoreInterval = setInterval(() => fetchScore(), 90000);
      //   return () => clearInterval(scoreInterval);
      // }
    }
  },[status])

  return(<>
  <StatusBar animated={true} backgroundColor="#1a1a1a"/>
  <Header_ContestSelection navigation={()=>{navigation.goBack()}} navigation2={()=>{navigation.navigate('WebViewRules')}} TeamCode1={TeamCode1} TeamCode2={TeamCode2} Matchid={MatchId} special={'ContestSelection'} WalletFunction={()=>{openBottomSheet()}}/>
  
  {status!=='Upcoming' && scoreData!=null && <View style={{backgroundColor:'#1a1a1a',flexDirection:'column',justifyContent:'center',paddingHorizontal:13,paddingTop:10}}>
  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
    <View style={{alignItems:'flex-start'}}>
      <Text style={styles.LSTeamName}>{scoreData.Team1}</Text>
      <View style={styles.LSImageScoreContainer}>
        <FastImage source={{uri:I1}} style={styles.TeamLogoOne}/>
        {scoreData.Score1!=" " && <><Text style={[styles.ScoreDataCurrentText,{marginLeft:10}]}>{(scoreData.Score1).slice(0,(scoreData.Score1).indexOf('(')-1)}</Text>
        <Text style={[styles.LSOverText,{marginLeft:5}]}>{(scoreData.Score1).slice((scoreData.Score1).indexOf('('))}</Text></>}
        {scoreData.Score1==" " && <Text style={[styles.ScoreDataCurrentText,{marginLeft:10}]}>Yet to bat</Text>}
      </View>
    </View>  
    <View style={{alignItems:'flex-end'}}>
      <Text style={styles.LSTeamName}>{scoreData.Team2}</Text>
      <View style={styles.LSImageScoreContainer}>
        {scoreData.Score2!=" " && <><Text style={[styles.LSOverText,{marginRight:5}]}>{(scoreData.Score2).slice((scoreData.Score2).indexOf('('))}</Text>
        <Text style={[styles.ScoreDataCurrentText,{marginRight:10}]}>{(scoreData.Score2).slice(0,(scoreData.Score2).indexOf('(')-1)}</Text></>}
        {scoreData.Score2==" " && <Text style={[styles.ScoreDataCurrentText,{marginRight:10}]}>Yet to bat</Text>}
        <FastImage source={{uri:I2}} style={styles.TeamLogoOne}/>
      </View>  
    </View>  
  </View>
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:-10}}>
    <Text style={{color:'#109e00',fontFamily:'Poppins-SemiBold'}}>● </Text>
    <Text style={styles.LSStatusText}>{status.toUpperCase()}</Text>
  </View>
  <Text style={styles.LSConclusionText}>{scoreData.Status}</Text>
  <View style={{height:1,backgroundColor:'#4f4f4f',marginBottom:5}}></View>
  </View>}
  
  <Tab.Navigator initialRouteName={initialRouteName} optimizationsEnabled={true} screenOptions={{swipeEnabled:true,tabBarStyle:{position:'relative',height:28,backgroundColor:'#1a1a1a'},lazy:true}} initialLayout={{width:width}}>
    <Tab.Screen name='Contests' component={ContestSelectionTab} initialParams={{uid:uid,MatchId:MatchId,Team1:Team1,Team2:Team2,TeamCode1:TeamCode1,TeamCode2:TeamCode2,I1:I1,I2:I2,MatchLink:MatchLink}} options={{tabBarIndicatorStyle:styles.tabBarIndicatorStyle,tabBarPressColor:'#969696',swipeEnabled:true,title:({focused})=>(
      <Text style={[styles.contestTabBarTitleStyle,{color: focused ? '#dedede' : '#a1a1a1' }]}>Contests</Text>        
    )}}/>
    <Tab.Screen name='MyContests' component={MyContestsMatchDisplayOnClickLivePage} initialParams={{MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,I1:I1,I2:I2,Team1:Team1,Team2:Team2,MatchLink:MatchLink}} options={{tabBarIndicatorStyle:styles.tabBarIndicatorStyle,tabBarPressColor:'#969696',swipeEnabled:true,title:({focused})=>(
      <Text style={[styles.contestTabBarTitleStyle,{color: focused ? '#dedede' : '#a1a1a1' }]}>{contestCount}</Text>        
    )}}/>
    <Tab.Screen name='MySets' component={MySets} initialParams={{uid:uid,MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,I1:I1,I2:I2}} options={{tabBarIndicatorStyle:styles.tabBarIndicatorStyle,tabBarPressColor:'#969696',swipeEnabled:true,title:({focused})=>(
      <Text style={[styles.contestTabBarTitleStyle,{color: focused ? '#dedede' : '#a1a1a1' }]}>{setCount}</Text>        
    )}}/>
  </Tab.Navigator>

  <BottomSheet
    ref={sheetRef1}
    snapPoints={[36400/height+'%']}
    index={-1}
    enablePanDownToClose={true}
    enableOverDrag={true}
    backdropComponent={renderBackdrop}
    handleStyle={{position:'absolute',alignSelf:'center'}}
    handleIndicatorStyle={{backgroundColor:'#dbdbdb'}}
    backgroundStyle={{borderTopLeftRadius:13,borderTopRightRadius:13}}>
      <WalletBottomSheet navigation={()=>navigation.navigate('AddCash')}/>
  </BottomSheet>
  

  </>     
  )
}

export default ContestSelection;

const styles = StyleSheet.create({
  tabBarIndicatorStyle:{
    backgroundColor:'#007aff',
    height:3.2,
    width:width/4,
    marginLeft:(width)/24,
    borderRadius:5,
    borderTopEndRadius:20,
    borderTopStartRadius:20,
    elevation:2
  },
  contestTabBarTitleStyle:{
    color: '#a1a1a1',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12.7,
    marginTop: -20
  },
  TeamLogoOne:{
    width:33,
    height:33
  },
  LSTeamName:{
    color:'#a4a4a4',
    fontFamily:'Poppins-Medium',
    fontSize:11.5,
    letterSpacing:-0.3
  },
  LSImageScoreContainer:{
    flexDirection:'row',
    alignItems:'center',
  },
  ScoreDataCurrentText:{
    color:'#ababab',
    fontFamily:'Poppins-SemiBold',
    fontSize:18,
    marginTop:3
  },
  LSOverText:{
    color:'#a4a4a4',
    fontFamily:'Poppins-Medium',
    fontSize:12,
    marginTop:3
  },
  LSStatusText:{
    color:'#fafbff',
    fontFamily:'Poppins-SemiBold',
    fontSize:12
  },
  LSConclusionText:{
    color:'#fafbff',
    fontFamily:'Poppins-Regular',
    alignSelf:'center',
    fontSize:12,
    paddingBottom:5
  },
});