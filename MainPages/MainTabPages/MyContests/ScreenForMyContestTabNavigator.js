import { StyleSheet, Text, View ,FlatList,Image,TouchableNativeFeedback} from 'react-native'
import React,{useEffect,useState, useCallback} from 'react'
import {height,width} from '../../../Dimensions';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; 
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import { SkeletonContentOne } from '../../../SkeletonPlaceholder';
import {useRoute} from '@react-navigation/native';

export default function ScreenForMyContestTabNavigator({navigation}) {

  const {mode,status,emptyLine} = useRoute().params;
  const uid = auth().currentUser.uid
  const [refresh,setRefresh] = useState(false);
  const [List,setList] = useState();
  const [loadingSpinner,setLoadingSpinner] = useState(false);
  const [MatchId,setMatchId] = useState([])
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const GetTime = useCallback(({matchEndTime})=>{
    const date = new Date(matchEndTime);
    const hour = date.getHours();
    const min = date.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHours = hour % 12 === 0 ? 12 : hour % 12;
    const formattedMinutes = String(min).padStart(2, '0');
    return <Text style={styles.TimeLabelBelowStyle}>{formattedHours+':'+formattedMinutes+ampm}</Text>  
  },[])
      
  const TimeLeftComponent = useCallback(({milliseconds})=>{
    const now = new Date();
    const futureDate = new Date(milliseconds);
    const [DateComparasion, setDateComparasion] = useState(Math.floor((milliseconds-now.getTime())/(1000*60*60*24)));
    const [ctr,setCtr] = useState(0);
    useEffect(() => {
      const now = new Date();
      const intervalId = setInterval(() => {
        setDateComparasion(Math.floor((milliseconds-now.getTime())/(1000*60*60*24)));
        setCtr(ctr+1)
      }, 1000);
      return () => clearInterval(intervalId);
    }, [ctr]);
    if(DateComparasion>1){
      const futureMonth = monthNames[futureDate.getMonth()];
      const futureDay = futureDate.getDate();
      return <Text style={styles.timeLabelStyleTomorrow}>{`${futureDay} ${futureMonth}`}</Text>;
    }
    else if(DateComparasion==1)
      return <Text style={styles.timeLabelStyleTomorrow}>Tomorrow</Text>;
    else if(DateComparasion==0){
      const timeDiff = milliseconds - Date.now();
      const minutes = Math.floor((timeDiff / 1000) / 60);
      const hours = Math.floor(minutes / 60);
      if(timeDiff <= 600000)
        return <Text style={styles.timeLabelStyle}>{`${Math.floor(timeDiff / 60000)}m ${Math.floor((timeDiff / 1000) % 60)}s`}</Text>;
      else if(timeDiff > 43200000)
        return <Text style={styles.timeLabelStyleToday}>Today</Text>;
      else if(timeDiff <= 43200000)
        return <Text style={styles.timeLabelStyle}>{`${hours}h ${Math.floor((minutes % 60))}m`}</Text>;
    }
  },[])
  
  const RenderItem = useCallback(({item})=>(
    <TouchableNativeFeedback onPress={()=>{
      if(mode!='C')navigation.navigate('ContestSelection',{Team1:item.Team1,Team2:item.Team2,TeamCode1:item.TeamCode1,TeamCode2:item.TeamCode2,MatchId:item.MatchId,uid:uid,I1:item.Image1,I2:item.Image2,MatchLink:item.MatchLink,initialRouteName:'MyContests'})
      else if(mode=='C')navigation.navigate('MyMatchCompleted',{Team1:item.Team1,Team2:item.Team2,TeamCode1:item.TeamCode1,TeamCode2:item.TeamCode2,MatchId:item.MatchId,uid:uid,I1:item.Image1,I2:item.Image2,MatchLink:item.MatchLink,LeagueName:item.LeagueName})
    }}>
      <View style={styles.MainCardContainer} elevation={2}>
        <View style={styles.LeagueNameContainer}>
          <LinearGradient colors={['#edf5ff','#ffffff']} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 0 }} style={{borderTopLeftRadius:12,overflow:'hidden'}}>
            <Text style={styles.LeagueName}>{item.LeagueName}</Text>
          </LinearGradient>
          <View style={styles.Seperator}></View>
        </View>
        <View style={styles.TeamNameContainer}>
          <Text style={styles.TeamOne}>{item.Team1}</Text>
          <Text style={styles.TeamOne}>{item.Team2}</Text>
        </View>
        <View style={styles.TeamLogoContainer}>
          <View style={[styles.TeamLogoOneContainer,{marginLeft:10,}]}>
            <FastImage source={{uri:item.Image1,priority: FastImage.priority.high}} style={styles.TeamLogoOne}/>
            <FastImage source={{uri:item.Image1,priority: FastImage.priority.high}} style={[styles.TeamLogoOneShadow,{right:48}]}/>
            <Text style={styles.TeamOneCode}>{item.TeamCode1}</Text>
          </View>
          {mode=='U' && <View style={styles.CountdownContainer}>
            <TimeLeftComponent milliseconds={(item.MatchTime).toMillis()} MatchId={item.MatchId}/>
            <GetTime matchEndTime = {(item.MatchTime).toMillis()}/>
          </View>}
          {mode=='L' && <Text style={styles.LiveText}>• Live</Text>}
          {mode=='C' && <Text style={[styles.LiveText,{color:'#c77700',backgroundColor:'#fff4eb'}]}>• Completed</Text>}
          <View style={[styles.TeamLogoOneContainer,{marginRight:10,}]}>
            <Text style={styles.TeamOneCode}>{item.TeamCode2}</Text>
            <FastImage source={{uri:item.Image2,priority: FastImage.priority.high}} style={[styles.TeamLogoOneShadow,{left:48}]}/>
            <FastImage source={{uri:item.Image2,priority: FastImage.priority.high}} style={styles.TeamLogoOne}/>
          </View>
        </View>
        <View style={styles.Seperator2}></View>
        <View style={styles.ExtraDetailsContainer}>
          <LinearGradient colors={['#ffeee3','#ffffff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{borderTopLeftRadius:9,borderBottomLeftRadius:9,overflow:'hidden',flexDirection:'row',alignItems:'center'}}>
            <Text style={styles.MegaText}>{item.contests}{item.contests>1?' Contests':' Contest'}</Text>
          </LinearGradient>
        </View>
      </View>   
    </TouchableNativeFeedback>
  ),[]);
  
  const EmptyComponent = useCallback(()=>(<>
    <Image source={require('../../../accessories/DreamBallLogos/MyContestT.png')} style={styles.NoContestImage} />    
    <Text style={styles.NoContestText}>{emptyLine}</Text>
  </>),[]);

  useEffect(()=>{
    const MatchIds = []
    firestore().collection('users').doc(uid).collection('MyContests').get().then(QuerySnapshot=>{
      QuerySnapshot.forEach(documentSnapshot=>{
        MatchIds.push({
          id:documentSnapshot.id,
          ContestCount:documentSnapshot.data().ContestCount.length
        });
      })
      if(MatchIds.length>0){
        setMatchId(MatchId)
        setLoadingSpinner(true)
        const UpcomingList = []
        firestore().collection('AllMatches').where('MatchId','in',MatchIds.map(obj => obj.id)).where('Status','==',status).get().then(QuerySnapshot=>{
          QuerySnapshot.forEach(documentSnapshot=>{
            UpcomingList.push({
              Image1: documentSnapshot.data().Image1,
              Image2: documentSnapshot.data().Image2,
              LeagueName: documentSnapshot.data().LeagueName,
              Team1: documentSnapshot.data().Team1,
              Team2: documentSnapshot.data().Team2,
              TeamCode1: documentSnapshot.data().TeamCode1,
              TeamCode2: documentSnapshot.data().TeamCode2,
              MatchTime: documentSnapshot.data().MatchTime,
              contests: MatchIds.find(obj => obj.id === documentSnapshot.data().MatchId)?.ContestCount || 0 ,
              MatchId: documentSnapshot.data().MatchId,
              MatchLink: documentSnapshot.data().MatchLink,
            })
          })
          setList(UpcomingList);
          setLoadingSpinner(false)
        })
      }else setList([])
    })
  },[refresh])

  return(<>
    <LinearGradient colors={['#a8cfff', '#ffffff']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 0.2 }}>
      {loadingSpinner?<SkeletonContentOne/>:<FlatList
        data={List}
        onRefresh={()=>{setRefresh(!refresh)}}
        refreshing={false}
        renderItem={RenderItem}
        initialNumToRender={4}
        maxToRenderPerBatch={5}
        windowSize={30}
        ListFooterComponent={()=>(<View style={{height:150}}></View>)}
        ListEmptyComponent={EmptyComponent}
        style={{height:height,paddingTop:13}}
      />}
    </LinearGradient>
  </>)
}

const styles = StyleSheet.create({
  NoContestImage: {
    width: width * 0.7,
    height: width * 0.6,
    alignSelf: 'center',
  },
  NoContestText: {
    color: '#242424',
    fontFamily: 'Poppins-Medium',
    marginHorizontal: 10,
    textAlign: 'center',
    marginTop: 50,
  },
  MainCardContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 13,
    borderWidth: 0.5,
    borderColor: '#dedede',
    overflow: 'hidden',
  },
  LeagueNameContainer: {
    alignContent: 'center',
    marginBottom: 2,
  },
  Seperator: {
    height: 0.7,
    backgroundColor: '#c7c7c7',
    marginLeft: '15%',
    marginRight: '15%',
  },
  Seperator2: {
    height: 0.8,
    backgroundColor: '#f0f0f0',
  },
  LeagueName: {
    color: '#707070',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    textAlign: 'center',
    paddingBottom: 2,
    paddingTop: 5,
    borderRadius: 25,
  },
  TeamNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
    marginHorizontal: 10,
  },
  TeamOne: {
    color: '#545454',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  TeamLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  TeamLogoOneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  TeamLogoOne: {
    height: 33,
    width: 33,
    zIndex: 2,
  },
  TeamLogoOneShadow: {
    width: 55,
    height: 55,
    position: 'absolute',
    opacity: 0.1,
    zIndex: 1,
    bottom: 0,
  },
  TeamOneCode: {
    color: '#121212',
    fontFamily: 'Poppins-SemiBold',
    marginHorizontal: 10,
  },
  //-------Countdown Timer------------------------------------------
  CountdownContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 15,
  },
  timeLabelStyle: {
    color: '#1141c1',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    backgroundColor: '#edf5ff',
    paddingHorizontal: 7,
    borderRadius: 5,
  },
  timeLabelStyleToday: {
    color: '#1141c1',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  timeLabelStyleTomorrow: {
    color: '#4d4d4d',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  TimeLabelBelowStyle: {
    color: '#7a7a7a',
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  //--------Extra Details-------------------------------------------
  ExtraDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 35,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 10,
  },
  MegaText: {
    color: '#aa4203',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    paddingLeft: 7,
  },
  LiveText: {
    color: '#009e00',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#eeffed',
    paddingHorizontal: 8,
    borderRadius: 5,
  },
});