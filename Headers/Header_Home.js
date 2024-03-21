import React from 'react';
import {StyleSheet,Image,StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

export default function Header_Home ({navigation,navigation2}) {
  return (<>
    <LinearGradient colors={['#1141c1', '#002487']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.container}>
      <Icon name='menu' size={25} color="white" style={{marginLeft:10}} onPress={navigation}/>
      <Image source={require('../accessories/DreamBallLogos/ball24.png')} resizeMode='center' style={{width:150}}></Image>
      <Icon name='notifications' size={25} color='white' style={{marginRight:10}} onPress={navigation2}/>
    </LinearGradient></>
  )
}

const styles = StyleSheet.create({
  container:{
    height:65,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
})