import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';
import { View, Text, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';

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

const FetchScore = ({page,url,I1,I2,status}) => {
  const [team1Name, setTeam1Name] = useState('');
  const [team1Score, setTeam1Score] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [result,setResult] = useState('');
  const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));
  useEffect(() => {if(team1Name!='')LayoutAnimation.configureNext(customLayoutAnimation);}, [team1Name]);
  useEffect(() => {
    if(status=='Live' || status=='Completed'){
      const fetchData = async () => {
        await delay(1000);
        try {
          const response = await axios.get(url);
          const htmlCode = response.data;
          const $ = cheerio.load(htmlCode);
          setTeam1Name($('.team1-score-strip .country').text().trim());
          setTeam1Score($('.team1-score-strip .score').text().trim() + $('.team1-score-strip .overs-info').text().trim());
          setTeam2Name($('.team2-score-strip .country').text().trim());
          setTeam2Score($('.team2-score-strip .score').text().trim() + $('.team2-score-strip .overs-info').text().trim());
          setResult($('.match-result[data="data.info"]').text().trim()); 
        } catch (error) {}
      };
      fetchData()
    }
  }, [])


  return (<>
    {team1Name!='' && <View style={{backgroundColor:'#1a1a1a',flexDirection:'column',justifyContent:'center',paddingHorizontal:13,paddingTop:10}}>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <View style={{alignItems:'flex-start'}}>
          <Text style={styles.LSTeamName}>{team1Name}</Text>
          <View style={styles.LSImageScoreContainer}>
            <FastImage source={{uri:I1}} style={styles.TeamLogoOne}/>
            {team1Score!='' && <><Text style={[styles.ScoreDataCurrentText,{marginLeft:10}]}>{(team1Score).slice(0,(team1Score).indexOf('('))}</Text>
            <Text style={[styles.LSOverText,{marginLeft:5}]}>{(team1Score).slice((team1Score).indexOf('('))}</Text></>}
            {team1Score=='' && <Text style={[styles.ScoreDataCurrentText,{marginLeft:10}]}>Yet to bat</Text>}
          </View>
        </View>  
        <View style={{alignItems:'flex-end'}}>
          <Text style={styles.LSTeamName}>{team2Name}</Text>
          <View style={styles.LSImageScoreContainer}>
            {team2Score!='' && <><Text style={[styles.LSOverText,{marginRight:5}]}>{(team2Score).slice((team2Score).indexOf('('))}</Text>
            <Text style={[styles.ScoreDataCurrentText,{marginRight:10}]}>{(team2Score).slice(0,(team2Score).indexOf('('))}</Text></>}
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
      {page=='Selection' && <View style={{height:1,backgroundColor:'#4f4f4f',marginBottom:5}}></View>}
    </View>}
  </>);
};

export default FetchScore;

const styles = StyleSheet.create({
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
});