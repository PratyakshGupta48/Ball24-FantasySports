import { StatusBar } from 'react-native'
import React, { useState, useRef, useCallback } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Header_ContestSelection from '../Headers/Header_ContestSelection';
import firestore from '@react-native-firebase/firestore'; 
import { useFocusEffect, useRoute } from '@react-navigation/native';
import ContestDetails from './ContestDetails';
import AskForSetPage from './AskForSetPage';
import BallSelection from './BallSelection';
import { height } from '../Dimensions';
import BottomSheet , {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import WalletBottomSheet from './MainTabPages/WalletBottomSheet';
import FetchScore from '../FetchScore';

const Stack = createNativeStackNavigator();

export default function ContestDetailNavigation({navigation}) {

  const sheetRef1 = useRef(null);
  function openBottomSheet() {if (sheetRef1.current)sheetRef1.current.snapToIndex(0)}
  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />);
  const {Team1,Team2,MatchId,PrizePool,ContestType,Overs,Entry,TeamCode1,TeamCode2,I1,I2,MatchLink,MatchKey,MaximumSpots,FirstPosition,WinnersPercentage,uid,Winnings,Free,initialScreen,Inning,CurrentInning} = useRoute().params;
  const [status,setStatus] = useState('');
  const [focusedScreen, setFocusedScreen] = useState(initialScreen);
  let navigationV = navigation;

  useFocusEffect(
    useCallback(() => {
      const matchStatusListener = firestore().collection('AllMatches').doc(MatchId).onSnapshot((documentSnapshot) => {
        setStatus(documentSnapshot.data().Status);
      });
      return () => matchStatusListener;
    }, [])
  )

  return (<>
    <StatusBar animated={true} backgroundColor="#000000"/>
    <Header_ContestSelection navigation={()=>{navigationV.pop()}} navigation2={()=>{navigation.navigate('WebViewRules')}} TeamCode1={TeamCode1} TeamCode2={TeamCode2} Matchid={MatchId} MatchKey={MatchKey} Overs={Overs}  WalletFunction={()=>{openBottomSheet()}}/>
    {status!='' && status!='Upcoming' && <FetchScore I1={I1} I2={I2} status={status} MatchId={MatchId} Team1={Team1} Team2={Team2} CurrentInning={CurrentInning} focusedScreen={focusedScreen}/>}
    {/* {status!='Upcoming' && focusedScreen!='BallSelection' && <FetchScore I1={I1} I2={I2} status={status} MatchId={MatchId} Team1={Team1} Team2={Team2} CurrentInning={CurrentInning} focusedScreen={focusedScreen}/>} */}
    <Stack.Navigator initialRouteName={initialScreen}>
      <Stack.Screen name='ContestDetails' component={ContestDetails} listeners={({ navigation }) => ({focus: () => {navigationV=navigation; setFocusedScreen('ContestDetails') }})} options={{headerShown:false,animation:'slide_from_right',headerMode:'screen'}} initialParams={{MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,I1:I1,I2:I2,MatchLink:MatchLink,PrizePool:PrizePool,Overs:Overs,Entry:Entry,MatchKey:MatchKey,MaximumSpots:MaximumSpots,FirstPosition:FirstPosition,WinnersPercentage:WinnersPercentage,uid:uid,Winnings:Winnings,Free:Free,Inning:Inning}} />
      {status!=='Completed' && <Stack.Screen listeners={({ navigation }) => ({focus: () =>{ navigationV=navigation; setFocusedScreen('AskForSet') }})} name='AskForSet' component={AskForSetPage} options={{headerShown:false,animation:'slide_from_right',headerMode:'screen'}} initialParams={{MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,ContestType:ContestType,Entry:Entry,MatchKey:MatchKey,uid:uid,Free:Free}} />}
      {status!=='Completed' && <Stack.Screen name='BallSelection' component={BallSelection}  listeners={({ navigation }) => ({focus: () => {navigationV=navigation; setFocusedScreen('BallSelection') }})} options={{headerShown:false,animation:'slide_from_right',headerMode:'screen'}} initialParams={{MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,I1:I1,I2:I2,Team1:Team1,Team2:Team2,MatchLink:MatchLink,ContestType:ContestType,Entry:Entry,MatchKey:MatchKey,uid:uid,Free:Free,Inning:Inning,Overs:Overs,status:status}} />}
    </Stack.Navigator>
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