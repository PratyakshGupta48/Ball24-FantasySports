import { StyleSheet, Text, View, StatusBar, ScrollView} from 'react-native'
import React from 'react'
import HeaderBlank from '../../Headers/HeaderBlank';
import {height, width} from '../../Dimensions';
// import Image from 'react-native-scalable-image';

export default function HowToPlay({navigation}) {
  return (
    <>
      <StatusBar animated={true} backgroundColor="#000000"/>

      <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'How To Play '} color='#1a1a1a'/>

      <ScrollView>
        <View style={styles.MainWholeContainer}>

          <View style={styles.WholeStep1Container}>
            <View style={styles.Step1TextContainer}>
              <Text style={styles.Step1Text}>Select A Match</Text>
            </View>
            <View style={styles.Step3ImageContainer}>
            {/* <Image style={styles.Step1Image} width={width-50} source={require('../../accessories/HowToPlay/S.jpg')} resizeMode='center'></Image> */}
            </View>
            <View style={styles.Step1DetailsContainer}>
              <Text style={styles.Step1DetailsText}>Choose an upcoming match that you want to play</Text>
            </View>
          </View>

          <View style={styles.WholeStep1Container}>
            <View style={styles.Step2TextContainer}>
              <Text style={styles.Step1Text}>Join Contests</Text>
            </View>
            <View style={styles.Step3ImageContainer}>
            {/* <Image style={styles.Step2Image} width={width-50} source={require('../../accessories/HowToPlay/S1.jpg')} resizeMode='center'></Image> */}
            </View>
            <View style={styles.Step1DetailsContainer}>
              <Text style={styles.Step1DetailsText}>Choose between different contests and compete</Text>
            </View>
          </View>

          <View style={styles.WholeStep1Container}>
            <View style={styles.Step3TextContainer}>
              <Text style={styles.Step1Text}>Create Set</Text>
            </View>
            <View style={styles.Step3ImageContainer}>
            {/* <Image style={styles.Step3Image} width={width-80} source={require('../../accessories/HowToPlay/Screenshot_20221203_171241.png')}></Image> */}
            </View>
            <View style={styles.Step3DetailsContainer}>
              <Text style={styles.Step1DetailsText}>Use your skills to pick the right scores</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  MainWholeContainer:{
    flexDirection:'column',
    justifyContent:'space-evenly',
    alignItems:'center',
    backgroundColor:'#ffffff',
    flex:1,
  },
  WholeStep1Container:{
    width:width,
    flexDirection:'column',
    marginTop:15 
  },
  Step1TextContainer:{
    alignItems:'center'
  },
  Step1Text:{
    color:'#121212',
    fontFamily:'Poppins-Bold',
    fontSize:22
  },
  Step1Image:{
    borderRadius:10
  },
  Step1DetailsContainer:{
    alignItems:'center',
    marginHorizontal:14,
  },
  Step1DetailsText:{
    color:'#969696',
    fontFamily:'Poppins-Medium',
    textAlign:'center',
    paddingTop:13
  },
  Step2TextContainer:{
    alignItems:'center',
    marginTop:15
  },
  Step2Image:{
    width:width,
  },
  Step3TextContainer:{
    alignItems:'center',
    marginTop:15
  },
  Step3ImageContainer:{
    alignItems:'center',
    width:width
  },
  Step3Image:{
    marginTop:10,
    borderColor:"#121212",
    borderWidth:0.4,
    borderRadius:10,
    marginBottom:10
  },
  Step3DetailsContainer:{
    alignItems:'center',
    marginHorizontal:14,
    marginBottom:20,
  },
})