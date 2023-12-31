import { StatusBar } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Header_ContestSelection from '../Headers/Header_ContestSelection';
import firestore from '@react-native-firebase/firestore'; 
import { useRoute } from '@react-navigation/native';
import ContestDisplay from './ContestDetails';
import AskForSetPage from './AskForSetPage';
import BallSelection from './BallSelection';
import { height } from '../Dimensions';
import BottomSheet , {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import WalletBottomSheet from './MainTabPages/WalletBottomSheet';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

export default function ContestDetailNavigation({navigation}) {

  const sheetRef1 = useRef(null);
  function openBottomSheet() {if (sheetRef1.current)sheetRef1.current.snapToIndex(0)}
  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />);
  const {Team1,Team2,MatchId,PrizePool,ContestType,Overs,Entry,TeamCode1,TeamCode2,I1,I2,MatchLink,MatchKey,MaximumSpots,FirstPosition,WinnersPercentage,uid,Winnings,Free,initialScreen,Inning} = useRoute().params;
  const [status,setStatus] = useState(null);
  const [Conteststatus,setContestStatus] = useState('');
  const showToast = (type,text1,text2) =>{Toast.show({type: type,text1: text1,visibilityTime:2500,position:'top',topOffset:20,text2: text2});setTimeout(() => navigation.goBack(), 2000);}

  useEffect(() => {
    const contestStatusListener = firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).onSnapshot((document) => {
      setContestStatus(document.data().ContestStatus);
    });
    const matchStatusListener = firestore().collection('AllMatches').doc(MatchId).onSnapshot((documentSnapshot) => {
      setStatus(documentSnapshot.data().Status);
    });
    return () => { contestStatusListener(); matchStatusListener();};
  }, [navigation]);

  return (
    <>
    <StatusBar animated={true} backgroundColor="#000000"/>
    <Header_ContestSelection navigation={()=>{navigation.pop()}} TeamCode1={TeamCode1} TeamCode2={TeamCode2} Matchid={MatchId} status={status} ContestStatus={Conteststatus} Overs={Overs}  WalletFunction={()=>{openBottomSheet()}}/>
    <Stack.Navigator initialRouteName={initialScreen}>
      <Stack.Screen name='ContestDisplay' component={ContestDisplay} options={{headerShown:false,animation:'slide_from_right',headerMode:'screen'}} initialParams={{MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,I1:I1,I2:I2,MatchLink:MatchLink,PrizePool:PrizePool,Overs:Overs,Entry:Entry,MatchKey:MatchKey,MaximumSpots:MaximumSpots,FirstPosition:FirstPosition,WinnersPercentage:WinnersPercentage,uid:uid,Winnings:Winnings,Free:Free,Inning:Inning}} />
      {status && status!='Completed' && <Stack.Screen name='AskForSet' component={AskForSetPage} options={{headerShown:false,animation:'slide_from_right',headerMode:'screen'}} initialParams={{MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,I1:I1,I2:I2,Team1:Team1,Team2:Team2,MatchLink:MatchLink,ContestType:ContestType,Entry:Entry,MatchKey:MatchKey,MaximumSpots:MaximumSpots,uid:uid,Free:Free,Inning:Inning,spotsFilled:()=>showToast('error', 'Contest Full', 'Sorry, the spots for this contest are filled.Redirecting...'),contestLive:()=>showToast('error','Contest Live','Sorry, the contest is live. Redirecting...')}} />}
      {status && status!='Completed' && <Stack.Screen name='BallSelection' component={BallSelection} options={{headerShown:false,animation:'slide_from_right',headerMode:'screen'}} initialParams={{MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,I1:I1,I2:I2,Team1:Team1,Team2:Team2,MatchLink:MatchLink,ContestType:ContestType,Entry:Entry,MatchKey:MatchKey,uid:uid,Free:Free,Inning:Inning,Overs:Overs}} /> }
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
    <Toast/>
    </>
  )
}