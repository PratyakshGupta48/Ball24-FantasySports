import { StyleSheet, Text, View, FlatList, TouchableWithoutFeedback,LayoutAnimation, UIManager, Platform} from 'react-native'
import React,{useEffect,useState,useCallback,useRef} from 'react';
import {useRoute} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import {BottomSheetModal,BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import { height,width } from '../../../Dimensions';
import FastImage from 'react-native-fast-image';
import Tooltip from 'rn-tooltip';
import BallView from './BallViewPage';
import SkeletonContent, { SkeletonOneLiner} from '../../../SkeletonPlaceholder';
import SwitchSets from '../../../Helpers/SwitchSets';

const snapPoint = 50000/height+'%';
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

export default function MyContestsMatchDisplayOnClickLivePage({navigation}) {

  const {TeamCode1,TeamCode2,Team1,Team2,MatchId,I1,I2,MatchLink} = useRoute().params;
  const user = auth().currentUser;
  const uid = user.uid;
  const Name = user.displayName
  const [loadingSpinner,setLoadingSpinner] = useState(true);
  const [ContestData,setContestData] = useState([])
  const [refresh,setRefresh] = useState(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [Id,setId] = useState(null);
  const [MatchKey,setMatchKey] = useState(null);
  const [oldSet,setOldSet] = useState(null);
  const [ballViewData,setBallViewData] = useState(["",[]]);
  const sheetRef1 = useRef(null);
  const sheetRef2 = useRef(null);

  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0}/>)
  const openBottomSheet1 = useCallback(() => {sheetRef1.current?.present();}, []);
  const handleClosePress = () => sheetRef1.current?.close();
  const openBottomSheet2 = useCallback(() => {sheetRef2.current?.present();}, []);
  const handleClosePress2 = () => sheetRef2.current?.close();


  useEffect(() => {LayoutAnimation.configureNext(customLayoutAnimation)}, [selectedItemIndex,loadingSpinner]);
  // useFocusEffect(
    useEffect(() => {
      setSelectedItemIndex(-1)
      const fetchData = async () => {
        setLoadingSpinner(true);
        handleClosePress();
        handleClosePress2()
        const contestsSnapshot = await firestore().collection('users').doc(uid).collection('MyContests').doc(MatchId).collection('Contests').get();
        const arr = [];
        await Promise.all(
          contestsSnapshot.docs.map(async (documentSnapshot) => {
            const contestDoc = await firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(documentSnapshot.id).get();
            arr.push({
              ...contestDoc.data(),
              Count: documentSnapshot.data().Count,
            });
          })
        );
        setContestData(arr);
        setLoadingSpinner(false);
      };
      fetchData()
      const unsubscribe2 = firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'modified' && change.doc.exists) {
            const contestData = change.doc.data();
            if (contestData.ContestStatus === 'Live' && ContestData.find(item=> item.DocumentId === contestData.DocumentId)) {
              setRefresh(!refresh)
              handleClosePress();
              handleClosePress2()
            }
          }
        });
      });
      return () => unsubscribe2;
    }, [refresh])
  // )

  const RenderExtendedList = useCallback(({MatchKey,ContestStatus}) => {
    const [ContestSetsData,setContestSetsData] = useState([]);
    const [loading,setLoading] = useState(true);
    useEffect(() => {LayoutAnimation.configureNext(customLayoutAnimation)}, [ContestSetsData,loading]);
    useEffect(() => {
      const main = async () => {
        const SetDetails = [];
        const [participantSnapshot, userSetsSnapshot] = await Promise.all([
          firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).collection('Participants').where('uid', '==', uid).get(),
          firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(uid).get()
        ]);
        const userSetsData = userSetsSnapshot.data() || {};
        await Promise.all(participantSnapshot.docs.map(async (documentSnapshot) => {
          const name = documentSnapshot.data().SetNumber;
          const lockedStatusArray = userSetsData.LockedStatus || [];
          let Lock = false;
          for (let i = 0; i < lockedStatusArray.length; i++) {
            if (lockedStatusArray[i].Name === name) {
              const lockedFor = lockedStatusArray[i].LockedFor;
              const doc = await firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(lockedFor).get();
              if (doc.data().ContestStatus === 'Live') {
                Lock = true;
                break;
              }
            }
          }
          SetDetails.push({
            SetName: documentSnapshot.data().SetNumber,
            Set: userSetsData[name] ? userSetsData[name].flatMap(Object.values) : [],
            id: documentSnapshot.id,
            Points: documentSnapshot.data().PointsNumber,
            PointsArray: documentSnapshot.data().Points,
            Rank: documentSnapshot.data().Rank,
            Lock: Lock,
            WinningMessage: documentSnapshot.data().WinningMessage,
          });
        }));
        setContestSetsData(SetDetails);
        setLoading(false);
      };
      main();
    }, []);
    
    const RenderItem = ({item}) => {
      const navigateToBallView = () => {
        const totalRuns = (item.Set).reduce((acc, val) => acc + (isNaN(parseInt(val)) ? 0 : parseInt(val[0])), 0)
        setBallViewData([item.SetName,item.Set,totalRuns,item.Points,item.Rank,item.PointsArray,item.Lock,ContestStatus==='Upcoming'?'Upcoming':'Live'])
        openBottomSheet1(0);
      };
      const navigateToBallEdit = () => navigation.navigate('BallEdit', { MatchId, TeamCode1, TeamCode2, uid, I1, I2, SetName: item.SetName});
      const showModal = () => {
        openBottomSheet2()
        setId(item.id);
        setMatchKey(MatchKey);
        setOldSet(item.SetName);
      };
      return (
        <TouchableWithoutFeedback onPress={navigateToBallView} key={item.SetName}>
        <View style={styles.SecondMainCardComponent}>
          <View style={styles.FirstComp}>
            <View style={styles.FirstNameSetContainer}>
              <Text style={styles.Name}>{Name}</Text>
              <Text style={styles.SetName}>{item.SetName}</Text>
            </View>
            {item.WinningMessage!=undefined && ContestStatus!='Upcoming' && (<Text style={styles.WinningAmount}>{item.WinningMessage}</Text>)} 
          </View>
          {ContestStatus!=='Upcoming' && <Text style={styles.Points}>{item.Points}</Text>}
          {ContestStatus!=='Upcoming' && <Text style={styles.Rank}>{item.Rank?'#'+item.Rank:'—'}</Text>}
          {ContestStatus==='Upcoming' && <View style={styles.IconContainer}>
            {item.Lock===false && <Icon name='pencil-outline' size={23} color='#666666' onPress={navigateToBallEdit}/>}
            {item.Lock===true &&<Tooltip popover={<Text style={{color:'#fafbff',fontFamily:'Poppins-Regular',fontSize:12}}>This set cannot be edited because you have used it to participate in a contest that is now live.But you can always create and switch sets.</Text>} backgroundColor='#1141c1' height={100} width={250} ><Icon name='lock-outline' size={22} color='#666666' /></Tooltip>}
            <Icon name='swap-horizontal' size={23} color='#666666' onPress={showModal}style={{ marginLeft: 20 }}/>
          </View>}
        </View>
      </TouchableWithoutFeedback>
      );
    }
    return(<>
      {loading?<View style={{ height:50}}><SkeletonOneLiner/></View>:
        <FlatList
          data={ContestSetsData}
          renderItem={RenderItem}  
          refreshing={false}
          maxToRenderPerBatch={5}
          initialNumToRender={5}
          getItemLayout={(data,index) => ({length: 55, offset: 55* index, index})}
        />
      }
    </>)
  },[])

  const RenderItem = ({item,index}) => {
    const isItemSelected = selectedItemIndex === index; 
    const navigationLeaderboard = () => navigation.navigate('ContestDetailNavigation',{Team1:Team1,Team2:Team2,MatchId:MatchId,Overs:item.Overs,ContestType:item.Type,PrizePool:item.PrizePool,Entry:item.Entry,uid:uid,TeamCode1:TeamCode1,TeamCode2:TeamCode2,MatchKey:item.DocumentId,MaximumSpots:item.MaximumSpots,FirstPosition:item.FirstPosition,WinnersPercentage:item.WinnersPercentage,Winnings:item.Winning,I1:I1,I2:I2,MatchLink:MatchLink,Free:item.Free,initialScreen:'ContestDetails',Inning:item.Inning})
    return(
      <View style={styles.Card}>
        <TouchableWithoutFeedback onPress={navigationLeaderboard} style={{backgroundColor:'transparent'}}><View>
          {item.ContestStatus=='Upcoming' && <Text style={styles.UpcomingText}>• UPCOMING</Text>}
          <View style={[styles.PrizeEntryMoneyContainer,{marginTop:2}]} >
            <Text style={styles.PrizeText}>Prize Pool</Text>
            <Text style={styles.OversMentionNumber}>Innings-{item.Inning}    Over-{item.Overs}</Text>
            <Text style={styles.PrizeText}>Entry</Text>
          </View>
          <View style={styles.PrizeEntryMoneyContainer}>
             <View style={styles.PrizeMoneyContainer}>
               <Text style={styles.Rupee}>₹</Text>
               <Text style={styles.PrizeMoneyText}>{item.PrizePool}</Text>
             </View>
             <Text style={styles.EntryMoneyText}>{item.Entry}</Text>
          </View>
          <View style={styles.ProgressLineContainer}></View>
          <View style={{backgroundColor:'#db2800',height:4,marginTop:-4,opacity:0.7,borderTopLeftRadius:5,borderBottomLeftRadius:5,width:((item.FilledSpots/item.MaximumSpots)*100)+'%'}}></View>
          <View style={[styles.PrizeEntryMoneyContainer,{marginTop:4}]}>
            <Text style={styles.SpotsLeftNumber}>{(item.MaximumSpots-item.FilledSpots<=0)?'Contest full':item.MaximumSpots-item.FilledSpots+" spots left"}</Text>
            <Text style={styles.TotalSpotsNumber}>{item.MaximumSpots} spots</Text>
          </View>
          <View style={styles.ExtraDetailsContainer}>
            <View style={styles.FirstIconContainer}><Icon name='medal-outline' size={14} color='#666666'/></View>
            <View style={styles.WinningMoneyContainer}>
              <Text style={styles.RupeeSymbol}>₹</Text>
              <Text style={styles.WinningMoneyText}>{item.FirstPosition}</Text>
            </View>
            <View style={styles.TrophyIconContainer}><Icon name='trophy-outline' size={15} color='#666666'/></View>
            <View style={styles.WinningMoneyContainer}><Text style={styles.WinningMoneyText}>{item.WinnersPercentage}</Text></View>
            {item.ContestStatus === 'Live' && <><View style={styles.TrophyIconContainer}>
              <Icon name='gamepad-variant-outline' size={15} color='#666666'/></View>
              <View style={styles.WinningMoneyContainer}>
                <Text style={styles.ForOversText}>Over-{item.Overs}</Text>
              </View>
              <View style={styles.DeadlineContestContaioner}>{item.Refunded ? <Text style={styles.RefundedText}>• Refunded</Text>: <Text style={styles.LiveText}>• Live</Text>}</View>
            </>}
            {item.ContestStatus=='Upcoming' && <View style={styles.DeadlineContestContaioner}>
              <Icon name='clock-fast' size={18} color='#1141c1' style={{marginRight:3}}/>
              <View style={styles.WinningMoneyContainer}>
                <Text style={styles.DeadlineOverText}>{item.Overs>1?"Deadline "+(item.Overs-1):" Match Start"}</Text>
                {item.Overs>1 && <Text style={{marginBottom:10,color:'#1141c1',fontFamily:'Poppins-Medium',fontSize:8}}>th</Text>}
                {item.Overs>1 && <Text style={styles.DeadlineOverText}> over</Text>}
              </View>
            </View>}
          </View></View>
        </TouchableWithoutFeedback>
        <View style={styles.JoinedWithTextContainer}>
          <Text style={styles.JoinedWithText}>{'Joined with '+item.Count+' set'}</Text>
          <Icon name={isItemSelected?'chevron-up':'chevron-down'} size={23} color='#666666' onPress={()=>{setSelectedItemIndex(isItemSelected ? -1 : index)}}/>
        </View>
        {isItemSelected && item.Refunded !== true && <RenderExtendedList MatchKey={item.DocumentId} ContestStatus={item.ContestStatus}/>}
      </View>
    )
  }

  return (<>
    {loadingSpinner?<View style={{flex:1,backgroundColor:'#ffffff',paddingTop:12}}><SkeletonContent/></View>:(<>
    <FlatList
      style={{flex:1,backgroundColor:'#ffffff',marginBottom:5}}
      nestedScrollEnabled={true}
      data={ContestData}
      refreshing={false}
      onRefresh={()=>setRefresh(!refresh)}
      renderItem={RenderItem}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={15}
      getItemLayout={(data,index) => ({length: 200, offset: 200* index, index})}
      ListEmptyComponent={()=>(loadingSpinner==false && <View style={{alignItems:'center',justifyContent:'center',flexDirection:'column',paddingTop:30}}>
        <FastImage source={require('../../../accessories/DreamBallLogos/71bqZiF2kiL._SL1500_.jpg')} style={{width:width-100,height:width-100}}/>
        <Text style={{color:'#666666',textAlign:'center',fontFamily:'Poppins-Medium',fontSize:13,marginBottom:23,marginTop:-10}}>You haven't joined any contest yet! {"\n"}Start your journey of winning here</Text>
        <Text style={{paddingHorizontal:40,color:'#ffffff',backgroundColor:'#009e00',paddingVertical:7,fontFamily:'Poppins-Medium',borderRadius:8,fontSize:17}} onPress={()=>{navigation.jumpTo('Contests')}}>Explore Contests</Text>
      </View>)}
    />
    <BottomSheetModal
      ref={sheetRef2}
      snapPoints={['70%']}
      enablePanDownToClose={false}
      enableOverDrag={true}
      backdropComponent={renderBackdrop}
      handleStyle={{display:'none'}}
      backgroundStyle={{borderTopLeftRadius:13,borderTopRightRadius:13}}>
        <SwitchSets MatchId={MatchId} uid={uid} MatchKey={MatchKey} oldSet={oldSet} Id={Id} disableRefresh={()=>{setTimeout(()=>{setRefresh(!refresh);}, 1500);}}/>
    </BottomSheetModal>
    <BottomSheetModal
      ref={sheetRef1}
      snapPoints={[snapPoint]}
      enablePanDownToClose={true}
      enableOverDrag={true}
      backdropComponent={renderBackdrop}
      handleStyle={{position:'absolute',alignSelf:'center'}}
      handleIndicatorStyle={{backgroundColor:'#ffffff'}}
      backgroundStyle={{borderTopLeftRadius:13,borderTopRightRadius:13}}>
        <BallView status={ballViewData[7]} Points={ballViewData[3]} Rank={ballViewData[4]} PointsArray={ballViewData[5]} name={Name} userSetName={ballViewData[0]} userSet={ballViewData[1]} lockStatus={ballViewData[6]} TeamCode1={TeamCode1} TeamCode2={TeamCode2} totalRuns={ballViewData[2]} navigation={()=>{handleClosePress();navigation.navigate('BallEdit',{MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,uid:uid,I1:I1,I2:I2,SetName:ballViewData[0]})}}/>
    </BottomSheetModal>
  </>)}
  </>)      
}

const styles = StyleSheet.create({
  Card:{
    backgroundColor:'#ffffff',
    marginHorizontal:15,
    borderRadius:5,
    marginTop:20 ,
    marginBottom:5,
    elevation:3,
    paddingHorizontal:10,
    overflow:'hidden'
  },
  PrizeText:{
    color:'#969696',
    fontFamily:'Poppins-SemiBold',
    fontSize:12
  },
  OversMentionNumber:{
    color:'#696969',
    fontFamily:'Poppins-Medium',
    fontSize:13,
    marginTop:-1
  },
  PrizeEntryMoneyContainer:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
  },
  PrizeMoneyContainer:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  Rupee:{
    color:'#121212',
    fontSize:21,
    fontWeight:'600',
    alignSelf:'flex-start'
  },
  PrizeMoneyText:{
    color:'#121212',
    fontFamily:'Poppins-SemiBold',
    fontSize:20,
  },
  EntryMoneyText:{
    color:'#6b6b6b',
    fontWeight:'900'
  }, 
  ProgressLineContainer:{
    marginTop:9,
    height:4,
    backgroundColor:'#ffe2db',
    opacity:0.8,
    borderRadius:5,
  },
  SpotsLeftNumber:{
    color:'#db2800',
    fontSize:12,
    fontFamily:'Poppins-Regular'
  },
  TotalSpotsNumber:{
    color:'#a1a1a1',
    fontSize:12,
    fontFamily:'Poppins-Regular'
  },
  ExtraDetailsContainer:{
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#fafafa',
    height:26,
    marginHorizontal:-10,
    marginTop:4
  },
  FirstIconContainer:{
    marginLeft:12,
    marginRight:4
  },
  WinningMoneyContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    marginTop:2.9
  },
  RupeeSymbol:{
    color:'#666666',
    alignSelf:'flex-start',
    fontSize:12
  },
  WinningMoneyText:{
    color:'#666666',
    fontFamily:'Poppins-Medium',
    fontSize:12
  },
  TrophyIconContainer:{
    marginLeft:20,
    marginRight:4,
  },
  DeadlineContestContaioner:{
    flexDirection:'row',
    alignItems:'center',
    position:'absolute',
    right:12,
  },
  DeadlineOverText:{
    color:'#1141c1',
    fontFamily:'Poppins-Medium',
    fontSize:11,
    lineHeight:20
  },
  LiveText:{
    color:'#009e00',
    fontFamily:'Poppins-SemiBold',
    fontSize:12
  },
  RefundedText:{
    color:'#c77700',
    fontFamily:'Poppins-SemiBold',
    fontSize:12
  },
  ForOversText:{
    color:'#666666',
    fontFamily:'Poppins-Medium',
    fontSize:12,
  },
  JoinedWithTextContainer:{
    marginTop:15,
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom:12,
  },
  JoinedWithText:{
    color:'#666666',
    fontFamily:'Poppins-SemiBold',
    fontSize:13
  },  
  IconContainer:{
    flexDirection:'row',
    justifyContent:'flex-end',
    alignItems:'center',
  },
  UpcomingText:{
    color:'#1141c1',
    fontFamily:'Poppins-Bold',
    fontSize:11,
    marginTop:2,
  }, 
  WinningAmount:{
    color:'#009e00',
    fontFamily:'Poppins-Regular',
    fontSize:13
  },
  Points:{
    color:'#696969',
    fontSize:15
  },
  Rank:{
    color:'#121212',
    fontSize:15
  },
  SecondMainCardComponent:{
    backgroundColor:'#f5fdff',
    borderColor:'#ffffff',
    paddingHorizontal:12,
    paddingVertical:8, 
    borderTopWidth:0.5,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    height:55,
    marginHorizontal:-10
  },
  FirstComp:{
    flexDirection:'column',
    justifyContent:'space-between'
  },
  FirstNameSetContainer:{
    flexDirection:'row',
    alignItems:'center'
  },
  Name:{
    color:'#1a1a1a',
    fontFamily:'Poppins-Regular',
    fontSize:13
  },
  SetName:{
    color:'#2e2e2e',
    fontFamily:'Poppins-Medium',
    paddingHorizontal:2.5,
    paddingVertical:0.3,
    backgroundColor:'#f0f0f0',
    borderRadius:3,
    marginLeft:3,
    fontSize:12
  },
})