import React from 'react';
import {View,Text,ScrollView,StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {width} from '../Dimensions';
import FastImage from 'react-native-fast-image';

const BottomSheetInfo = () => (
  <ScrollView>
  <View style={styles.BSImageSet1}>
    <View style={styles.BSExampleHeadingContainer1}>
      <Text style={styles.BSExampleHeading1}>Tutorial : </Text>
    </View>
    <View style={styles.BSImageSet11}>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage}/>
        <Icon name='numeric-1' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/4.png')} style={styles.BSImage}/>
        <Icon name='numeric-2' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/6.png')} style={styles.BSImage}/>
        <Icon name='numeric-3' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/Wd.png')} style={styles.BSImage}/>
        <Icon name='numeric-4' size={23} color='#ec1c24'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/3.png')} style={styles.BSImage}/>
        <Icon name='numeric-5' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/Wkt.png')} style={styles.BSImage}/>
        <Icon name='numeric-6' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage}/>
        <Icon name='numeric-7' size={23} color='#9d9d9e'/>
      </View>
    </View>
    <View style={styles.BSArrow}><Icon name='arrow-down-thin' size={30} color='#454545'/></View>
    <View style={styles.BSImageSet12}>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage}/>
        <Icon name='numeric-1' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/4.png')} style={styles.BSImage}/>
        <Icon name='numeric-2' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/6.png')} style={styles.BSImage}/>
        <Icon name='numeric-3' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/3.png')} style={styles.BSImage}/>
        <Icon name='numeric-4' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/Wkt.png')} style={styles.BSImage}/>
        <Icon name='numeric-5' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage}/>
        <Icon name='numeric-6' size={23} color='#9d9d9e'/>
      </View>
    </View>
    <View style={styles.BSDescriptionContainer1}>
      <Text style={styles.BSDescriptionText1}>If wide ball,no ball,dead ball,or any other such condition happen,then that ball is ignored and the ball bowled in place of it will be considered,effectively making a set of total 6 balls.</Text>
    </View>
  </View>
  <View style={styles.BSLine}></View>  
  <View style={styles.BSImageSet1}>
    <View style={styles.BSExampleHeadingContainer}>
      <Text style={styles.BSExampleHeading}>Example 2:</Text>
    </View>
    <View style={styles.BSImageSet11}>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage2}/>
        <Icon name='numeric-1' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/4.png')} style={styles.BSImage2}/>
        <Icon name='numeric-2' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/Wd.png')} style={styles.BSImage2}/>
        <Icon name='numeric-3' size={23} color='#ec1c24'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/3.png')} style={styles.BSImage2}/>
        <Icon name='numeric-4' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/Wkt.png')} style={styles.BSImage2}/>
        <Icon name='numeric-5' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage2}/>
        <Icon name='numeric-6' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/NB.png')} style={styles.BSImage2}/>
        <Icon name='numeric-7' size={23} color='#ec1c24'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage2}/>
        <Icon name='numeric-8' size={23} color='#9d9d9e'/>
      </View>
    </View>
    <View style={styles.BSArrow}><Icon name='arrow-down-thin' size={30} color='#454545'/></View>
    <View style={styles.BSImageSet12}>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage2}/>
        <Icon name='numeric-1' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/4.png')} style={styles.BSImage2}/>
        <Icon name='numeric-2' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/3.png')} style={styles.BSImage2}/>
        <Icon name='numeric-3' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/Wkt.png')} style={styles.BSImage2}/>
        <Icon name='numeric-4' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage2}/>
        <Icon name='numeric-5' size={23} color='#9d9d9e'/>
      </View>
      <View style={styles.BSImageNumContainer}>
        <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage2}/>
        <Icon name='numeric-6' size={23} color='#9d9d9e'/>
      </View>
    </View>
  </View>
  </ScrollView>
  )


export default BottomSheetInfo

const styles = StyleSheet.create({
    BSImageSet1:{
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        zIndex:100
      },
      BSExampleHeadingContainer:{
        width:width,
        marginLeft:25,
        marginBottom:10
      },
      BSExampleHeadingContainer1:{
        width:width,
        marginBottom:10
      },
      BSExampleHeading:{
        color:'#292929',
        fontFamily:'Poppins-Medium'
      },
      BSExampleHeading1:{
        textAlign:'center',
        color:'#292929',
        fontFamily:'Poppins-Medium'
      },
      BSImageSet11:{
        flexDirection:'row',
        justifyContent:'center',
        width:'100%',
      },
      BSImageNumContainer:{
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        marginRight:(width-((width*7)/10))/11
      },
      BSImage:{
        width:width/10,
        height:width/10
      },
      BSImageSet12:{
        flexDirection:'row',
        justifyContent:'center',
        width:'100%'
      },
      BSDescriptionContainer1:{
        marginHorizontal:8,
        marginTop:5
      },
      BSDescriptionText1:{
        color:'#121212',
        fontFamily:'Poppins-Regular',
        fontSize:12,
        textAlign:'center'
      },
      BSLine:{
        backgroundColor:'#dbdbdb',
        height:0.5,
        width:width-20,
        alignSelf:'center'
      },
      BSImage2:{
        width:width/11,
        height:width/11
      }
})