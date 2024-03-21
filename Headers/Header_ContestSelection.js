import { StyleSheet, Text, View, StatusBar } from 'react-native'
import React,{useEffect,useState,useCallback } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';

export default function Header_ContestSelection({walletIconHide,navigation,navigation2,TeamCode1,TeamCode2,Matchid,MatchKey,Overs,special,WalletFunction}) {

  const [MatchTime,setMatchTime] = useState(null);
  const [status,setStatus] = useState();
  const [ContestStatus,setContestStatus] = useState();
  
  useEffect(()=>{
    const db = firestore().collection('AllMatches').doc(Matchid);
    const unsubscribe = db.onSnapshot(documentSnapshot=>{setMatchTime(documentSnapshot.data().MatchTime);setStatus(documentSnapshot.data().Status)});
    let unsubscribe2;
    if(MatchKey) unsubscribe2 = db.collection('4oversContests').doc(MatchKey).onSnapshot((document) => {setContestStatus(document.data().ContestStatus);});
    return ()=>{unsubscribe();if(unsubscribe2)unsubscribe2()};
  },[]);

  const TimeLeftComponent = useCallback(({milliseconds})=>{
    const [timeDiff,setTimeDiff] = useState(milliseconds-Date.now());
    useEffect(() => {
      const intervalId = setInterval(() => setTimeDiff(milliseconds-Date.now()), 1000);
      return () => clearInterval(intervalId);
    }, []);
    const minutes = Math.floor((timeDiff / 1000) / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
    if(timeDiff>=172800000) return <Text style={styles.timeLabelStyle}>{days+' days left'}</Text>;
    else if(timeDiff <= 600000) return <Text style={styles.timeLabelStyle}>{`${Math.floor(timeDiff / 60000)}m ${Math.floor((timeDiff / 1000) % 60)}s`} left{' '}{(Overs && Overs[0]>2) ? `+${Overs[0] - 2} overs left` : ''}</Text>
    else return <Text style={styles.timeLabelStyle}>{`${hours}h ${Math.floor(minutes % 60)}m`} left{' '}{(Overs && Overs>1) ? `+ ${Overs - 1} overs left` : ''}</Text>
  })

  return (<>
    <StatusBar animated={true} backgroundColor='#1a1a1a'/>
    <View style={styles.MainHeaderContainer}>
      <View style={{flexDirection:'row',alignItems:'center'}}>
        <Icon name='arrow-left' size={23} color="#fafbff" style={{paddingRight:20,paddingBottom:3}} onPress={navigation}/>
        <View style={styles.Name_CountDownContainer}>
          <Text style={styles.Name}>{TeamCode1} vs {TeamCode2}</Text>
          {MatchTime!=null && status=='Upcoming' && <TimeLeftComponent milliseconds={MatchTime.toMillis()} />}
          {status=='Live' && (!ContestStatus || ContestStatus=='Live') && special!='ContestSelection' && <Text style={styles.LiveText}>• Live</Text>}  
          {status=='Live' && ContestStatus=='Upcoming' && <Text style={styles.timeLabelStyle}>Deadline - {Overs-1+'th over'}</Text>}  
        </View>
      </View>
      <View style={{flexDirection:'row',alignItems:"center"}}>
        <Icon name='help-circle-outline' color={'#f6f7fb'} size={22} style={{paddingBottom:3,paddingRight:15}} onPress={navigation2}/>
        {/* <Icon name='bell-plus-outline' color={'#f6f7fb'} size={22} style={{paddingBottom:3,paddingRight:15}} onPress={()=>{WalletFunction()}}/> */}
        {!walletIconHide && <Icon name='wallet-outline' color={'#f6f7fb'} size={22} style={{paddingBottom:3,paddingRight:15}} onPress={()=>{WalletFunction()}}/>}
      </View>
    </View>
  </>)
}

const styles = StyleSheet.create({
  MainHeaderContainer:{
    backgroundColor:'#1a1a1a',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    paddingLeft:13,
    paddingBottom:5,
    paddingTop:10,
  },
  Name_CountDownContainer:{
    flexDirection:'column',
    justifyContent:'space-between',
    alignItems:'flex-start',
  },
  Name:{
    fontSize:14,
    fontFamily:'Poppins-SemiBold',
    color:'#fafbff'
  },
  LiveText:{
    fontFamily:'Poppins-Medium',
    color:'#fafbff',
    fontSize:13
  },
  timeLabelStyle:{
    fontSize:11,
    fontFamily:'Poppins-Medium',
    textAlign:'center',
    color:'#fafbff'
  },
})