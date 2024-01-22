import { StyleSheet, Text, View, FlatList, TouchableWithoutFeedback,LayoutAnimation, UIManager, Platform, Image} from 'react-native'
import React,{useEffect,useState,useCallback,useRef} from 'react';
import {useRoute} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import { height,width } from '../../../Dimensions';
import BottomSheet , {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import SkeletonContent, { SkeletonOneLiner} from '../../../SkeletonPlaceholder';
import BallViewCompleted from './BallViewCompleted';
import HeaderBlank from '../../../Headers/HeaderBlank';
import FastImage from 'react-native-fast-image';

const size = Math.floor((width-34)/45);
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

export default function MyContestsMatchDisplayOnClickCompletedPage({navigation}) {

  const {TeamCode1,TeamCode2,Team1,Team2,MatchId,I1,I2,MatchLink} = useRoute().params;
  const uid = auth().currentUser.uid;
  const Name = auth().currentUser.displayName;
  const [TotalWinnings,setTotalWinnings] = useState(null);
  const [TotalWinningContests,setTotaWinningsContests] = useState(null);
  const [loadingSpinner,setLoadingSpinner] = useState(true);
  const [ContestData,setContestData] = useState([])
  const [refresh,setRefresh] = useState(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [ballViewData,setBallViewData] = useState(["",[]]);
  const [scoreData,setScoreData] = useState(null);
  const sheetRef1 = useRef(null);

  const openBottomSheet1 = useCallback((index) => {if(sheetRef1.current) sheetRef1.current.snapToIndex(index);},[]);
  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0}/>)
  useEffect(() => {if (scoreData||selectedItemIndex) LayoutAnimation.configureNext(customLayoutAnimation);}, [scoreData,selectedItemIndex]);
  useEffect(()=>{ 
    const fetchData = async () => {
      setLoadingSpinner(true);
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
      let totalWinningAmount = 0;
      let num = 0;
      const promises = contestsSnapshot.docs.map(async (documentSnapshot) => {
        const query = await firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(documentSnapshot.id).collection('Participants').where('uid', '==', uid).get();
        query.forEach((documentSnapshot) => {
          if (documentSnapshot.data().WinningAmount) {
            totalWinningAmount += documentSnapshot.data().WinningAmount;
            num += 1;
          }
        });
      });
      await Promise.all(promises);
      setTotalWinnings(totalWinningAmount);
      setTotaWinningsContests(num);
    };
    fetchData()
  },[refresh]);
  useEffect(()=>{
    if (MatchLink!=undefined) {
      async function fetchScore() {
        try {
          const response = await fetch('https://get-cricket-score.vercel.app/score?url=' + MatchLink);
          const data = await response.json();
          setScoreData(data);
        } catch (e) {
          // fetchScore();
        }
      }
      fetchScore();
    }
  },[refresh])

  const RenderExtendedList = useCallback(({MatchKey}) => {
    const [ContestSetsData,setContestSetsData] = useState([]);
    const [loading,setLoading] = useState(true);
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
          SetDetails.push({
            SetName: documentSnapshot.data().SetNumber,
            Set: userSetsData[name] ? userSetsData[name].flatMap(Object.values) : [],
            id: documentSnapshot.id,
            Points: documentSnapshot.data().PointsNumber,
            PointsArray: documentSnapshot.data().Points,
            Rank: documentSnapshot.data().Rank,
            WinningAmount: documentSnapshot.data().WinningAmount
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
        setBallViewData([item.SetName,item.Set,totalRuns,item.Points,item.Rank,item.PointsArray])
        openBottomSheet1(0);
      };
      return (
        <TouchableWithoutFeedback onPress={navigateToBallView} key={item.SetName}>
        <View style={styles.SecondMainCardComponent}>
          <View style={styles.FirstComp}>
            <View style={styles.FirstNameSetContainer}>
              <Text style={styles.Name}>{Name}</Text>
              <Text style={styles.SetName}>{item.SetName}</Text>
            </View>
            {item.WinningAmount!=undefined && (<Text style={styles.WinningAmount}>{`You won Rs ${item.WinningAmount}`}</Text>)} 
          </View>
          <Text style={styles.Points}>{item.Points}</Text>
          <Text style={styles.Rank}>{item.Rank?'#'+item.Rank:'—'}</Text>
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

  const listHeaderComponent = useCallback(()=>
    TotalWinningContests>=1 && <View style={styles.TotalWinningsContainer}>
      <Text style={styles.TotalWinningsCongoText}>You've won in {TotalWinningContests>1?(TotalWinningContests+' contests 🎉.'):TotalWinningContests+' contest 🎉.'} </Text>
      <View style={styles.ImageMoneyContainer}>
        <Image source={require('../../../accessories/DreamBallLogos/logoblue.png')} style={styles.Logo} ></Image>
        <Text style={styles.TotalWinningsText}>{' ₹'+TotalWinnings}</Text>
      </View>
    </View>
  ,[TotalWinningContests])

  const RenderItem = ({item,index}) => {
    const isItemSelected = selectedItemIndex === index; 
    const navigationLeaderboard = () => navigation.navigate('ContestDetailNavigation',{Team1:Team1,Team2:Team2,MatchId:MatchId,Overs:item.Overs,ContestType:item.Type,PrizePool:item.PrizePool,Entry:item.Entry,uid:uid,TeamCode1:TeamCode1,TeamCode2:TeamCode2,MatchKey:item.DocumentId,MaximumSpots:item.MaximumSpots,FirstPosition:item.FirstPosition,WinnersPercentage:item.WinnersPercentage,Winnings:item.Winning,I1:I1,I2:I2,MatchLink:MatchLink,Free:item.Free,initialScreen:'ContestDetails',Inning:item.Inning})
    return(
      <View style={styles.Card}>
        <TouchableWithoutFeedback onPress={navigationLeaderboard} style={{backgroundColor:'transparent'}}><View>
          <View style={[styles.PrizeEntryMoneyContainer,{marginTop:5}]} >
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
            <View style={styles.TrophyIconContainer}>
              <Icon name='gamepad-variant-outline' size={15} color='#666666'/>
            </View>
            <View style={styles.WinningMoneyContainer}>
              <Text style={styles.ForOversText}>Over-{item.Overs}</Text>
            </View>
            <View style={styles.DeadlineContestContaioner}>{item.Refunded && <Text style={styles.RefundedText}>• Refunded</Text>}</View>
          </View></View>
        </TouchableWithoutFeedback>
        <View style={styles.JoinedWithTextContainer}>
          <Text style={styles.JoinedWithText}>{'Joined with '+item.Count+' set'}</Text>
          <Icon name={isItemSelected?'chevron-up':'chevron-down'} size={23} color='#666666' onPress={()=>{setSelectedItemIndex(isItemSelected ? -1 : index)}}/>
        </View>
        {isItemSelected && item.Refunded !== true && <RenderExtendedList MatchKey={item.DocumentId}/>}
      </View>
    )
  }

  return (<>
  <HeaderBlank Heading={TeamCode1 +' vs '+TeamCode2} navigation={()=>{navigation.goBack()}} color='#1a1a1a'/>
  {scoreData!=null && <View style={{backgroundColor:'#1a1a1a',flexDirection:'column',justifyContent:'center',paddingHorizontal:13,paddingBottom:5}}>
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
      <Text style={styles.LSStatusText}>{'Completed'}</Text>
    </View>
    <Text style={styles.LSConclusionText}>{scoreData.Status}</Text>
  </View>}
    
  {loadingSpinner?<View style={{flex:1,backgroundColor:'#ffffff',paddingTop:12}}><SkeletonContent/></View>:(<>
    <FlatList
      style={{flex:1,backgroundColor:'#ffffff',marginBottom:5}}
      nestedScrollEnabled={true}
      data={ContestData}
      refreshing={false}
      onRefresh={()=>setRefresh(!refresh)}
      renderItem={RenderItem}
      initialNumToRender={7}
      getItemLayout={(data,index) => ({length: 200, offset: 200* index, index})}
      ListHeaderComponent={listHeaderComponent}
      maxToRenderPerBatch={5}
    />
    <BottomSheet
      ref={sheetRef1}
      snapPoints={[(ballViewData[1].length>size?(50000/height+'%'):(47500/height+'%'))]}
      index={-1}
      enablePanDownToClose={true}
      enableOverDrag={true}
      backdropComponent={renderBackdrop}
      handleStyle={{position:'absolute',alignSelf:'center'}}
      handleIndicatorStyle={{backgroundColor:'#ffffff'}}
      backgroundStyle={{borderTopLeftRadius:13,borderTopRightRadius:13}}>
        {ballViewData[0] && <BallViewCompleted Points={ballViewData[3]} Rank={ballViewData[4]} PointsArray={ballViewData[5]} name={Name} userSetName={ballViewData[0]} userSet={ballViewData[1]} TeamCode1={TeamCode1} TeamCode2={TeamCode2} totalRuns={ballViewData[2]}/>}
    </BottomSheet>
  </>)}
  </>)      
}

const styles = StyleSheet.create({
  TotalWinningsContainer:{
    flexDirection:'column',
    marginHorizontal:15,
    paddingTop:10
  },
  TotalWinningsCongoText:{
    color:'#007d00',
    fontFamily:'Poppins-Medium',
    fontSize:13,
  },
  TotalWinningsText:{
    color:'#121212',
    fontSize:22,
    fontWeight:'500',
    paddingTop:3,
    paddingLeft:5
  },
  ImageMoneyContainer:{
    flexDirection:'row',
    alignItems:'center',
    marginTop:5
  },
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
  Logo:{
    width:60,
    height:40
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
})