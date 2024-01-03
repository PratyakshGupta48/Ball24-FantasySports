import {View,Text,StyleSheet,TouchableWithoutFeedback,FlatList,ActivityIndicator} from 'react-native';
import React,{useCallback,useEffect,useState,useRef} from 'react';
import { useRoute } from '@react-navigation/native';
import {width} from '../../../Dimensions';
import firestore from '@react-native-firebase/firestore'; 
import FastImage from 'react-native-fast-image';
import BallViewLive from './BallViewLive';
import {BottomSheetBackdrop,BottomSheetModal,} from '@gorhom/bottom-sheet';

const size = Math.floor((width-34)/45);

export default function LiveLeaderboard() {
  const {MatchId,MatchKey,uid,TeamCode1,TeamCode2,contestStatus} = useRoute().params;
  let BallViewCompleted;
  if (contestStatus === 'C') BallViewCompleted = require('./BallViewCompleted').default;
  const [ballViewData,setBallViewData] = useState(["",[]]);
  const [filledSpots,setFilledSpots] = useState();
  const [mySize,setMySize] = useState(null)
  const [LeaderboardData,setLeaderboardData] = useState([]);
  const [lastItem,setLastItem] = useState();
  const [refresh,setRefresh] = useState(false);

  const sheetRef1 = useRef(null);
  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0}/>)
  const handlePresentModalPress = useCallback(() => {sheetRef1.current?.present();}, []);

  useEffect(() => {
    const unsubscricbe1 = firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).onSnapshot((documentSnapshot) => setFilledSpots(documentSnapshot.data().FilledSpots));
    const myData = [];
    const initialLeaderboardData = [];
    const fetchInitialData = async (lim) => {  
      const querySnapshot = await firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).collection('Participants').orderBy('PointsNumber', 'desc').limit(lim).get();
      let newLastItem = null;
      let isDiff = false;
      for (const documentSnapshot of querySnapshot.docs) {
        const participantData = documentSnapshot.data();
        if (participantData.uid === uid) continue;
        const participantSetDoc = await firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(participantData.uid).get();
        const setNumber = participantData.SetNumber;
        isDiff = true;
        initialLeaderboardData.push({
          key: documentSnapshot.id,
          Profile: participantData.ProfileImage,
          Name: participantData.Name,
          SetName: setNumber,
          Points: participantData.PointsNumber,
          PointsArray: participantData.Points,
          Rank: participantData.Rank,
          WinningMessage: participantData.WinningMessage,
          WinningAmount:participantData.WinningAmount,
          Set: participantSetDoc.data()[setNumber],
        });
        newLastItem = documentSnapshot;
      }
      if(!isDiff) fetchInitialData(lim+2);
      else if (querySnapshot.docs.length > 0)setLastItem(newLastItem);
      else setLastItem(null) 
      setLeaderboardData([...myData, ...initialLeaderboardData]);
    };
    const fetchMyData = async () => {
      const querySnapshot = await firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).collection('Participants').orderBy('PointsNumber', 'desc').where('uid', '==', uid).get();
      const document = await firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(uid).get();
      querySnapshot.forEach((documentSnapshot) => {
        myData.push({
          key: documentSnapshot.id,
          Profile: documentSnapshot.data().ProfileImage,
          Name: documentSnapshot.data().Name,
          SetName: documentSnapshot.data().SetNumber,
          Points: documentSnapshot.data().PointsNumber,
          PointsArray: documentSnapshot.data().Points,
          Rank: documentSnapshot.data().Rank,
          WinningMessage: documentSnapshot.data().WinningMessage,
          WinningAmount:documentSnapshot.data().WinningAmount,
          My: true,
          Set: document.data()[documentSnapshot.data().SetNumber],
        });
      });
      setMySize(querySnapshot.size);
    };
    fetchMyData();
    fetchInitialData(8);
    return () => unsubscricbe1;
  }, [refresh]);
  
  const LeaderboardFinalData =React.memo( async () => {
    if (lastItem) {
      const querySnapshot = await firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).collection('Participants').orderBy('PointsNumber', 'desc').startAfter(lastItem).limit(8).get();
      const finalLeaderboardData = [];
      let newLastItem = null;
      for (const documentSnapshot of querySnapshot.docs) {
        const participantData = documentSnapshot.data();
        if (participantData.uid === uid) continue;
        const participantSetDoc = await firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(participantData.uid).get();
        const setNumber = participantData.SetNumber;
        finalLeaderboardData.push({
          key: documentSnapshot.id,
          Profile: participantData.ProfileImage,
          Name: participantData.Name,
          SetName: setNumber,
          Points: participantData.PointsNumber,
          PointsArray: participantData.Points,
          Rank: participantData.Rank,
          WinningMessage: participantData.WinningMessage,
          WinningAmount:participantData.WinningAmount,
          Set: participantSetDoc.data()[setNumber],
        });
        newLastItem = documentSnapshot;
      }
      if(querySnapshot.docs.length > 0) setLastItem(newLastItem);
      else setLastItem(null)
      setLeaderboardData([...LeaderboardData, ...finalLeaderboardData]);
    }
  });

  const RenderItem = useCallback(({item})=>
    <TouchableWithoutFeedback onPress={()=>{
      const totalRuns = (item.Set).reduce((acc, val) => acc + (isNaN(parseInt(val)) ? 0 : parseInt(val[0])), 0);
      setBallViewData([item.SetName,item.Set,totalRuns,item.Points,item.Rank,item.PointsArray,item.Name]);
      handlePresentModalPress()
    }}>
    <View style={item.My?[styles.LeaderBoardItemContainer,{backgroundColor:'#e3f4fa'}]:styles.LeaderBoardItemContainer}>
      <View style={styles.ProfileNameSetContainer}>
        <FastImage source={{uri:item.Profile}} style={styles.ProfileImageStyle}/>
        <View style={styles.NameSetPlusMessageContainer}>
          <View style={styles.NameSetContainer}>           
            <Text style={styles.LeaderBoardItemName}>{item.Name}</Text>
            <Text style={styles.setName}>{item.SetName}</Text>
          </View>
          {contestStatus=='L' && item.WinningMessage==='In Winning Zone' && <Text style={styles.WinningMessageText}>{item.WinningMessage}</Text>}
          {contestStatus=='C' && item.WinningAmount && <Text style={styles.WinningMessageText}>Won Rs {item.WinningAmount}</Text>}
        </View>
      </View>
      <View style={styles.PointRankTextContainer}>
        <Text style={styles.PointsText}>{item.Points}</Text>
        <View style={styles.HashRankContainer}>
          <Text style={styles.PointsText}>#</Text>
          <Text style={styles.RankText}>{item.Rank}</Text>
        </View>
      </View>
    </View>
    </TouchableWithoutFeedback>
  ,[]);
  const ListHeaderComponent = useCallback(()=><>
    <View style={styles.AllSetsContainer}>
      <Text style={styles.TotalSetsText}>{'Total Sets ('+filledSpots+')'}</Text>
      <View style={{flexDirection:'row',justifyContent:'space-between',width:width}}>
        {mySize!=null && mySize!=0 && <Text style={styles.TotalSetsText}>{'You have joined with '+mySize+' sets'}</Text>}
        <View style={styles.PointsRanksContainer}>
          <Text style={styles.TotalSetsText}>Points</Text>
          <Text style={styles.TotalSetsText}>Rank</Text>
        </View>
      </View>
    </View>
    <View style={styles.Line}></View>
    </>,[]
  );
  const ListFooterComponent = useCallback(()=> <ActivityIndicator color="#969696" size="small" animating={true} />,[]);

  return (<>
    <FlatList
      style={{backgroundColor:'#ffffff',flex:1}}
      data={LeaderboardData}
      onEndReachedThreshold={1}
      onEndReached={lastItem && LeaderboardFinalData}
      renderItem={RenderItem}
      ListHeaderComponent={filledSpots>0 && ListHeaderComponent}
      ListFooterComponent={lastItem && ListFooterComponent}
      initialNumToRender={10}
      removeClippedSubviews={true}
      refreshing={false}
      onRefresh={()=>{setRefresh(!refresh)}}
      maxToRenderPerBatch={9}
    />
    <BottomSheetModal
      ref={sheetRef1}
      index={1}
      snapPoints={['25%','50%']}
      backdropComponent={renderBackdrop}
      handleStyle={{position:'absolute',alignSelf:'center'}}
      handleIndicatorStyle={{backgroundColor:'#ffffff'}}
      backgroundStyle={{borderTopLeftRadius:13,borderTopRightRadius:13}}>
        {contestStatus==='L' && ballViewData[0] && <BallViewLive status={'Live'} Points={ballViewData[3]} PointsArray={ballViewData[5]} name={ballViewData[6]} userSetName={ballViewData[0]} userset={ballViewData[1]} lockStatus={true} TeamCode1={TeamCode1} TeamCode2={TeamCode2} totalRuns={ballViewData[2]} navigation={()=>{null}}/>}
        {contestStatus==='C'&&ballViewData[0] && <BallViewCompleted Points={ballViewData[3]} Rank={ballViewData[4]} PointsArray={ballViewData[5]} name={ballViewData[6]} userSetName={ballViewData[0]} userSet={ballViewData[1].flatMap(Object.values)} TeamCode1={TeamCode1} TeamCode2={TeamCode2} totalRuns={ballViewData[2]}/>}
    </BottomSheetModal>
  </>)
}

const styles = StyleSheet.create({
  PointsRanksContainer:{
    flexDirection:'row',
    width:'30%',
    justifyContent:'space-between',
    marginRight:20,
  },
  AllSetsContainer:{
    paddingHorizontal:12,
    paddingBottom:3,
    backgroundColor:'#ffffff',
    paddingTop:10,
    width:'60%',
  },
  TotalSetsText:{
    color:'#969696',
    fontFamily:'Poppins-Regular',
    fontSize:12
  },
  ProfileNameSetContainer:{
    width:'64%',
    flexDirection:'row',
    alignItems:'center',
  },
  NameSetPlusMessageContainer:{
    flexDirection:'column',
    justifyContent:'space-between',
    alignItems:'flex-start',
  },
  NameSetContainer:{
    flexDirection:'row',
    alignItems:'center',
  },
  WinningMessageText:{
    color:"#008006",
    fontFamily:'Poppins-Regular',
    fontSize:12,
    paddingLeft:20
  },
  PointRankTextContainer:{
    width:'30%',
    flexDirection:'row',
    justifyContent:'space-between',
    paddingRight:20
  },
  PointsText:{
    color:'#a6a6a6',
    fontSize:14,
    fontFamily:'Poppins-Regular',
  },
  HashRankContainer:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
  },
  RankText:{
    color:'#3d3d3d',
    fontSize:14,
    fontFamily:'Poppins-Medium',
  },
  LeaderBoardItemContainer:{
    height:60,
    borderBottomWidth:0.8,
    borderBottomColor:'#dbdbdb',
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#fafbfc',
    justifyContent:'space-between'
  },
  ProfileImageStyle:{
    height:43,
    width:43,
    borderRadius:50,
    marginLeft:12,
    borderColor:'#dbdbdb',
    borderWidth:0.8
  },
  LeaderBoardItemName:{
    color:'#383838',
    fontFamily:'Poppins-Regular',
    fontSize:13,
    paddingLeft:20
  },
  setName:{
    color:'#171717',
    fontFamily:'Poppins-Light',
    fontSize:12.5,
    marginLeft:10,
    backgroundColor:'#f5f5f5',
    paddingHorizontal:4,
    borderRadius:2
  },
  Line:{
    backgroundColor:'#dbdbdb',
    height:0.4,
    position:'relative',
    left:-12,
    right:-12,
    width:width+50
  },
});