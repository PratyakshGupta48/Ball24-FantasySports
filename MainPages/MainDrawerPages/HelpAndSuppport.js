import { StyleSheet, Text, View, StatusBar,Linking} from 'react-native'
import React from 'react'
import HeaderBlank from '../../Headers/HeaderBlank';
import Icon from 'react-native-vector-icons/FontAwesome';
import email from 'react-native-email'

export default function HelpAndSuppport({navigation}) {
  const handleEmail = () => {
    const to = ['support@ball24.in'] 
    email(to, {
      subject: '',
      body: '',
      checkCanOpen: false 
    })
  }

  return (<>
  <StatusBar animated={true} backgroundColor="#000000"/>
  <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'Help & Support'} color='#1a1a1a'/>
  <View style={styles.WholeMainContainer}>
    <View style={styles.MainCardContainer} elevation={3}>
      <Text style={styles.ContactUsText}>CONTACT US :</Text>
        <Text style={styles.EmailUsText} onPress={handleEmail}>Email Us</Text>
        <Text style={[styles.YouCanText,{paddingTop:10}]}>support@ball24.in{'\n'}</Text>
        {/* <Text style={[styles.YouCanText,{paddingTop:5}]}>Address: Ball24 Main Unit {'\n'} Laxman Chowk,Park Road {'\n'} Dehradun,Uttarakhand-248001</Text> */}
        <Text style={[styles.YouCanText,{marginTop:37}]}>You can also message us your query on our social media handles</Text>
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
  WholeMainContainer:{
    backgroundColor:'#ffffff',
    flex:1
  },
  MainCardContainer:{
    backgroundColor:'#ffffff',
    marginHorizontal:12,
    marginTop:20,
    marginBottom:20,
    paddingTop:15,
    paddingHorizontal:15,
    borderRadius:10,
    paddingBottom:15
  },
  ContactUsText:{
    color:'#000000',
    fontFamily:'Poppins-Bold',
    fontSize:24,
    letterSpacing:-0.5
  },
  EmailUsText:{
    backgroundColor:"#1141c1",
    color:"#ffffff",
    fontFamily:'Poppins-SemiBold',
    fontSize:18,
    textAlign:'center',
    paddingVertical:10,
    paddingHorizontal:17,
    borderRadius:5,
    marginTop:15,
    width:115,
    alignSelf:'center'
  },
  YouCanText:{
    color:'#636363',
    textAlign:'center',
    fontFamily:'Poppins-Medium',
    fontSize:12
  },
  MainIconContainer:{
    flexDirection:'column',
    justifyContent:'space-between',
    marginTop:20
  },
  IconContainerSmall:{
    flexDirection:'row',
    justifyContent:'space-evenly',
    marginBottom:20
  },
})