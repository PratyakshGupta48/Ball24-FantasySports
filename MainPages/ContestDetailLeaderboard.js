import {View,Text,StyleSheet,TouchableWithoutFeedback,FlatList,ActivityIndicator} from 'react-native';
import React,{useEffect,useState,useCallback} from 'react';
import { useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; 
import { width } from '../Dimensions';
import FastImage from 'react-native-fast-image';
import Modal from "react-native-modal";
import BallViewLive from './MainTabPages/MyContests/BallViewLive';
import Toast from 'react-native-toast-message';

export default function ContestDetailLeaderboard() {

  const {MatchId,MatchKey,uid,TeamCode1,TeamCode2} = useRoute().params;
  const [isModalVisible,setIsModalVisible] = useState(false);
  const [userSetName,setUserSetName] = useState();
  const [userSet,setUserSet] = useState([]);
  const [totalRuns,setTotalRuns] = useState();
  const [Name,setName] = useState();
  const [lastItem,setLastItem] = useState('');
  const [LeaderboardData,setLeaderboardData] = useState();
  const [refresh,setRefresh] = useState(false);
  const [mySize,setMySize] = useState(null)
  const [filledSpots,setFilledSpots] = useState();
  const showToast = (type,text1,text2) => Toast.show({type: type,text1: text1,visibilityTime:2500,position:'top',topOffset:20,text2: text2});

  useEffect(()=>{
    const unsubscricbe1 = firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).get().then(documentSnapshot=>setFilledSpots(documentSnapshot.data().FilledSpots))
    let initialData;
    const fetchInitialData = async () => {
      const querySnapshot = await firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).collection('Participants').where('uid','!=',uid).orderBy('uid').limit(8).get();
      const documents = querySnapshot.docs;
      const initialLeaderboardData = new Array(documents.length);
      let lastIndex;
      for (let i = 0; i < documents.length; i++) {
        const documentSnapshot = documents[i];
        initialLeaderboardData[i] = {
          key: documentSnapshot.id,
          Profile: documentSnapshot.data().ProfileImage,
          Name: documentSnapshot.data().Name,
          SetName: documentSnapshot.data().SetNumber,
        };
        lastIndex = i;
      }
      initialData = initialLeaderboardData;
      if(lastIndex)setLastItem(documents[lastIndex]);
    }
    fetchInitialData();

    const fetchMyData = async () => {
      const querySnapshot = await firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).collection('Participants').where('uid', '==', uid).get();
      const document = await firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(uid).get(); 
      const myData = [];
      querySnapshot.forEach(documentSnapshot => {
        myData.push({
          key: documentSnapshot.id + Date(),
          Profile: documentSnapshot.data().ProfileImage,
          Name: documentSnapshot.data().Name,
          SetName: documentSnapshot.data().SetNumber,
          My: true,
          Set: document.data()[documentSnapshot.data().SetNumber],
        });
      });
      setLeaderboardData([...myData, ...initialData]);
      setMySize(querySnapshot.size);
    };
    fetchMyData();
    return () => unsubscricbe1;
  },[refresh])

  const LeaderboardFinalData = async () => {
    if(lastItem){
      const FinalLeaderboardData = [];
      const querySnapshot = await firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).collection('Participants').where('uid', '!=', uid).orderBy('uid').limit(8).startAfter(lastItem).get()
      querySnapshot.forEach(documentSnapshot=>{
        FinalLeaderboardData.push({
          key:documentSnapshot.id,
          Profile:documentSnapshot.data().ProfileImage,
          Name:documentSnapshot.data().Name,
          SetName:documentSnapshot.data().SetNumber
        })
      })
      setLastItem(querySnapshot.docs[querySnapshot.docs.length-1])
      setLeaderboardData([...LeaderboardData,...FinalLeaderboardData])
    } 
  }
  
  const RenderItem = useCallback(({item})=>
    <TouchableWithoutFeedback onPress={()=>{
      if(item.My){
        const totalRuns = (item.Set).reduce((acc, val) => acc + (isNaN(parseInt(val)) ? 0 : parseInt(val[0])), 0)
        setUserSetName(item.SetName)
        setUserSet(item.Set)
        setTotalRuns(totalRuns)
        setName(item.Name)
        setIsModalVisible(true)
      }
      else showToast('info', 'Contest Not Live Yet', 'You can view other participants\' sets when the contest is live.');
    }}>
    <View style={item.My?[styles.LeaderBoardItemContainer,{backgroundColor:'#e3f4fa'}]:styles.LeaderBoardItemContainer}>
      <FastImage source={{uri:item.Profile}} style={styles.ProfileImageStyle}/>
      <Text style={styles.LeaderBoardItemName}>{item.Name}</Text>
      <Text style={styles.setName}>{item.SetName}</Text>
    </View>
    </TouchableWithoutFeedback>
  ,[])
  const ListHeaderComponent = useCallback(()=><>
    <View style={styles.AllSetsContainer}>
      <Text style={styles.TotalSetsText}>{'Total Sets ('+filledSpots+')'}</Text>
      {mySize!=null && mySize!=0 && <Text style={styles.TotalSetsText}>{'You have joined with '+mySize+' sets'}</Text>}
    </View>
    <View style={styles.Line}></View>
    </>
  )
  const ListFooterComponent = useCallback(()=> <ActivityIndicator color="#969696" size="small" animating={true} />)
  const ListEmptyComponent = useCallback(()=><View style={{flex:1,backgroundColor:'#ffffff'}}><Text style={{fontFamily:'Poppins-Medium',color:'#969696',fontSize:15,textAlign:'center',marginTop:30}}>No other sets have joined the contest</Text></View>,[])

  return (<>
    <FlatList
      style={{backgroundColor:'#ffffff',flex:1}}
      data={LeaderboardData}
      onEndReachedThreshold={1}
      onEndReached={lastItem && LeaderboardFinalData}
      renderItem={RenderItem}
      ListHeaderComponent={filledSpots>0 && ListHeaderComponent}
      ListFooterComponent={lastItem && ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      initialNumToRender={10}
      removeClippedSubviews={true}
      refreshing={false}
      onRefresh={()=>{setRefresh(!refresh)}}
      maxToRenderPerBatch={9}
    />
    <Modal isVisible={isModalVisible} animationIn={'slideInUp'} animationInTiming={300} animationOut={'slideOutDown'} animationOutTiming={300} backdropOpacity={0.5} onBackdropPress={()=>{setIsModalVisible(false)}} hideModalContentWhileAnimating={true} style={{justifyContent: 'flex-end',margin: 0,}}>
      {/* BallViewLive because of flatlist issues */}
      <BallViewLive status={'upcoming'} Points={null} PointsArray={null} name={Name} userSetName={userSetName} userset={userSet} lockStatus={true} TeamCode1={TeamCode1} TeamCode2={TeamCode2} totalRuns={totalRuns} navigation={()=>{null}}/>
    </Modal>
    <Toast/>
    </>
  )
}

const styles = StyleSheet.create({
  AllSetsContainer:{
    paddingHorizontal:12,
    paddingBottom:3,
    backgroundColor:'#ffffff',
    paddingTop:10
  },
  TotalSetsText:{
    color:'#969696',
    fontFamily:'Poppins-Regular',
    fontSize:12
  },
  LeaderBoardItemContainer:{
    height:60,
    borderBottomWidth:0.8,
    borderBottomColor:'#dbdbdb',
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#fafbfc'
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
})