import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar, Dimensions, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import CodePush from 'react-native-code-push'; 
import LinearGradient from 'react-native-linear-gradient';
import Carousel,{Pagination} from 'react-native-snap-carousel';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

const { width, height } = Dimensions.get('window');

function RegOrLog({ navigation }) {

  const [firstLaunch, setFirstLaunch] = useState(false);
  const [activeSlide,setActiveState] = useState(0);

  useEffect(() => {
    changeNavigationBarColor('#000000');
    const user = auth().currentUser;
    if(!user || user.displayName===null) setFirstLaunch(true);
    else setTimeout(() => {
      const uid = user.uid;
      navigation.replace('MainStackNavigation', {screen: 'Drawer',params: {creen: 'MainTab',params: {screen: 'Home',params: { uid }}}});
    }, 700);
  }, []);

  const handleNavigation = (clickedValue) => navigation.navigate('Authentication', { ClickedValue: clickedValue });
  
  const data1 = [
    {JSX:(
      <View style={styles.CarouselContainer}>
        <Image source={require('../accessories/DreamBallLogos/mainm.png')} style={{width:'100%',height:undefined,aspectRatio:833/645,alignSelf:'center',marginTop:'15%'}} />
        <View style={styles.WelcomeTextContainer}>
          <Text style={styles.Exp11Text}>Welcome to Ball24</Text>
          <Text style={styles.Exp22Text}>Ready to start winning? Your one-stop destination for fantasy & online gaming.</Text>
        </View>
      </View>
    )},
    {JSX:(
      <View style={styles.CarouselContainer}>
        <View style={{width:'100%'}}>
          <Image source={require('../accessories/DreamBallLogos/smartmock1.png')} style={{width:'50%',height:undefined,aspectRatio:1174/1935,alignSelf:'center',marginTop:'15%'}} />
          <LinearGradient colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']} style={styles.gradient}/>
        </View>
        <View style={styles.WelcomeTextContainer}>
          <Text style={styles.Exp11Text}>LIVE Predictions</Text>
          <Text style={styles.Exp22Text}>Predict the scores of upcoming overs while you watch the match and enjoy big winnings.</Text>
        </View>
      </View>
    )},
  ]

  return (<>
    <StatusBar animated={true} backgroundColor="#02091b" />
    <ImageBackground source={require('../accessories/DreamBallLogos/newbanner3.png')} resizeMode="cover" style={styles.BackgroundImage}>
      <Image source={require('../accessories/DreamBallLogos/azxcv.png')} style={styles.OnboardingLogo} />
      {firstLaunch && <><Carousel data={data1} renderItem={({item})=>item.JSX} itemWidth={width} sliderWidth={width} onSnapToItem={(index) => setActiveState(index ) }/>
      <View style={styles.RegOrLogContainer}>
        <Pagination dotsLength={data1.length} activeDotIndex={activeSlide} containerStyle={{paddingVertical:0,paddingBottom:15}} dotStyle={{width: 16,height: 4,borderRadius: 5,marginHorizontal: -5,backgroundColor: 'rgba(255, 255, 255, 0.92)'}} inactiveDotStyle={{width:10,height:10}}/>
        <View style={styles.RegOrLogInsideContainer}>
          <Text style={styles.registerText} onPress={() => handleNavigation('REGISTER')}>REGISTER</Text>
          <View style={styles.LoginContainer}>
            <Text style={styles.AlreadyUsertextText}>Already User?  </Text>
            <Text style={styles.LoginText} onPress={() => handleNavigation('LOGIN')}>LOGIN</Text>
          </View>
        </View>
      </View></>}
      {!firstLaunch && <>
        <View style={styles.CarouselContainer2}>
          <Image source={require('../accessories/DreamBallLogos/mainm.png')} style={{width:'100%',height:undefined,aspectRatio:833/645,alignSelf:'center',marginTop:'15%'}} />
          <View style={styles.ExperienceContainer}>
            <Text style={styles.Exp1Text}>EXPERIENCE THE THRILL</Text>  
            <Text style={[styles.Exp1Text,{fontSize:40}]}>OF CRICKET</Text>  
          </View>
        </View>
      </>}
    </ImageBackground></>
  )
}

export default CodePush(RegOrLog);

const styles = StyleSheet.create({
  BackgroundImage:{
    flex:1,
    justifyContent:'space-between'
  },
  registerText:{
    color:'#121212',
    paddingVertical:6,
    backgroundColor:'#ffffff',
    fontFamily:'Poppins-SemiBold',
    fontSize:16,
    marginBottom:13,
    width:'92%',
    textAlign:'center',
    borderRadius:3
  },
  LoginContainer:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  AlreadyUsertextText:{
    color:'#cacaca',
    fontSize:14,
    fontFamily:'Poppins-Regular',
  },
  LoginText:{
    color:'#ffffff',
    fontSize:15,
    fontFamily:'Poppins-Medium'
  },
  OnboardingLogo:{        
    width:'57%',
    height:undefined,
    aspectRatio:938/204,
    alignSelf:'center',
    marginTop:35,
  },
  RegOrLogContainer:{
    flexDirection:'column',
    justifyContent:'space-between',
    alignItems:'center',
    height:height/4,
    width:'100%',
    backgroundColor:'#000000', 
  },
  RegOrLogInsideContainer:{
    width:'100%',
    alignItems:'center',
    paddingBottom:30
  },
  CarouselContainer:{
    flexDirection:'column',
    justifyContent:'flex-start',
    alignItems:'center',
    height:height/1.55,
    paddingTop:8
  },
  CarouselContainer2:{
    flexDirection:'column',
    justifyContent:'flex-start',
    alignItems:'center',
    height:height/1.2,
  },
  WelcomeTextContainer:{
    backgroundColor:'#000000',
    height:height/5,
    width:'100%',
    paddingHorizontal:21,
    paddingTop:10,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%', 
  },
  ExperienceContainer:{
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    zIndex:10,
    width:'100%',
    height:height/4,
    backgroundColor:'#000000',
  },
  Exp1Text:{
    color:'#ebebeb',
    textTransform:'uppercase',
    fontFamily:'Poppins-Bold',
    fontSize:26,
    textShadowColor:'pink',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  Exp11Text:{
    color:'#ebebeb',
    fontFamily:'Poppins-Bold',
    fontSize:25,
    alignSelf:'center',
    marginBottom:8
  },
  Exp22Text:{
    color:'#cacaca',
    fontFamily:'Poppins-Regular',
    fontSize:14,
    alignSelf:'center',
    textAlign:'center',
  }
})