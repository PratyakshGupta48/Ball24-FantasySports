import React, {useEffect, useState,useCallback,useRef} from 'react';
import {View,Text,TouchableWithoutFeedback,ScrollView,StatusBar,ActivityIndicator,LayoutAnimation,UIManager,Platform} from 'react-native';
import {useRoute} from '@react-navigation/native';
import Header_ContestSelection from '../../../Headers/Header_ContestSelection';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore'; 
import FastImage from 'react-native-fast-image';
import Modal from "react-native-modal";
import functions from '@react-native-firebase/functions';
import Toast from 'react-native-toast-message';
import styles from '../../../Styles/BallSelection_SetCreator_Styles';
import {BottomSheetModal,BottomSheetBackdrop, BottomSheetScrollView} from '@gorhom/bottom-sheet';

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

export default function BallEditPage({navigation}) {

  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />);
  const sheetRef2 = useRef(null);
  const handlePresentModalPress2 = useCallback(() => {sheetRef2.current?.present();}, []);
  const handleClosePress2 = () => sheetRef2.current.close();
  const {MatchId,TeamCode1,TeamCode2,I1,I2,uid,SetName} = useRoute().params;
  const [isModalVisible,setIsModalVisible] = useState(false);
  const [BallToBeUpdated,setballToBeUpdated] = useState(null);
  const [wideShown,showWide] = useState(false);
  const [wideNoBallShown,setWideNoBallShown] = useState(true);
  const [starBall,setStarBall] = useState([]);
  const [bonusBall,setBonusBall] = useState([]);
  const [loadingSpinner,setLoadingSpinner] = useState(true);
  const [scores, setScores] = useState([]);
  // const [copy,setCopy] = useState([])

  const colors = {null:'#ffffff',"0":'#006269',"1":'#006269',"2":'#006269',"3":'#006269',"4":'#1e8e3e',"5":'#006269',"6":'#1e8e3e',"1WD":'#185ccc',"1NB":'#185ccc',"2NB":'#185ccc',"3NB":'#185ccc',"4NB":'#185ccc',"5NB":'#185ccc',"7NB":'#185ccc',"W":'#d93025'}
  const skip = ["1WD","1NB","2NB","3NB","4NB","5NB","7NB"];
  const FreeHitCheck = ["1NB","2NB","3NB","4NB","5NB","7NB"];
  const isFreeHit = (index, ind) => {
    if (scores[index].length === 2 && ind === 1 && FreeHitCheck.includes(scores[index][ind - 1][0]))
      return true;
    if (scores[index].length === 3 && ind === 2 && (FreeHitCheck.includes(scores[index][ind - 1][0]) || FreeHitCheck.includes(scores[index][ind - 2][0])))
      return true;
    return false;
  };
  const showToast = (type,text1,text2) => Toast.show({type: type,text1: text1,visibilityTime:2500,position:'top',topOffset:0,text2: text2});

  function helper (image, label ,style ,textStyle) {
    return(
      <View style={styles.ScoreDesignContainer}>
      <View style={{width:50,alignItems:'center',marginRight:10}}><FastImage style={style} source={image} /></View>
      <View style={{backgroundColor:'#c4c4c4',width:1,height:35,marginRight:10,borderRadius:20}}></View>
      <Text style={textStyle}>{label}</Text>
      </View>
    )
  }
  const equivalentJSX = {
    '0':helper(require('../../../accessories/DreamBallLogos/001.png'),"0 Run",{height:49,width:24.99},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:6,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
    '1':helper(require('../../../accessories/DreamBallLogos/11.png'),"1 Run",{height:49,width:29},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:8,borderRadius:5,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
    '2':helper(require('../../../accessories/DreamBallLogos/22.png'),"2 Runs",{height:49.5,width:45},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
    '3':helper(require('../../../accessories/DreamBallLogos/Three.png'),"3 Runs",{height:49,width:34.065},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
    '4':helper(require('../../../accessories/DreamBallLogos/44.png'),"4 Runs (Boundary)",{height:49.5,width:49},{backgroundColor:'#1e8e3e',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
    '5':helper(require('../../../accessories/DreamBallLogos/5.png'),"5 Runs",{height:49,width:34.065},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
    '6':helper(require('../../../accessories/DreamBallLogos/66.png'),"6 runs (Six)",{height:50,width:50},{backgroundColor:'#1e8e3e',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
    '1WD':helper(require('../../../accessories/DreamBallLogos/Wide.png'),"Wide + 1",{height:51,width:48},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
    '1NB':helper(require('../../../accessories/DreamBallLogos/NB.png'),"No Ball + 1",{height:49,width:50},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),  
    '2NB':helper(require('../../../accessories/DreamBallLogos/NB.png'),"1NoBall + 1",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
    '3NB':helper(require('../../../accessories/DreamBallLogos/NB.png'),"1NoBall + 1",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
    '4NB':helper(require('../../../accessories/DreamBallLogos/NB.png'),"1NoBall + 1",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
    '5NB':helper(require('../../../accessories/DreamBallLogos/NB.png'),"1NoBall + 1",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
    '7NB':helper(require('../../../accessories/DreamBallLogos/NB.png'),"1NoBall + 1",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
    'W':helper(require('../../../accessories/DreamBallLogos/W.png'),"Wicket",{height:42,width:42},{backgroundColor:'#d93025',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13}),
  }
  function createOutputArray(inputArray) {
    let outputArray = [];
    let matchingFound = false;
    const transformedArray = [];
    for (const element of inputArray) {
      if (skip.includes(element)) {
        matchingFound = true;
      }
      if (matchingFound) {
        outputArray.push([element,equivalentJSX[element]]);
        if (!skip.includes(element)) {
          transformedArray.push(outputArray)
          matchingFound = false;
          outputArray = [];
        }
      }
      else{
        transformedArray.push([[element,equivalentJSX[element]]])
        matchingFound = false;
      }
    }
    return transformedArray;
  }
  
  const NextButtonTouched = async () => {
    handleClosePress2()
    setLoadingSpinner(true)
    const transformedData = [];
    await firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(uid).get().then((documentSnapshot) => {
      const data = documentSnapshot.data();
      if (data) for (let i = 1; i <= documentSnapshot.data().Count; i++) transformedData.push(data['S' + i]);
    });
    const copy = [];
    scores.map(item=>copy.push(item))
    let cpy2 = copy;
    // # represents 2X  ,  * represents 1.5X
    (cpy2[starBall[0]][starBall[1]])[0] = (cpy2[starBall[0]][starBall[1]])[0]+'#';
    (cpy2[bonusBall[0]][bonusBall[1]])[0] = (cpy2[bonusBall[0]][bonusBall[1]])[0]+'*';
    const outputArray = cpy2.map(innerArray => {
      const newObj = {};
      innerArray.forEach((item, index) => {
        newObj[index] = item[0];
      });
      return newObj;
    });
    
    function arraysAreEqual(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((value, index) => {
        const value1 = typeof value === 'object' ? Object.values(value)[0] : value;
        const value2 = typeof arr2[index] === 'object' ? Object.values(arr2[index])[0] : arr2[index];
        return String(value1) === String(value2);
      });
    }
    const foundMatch = transformedData.findIndex(arr => arraysAreEqual(outputArray, arr));
    if(foundMatch==-1){
      const EditSet = functions().httpsCallable('EditSetMain')
      EditSet({MatchId: MatchId,uid:uid,SetName:SetName,Set: outputArray}).then(() => {
        setLoadingSpinner(false);
        showToast('success','Successfully Edited','The set has been successfully edited.Redirecting...')
        setTimeout(() => navigation.pop(), 2500);
      }).catch(e=>showToast('error','Oops! Something Went Wrong', 'We encountered an error. Please try again later.'))
    }
    else{setLoadingSpinner(false); showToast('error','Duplicate Sets Found!',`The current set matches an existing set S${foundMatch+1}`)}
  }

  useEffect(() => {if(isModalVisible||!isModalVisible) LayoutAnimation.configureNext(customLayoutAnimation)}, [isModalVisible]);
  useEffect(() => {
    let lockedFor;
    const unsubscribe1 = firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(uid).onSnapshot((documentSnapshot) => {
      if(documentSnapshot.exists){
        const indicesHash = documentSnapshot.data()[SetName].flatMap((obj, index) => Object.entries(obj).filter(([_, value]) => value.endsWith('#')).map(([fieldIndex]) => [index, parseInt(fieldIndex)])).flat();
        const indicesStar = documentSnapshot.data()[SetName].flatMap((obj, index) => Object.entries(obj).filter(([_, value]) => value.endsWith('*')).map(([fieldIndex]) => [index, parseInt(fieldIndex)])).flat();
        setStarBall(indicesStar);
        setBonusBall(indicesHash);
        setScores(createOutputArray(documentSnapshot.data()[SetName].flatMap(Object.values).map(value => value.endsWith('#') || value.endsWith('*') ? value.slice(0, -1) : value)))
        const data = documentSnapshot.data();
        let lockedStatus;
        if(data.LockedStatus) lockedStatus = data.LockedStatus.filter((item) => item.Name === SetName);
        lockedFor = lockedStatus?lockedStatus.map((item) => item.LockedFor):[];
        async function a() {
          for (let i = 0; i < lockedFor.length; i++) {
            const documentSnapshot = await firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(lockedFor[i]).get();
            if (documentSnapshot.data().ContestStatus === 'Live') return true;
          }
          return false;
        }
        a().then((result) => {
          if(result==true) LockSet()
        });
      }
      else showToast('error','Oops! Something Went Wrong', 'We encountered an error. Please try again later.')
    });
    const unsubscribe2 = firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').onSnapshot((querySnapshot) => {
      querySnapshot.docChanges().forEach((change) => {
        if (change.type === 'modified' && change.doc.exists) {
          const contestData = change.doc.data();
          if (contestData.ContestStatus === 'Live' && lockedFor.includes(contestData.DocumentId)) {
            LockSet()
          }
        }
      });
    });
    setLoadingSpinner(false);
    return () => {unsubscribe1();unsubscribe2();};
  }, []);

  const LockSet = () => {
    showToast('error','The set is locked.','This contest in which this set is used is live.Swap the set.')
    setTimeout(() => navigation.pop(), 2000);
  }
  
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
    <StatusBar animated={true} backgroundColor="#000000"/>
    <Header_ContestSelection walletIconHide={true} navigation={()=>{navigation.goBack()}} navigation2={()=>{navigation.navigate('WebViewRules')}} TeamCode1={TeamCode1} TeamCode2={TeamCode2} Matchid={MatchId}/>
    <View style={styles.MainDetailsContainer}>
      <View style={styles.TWholeContainer}>
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
      </View>
  
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{flex:1,height:40,marginHorizontal:12,marginTop:34}}>
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
      <Text style={styles.CreateSetText}>Edit</Text>
      <Text style={[styles.CreateSetText,{fontSize:13}]}>Set- {SetName}</Text>
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
                {ind>0 && isFreeHit(index, ind) && <FastImage source={require('../../../accessories/DreamBallLogos/FH.png')} style={{height:12,aspectRatio:500/100,borderTopLeftRadius:5,position:'absolute',top:-5.5,left:-0.5,opacity:1}}/>}
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
          {ScoreOption(require('../../../accessories/DreamBallLogos/001.png'),"0 Run",{height:49,width:24.99},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:6,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"0")}
          {ScoreOption(require('../../../accessories/DreamBallLogos/11.png'),"1 Run",{height:49,width:29},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:8,borderRadius:5,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"1")}
          {ScoreOption(require('../../../accessories/DreamBallLogos/22.png'),"2 Runs",{height:49.5,width:45},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"2")}
          {ScoreOption(require('../../../accessories/DreamBallLogos/Three.png'),"3 Runs",{height:49,width:34.065},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"3")}
          {ScoreOption(require('../../../accessories/DreamBallLogos/44.png'),"4 Runs (Boundary)",{height:49.5,width:49},{backgroundColor:'#1e8e3e',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"4")}
          {ScoreOption(require('../../../accessories/DreamBallLogos/5.png'),"5 Runs",{height:49,width:34.065},{backgroundColor:'#006269',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"5")}
          {ScoreOption(require('../../../accessories/DreamBallLogos/66.png'),"6 runs (Six)",{height:50,width:50},{backgroundColor:'#1e8e3e',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"6")}
          {wideNoBallShown && <>
          {ScoreOption(require('../../../accessories/DreamBallLogos/Wide.png'),"Wide + 1",{height:51,width:48},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"1WD")}
          {ScoreOption(require('../../../accessories/DreamBallLogos/NB.png'),"No Ball + 1",{height:49,width:50},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"1NB")}</>}     
          {wideShown && wideNoBallShown&& <>
          {ScoreOption(require('../../../accessories/DreamBallLogos/NB.png'),"1NoBall + 1",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"2NB")}
          {ScoreOption(require('../../../accessories/DreamBallLogos/NB.png'),"1NoBall + 2",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"3NB")}
          {ScoreOption(require('../../../accessories/DreamBallLogos/NB.png'),"1NoBall + 3",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"4NB")}
          {ScoreOption(require('../../../accessories/DreamBallLogos/NB.png'),"1NoBall + 4",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"5NB")}
          {ScoreOption(require('../../../accessories/DreamBallLogos/NB.png'),"1NoBall + 6",{height:49,width:45},{backgroundColor:'#185ccc',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"7NB")}</>}
          {ScoreOption(require('../../../accessories/DreamBallLogos/W.png'),"Wicket",{height:42,width:42},{backgroundColor:'#d93025',paddingVertical:1.5,paddingHorizontal:7,borderRadius:6,color:'#ffffff',fontFamily:'Poppins-Medium',fontSize:13},"W")}
        </ScrollView>
      </View>
    </Modal>
      
    {/* <Text onPress={()=>{if (allBallsFilled==0)NextButtonTouched()}} style={allBallsFilled==0 ?[styles.NextButtonText,{backgroundColor:'#009e00'}]:styles.NextButtonText}>Next</Text> */}
    <Text onPress={()=>{if (allBallsFilled==0){handlePresentModalPress2();}}} style={allBallsFilled==0 ?[styles.NextButtonText,{backgroundColor:'#009e00'}]:styles.NextButtonText}>Next</Text>

    <BottomSheetModal
      ref={sheetRef2}
      snapPoints={['98%']}
      enablePanDownToClose={true}
      enableOverDrag={true}
      handleStyle={{position:'absolute',alignSelf:'center'}}
      handleIndicatorStyle={{backgroundColor:'#a1a1a1'}}
      backgroundStyle={{borderTopLeftRadius:13,borderTopRightRadius:13}}
      backdropComponent={renderBackdrop}><>
        <View style={{backgroundColor:'#f5f5f5',borderTopLeftRadius:13,borderTopRightRadius:13,paddingTop:20,paddingBottom:12}}>
          <Text style={styles.ChooseText}>Choose your Star and Bonus Score</Text>
          <Text style={[styles.ChooseText,{fontSize:12,fontFamily:'Poppins-Medium'}]}>Star Score gets 2X, Bonus Score gets 1.5X points</Text>
        </View>
        <View style={styles.ChooseHeadingsContainer}>
          <Text style={styles.ChooseHeadings}> SCORE          POINTS</Text>
          <Text style={styles.ChooseHeadings}>STAR     BONUS</Text>
        </View>
        <BottomSheetScrollView style={{ backgroundColor: '#ffffff',paddingHorizontal:12,paddingTop:10 }}>
            {scores.map((n, index) => {
              const renderItems = n.map((item, ind) => {
                const [score, ballName] = item;
                const isSkip = !skip.includes(score);
                return (
                  <View key={ind} style={[styles.PickerContainer2,(ind>0 && isFreeHit(index,ind))?{paddingVertical:5}:{paddingVertical:10}]}>
                  {ind>0 && isFreeHit(index, ind) && <FastImage source={require('../../../accessories/DreamBallLogos/FH.png')} style={{height:12,aspectRatio:500/100,borderTopLeftRadius:5,position:'absolute',top:-5.5,left:-0.5,opacity:1}}/>}
                    <View style={common}>
                      <Text style={[styles.BallNumberingText,{paddingRight:0}]}>{isSkip?index + 1 :''}</Text>
                      <Text style={styles.BallNameText}>{ballName}</Text>
                    </View>
                    <View style={common}>
                      <Text onPress={()=>{if(starBall[0]==index && starBall[1]==ind)setStarBall([]);else if(bonusBall[0]==index && bonusBall[1]==ind){setBonusBall([]);setStarBall([index,ind]);} else setStarBall([index,ind])}} style={[ styles.StarBonusCircle,{borderColor:(starBall[0]==index && starBall[1]==ind)?'#1a1a1a':'#a1a1a1',paddingHorizontal:(starBall[0]==index && starBall[1]==ind)?9:12.5,marginRight:25,color:(starBall[0]==index && starBall[1]==ind)?'#f5f5f5':'#a1a1a1',backgroundColor:(starBall[0]==index && starBall[1]==ind)?'#1a1a1a':'#ffffff'}]}>{(starBall[0]==index && starBall[1]==ind)?'2X':'S'}</Text>
                      <Text onPress={()=>{if(bonusBall[0]==index && bonusBall[1]==ind)setBonusBall([]);else if(starBall[0]==index && starBall[1]==ind){setStarBall([]);setBonusBall([index,ind]);} else setBonusBall([index,ind])}} style={[styles.StarBonusCircle,{borderColor:(bonusBall[0]==index && bonusBall[1]==ind)?'#1a1a1a':'#a1a1a1',paddingHorizontal:(bonusBall[0]==index && bonusBall[1]==ind)?2.4:12.5,color:(bonusBall[0]==index && bonusBall[1]==ind)?'#f5f5f5':'#a1a1a1',backgroundColor:(bonusBall[0]==index && bonusBall[1]==ind)?'#1a1a1a':'#ffffff'}]}>{(bonusBall[0]==index && bonusBall[1]==ind)?'1.5X':'B'}</Text>
                    </View>
                  </View>
                );
              });
              return renderItems;
            })}
        </BottomSheetScrollView>
        <Text onPress={()=>{if (starBall.length===2 && bonusBall.length===2)NextButtonTouched()}} style={(starBall.length===2 && bonusBall.length===2) ?[styles.NextButtonText,{backgroundColor:'#009e00'}]:styles.NextButtonText}>NEXT</Text>
    </></BottomSheetModal>

    {loadingSpinner && <ActivityIndicator 
      hidesWhenStopped={true}
      color="#1141c1"
      size="large"
      animating={true}
      style={styles.ActivityIndicator}
    />}

    </>
  )}

const common = {  flexDirection:'row',
  justifyContent:'space-between',
  alignItems:'center'}
