import React, {useEffect, useState,useCallback,useRef} from 'react';
import {View,Text,TouchableWithoutFeedback,ScrollView,StyleSheet,LayoutAnimation,UIManager,Platform} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {height} from '../Dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore'; 
import FastImage from 'react-native-fast-image';
import Modal from "react-native-modal";
import EntryCalculator from './EntryCalculator';
import Toast from 'react-native-toast-message';
import {BottomSheetModal,BottomSheetBackdrop} from '@gorhom/bottom-sheet';

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

export default function BallSelection({navigation}) {

  const sheetRef1 = useRef(null);
  const handlePresentModalPress = useCallback(() => {sheetRef1.current?.present();}, []);
  const handleClosePress = () => sheetRef1.current.close()
  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior={isPriceModalFixed?'none':'close'}/>);
  const {MatchId, TeamCode1, TeamCode2, Team1, Team2, I1, I2,ContestType, MatchKey, MatchLink, Entry, uid, Free, Inning, Overs} = useRoute().params;
  const [selectedScores,setSelectedScores] = useState(null);
  const [isModalVisible,setIsModalVisible] = useState(false);
  const [isPriceModalFixed,setIsPriceModalFixed] = useState(false);
  const [BallToBeUpdated,setballToBeUpdated] = useState(null);
  const [status,setStatus] = useState('');
  const [wideShown,showWide] = useState(false);
  const [wideNoBallShown,setWideNoBallShown] = useState(true);
  const [scoreData,setScoreData] = useState(null);
  const colors = {null:'#ffffff',"0":'#006269',"1":'#006269',"2":'#006269',"3":'#006269',"4":'#1e8e3e',"5":'#006269',"6":'#1e8e3e',"1WD":'#185ccc',"1NB":'#185ccc',"2NB":'#185ccc',"3NB":'#185ccc',"4NB":'#185ccc',"5NB":'#185ccc',"7NB":'#185ccc',"W":'#d93025'}
  const skip = ["1WD","1NB","2NB","3NB","4NB","5NB","7NB"];
  const FreeHitCheck = ["1NB","2NB","3NB","4NB","5NB","7NB"];
  const isFreeHit = (index, ind) => {
    if (scores[index].length === 2 && ind === 1 && FreeHitCheck.includes(scores[index][ind - 1][0])) {
      return true;
    }
    if (scores[index].length === 3 && ind === 2 && (FreeHitCheck.includes(scores[index][ind - 1][0]) || FreeHitCheck.includes(scores[index][ind - 2][0]))) {
      return true;
    }
    return false;
  };
  const [scores, setScores] = useState(Array.from({ length: 6 }, () => [[null, 'Select Score']]));
  const showToast = (type,text1,text2) => Toast.show({type: type,text1: text1,visibilityTime:2500,position:'top',topOffset:0,text2: text2});
  
  const NextButtonTouched = async () => {
    setIsPriceModalFixed(false)
    const transformedData = [];
    await firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(uid).get().then((documentSnapshot) => {
      const data = documentSnapshot.data();
      if (data) for (let i = 1; i <= documentSnapshot.data().Count; i++) transformedData.push(data['S' + i]);
    });
    const outputArray = scores.map(innerArray => {
      const newObj = {};
      innerArray.forEach((item, index) => {
        newObj[index] = item[0];
      });
      return newObj;
    });
    setSelectedScores(outputArray);
    function arraysAreEqual(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((value, index) => {
        const value1 = typeof value === 'object' ? Object.values(value)[0] : value;
        const value2 = typeof arr2[index] === 'object' ? Object.values(arr2[index])[0] : arr2[index];
        return String(value1) === String(value2);
      });
    }
    const foundMatch = transformedData.findIndex(arr => arraysAreEqual(outputArray, arr));
    if(foundMatch==-1) handlePresentModalPress()
    else showToast('error','Duplicate Sets Found!',`The current set matches an existing set S${foundMatch+1}`)
  }

  useEffect(() => {if(scoreData||isModalVisible||!isModalVisible) LayoutAnimation.configureNext(customLayoutAnimation)}, [scoreData,isModalVisible]);
  useEffect(() => {
    setIsPriceModalFixed(false)
    const matchListener = firestore().collection('AllMatches').doc(MatchId).onSnapshot((documentSnapshot) => {
      setStatus(documentSnapshot.data().Status);
      if (documentSnapshot.data().Status === 'Live' && MatchLink) {
        async function fetchScore() {
          try {
            const response = await fetch('https://get-cricket-score.vercel.app/score?url=' + MatchLink);
            const data = await response.json();
            setScoreData(data);
          } catch (exception) {
            fetchScore();
          }
        }
        fetchScore();
        // const scoreInterval = setInterval(() => {
        //   fetchScore();
        // }, 90000);
        // return () => clearInterval(scoreInterval);
      }
    });
    return () => {matchListener();}
  }, []);
  
  
  const ScoreOption = useCallback((image, label ,style ,textStyle,number)=>(
    <TouchableWithoutFeedback onPress={()=>{
      const score = [number,
        <View style={styles.ScoreDesignContainer}>
          <View style={{width:50,alignItems:'center',marginRight:10}}><FastImage style={style} source={image} /></View>
          <View style={{backgroundColor:'#c4c4c4',width:1,height:35,marginRight:10,borderRadius:20}}></View>
          <Text style={textStyle}>{label}</Text>
        </View>]
      const copy = scores;
      showWide(false);
      if(skip.includes(number)){
        copy[BallToBeUpdated[0]][BallToBeUpdated[1]+1] = [null,'Select Score'];
      }
      else if(copy[BallToBeUpdated[0]][BallToBeUpdated[1]+1]){
        const indexToRemove = BallToBeUpdated[1] + 1;
        copy[BallToBeUpdated[0]].splice(indexToRemove);
      }
      copy[BallToBeUpdated[0]][BallToBeUpdated[1]] = score;
      setScores(copy)
      setIsModalVisible(false) 
    }}>
      <View style={styles.ScoreItemContainer}>
        <View style={styles.ScoreDesignContainer}>
          <View style={{width:50,alignItems:'center',marginRight:10}}><FastImage style={style} source={image} /></View>
          <View style={{backgroundColor:'#c4c4c4',width:1,height:35,marginRight:10,borderRadius:20}}></View>
          <Text style={textStyle}>{label}</Text>
          {number=="1NB" && <Icon name='chevron-down' color={'#7d7d7d'} size={20} style={{marginLeft:20}} onPress={()=>showWide(!wideShown)}/>}
        </View>
        <Icon name='radiobox-blank' color={'#7d7d7d'} size={18} />
      </View>
    </TouchableWithoutFeedback>
  ));
  
  const allBallsFilled = scores.flat(Infinity).filter((value) => value === null).length;
  
  return(<>
    <View style={styles.MainDetailsContainer}>
      {scoreData==null && <View style={styles.TWholeContainer}>
        <View style={[styles.BallLeftMainContainer,{marginLeft:15,alignItems:'flex-start',}]}>
          <Text style={styles.BallsLeftBallsText}>Balls</Text>
          <View style={{flexDirection:'row'}}>
            <Text style={styles.BallsLeftBallsMainText}>{6 - allBallsFilled}</Text>
            <Text style={styles.BallsLeftBallsText}>/6</Text>
          </View>
        </View>
        <View style={styles.LogoAndnameContainer}>
          <View style={styles.LogoAndNameOneContainer}>
            <FastImage source={{uri:I1}} style={styles.TeamLogoOne}/>
            <Text style={styles.TeamCodeOne}>{TeamCode1}</Text>
          </View>
          <Text style={styles.versustext}>v/s</Text>
          <View style={styles.LogoAndNameTwoContainer}>
            <Text style={styles.TeamCodeTwo}>{TeamCode2}</Text>
            <FastImage source={{uri:I2}} style={styles.TeamLogoOne}/>
          </View>
        </View>
        <View style={[styles.BallLeftMainContainer,{marginRight:15,alignItems:'flex-end',}]}>
          <Text style={styles.BallsLeftBallsText}>Runs </Text>
          <Text style={[styles.BallsLeftBallsMainText,{marginRight:4}]}>{scores.flat().map(item => item[0] && item[0].charAt(0)).filter(item => item !== null && !isNaN(item)).reduce((sum, item) => sum + parseInt(item), 0)}</Text>
        </View>
      </View>}
      {status==='Live' && scoreData!=null && <View style={{flexDirection:'column',justifyContent:'center',paddingHorizontal:13,paddingTop:10}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <View style={{alignItems:'flex-start'}}>
            <Text style={styles.LSTeamName}>{scoreData.Team1}</Text>
            <View style={styles.LSImageScoreContainer}>
              <FastImage source={{uri:I1}} style={styles.TeamLogoOne}/>
              {scoreData.Score1!=" " && <><Text style={[styles.ScoreDataCurrentText,{marginLeft:10}]}>{(scoreData.Score1).slice(0,(scoreData.Score1).indexOf('(')-1)}</Text>
              <Text style={[styles.LSOverText,{marginLeft:5}]}>{(scoreData.Score1).slice((scoreData.Score1).indexOf('('))}</Text></>}
              {scoreData.Score1==" " && <Text style={[styles.ScoreDataCurrentText,{marginLeft:10}]}>Yet to bat</Text>}
            </View>
            <View style={[styles.BallLeftMainContainer,{marginLeft:15,alignItems:'flex-start',}]}>
          <Text style={styles.BallsLeftBallsText}>Balls</Text>
          <View style={{flexDirection:'row'}}>
            <Text style={styles.BallsLeftBallsMainText}>{6 - allBallsFilled}</Text>
            <Text style={styles.BallsLeftBallsText}>/6</Text>
          </View>
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
            <View style={[styles.BallLeftMainContainer,{marginRight:15,alignItems:'flex-end',}]}>
          <Text style={styles.BallsLeftBallsText}>Runs </Text>
          <Text style={[styles.BallsLeftBallsMainText,{marginRight:4}]}>{scores.flat().map(item => item[0] && item[0].charAt(0)).filter(item => item !== null && !isNaN(item)).reduce((sum, item) => sum + parseInt(item), 0)}</Text>
        </View> 
          </View>  
        </View>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:-55}}>
          <Text style={{color:'#109e00',fontFamily:'Poppins-SemiBold'}}>● </Text>
          <Text style={styles.LSStatusText}>{'Live'}</Text>
        </View>
        <Text style={styles.LSConclusionText}>{scoreData.Status}</Text>
      </View>}
        
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{height:40,marginHorizontal:12,marginTop:34,alignSelf:'center',marginBottom:10}}>
        {scores.map((n, index) => {
          return n.map((i,ind)=>(
            <TouchableWithoutFeedback key={ind} onPress={()=>{
              setWideNoBallShown(true);
              if(ind>=2) setWideNoBallShown(false);
              setIsModalVisible(true);
              setballToBeUpdated([index,ind]);
            }}>
              <View style={[styles.TabPattiItemContainer2,{backgroundColor:colors[(n)[ind][0]]}]}>
                {!skip.includes(n[ind][0]) && <Text style={[styles.BallNumberingText0,{color:(n)[ind][0]?'#f6f7fb':'#1a1a1a'}]}>{(+index+1)}</Text>}
                <Text style={styles.TabPattiText2}>{(n)[ind][0]}</Text>
              </View>
            </TouchableWithoutFeedback>
          ))
        })}
      </ScrollView>
    </View>
    
    <View style={styles.OverNamePattiContainer}>
      <Text style={styles.CreateSetText}>Create a set</Text>
      <Text style={[styles.CreateSetText,{fontSize:13}]}>Inning-{Inning}   Over-{Overs}</Text>
    </View>
    
    <ScrollView style={{ backgroundColor: '#ffffff' }}>
      <View style={styles.PikersMainSuperContainer}>
        {scores.map((n, index) => {
          const renderItems = n.map((item, ind) => {
            const [score, ballName] = item;
            const isSkip = !skip.includes(score);
            return (
              <TouchableWithoutFeedback
                key={ind}
                onPress={() => {
                  setWideNoBallShown(true);
                  if (ind >= 2) setWideNoBallShown(false);
                  setIsModalVisible(true);
                  setballToBeUpdated([index, ind]);
                }}>
                <View style={[styles.PickerContainer,(ind>0 && isFreeHit(index,ind))?{paddingVertical:13}:{paddingVertical:9}]}>
                {ind>0 && isFreeHit(index, ind) && <FastImage source={require('../accessories/DreamBallLogos/FH.png')} style={{height:12,aspectRatio:500/100,borderTopLeftRadius:5,position:'absolute',top:-5.5,left:-0.5,opacity:1}}/>}
                  <View style={common}>
                    {isSkip && <Text style={styles.BallNumberingText}>{index + 1}</Text>}
                    <Text style={styles.BallNameText}>{ballName}</Text>
                  </View>
                  <Icon name="chevron-down" color="#1c1c1c" size={22} />
                </View>
              </TouchableWithoutFeedback>
            );
          });
          return renderItems;
        })}
      </View>
    </ScrollView>
  
    <Modal isVisible={isModalVisible} animationIn={'slideInUp'} animationInTiming={350} animationOut={'slideOutDown'} animationOutTiming={350} backdropOpacity={0.5} onBackdropPress={()=>{setIsModalVisible(false)}} hideModalContentWhileAnimating={true}>
      <View style={styles.ModalMainContainer}>
        <Text style={styles.SelectScoreText}>SELECT SCORE:</Text>
        <View style={{height:0.6,backgroundColor:'#1a1a1a'}}></View>
        <ScrollView>
          {ScoreOption(require('../accessories/DreamBallLogos/001.png'),"0 Run",{height:49,width:24.99},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:6,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"0")}
          {ScoreOption(require('../accessories/DreamBallLogos/11.png'),"1 Run",{height:49,width:29},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:8,borderRadius:5,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"1")}
          {ScoreOption(require('../accessories/DreamBallLogos/22.png'),"2 Runs",{height:49.5,width:45},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"2")}
          {ScoreOption(require('../accessories/DreamBallLogos/Three.png'),"3 Runs",{height:49,width:34.065},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"3")}
          {ScoreOption(require('../accessories/DreamBallLogos/44.png'),"4 Runs (Boundary)",{height:49.5,width:49},{backgroundColor:'#1e8e3e',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"4")}
          {ScoreOption(require('../accessories/DreamBallLogos/5.png'),"5 Runs",{height:49,width:34.065},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"5")}
          {ScoreOption(require('../accessories/DreamBallLogos/66.png'),"6 runs (Six)",{height:50,width:50},{backgroundColor:'#1e8e3e',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"6")}
          {wideNoBallShown && <>
          {ScoreOption(require('../accessories/DreamBallLogos/Wide.png'),"Wide + 1",{height:51,width:48},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"1WD")}
          {ScoreOption(require('../accessories/DreamBallLogos/NB.png'),"No Ball + 1",{height:49,width:50},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"1NB")}</>}     
          {wideShown && wideNoBallShown&& <>
          {ScoreOption(require('../accessories/DreamBallLogos/NB.png'),"1NoBall + 1",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"2NB")}
          {ScoreOption(require('../accessories/DreamBallLogos/NB.png'),"1NoBall + 2",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"3NB")}
          {ScoreOption(require('../accessories/DreamBallLogos/NB.png'),"1NoBall + 3",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"4NB")}
          {ScoreOption(require('../accessories/DreamBallLogos/NB.png'),"1NoBall + 4",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"5NB")}
          {ScoreOption(require('../accessories/DreamBallLogos/NB.png'),"1NoBall + 6",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"7NB")}</>}
          {ScoreOption(require('../accessories/DreamBallLogos/W.png'),"Wicket",{height:42,width:42},{backgroundColor:'#d93025',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"W")}
        </ScrollView>
      </View>
    </Modal>
    <Text onPress={()=>{if (allBallsFilled==0)NextButtonTouched()}} style={allBallsFilled==0 ?[styles.NextButtonText,{backgroundColor:'#009e00'}]:styles.NextButtonText}>Next</Text>
    <BottomSheetModal
      ref={sheetRef1}
      snapPoints={['35%']}
      enablePanDownToClose={!isPriceModalFixed}
      enableOverDrag={true}
      detached={true}
      bottomInset={420}
      containerStyle={{marginHorizontal:15}}
      backdropComponent={renderBackdrop}
      handleStyle={{position:'absolute',alignSelf:'center'}}
      handleIndicatorStyle={{backgroundColor:'#ffffff'}}
      backgroundStyle={{borderTopLeftRadius:13,borderTopRightRadius:13}}>
      <EntryCalculator MatchId={MatchId} TeamCode1={TeamCode1} TeamCode2={TeamCode2} ContestType={ContestType} MatchKey={MatchKey} Entry={Entry} uid={uid} selectedScores={selectedScores} Free={Free} navigation={()=>{navigation.navigate('ContestSelection',{Team1:Team1,Team2:Team2,TeamCode1:TeamCode1,TeamCode2:TeamCode2,MatchId:MatchId,uid:uid,I1:I1,I2:I2,MatchLink:MatchLink})}} navigation2={(ja)=>navigation.navigate('AddCash',{add:'₹'+ja})} modalFix={()=>{setIsPriceModalFixed(true)}} disableModal={handleClosePress} error={(err,err2)=>{handleClosePress();showToast('error',err,err2)}} />
    </BottomSheetModal>
    <Toast />
    </>
  )}

//========Styles==========================================================================================================================================================================================
const LogoAndNameOneContainer = {flexDirection:'row',
  alignItems:'center',
  justifyContent:'center'}
const TeamCodeOne = {fontFamily:'Poppins-Medium',
  fontSize:15,
  color:'#ffffff'}
const common = {  flexDirection:'row',
  justifyContent:'space-between',
  alignItems:'center'}
const styles = StyleSheet.create({
  MainDetailsContainer:{
    backgroundColor:'#1a1a1a',
    justifyContent:'space-between',
  },
  LogoAndnameContainer:{
    ...LogoAndNameOneContainer,
    marginTop:17,
  },
  LogoAndNameOneContainer:{
      ...LogoAndNameOneContainer,
      marginRight:20,
  },
  LogoAndNameTwoContainer:{
    ...LogoAndNameOneContainer,
    marginLeft:20,
  },
  TeamCodeOne:{
    ...TeamCodeOne,
    marginLeft:3
  },
  TeamCodeTwo:{
    ...TeamCodeOne,
    marginRight:3,
  },
  versustext:{
    fontFamily:'Poppins-Regular',
    fontSize:14
  },
  TWholeContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    width:'100%',
  },
  BallLeftMainContainer:{
    marginTop:17,
    marginBottom:-8
  },
  BallsLeftBallsText:{
    fontFamily:'Poppins-Medium',
    fontSize:13
  },
  BallsLeftBallsMainText:{
    fontFamily:'Poppins-SemiBold',
    fontSize:14.5,
    color:'#f6f7fb',
    position:'relative',
    bottom:1.5
  },
  OverNamePattiContainer:{
    flexDirection:'row',
    justifyContent:'space-between',
    paddingVertical:4,
    paddingHorizontal:12,
    backgroundColor:'#ffffff',
    alignItems:'center',
    borderBottomWidth:0.7,
    borderBottomColor:'#e8e8e8',
    elevation:2
  },
  CreateSetText:{
    color:'#545454',
    fontFamily:'Poppins-SemiBold',
    fontSize:12
  },
  PikersMainSuperContainer:{
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    marginTop:20,
    marginBottom:90,
    marginHorizontal:10,
  },
  PickerContainer:{
    ...common,
    backgroundColor:'#fffffe',
    borderColor:'#d4d4d4',
    borderWidth:0.6,
    borderRadius:11,
    paddingHorizontal:12,
    marginBottom:20,
    width:'92%',
    elevation:0.5
  },
  ModalMainContainer:{
    maxHeight:0.90*height,
    backgroundColor:'#ffffff',
    borderRadius:12,
    paddingTop:10,
    borderColor:'#a1a1a1',
    borderWidth:0.4,
    opacity:0.99,
  },
  SelectScoreText:{
    color:'#1a1a1a',
    fontFamily:'Poppins-SemiBold',
    textAlign:'center',
    fontSize:15
  },
  BallNumberingText:{
    color:'#9d9d9d',
    fontFamily:'Poppins-Medium',
    fontSize:12,
    paddingRight:'5%'
  },
  BallNameText:{
    color:'#545454',
    fontFamily:'Poppins-Medium',
    fontSize:14,
  },
  ScoreItemContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    borderBottomWidth:0.6,
    borderBottomColor:'#e6e6e6',
    borderBottomEndRadius:11,
    borderBottomStartRadius:11,
    padding:5
  },
  ScoreDesignContainer:{
    ...LogoAndNameOneContainer,
    paddingLeft:10,
    width:"80%",
    alignItems:'center',
    justifyContent:'flex-start',
  },
  NextButtonText:{
    position:'absolute',
    bottom:25,
    color:'white',
    backgroundColor:'#999999',
    borderRadius:25,
    fontFamily:'Poppins-SemiBold',
    fontSize:16,
    paddingVertical:5,
    paddingHorizontal:40,
    alignSelf:'center',
    elevation:1,
  },
  TabPattiItemContainer2:{
    minWidth:37,
    height: 28,
    backgroundColor: 'white',
    alignItems:'center',
    justifyContent:'center',
    marginHorizontal:1,
    borderRadius:4
  },
  TabPattiText2:{
    color:'#f6f7fb',
    fontFamily:'Poppins-SemiBold',
    fontSize:14,
  },
  BallNumberingText0:{
    fontFamily:'Poppins-Medium',
    fontSize:7,
    position:'absolute',
    bottom:16.8,
    right:31
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
    maxWidth:'60%',
    textAlign:'center'
  },
});