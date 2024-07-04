import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import firestore from '@react-native-firebase/firestore';
import FastImage from 'react-native-fast-image';

export default function FetchScore({page,I1,I2,status,MatchId,Team1,Team2,CurrentInning,focusedScreen}) {

  const [over1, setOver1] = useState('');
  const [team1Score, setTeam1Score] = useState(null);
  const [over2, setOver2] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [result,setResult] = useState('');
  const [liveScoreData,setLiveScoreData] = useState([]);
  const colors = {"0":'#006269',"1":'#006269',"1B":'#006269',"1LB":'#006269',"2":'#006269',"2B":'#006269',"2LB":'#006269',"3":'#006269',"3B":'#006269',"3LB":'#006269',"4":'#1e8e3e',"4B":'#1e8e3e',"4LB":'#1e8e3e',"5":'#006269',"5B":'#006269',"5LB":'#006269',"6":'#1e8e3e',"6B":'#1e8e3e',"6LB":'#1e8e3e',"1WD":'#185ccc',"2WD":'#185ccc',"3WD":'#185ccc',"4WD":'#185ccc',"5WD":'#185ccc',"6WD":'#185ccc',"7WD":'#185ccc',"1NB":'#185ccc',"2NB":'#185ccc',"3NB":'#185ccc',"4NB":'#185ccc',"5NB":'#185ccc',"6NB":'#185ccc',"7NB":'#185ccc',"W":'#d93025'}

  function getSubscript(number) {
    if (number === 1) return "st";
    else if (number === 2) return "nd";
    else if (number === 3) return "rd";
    else return "th";
  }

  useEffect(()=>{
    if(status!='Upcoming'){
      const db = firestore().collection('AllMatches').doc(MatchId).collection('LiveScores');
      const unsubscribe = db.doc('LiveInfo').onSnapshot((documentSnapshot)=>{
        setOver1(documentSnapshot.data().Over1);
        setOver2(documentSnapshot.data().Over2);
        setTeam1Score(documentSnapshot.data().Score1);
        setTeam2Score(documentSnapshot.data().Score2);
        setResult(documentSnapshot.data().Result);
      })
      const unsubscribe2 = db.doc(CurrentInning==1?'LiveScores':'LiveScores2').onSnapshot((documentSnapshot)=>{
        const LiveScores = documentSnapshot.data();
        const convertedLiveScores = [];
        Object.keys(LiveScores).forEach(over => {
          const flatted = LiveScores[over].flatMap(Object.values)
          convertedLiveScores.push(flatted);
        });
        setLiveScoreData(convertedLiveScores)
      })
      return()=>{unsubscribe();unsubscribe2();}
    }
  },[])

  return (<>
    {team1Score!=null && <View style={{backgroundColor:'#1a1a1a',flexDirection:'column',justifyContent:'center',paddingHorizontal:13,paddingTop:10}}>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <View style={{alignItems:'flex-start'}}>
          <Text style={styles.LSTeamName}>{Team1}</Text>
          <View style={styles.LSImageScoreContainer}>
            <FastImage source={{uri:I1}} style={styles.TeamLogoOne}/>
            {team1Score!='' && <><Text style={[styles.ScoreDataCurrentText,{marginLeft:10}]}>{team1Score}</Text>
            <Text style={[styles.LSOverText,{marginLeft:5}]}>{'('+over1+')'}</Text></>}
            {team1Score=='' && <Text style={[styles.ScoreDataCurrentText,{marginLeft:10}]}>Yet to bat</Text>}
          </View>
        </View>  
        <View style={{alignItems:'flex-end'}}>
          <Text style={styles.LSTeamName}>{Team2}</Text>
          <View style={styles.LSImageScoreContainer}>
            {team2Score!='' && <><Text style={[styles.LSOverText,{marginRight:5}]}>{'('+over2+')'}</Text>
            <Text style={[styles.ScoreDataCurrentText,{marginRight:10}]}>{team2Score}</Text></>}
            {team2Score=='' && <Text style={[styles.ScoreDataCurrentText,{marginRight:10}]}>Yet to bat</Text>}
            <FastImage source={{uri:I2}} style={styles.TeamLogoOne}/>
          </View>  
        </View>  
      </View>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:-10}}>
        <Text style={{color:'#109e00',fontFamily:'Poppins-SemiBold'}}>● </Text>
        <Text style={styles.LSStatusText}>{status?status.toUpperCase():'LIVE'}</Text>
      </View>
      <Text style={styles.LSConclusionText}>{result}</Text>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={{alignSelf:'flex-start',marginBottom:6}}
        data={liveScoreData}
        contentContainerStyle={{ flexDirection: 'row-reverse' ,marginVertical:5}}
        inverted
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => 
          <View style={{ flexDirection: 'row',alignItems:'center'}}>
            <Text style={{ color: '#fafcff', fontFamily: 'Poppins-Medium', fontSize: 9, textAlign: 'center', paddingRight: 3, paddingLeft: 10 }}>{index + 1 + (getSubscript(index + 1)) + '\nover'}</Text>
            {item.map((value, itemIndex) => (
              <View key={itemIndex} style={[styles.TabPattiItemContainer2, { backgroundColor:colors[value.toString()] }]}>
                <Text style={styles.TabPattiText2}>{value}</Text>
              </View>
            ))}
          </View>
        }
      />
    </View>}
  </>);
}

const styles = StyleSheet.create({
  TeamLogoOne:{
    height:33,
    aspectRatio:1/1.3,
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
  TabPattiItemContainer2: {
    minWidth: 29,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
    borderRadius: 2,
  },
  TabPattiText2: {
    color: '#f6f7fb',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11.3,
  },
});

// import React, { useCallback, useEffect, useState } from 'react';
// import axios from 'axios';
// import cheerio from 'cheerio';
// import { View, Text, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native';
// import FastImage from 'react-native-fast-image';

// if (Platform.OS === 'android')UIManager.setLayoutAnimationEnabledExperimental(true);
// const customLayoutAnimation = {
//   duration: 250,
//   create: {
//     type: LayoutAnimation.Types.easeInEaseOut,
//     property: LayoutAnimation.Properties.opacity,
//   },
//   update: {
//     type: LayoutAnimation.Types.easeInEaseOut,
//   },
// };

// const FetchScore = ({page,url,I1,I2,status}) => {
//   const [team1Name, setTeam1Name] = useState('');
//   const [team1Score, setTeam1Score] = useState('');
//  Team2, setTeam2Name] = useState('');
//   const [team2Score, setTeam2Score] = useState('');
//   const [result,setResult] = useState('');
//   const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));
//   useEffect(() => {if(team1Name!='')LayoutAnimation.configureNext(customLayoutAnimation);}, [team1Name]);
//   useEffect(() => {
//     if(status=='Live' || status=='Completed'){
//       const fetchData = async () => {
//         await delay(1000);
//         try {
//           const response = await axios.get(url);
//           const htmlCode = response.data;
//           const $ = cheerio.load(htmlCode);
//           setTeam1Name($('.team1-score-strip .country').text().trim());
//           setTeam1Score($('.team1-score-strip .score').text().trim() + $('.team1-score-strip .overs-info').text().trim());
//           setTeam2Name($('.team2-score-strip .country').text().trim());
//           setTeam2Score($('.team2-score-strip .score').text().trim() + $('.team2-score-strip .overs-info').text().trim());
//           setResult($('.match-result[data="data.info"]').text().trim()); 
//         } catch (error) {}
//       };
//       fetchData()
//     }
//   }, [])


//   return (<>
//     {team1Name!='' && <View style={{backgroundColor:'#1a1a1a',flexDirection:'column',justifyContent:'center',paddingHorizontal:13,paddingTop:10}}>
//       <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
//         <View style={{alignItems:'flex-start'}}>
//           <Text style={styles.LSTeamName}>{team1Name}</Text>
//           <View style={styles.LSImageScoreContainer}>
//             <FastImage source={{uri:I1}} style={styles.TeamLogoOne}/>
//             {team1Score!='' && <><Text style={[styles.ScoreDataCurrentText,{marginLeft:10}]}>{(team1Score).slice(0,(team1Score).indexOf('('))}</Text>
//             <Text style={[styles.LSOverText,{marginLeft:5}]}>{(team1Score).slice((team1Score).indexOf('('))}</Text></>}
//             {team1Score=='' && <Text style={[styles.ScoreDataCurrentText,{marginLeft:10}]}>Yet to bat</Text>}
//           </View>
//         </View>  
//         <View style={{alignItems:'flex-end'}}>
//           <Text style={styles.LSTeamName}>{team2Name}</Text>
//           <View style={styles.LSImageScoreContainer}>
//             {team2Score!='' && <><Text style={[styles.LSOverText,{marginRight:5}]}>{(team2Score).slice((team2Score).indexOf('('))}</Text>
//             <Text style={[styles.ScoreDataCurrentText,{marginRight:10}]}>{(team2Score).slice(0,(team2Score).indexOf('('))}</Text></>}
//             {team2Score=='' && <Text style={[styles.ScoreDataCurrentText,{marginRight:10}]}>Yet to bat</Text>}
//             <FastImage source={{uri:I2}} style={styles.TeamLogoOne}/>
//           </View>  
//         </View>  
//       </View>
//       <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:-10}}>
//         <Text style={{color:'#109e00',fontFamily:'Poppins-SemiBold'}}>● </Text>
//         <Text style={styles.LSStatusText}>{status?status.toUpperCase():'LIVE'}</Text>
//       </View>
//       <Text style={styles.LSConclusionText}>{result}</Text>
//       {page=='Selection' && <View style={{height:1,backgroundColor:'#4f4f4f',marginBottom:5}}></View>}
//     </View>}
//   </>);
// };

// export default FetchScore;

