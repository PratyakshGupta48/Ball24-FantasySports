import { StyleSheet, Text, View, StatusBar,Linking } from 'react-native';
import React from 'react';
import HeaderBlank from '../../Headers/HeaderBlank';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function FollowUs({navigation}) {
  return (<>
    <StatusBar animated={true} backgroundColor="#000000"/>
    <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'Follow us on social media '}/>
    <View style={styles.MainWholeContainer}>
      <View style={styles.MainCardContainer} elevation={3}>
        <Text style={styles.HeadingText}>Follow us on social media</Text>
        <View style={styles.MainIconContainer}>
          <View style={styles.IconContainerSmall}>
            <Icon name='facebook-square' color='#737373' size={35} onPress = {() => {Linking.openURL('https://www.facebook.com/ball24in')}}/>
            <Icon name='twitter' color='#737373' size={35} onPress = {() => {Linking.openURL('https://twitter.com/Ball24_in')}}/>
            <Icon name='linkedin-square' color='#737373' size={35} onPress = {() => {Linking.openURL('https://www.linkedin.com/company/ball24/')}}/>              
          </View>
          <View style={styles.IconContainerSmall}>
            <Icon name='youtube-play' color='#737373' size={35} onPress = {() => {Linking.openURL('https://www.youtube.com/@ball24-in')}}/>
            <Icon name='instagram' color='#737373' size={35} onPress = {() => {Linking.openURL('https://www.instagram.com/ball24_in/')}}/>
            <Icon name='telegram' color='#737373' size={35} onPress = {() => {Linking.openURL('https://t.me/ball24_in')}}/>           
          </View>
        </View>
      </View>
    </View>
  </>)
}

const styles = StyleSheet.create({
  MainWholeContainer:{
    backgroundColor:'#ffffff',
    flex:1
  },
  MainCardContainer:{
    backgroundColor:'#ffffff',
    marginHorizontal:18,
    marginTop:20,
    marginBottom:20,
    borderRadius:10
  },
  MainIconContainer:{
    flexDirection:'column',
    justifyContent:'space-between',
  },
  IconContainerSmall:{
    flexDirection:'row',
    justifyContent:'space-evenly',
    marginBottom:20
  },
  HeadingText:{
    color:'#121212',
    textAlign:'center',
    fontFamily:'Poppins-Medium',
    fontSize:16,
    marginTop:15,
    marginBottom:20
  },
})