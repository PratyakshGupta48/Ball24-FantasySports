import { StyleSheet, Text, View, StatusBar, Image, Button } from 'react-native'
import React from 'react'
import HeaderBlank from '../Headers/HeaderBlank'
import { width} from '../Dimensions'

export default function Notification({navigation}) {

  return (
    <>
    <StatusBar animated={true} backgroundColor="#000000"/>
    <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'Notifications '}/>
    
    <View style={styles.NoNewNotContainer}>
        <Image source={require('../accessories/DreamBallLogos/Notifications.png')} style={styles.NoNotificationImage} />    
        <Text style={styles.NoNotificationText}>There are currently no new notifications.</Text>
    </View>
    </>
  )
}

const styles = StyleSheet.create({
    NoNewNotContainer:{
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
    },
    NoNotificationImage:{
        width:width*0.7,
        height:width*0.6,
        marginTop:30
    },
    NoNotificationText:{
        color:'#121212',
        fontFamily:'Poppins-Medium',
        marginHorizontal:10,
        textAlign:'center',
        marginTop:35,
        fontSize:15
    }
})