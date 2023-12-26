import { StyleSheet, Text, View ,ScrollView} from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image';
import { width,height } from '../Dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


export default function Info() {
  return (
<>
    <View style={styles.MainWholeContainer}>
      <ScrollView>
        <View style={styles.MainSmallContainer} elevation={3}>
          
          <View style={styles.RightGuessTextContainer}>
            <Text style={styles.RightGuessText}>Right Predictions :</Text>
          </View>
          
          <View style={styles.LineI}></View>

          <View style={styles.RightPredictionTable}>
            <View style={styles.Row1}>
              <View style={styles.Row1Element1Container}><Text style={styles.Row1Element1Text}>0 run</Text></View>
              <View style={styles.Row1Element2Container}><Text style={styles.Row1Element2Text}>+10</Text></View>
            </View>
            <View style={styles.Row2}>
              <View style={styles.Row1Element1Container}><Text style={styles.Row1Element1Text}>1 run</Text></View>
              <View style={styles.Row1Element2Container}><Text style={styles.Row1Element2Text}>+11</Text></View>
            </View>
            <View style={styles.Row1}>
              <View style={styles.Row1Element1Container}><Text style={styles.Row1Element1Text}>2 runs</Text></View>
              <View style={styles.Row1Element2Container}><Text style={styles.Row1Element2Text}>+13</Text></View>
            </View>
            <View style={styles.Row2}>
              <View style={styles.Row1Element1Container}><Text style={styles.Row1Element1Text}>3 runs</Text></View>
              <View style={styles.Row1Element2Container}><Text style={styles.Row1Element2Text}>+15</Text></View>
            </View>
            <View style={styles.Row1}>
              <View style={styles.Row1Element1Container}><Text style={styles.Row1Element1Text}>4 runs</Text></View>
              <View style={styles.Row1Element2Container}><Text style={styles.Row1Element2Text}>+20</Text></View>
            </View>
            <View style={styles.Row2}>
              <View style={styles.Row1Element1Container}><Text style={styles.Row1Element1Text}>6 runs</Text></View>
              <View style={styles.Row1Element2Container}><Text style={styles.Row1Element2Text}>+25</Text></View>
            </View>
            <View style={styles.Row1}>
              <View style={styles.Row1Element1Container}><Text style={styles.Row1Element1Text}>Wicket</Text></View>
              <View style={styles.Row1Element2Container}><Text style={styles.Row1Element2Text}>+30</Text></View>
            </View>
          </View>  

          <View style={styles.LineI}></View>

          <View style={styles.ExtraDetailsContainerI}>
            {/* Concept details====================================================================================================== */}

            <View style={styles.BSImageSet1}>
            <View style={styles.BSExampleHeadingContainer}>
              <Text style={styles.BSExampleHeading}>Example 1 :</Text>
            </View>
            <View style={styles.BSImageSet11}>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage}/>
                <Icon name='numeric-1' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/4.png')} style={styles.BSImage}/>
                <Icon name='numeric-2' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/6.png')} style={styles.BSImage}/>
                <Icon name='numeric-3' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/Wd.png')} style={styles.BSImage}/>
                <Icon name='numeric-4' size={23} color='#ec1c24' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/3.png')} style={styles.BSImage}/>
                <Icon name='numeric-5' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/Wkt.png')} style={styles.BSImage}/>
                <Icon name='numeric-6' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage}/>
                <Icon name='numeric-7' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
            </View>
            <View style={styles.BSArrow}><Icon name='arrow-down-thin' size={30} color='#454545'/></View>
            <View style={styles.BSImageSet12}>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage}/>
                <Icon name='numeric-1' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/4.png')} style={styles.BSImage}/>
                <Icon name='numeric-2' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/6.png')} style={styles.BSImage}/>
                <Icon name='numeric-3' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/3.png')} style={styles.BSImage}/>
                <Icon name='numeric-4' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/Wkt.png')} style={styles.BSImage}/>
                <Icon name='numeric-5' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage}/>
                <Icon name='numeric-6' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
            </View>
            <View style={styles.BSDescriptionContainer1}>
              <Text style={styles.BSDescriptionText1}>◉ If wide ball,no ball,dead ball,or any other such condition happen,then that ball is ignored and the ball bowled in place of it will be considered,effectively making a set of total 6 balls.</Text>
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
                <Icon name='numeric-1' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/4.png')} style={styles.BSImage2}/>
                <Icon name='numeric-2' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/Wd.png')} style={styles.BSImage2}/>
                <Icon name='numeric-3' size={23} color='#ec1c24' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/3.png')} style={styles.BSImage2}/>
                <Icon name='numeric-4' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/Wkt.png')} style={styles.BSImage2}/>
                <Icon name='numeric-5' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage2}/>
                <Icon name='numeric-6' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/NB.png')} style={styles.BSImage2}/>
                <Icon name='numeric-7' size={23} color='#ec1c24' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage2}/>
                <Icon name='numeric-8' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
            </View>
            <View style={styles.BSArrow}><Icon name='arrow-down-thin' size={30} color='#454545'/></View>
            <View style={styles.BSImageSet12}>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage2}/>
                <Icon name='numeric-1' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/4.png')} style={styles.BSImage2}/>
                <Icon name='numeric-2' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/3.png')} style={styles.BSImage2}/>
                <Icon name='numeric-3' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/Wkt.png')} style={styles.BSImage2}/>
                <Icon name='numeric-4' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage2}/>
                <Icon name='numeric-5' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
              <View style={styles.BSImageNumContainer}>
                <FastImage source={require('../accessories/HowToPlay/2.png')} style={styles.BSImage2}/>
                <Icon name='numeric-6' size={23} color='#9d9d9e' style={styles.BSNumbers}/>
              </View>
            </View>
        </View>

            {/* Concept details====================================================================================================== */}
            {/* <Text style={styles.ExtraDetailI}>◉ Only Legal Deliveries scores will be counted; For example,if there is a no ball balled,then the next legal delivery score will be counted eventually making a set of 6 legal deliveries.</Text> */}
          </View>

          <View style={styles.LineI}></View>
          
          <View style={styles.RightGuessTextContainer}>
            <Text style={styles.RightGuessText}>Wrong Predictions :</Text>
          </View>
          
          <View style={styles.LineI}></View>

          <View style={styles.ExtraDetailsContainerI}>
            <Text style={styles.ExtraDetailI}>◉ No points are deducted or awarded for any wrong Predictions</Text>
          </View>
          
        </View>
      </ScrollView>
    </View>
            </>
  )
}

const styles = StyleSheet.create({
    MainWholeContainer:{
        backgroundColor:'#ffffff',
        flex:1
      },
      MainSmallContainer:{
        backgroundColor:'#ffffff',
        marginHorizontal:18,
        marginTop:20,
        marginBottom:20,
        borderRadius:10
      },
      RightGuessTextContainer:{
        marginLeft:12,
        paddingVertical:3
      },
      RightGuessText:{
        color:'#121212',
        fontFamily:'Poppins-SemiBold',
        fontSize:17
      },
      LineI:{
        backgroundColor:'#969696',
        height:0.6
      },
      RightPredictionTable:{
        flexDirection:'column'
      },
      Row1:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        backgroundColor:'#f5f5f5',
        marginBottom:1
        // paddingVertical:5
      },
      Row2:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        marginBottom:1
      },
      Row1Element1Container:{
        marginLeft:12,
      },
      Row1Element1Text:{
        color:'#121212',
        fontFamily:"Poppins-Medium",
        fontSize:16
      },
      Row1Element2Container:{
        backgroundColor:'#009c29',
        paddingVertical:7,
        width:50,
        alignItems:'center'
      },
      Row1Element2Text:{
        color:'#ffffff',
        fontFamily:'Poppins-Medium',
        fontSize:16
      },
    
      ExtraDetailsContainerI:{
        marginHorizontal:12,
        paddingVertical:12,
        marginTop:5
      },
      ExtraDetailI:{
        color:'#121212',
        fontFamily:'Poppins-Regular',
        letterSpacing:0.5,
      },
      BSImageSet1:{
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center'
      },
      BSExampleHeadingContainer:{
        width:width,
        marginLeft:25,
        marginBottom:10
      },
      BSExampleHeading:{
        color:'#292929',
        fontFamily:'Poppins-Medium',
        marginLeft:12,
        fontSize:15
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
        marginRight:(((width-15)-(((width-15)*7)/10))/11)/3,
        marginLeft:(((width-15)-(((width-15)*7)/10))/11)/3,
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
        // marginHorizontal:12,
        paddingVertical:12,
        marginTop:5
      },
      BSDescriptionText1:{
        color:'#121212',
        fontFamily:'Poppins-Regular',
        fontSize:14,
        textAlign:'left',
        letterSpacing:0.5
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