import React,{useCallback, useEffect,useState} from 'react';
import {View,Text,StyleSheet,LayoutAnimation, UIManager, Platform, Image} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore'; 
import RenderWinning from './RenderWinning';
import ContestDetailLeaderboard from './ContestDetailLeaderboard';
import LiveLeaderboard from './MainTabPages/MyContests/LiveLeaderboard';
import { width } from '../Dimensions';
// import FetchScore from '../FetchScore';

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

function ContestDetails({navigation}) {

  const {MatchId,PrizePool,Overs,Entry,TeamCode1,TeamCode2,I1,I2,MatchLink,MatchKey,MaximumSpots,FirstPosition,WinnersPercentage,uid,Winnings,Free,Inning} = useRoute().params;
  const [filledSpots,setFilledSpots] = useState(null)
  const [status,setStatus] = useState('');
  const [contestStatus,setContestStatus] = useState(null);
  const [refunded,setRefunded] = useState()
  const [newUser,setNewUser] = useState();
  const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));

  useEffect(() => {if (contestStatus||MaximumSpots-filledSpots<=0) LayoutAnimation.configureNext(customLayoutAnimation);}, [contestStatus,filledSpots]);
  useFocusEffect(
    useCallback(() => {
      const contestListener = firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).onSnapshot(async (documentSnapshot) => {
        await delay(400)
        setFilledSpots(documentSnapshot.data().FilledSpots);
        const m = (documentSnapshot.data().ContestStatus)[0]
        setContestStatus(m)
        if(m==='L')setRefunded(documentSnapshot.data().Refunded)
      });
      // const matchListener = firestore().collection('AllMatches').doc(MatchId).onSnapshot((documentSnapshot) => {
      //   const status = documentSnapshot.data().Status
      //   setStatus(status);
      // });
      const userListener = firestore().collection('users').doc(uid).onSnapshot((documentSnapshot) => {
        setNewUser(documentSnapshot.data().Contest);
      });
      return () => { contestListener(); 
        // matchListener(); 
        userListener();};
    }, [])
  )

  return ( <>

    {/* {(status==='Live' || status==='Completed') && MatchLink && <FetchScore page={'Details'}  I1={I1} I2={I2} status={status} url={MatchLink}/>} */}
    <View style={styles.Card}>
      <View style={styles.PrizeEntryTextContainer}>
        <Text style={styles.PrizeText}>Prize Pool</Text>
        <Text style={styles.OversMentionNumber}>Innings-{Inning}    Over-{Overs}</Text>
        {(contestStatus==='L' || contestStatus==='C' || MaximumSpots-filledSpots<=0) && <Text style={styles.PrizeText}>Entry</Text>}
      </View>
      <View style={[styles.PrizeMoneyContainer,{justifyContent:"space-between"}]}>
        <View style={styles.PrizeMoneyContainer}>
          <Text style={styles.Rupee}>₹</Text>
          <Text style={styles.PrizeMoneyText}>{PrizePool}</Text>
        </View>
        {(contestStatus==='L' || contestStatus==='C' || MaximumSpots-filledSpots<=0) && <Text style={styles.EntryText}>{Entry}</Text>}
      </View>
      <View style={styles.ProgressLineContainer}></View>
      <View style={{backgroundColor:'#db2800',height:4,marginTop:-4,opacity:0.7,borderTopLeftRadius:5,borderBottomLeftRadius:5,width:((filledSpots/MaximumSpots)*100)+'%'}}></View>
      <View style={styles.SpotsNumberContainer}>
        <Text style={styles.SpotsLeftNumber}>{(MaximumSpots-filledSpots<=0)?'Contest full':MaximumSpots-filledSpots+" spots left"}</Text>
        <Text style={styles.TotalSpotsNumber}>{MaximumSpots} spots</Text>
      </View>
      {contestStatus==='U' && MaximumSpots-filledSpots>0 && <Text style={styles.EntryMoneyText} onPress={()=>{if(contestStatus==='U')navigation.navigate('AskForSet')}}>{(!newUser && Free==true)?'Free':'Join  '+Entry}</Text>}
      <View style={styles.ExtraDetailsContainer}>
        <View style={styles.FirstIconContainer}>
          <Icon name='medal-outline' size={14} color='#666666'/>
        </View>
        <View style={styles.WinningMoneyContainer}>
          <Text style={styles.RupeeSymbol}>₹</Text>
          <Text style={styles.WinningMoneyText}>{FirstPosition}</Text>
        </View>
        <View style={styles.TrophyIconContainer}>
          <Icon name='trophy-outline' size={15} color='#666666'/>
        </View>
        <View style={styles.WinningMoneyContainer}>
          <Text style={styles.WinningMoneyText}>{WinnersPercentage}</Text>
        </View>
        {contestStatus==='U' && <View style={styles.DeadlineContestContaioner}>
          <View style={styles.DeadlineContestIconContaioner}>
            <Icon name='clock-fast' size={18} color='#1141c1'/>
          </View>
          <View style={styles.WinningMoneyContainer}>
            <Text style={styles.DeadlineOverText}>{Overs>1?"Deadline "+(Overs-1):"Match Start"}</Text>
            {Overs>1 && <Text style={{marginBottom:10,color:'#1141c1',fontFamily:'Poppins-Medium',fontSize:8}}>th</Text>}
            {Overs>1 && <Text style={styles.DeadlineOverText}> over</Text>}
          </View>
        </View>}
        {(contestStatus==='L' || contestStatus==='C') && <View style={styles.DeadlineContestContaioner}>{refunded ? <Text style={styles.RefundedTextDot}>• Refunded</Text>:contestStatus==='L'?<Text style={styles.LiveText}>• Live</Text>:<Text style={styles.RefundedTextDot}>• Completed</Text>}</View>}
      </View>
    </View>

    {!refunded && <Tab.Navigator initialRouteName='Winning' backBehavior='none' screenOptions={{swipeEnabled:true,tabBarStyle:{elevation:3,height:37,backgroundColor:'#ffffff',paddingLeft:4},tabBarItemStyle:{width: 120,alignItems:'flex-start' },lazy:true}}>
      <Tab.Screen name='Winning' component={RenderWinning} initialParams={{Winning:Winnings}} options={{swipeEnabled:true,tabBarIndicatorStyle:[styles.TabScreen,{width:70,marginLeft:13}],tabBarPressColor:'#fcfcfc',title:({focused})=>(
        <Text style={[styles.TabScreenText,{color:focused?'#1a1a1a':'#a1a1a1',}]}>Winnings</Text>        
      )}}/>
      {contestStatus && <Tab.Screen name='Leaderboard' component={contestStatus && contestStatus==='U'?ContestDetailLeaderboard:LiveLeaderboard} initialParams={{uid:uid,MatchId:MatchId,MatchKey:MatchKey,TeamCode1:TeamCode1,TeamCode2:TeamCode2,contestStatus:contestStatus}} options={{swipeEnabled:true,tabBarIndicatorStyle:[styles.TabScreen,{width:70,marginLeft:10}],tabBarPressColor:'#fcfcfc',title:({focused})=>(
        <Text style={[styles.TabScreenText,{color:focused?'#1a1a1a':'#a1a1a1',left:-20}]}>  Leaderboard</Text>        
      )}}/>}
    </Tab.Navigator>}
    {refunded && <View style={styles.RefundedMainContainer}>
      <Image source={require('../accessories/DreamBallLogos/vvk.jpg')} style={styles.Image}/>
      <Text style={styles.RefundedText}>This contest has been abandoned due to incomplete spots & your entry fees has been refunded to your Ball24 wallet.</Text>    
    </View>}
    </>
  );
}

export default ContestDetails;

const styles = StyleSheet.create({
  Card: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    paddingHorizontal: 12,
  },
  PrizeEntryTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  PrizeText: {
    color: '#969696',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  PrizeMoneyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Rupee: {
    color: '#1a1a1a',
    fontSize: 23,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  PrizeMoneyText: {
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
  },
  EntryText: {
    color: '#858585',
    fontWeight: '900',
    fontSize: 15,
    marginTop: -10,
  },
  EntryMoneyText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 18,
    backgroundColor: '#009e00',
    borderRadius: 5,
    height: 41,
    textAlign: 'center',
    marginTop: 5,
    paddingTop: 7,
  },
  ProgressLineContainer: {
    marginTop: 9,
    height: 4,
    backgroundColor: '#ffe2db',
    opacity: 0.8,
    borderRadius: 5,
  },
  SpotsNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  SpotsLeftNumber: {
    color: '#db2800',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  TotalSpotsNumber: {
    color: '#a1a1a1',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  ExtraDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    marginHorizontal: -12,
    marginTop: 14,
    height: 29,
  },
  FirstIconContainer: {
    marginLeft: 12,
    marginRight: 4,
  },
  WinningMoneyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2.9,
  },
  RupeeSymbol: {
    color: '#666666',
    alignSelf: 'flex-start',
    fontSize: 12,
  },
  WinningMoneyText: {
    color: '#666666',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  TrophyIconContainer: {
    marginLeft: 20,
    marginRight: 4,
  },
  DeadlineContestContaioner: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 12,
  },
  DeadlineContestIconContaioner: {
    marginRight: 4,
  },
  DeadlineOverText: {
    color: '#1141c1',
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    lineHeight: 20,
  },
  DeadlineClockIcon: {
    textAlign: 'center',
    marginTop: 40,
  },
  DeadlineTextContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  DeadlineText: {
    color: '#1a1a1a',
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    marginTop: 8,
  },
  RedirectingText: {
    color: '#a1a1a1',
    fontFamily: 'Poppins-Medium',
    marginTop: 10,
  },
  OversMentionNumber: {
    color: '#696969',
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    marginTop: -1,
    marginRight: 15,
  },
  TabScreen: {
    backgroundColor: '#1141c1',
    height: 4,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  TabScreenText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    position: 'relative',
    bottom: 5,
  },
  RefundedMainContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 5,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 5,
    marginHorizontal: 10,
    elevation: 2,
    alignItems: 'center',
  },
  RefundedText: {
    color: '#787878',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    textAlign: 'center',
  },
  Image: {
    width: width * 0.7,
    height: width * 0.7,
  },
  LiveText: {
    color: '#009e00',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  RefundedTextDot: {
    color: '#c77700',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
});  