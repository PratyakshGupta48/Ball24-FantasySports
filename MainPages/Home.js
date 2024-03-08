import {View,Text,StyleSheet,FlatList,Image,TouchableNativeFeedback} from 'react-native';
import {requestPermission} from './FirebaseMessaging';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import React, { useState,useEffect,useCallback} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import Carousel from 'react-native-snap-carousel';
import FastImage from 'react-native-fast-image';
import auth from '@react-native-firebase/auth';
import {height,width} from '../Dimensions';
import SkeletonContent from '../SkeletonPlaceholder';
import { useFocusEffect } from '@react-navigation/native';

export default function Home({navigation}) {
  const isFocused = useIsFocused();
  const uid = auth().currentUser.uid;
  const [refresh,setRefresh] = useState(false);
  const [MatchList,setMatchList] = useState([]);
  const [loadingSpinner,setLoadingSpinner] = useState(true);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));
  
  useFocusEffect(
    useCallback(()=>{
      requestPermission();
      setLoadingSpinner(true)
      const unsubscribe = firestore().collection('AllMatches').onSnapshot(async (querySnapshot) => {
        await delay(200)
        let matchList = [];
        querySnapshot.forEach((documentSnapshot) => {
          if (documentSnapshot.data().Status !== 'Completed')
            matchList.push({
              ...documentSnapshot.data(),
              key: documentSnapshot.id
            });
        });
        setMatchList(matchList);
        setLoadingSpinner(false);
        changeNavigationBarColor('#ffffff')
      });
      return () => unsubscribe;
    },[refresh])
  )

  const data = [
  // {
  //   imglink:require('../accessories/ReferImages/carousell.png'),
  //   onPressLink:()=>{navigation.navigate('ReferAndWin')}
  // },
  {
    imglink:require('../accessories/ReferImages/carousell22.png'),
  }
]

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
    else if(DateComparasion==1){
      return <Text style={styles.timeLabelStyleTomorrow}>Tomorrow</Text>;
    }
    else if(DateComparasion==0){
      const timeDiff = milliseconds - Date.now();
      const minutes = Math.floor((timeDiff / 1000) / 60);
      const hours = Math.floor(minutes / 60);
      if(timeDiff <= 600000){
        return <Text style={styles.timeLabelStyle}>{`${Math.floor(timeDiff / 60000)}m ${Math.floor((timeDiff / 1000) % 60)}s`}</Text>;
      }
      else if(timeDiff > 43200000){
        return <Text style={styles.timeLabelStyleToday}>Today</Text>;
      }
      else if(timeDiff <= 43200000){
        return <Text style={styles.timeLabelStyle}>{`${hours}h ${Math.floor((minutes % 60))}m`}</Text>;
      }
    }
  })

  const CarouselComponent = useCallback(()=><>
    <Carousel data={data} loop={true} autoplayInterval={15000} itemWidth={width} sliderWidth={width} autoplay={isFocused} renderItem={({item})=>(
      <View style={{alignItems:'center',paddingTop:15}}>
        <TouchableNativeFeedback onPress={item.onPressLink}>
          <Image source={item.imglink} style={{width:width-20,height:65,borderRadius:6}} resizeMode='contain'/>
        </TouchableNativeFeedback>
      </View>
    )}/>
    <Text style={styles.UpcomingText}>Upcoming Matches</Text></>,
  [])

  const RenderItem = useCallback(({item}) =>(
    <TouchableNativeFeedback onPress={()=>{navigation.navigate('ContestSelection',{Team1:item.Team1,Team2:item.Team2,TeamCode1:item.TeamCode1,TeamCode2:item.TeamCode2,MatchId:item.MatchId,uid:uid,I1:item.Image1,I2:item.Image2,MatchLink:item.MatchLink})}}>
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
            <FastImage source={{uri:item.Image1,priority: FastImage.priority.normal}} style={styles.TeamLogoOne}/>
            <FastImage source={{uri:item.Image1,priority: FastImage.priority.normal}} style={[styles.TeamLogoOneShadow,{right:48}]}/>
            <Text style={styles.TeamOneCode}>{item.TeamCode1}</Text>
          </View>
          {item.Status=='Upcoming' && <View style={styles.CountdownContainer}>
            <TimeLeftComponent milliseconds={(item.MatchTime).toMillis()}/>
            <GetTime matchEndTime = {(item.MatchTime).toMillis()}/>
          </View>}
          {item.Status=='Live' && <Text style={styles.LiveText}>• Live</Text>}
          <View style={[styles.TeamLogoOneContainer,{marginRight:10,}]}>
            <Text style={styles.TeamOneCode}>{item.TeamCode2}</Text>
            <FastImage source={{uri:item.Image2,priority: FastImage.priority.normal}} style={[styles.TeamLogoOneShadow,{left:48}]}/>
            <FastImage source={{uri:item.Image2,priority: FastImage.priority.normal}} style={styles.TeamLogoOne}/>
          </View>
        </View>
        <View style={styles.Seperator2}></View>
        <View style={styles.ExtraDetailsContainer}>
          <LinearGradient colors={['#ffeee3','#ffffff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{borderTopLeftRadius:9,borderBottomLeftRadius:9,overflow:'hidden',flexDirection:'row',alignItems:'center'}}>
            <Text style={styles.MegaText}>MEGA</Text>
            <View style={styles.WinningMoneyContainer}>
              <Text style={styles.RupeeSymbol}> ₹</Text>
              <Text style={styles.WinningMoneyText}>{item.MegaPrize}</Text>
            </View>
          </LinearGradient>
        </View>
      </View>   
    </TouchableNativeFeedback>
  ), [refresh]);

  return (<>
    <LinearGradient colors={['#a8cfff', '#ffffff']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 0.2 }}>
      <CarouselComponent/>
      {loadingSpinner?<SkeletonContent/>:<FlatList
        data={MatchList}
        onRefresh={()=>{setRefresh(!refresh)}}
        refreshing={false}
        renderItem={RenderItem}         
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={25}
        ListFooterComponent={()=>(<View style={{height:280}}></View>)}
        style={{height:height}}
        removeClippedSubviews={true}
        ItemSeparatorComponent={()=><View style={{height:19}}></View>}
        getItemLayout={(data, index) => ({length: 140.36363220214844 + 19, offset: (140.36363220214844 + 19) * index + 19, index})}
      />}
    </LinearGradient>
  </>
  );
}

const styles=StyleSheet.create({
  MainCardContainer:{
    backgroundColor:'#ffffff',
    marginHorizontal:15,
    borderRadius:12,
    borderWidth:0.5,
    borderColor:'#dedede',
    overflow: 'hidden',
  },
  UpcomingText:{
    color:'#292929',
    fontFamily:'Poppins-SemiBold',
    fontSize:15,
    marginLeft:15,
    paddingTop:17,
    paddingBottom:5
  },
//------------------------------------------------------------
  LeagueNameContainer:{
    alignContent:'center',
    marginBottom:2,
  },
  Seperator:{
    height:0.7,
    backgroundColor:'#c7c7c7',
    marginLeft:'15%',
    marginRight:'15%',
  },
  Seperator2:{
    height:0.8,
    backgroundColor:'#f0f0f0',
  },
  LeagueName:{
    color:'#707070',
    fontFamily:'Poppins-Medium',
    fontSize:12,
    textAlign:'center',
    paddingBottom:2,
    paddingTop:5,
    borderRadius:25
  },
//------------------------------------------------------------
  TeamNameContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginTop:5,
    marginHorizontal:10
  },
  TeamOne:{
    color:'#545454',
    fontFamily:'Poppins-Medium',
    fontSize:12 
  },
//-------------------------------------------------------------
  TeamLogoContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginTop:5,
  },
  TeamLogoOneContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    paddingBottom:10
  },
  TeamLogoOne:{
    height:33,
    width:33,
    zIndex:2
  } ,
  TeamLogoOneShadow:{
    width:55,
    height:55,
    position:'absolute',
    opacity:0.1,
    zIndex:1,
    bottom:0
  },
  TeamOneCode:{
    color:'#121212',
    fontFamily:'Poppins-SemiBold',
    marginHorizontal:10
  },
//-------Countdown Timer------------------------------------------
  CountdownContainer:{
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    paddingBottom:15,
  },
  timeLabelStyle:{
    color:'#1141c1',
    fontSize:12,
    fontFamily:'Poppins-Bold',
    textAlign:'center',
    backgroundColor:'#edf5ff',
    paddingHorizontal:7,
    borderRadius:5
  },
  timeLabelStyleToday:{
    color:'#1141c1',
    fontSize:12,
    fontFamily:'Poppins-SemiBold',
    textAlign:'center',
  },
  timeLabelStyleTomorrow:{
    color:'#4d4d4d',
    fontSize:12,
    fontFamily:'Poppins-SemiBold',
    textAlign:'center',
  },
  TimeLabelBelowStyle:{
    color:'#7a7a7a',
    fontSize:11,
    fontFamily:'Poppins-Medium',
    textAlign:'center',
  },
  //--------Extra Details-------------------------------------------
  ExtraDetailsContainer:{
    flexDirection:'row',
    alignItems:'center',
    height:35,
    borderBottomLeftRadius:12,
    borderBottomRightRadius:12,
    paddingHorizontal:10,
  },
  WinningMoneyContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    marginTop:1.5
  },
  RupeeSymbol:{
    color:'#aa4203',
    alignSelf:'flex-start',
    fontSize:12,
    fontWeight:'700'
  },
  WinningMoneyText:{
    color:'#aa4203',
    fontFamily:'Poppins-SemiBold',
    fontSize:12
  },
  MegaText:{
    color:'#aa4203',
    fontFamily:'Poppins-SemiBold',
    fontSize:12,
    paddingLeft:7
  },
  LiveText:{
    color:'#009e00',
    fontFamily:'Poppins-SemiBold',
    marginBottom:16,
    textAlign:'center',
    backgroundColor:'#eeffed',
    paddingHorizontal:8,
    borderRadius:5
  },
});

// import CoachMarks from 'react-native-coachmarks';

  // const [isFirstTimeLoad, setIsFirstTimeLoad] = useState(false) 


  
  {/* {isFirstTimeLoad && <OnboardFlow
      pages={[
        {
          title: 'Welcome to my app',
          subtitle: 'This is page 1',
          imageUri: 'https://frigade.com/img/example1.png',
        },
        {
          title: 'Page 2 header',
          subtitle: 'This is page 2',
          imageUri: 'https://frigade.com/img/example2.png',
          
        }
      ]}
      type={'fullscreen'}
    />} */}

    
  // useEffect(()=>{
  //   AsyncStorage.getItem('alreadyLaunched').then(value=>{
  //     if(value==null){
  //       AsyncStorage.setItem('alreadyLaunched','true');
  //       setIsFirstTimeLoad(true)
  //     }
  //     else setIsFirstTimeLoad(false)
  //   })
  // },[])


  // {isFirstTimeLoad && <CoachMarks
  //   numberOfSteps={CM.length}
  //   coachMarks={CM}
  //   congratsText={"Congratulations! on starting your journey with Ball24.\n"+"You get first contest Free!"}
  //   startButtonText={"Next"}
  //   skipButtonText={"Skip Tutorial"}
  //   congratsImage={require('../accessories/DreamBallLogos/congi.png')}
  //   visible={true}
  //   onClose={async () => {await AsyncStorage.setItem('isFirstTimeOpen', 'false')}}
  // />} 

  // const CM = [
  //   {
  //     tooltip: 'You can view your participated contests from My Matches',
  //     position: {
  //       top:height - 90,
  //       left: (width/4)+10,
  //     },
  //     tooltipPosition: {
  //       width: 300,
  //       height: 120,
  //       top: height - 300,
  //       left: (width - 300) / 2,
  //     },
  //     style: {
  //       width: 70,
  //       height: 70,
  //       borderRadius: 30,
  //     },
  //   },
  //   {
  //     tooltip: 'You can manage your money from Wallet',
  //     position: {
  //       top:height - 90,
  //       left: ((width*2)/4)+10,
  //     },
  //     tooltipPosition: {
  //       width: 300,
  //       height: 120,
  //       top: height - 400,
  //       left: (width - 300) / 2,
  //     },
  //     style: {
  //       width: 70,
  //       height: 70,
  //       borderRadius: 30,
  //     },
  //   },
  //   {
  //     tooltip: 'You can visit your profile from here',
  //     position: {
  //       top:0,
  //       left: 0,
  //     },
  //     tooltipPosition: {
  //       width: 300,
  //       height: 120,
  //       top: height - 550,
  //       left: (width - 300) / 2,
  //     },
  //     style: {
  //       width: 60,
  //       height: 60,
  //       borderRadius: 20,
  //     },
  // },];