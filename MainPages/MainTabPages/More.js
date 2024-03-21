import React from 'react';
import {View,Text,TouchableWithoutFeedback,StyleSheet,StatusBar,ScrollView,Linking} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderBlank from '../../Headers/HeaderBlank';

export default function More({navigation}) {
  return (<>
  <StatusBar animated={true} backgroundColor="#000000"/>
  <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'More'} color='#1a1a1a'/>
  <ScrollView style={styles.MainWholeContainer}>
    <TouchableWithoutFeedback onPress={()=>{navigation.navigate('HowToPlay')}}>
      <View style={styles.AboutUscardContainer} elevation={3}>
        <Icon name='gamepad-variant-outline' size={25} color='#121212' style={styles.iicon}/>
        <Text style={styles.AboutUsText}>How To play</Text>
      </View>
    </TouchableWithoutFeedback>
    {/* <TouchableWithoutFeedback onPress={()=>{navigation.navigate('Fantasy Point System')}}>
      <View style={styles.AboutUscardContainer} elevation={3}>
        <Icon name='scoreboard-outline' size={25} color='#121212' style={styles.iicon}/>
        <Text style={styles.AboutUsText}>Rules & Scoring</Text>
      </View>
    </TouchableWithoutFeedback> */}
    <TouchableWithoutFeedback onPress={() => Linking.openURL('https://ball24.in/pages/about-us')}>
      <View style={styles.AboutUscardContainer} elevation={3}>
        <Icon name='information-outline' size={25} color='#121212' style={styles.iicon}/>
        <Text style={styles.AboutUsText}>About Us</Text>
      </View>
    </TouchableWithoutFeedback>
    <TouchableWithoutFeedback onPress={() => Linking.openURL('https://ball24.in/pages/terms-conditions')}>
      <View style={styles.AboutUscardContainer} elevation={3}>
        <Icon name='file-document-outline' size={25} color='#121212' style={styles.iicon}/>
        <Text style={styles.AboutUsText}>Terms & Conditions</Text>
      </View>
    </TouchableWithoutFeedback>
    <TouchableWithoutFeedback onPress={() => Linking.openURL('https://ball24.in/pages/privacy-policy')}>
      <View style={styles.AboutUscardContainer} elevation={3}>
        <Icon name='paperclip' size={25} color='#121212' style={styles.iicon}/>
        <Text style={styles.AboutUsText}>Privacy Policy</Text>
      </View>
    </TouchableWithoutFeedback>
    <TouchableWithoutFeedback onPress={() => Linking.openURL('https://ball24.in/pages/withdrawal-policies')}>
      <View style={styles.AboutUscardContainer} elevation={3}>
        <Icon name='reload' size={25} color='#121212' style={styles.iicon}/>
        <Text style={styles.AboutUsText}>Withdrawal Policy</Text>
      </View>
    </TouchableWithoutFeedback>
    <TouchableWithoutFeedback onPress={() => Linking.openURL('https://ball24.in/pages/responsible-gaming')}>
      <View style={styles.AboutUscardContainer} elevation={3}>
        <Icon name='scale-balance' size={25} color='#121212' style={styles.iicon}/>
        <Text style={styles.AboutUsText}>Responsible Gaming</Text>
      </View>
    </TouchableWithoutFeedback>
  </ScrollView>
  </>)
}

const styles = StyleSheet.create({
  MainWholeContainer:{
    backgroundColor:'#ffffff',
    flex:1
  },
  AboutUscardContainer:{
    marginTop:10,
    backgroundColor:'#ffffff',
    marginBottom:10,
    marginHorizontal:12,
    paddingVertical:7,
    borderRadius:7,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  AboutUsText:{
    color:'#121212',
    fontFamily:'Poppins-Medium',
    fontSize:14,
    textAlign:'center',
    marginLeft:12
  },
})