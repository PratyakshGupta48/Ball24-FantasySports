import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Header_PhoneNumberEnter({navigation,showValue,display}) {
  return ( 
    <View style={[styles.MainHeaderContainer]}>
      <Icon name='arrow-back' size={25} color="#ffffff" onPress={navigation}/>
      <Text style={styles.Heading}>{showValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
MainHeaderContainer:{
  flexDirection:'row',
  alignItems:'center',
  backgroundColor:'#1141c1',
  height:50,
  paddingLeft:18
},
Heading:{
  color:'white',
  fontSize:15,
  fontFamily:'Poppins-Medium',
  marginLeft:13,
  marginTop:2
}
})