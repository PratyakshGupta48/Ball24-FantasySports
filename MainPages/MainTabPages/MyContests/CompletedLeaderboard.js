import {View,Text,StyleSheet,TouchableWithoutFeedback,FlatList,ActivityIndicator} from 'react-native';
import React,{useCallback, useEffect,useState} from 'react';
import {useRoute} from '@react-navigation/native';
import {width} from '../../../Dimensions';
import firestore from '@react-native-firebase/firestore'; 
import FastImage from 'react-native-fast-image';

export default function CompletedLeaderboard({navigation}) {
    
  const route = useRoute();
  const MatchId = route.params.MatchId;
  const MatchKey = route.params.MatchKey;
  const contestName = route.params.contestName;
  const FilledSpots = route.params.FilledSpots;
  const uid = route.params.uid;
  const Overs = route.params.Overs;
  
  const ListHeaderComponent = useCallback(()=>(
    <>
    <View style={styles.SetsPointsRankContainer} elevation={2}>
        <View style={styles.AllSetsContainer}>
            <Text style={styles.TotalSetsText}>{'Total Sets ('+FilledSpots+')'}</Text>
        </View>
        <View style={styles.PointsRanksContainer}>
            <Text style={styles.TotalSetsText}>Points</Text>
            <Text style={styles.TotalSetsText}>Rank</Text>
        </View>
    </View>
    <View style={styles.Line}></View></>
),[]);

const ListFooterComponent = useCallback(()=>(
    <ActivityIndicator 
    color="#969696"
    size="small"
    animating={true}
    />
),[]);

const RenderItem = useCallback(({item})=>(
    <TouchableWithoutFeedback onPress={()=>{
        navigation.navigate('BallViewCompleted', { Set: item.Set, Name: item.Name, Team: item.SetName, Overs: [1, 4], MatchId:MatchId, MatchKey:MatchKey, TimeId:item.TimeId})
    }}>
    <View style={item.My?styles.LeaderBoardItemContainerFinal:styles.LeaderBoardItemContainer}>
        <View style={styles.ProfileNameSetContainer}>
           <FastImage source={{uri:item.Profile}} style={styles.ProfileImageStyle}/>
           <View style={styles.NameSetPlusMessageContainer}>
             <View style={styles.NameSetContainer}>           
               <Text style={styles.LeaderBoardItemName}>{item.Name}</Text>
               <Text style={styles.setName}>{item.SetName}</Text>
             </View>
             {item.WinningAmount && <Text style={styles.WinningMessageText}>You won Rs {item.WinningAmount}</Text>}
           </View>
        </View>
        <View style={styles.PointRankTextContainer}>
          <Text style={styles.PointsText}>{item.Points}</Text>
          <View style={styles.HashRankContainer}>
            <Text style={styles.HashText}>#</Text>
            <Text style={styles.RankText}>{item.Rank}</Text>
          </View>
        </View>
    </View>
    </TouchableWithoutFeedback>
),[])

  const [LeaderboardData,setLeaderboardData] = useState([]);
  const [lastItem,setLastItem] = useState();
  const [refresh,setRefresh] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const InitialLeaderboardData = [];
      const MySetsData = [];  
      const [initialDataSnapshot, myDataSnapshot] = await Promise.all([
        firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).collection('Participants').orderBy('PointsNumber', 'desc').limit(7).get(),
        firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).collection('Participants').orderBy('PointsNumber', 'desc').where('uid', '==', uid).get()
      ]);
      const document = await firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(uid).get();
      initialDataSnapshot.forEach(documentSnapshot => {
        InitialLeaderboardData.push({
          key: documentSnapshot.id,
          TimeId: documentSnapshot.id,
          Profile: documentSnapshot.data().ProfileImage,
          Name: documentSnapshot.data().Name,
          SetName: documentSnapshot.data().SetNumber,
          Points: documentSnapshot.data().PointsNumber,
          Rank: documentSnapshot.data().Rank,
          WinningAmount:documentSnapshot.data().WinningAmount,
          Set: document.data()[documentSnapshot.data().SetNumber]
        });
      });  
      myDataSnapshot.forEach(documentSnapshot => {
        MySetsData.push({
          key: documentSnapshot.id + Date(),
          TimeId: documentSnapshot.id,
          Profile: documentSnapshot.data().ProfileImage,
          Name: documentSnapshot.data().Name,
          SetName: documentSnapshot.data().SetNumber,
          Points: documentSnapshot.data().PointsNumber,
          Rank: documentSnapshot.data().Rank,
          WinningAmount:documentSnapshot.data().WinningAmount,
          My: 'My',
          Set: document.data()[documentSnapshot.data().SetNumber]
        });
      });
      setLastItem(initialDataSnapshot.docs[initialDataSnapshot.docs.length - 1]);
      setLeaderboardData([...MySetsData, ...InitialLeaderboardData]);
    };
    fetchData();
  }, [refresh]);
  
const LeaderboardFinalData = () => {
    firestore().collection('AllMatches').doc(MatchId).collection(contestName).doc(MatchKey).collection('Participants').orderBy('PointsNumber','desc').limit(7).startAfter(lastItem).get().then(async QuerySnapshot=>{
        const document = await firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(uid).get();
        const FinalLeaderboardData = [];
        QuerySnapshot.forEach(documentSnapshot=>{
            FinalLeaderboardData.push({
                key: documentSnapshot.id,
                TimeId: documentSnapshot.id,
                Profile: documentSnapshot.data().ProfileImage,
                Name: documentSnapshot.data().Name,
                SetName: documentSnapshot.data().SetNumber,
                Points: documentSnapshot.data().PointsNumber,
                Rank: documentSnapshot.data().Rank,
                WinningAmount:documentSnapshot.data().WinningAmount,
                Set: document.data()[documentSnapshot.data().SetNumber]
            })
        })
        setLastItem(QuerySnapshot.docs[QuerySnapshot.docs.length-1])
        setLeaderboardData([...LeaderboardData,...FinalLeaderboardData])
    })
  }

  return (
    <FlatList
      style={{backgroundColor:'#ffffff',flex:1}}
      data={LeaderboardData}
      onEndReachedThreshold={1}
      onEndReached={lastItem!=undefined && LeaderboardFinalData}
      renderItem={RenderItem}
      stickyHeaderIndices={[0]}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={lastItem!=undefined && ListFooterComponent}
      initialNumToRender={7}
      removeClippedSubviews={true}
      refreshing={false}
      onRefresh={()=>{setRefresh(!refresh)}}
      maxToRenderPerBatch={6}
    />
  )
}

const styles = StyleSheet.create({
    SetsPointsRankContainer:{
        flexDirection:'row',
        backgroundColor:'#ffffff',
        justifyContent:'space-between',
        paddingRight:'5%'
    },
    PointsRanksContainer:{
        flexDirection:'row',
        width:'30%',
        justifyContent:'space-between',
        paddingTop:10
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
    LeaderBoardItemContainer:{
        height:64,//67
        borderBottomWidth:0.8,
        borderBottomColor:'#dbdbdb',
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'#fafbfc',
        flexDirection:'row',
        justifyContent:'space-between',
        paddingRight:'5%',
    },
    LeaderBoardItemContainerFinal:{
        height:64,//67
        borderBottomWidth:0.8,
        borderBottomColor:'#dbdbdb',
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'#e3f4fa',
        flexDirection:'row',
        justifyContent:'space-between',
        paddingRight:'5%',
    },
    ProfileNameSetContainer:{
        width:'64%',
        flexDirection:'row',
        alignItems:'center',
    },
    ProfileImageStyle:{
        height:43,
        width:43,
        borderRadius:50,
        marginLeft:12,
        borderWidth:0.8,
        borderColor:'#dbdbdb',
    },
    LeaderBoardItemName:{
        color:'#383838',
        fontFamily:'Poppins-Regular',
        fontSize:14,
        paddingLeft:15
    },
    NameSetPlusMessageContainer:{
        flexDirection:'column',
        justifyContent:'space-between',
        alignItems:'flex-start',
        height:46,
    },
    NameSetContainer:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        width:(0.64*width)-55
    },
    WinningMessageText:{
        color:"#008006",
        fontFamily:'Poppins-Regular',
        fontSize:13,
        paddingLeft:15
    },
    setName:{
        color:'#383838',
        fontFamily:'Poppins-Light',
        fontSize:11,
        backgroundColor:'#f5f5f5',
        borderRadius:2,
        marginRight:20
    },
    PointRankTextContainer:{
        width:'30%',
        flexDirection:'row',
        justifyContent:'space-between',
    },
    PointsText:{
        color:'#a6a6a6',
        fontSize:14,
        fontFamily:'Poppins-Regular',
        paddingLeft:9
    },
    HashRankContainer:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },
    HashText:{
        color:'#a6a6a6',
        fontFamily:'Poppins-Regular'
    },
    RankText:{
        color:'#3d3d3d',
        fontSize:14,
        fontFamily:'Poppins-Medium',
        paddingRight:9
    },
    Line:{
        backgroundColor:'#dbdbdb',
        height:0.4,
        position:'relative',
        left:-12,
        right:-12,
        width:width+50
    },
})
