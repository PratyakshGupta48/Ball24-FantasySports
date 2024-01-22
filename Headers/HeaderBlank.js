import { StyleSheet, Text, View, StatusBar } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function HeaderBlank({navigation,Heading,color}) {
  return (<>
    <StatusBar animated={true} backgroundColor={color}/>
    <View style={[styles.MainHeaderContainer,{backgroundColor:color}]}> 
      <Icon name='arrow-back' size={20} color="#fafbff" onPress={navigation}/>
      <Text style={styles.HeadingText}>{Heading}</Text>
    </View>
  </>)
}

const styles = StyleSheet.create({
  MainHeaderContainer:{
    height:52,
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center',
    paddingLeft:18
  },
  HeadingText:{
    color:'#fafbff',
    fontFamily:'Poppins-Medium',
    fontSize:14,
    marginLeft:15,
    marginTop:2
  }
})
