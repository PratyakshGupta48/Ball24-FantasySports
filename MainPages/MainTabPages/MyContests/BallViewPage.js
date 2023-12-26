import { StyleSheet, Text, View, ImageBackground} from 'react-native'
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { width } from '../../../Dimensions';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';

export default function BallView({name,userSetName,lockStatus,navigation,TeamCode1,TeamCode2,totalRuns,userSet,status,Points,Rank,PointsArray}) {

  const colors = {"0":'#006269',"1":'#006269',"2":'#006269',"3":'#006269',"4":'#1e8e3e',"5":'#006269',"6":'#1e8e3e',"1WD":'#185ccc',"1NB":'#185ccc',"2NB":'#185ccc',"3NB":'#185ccc',"4NB":'#185ccc',"5NB":'#185ccc',"7NB":'#185ccc',"W":'#d93025'}
  const skip = ["1WD","1NB","2NB","3NB","4NB","5NB","7NB"];
  const TextEq = {"0":'Zero',"1":'One',"2":'Two',"3":'Three',"4":'Four',"5":'Five',"6":'Six',"1WD":'1Wide',"1NB":'1NoBall',"2NB":'1NoBall+1',"3NB":'1NoBall+2',"4NB":'1NoBall+3',"5NB":'1NoBall+4',"7NB":'1NoBall+6',"W":'Wicket'}
  const size = Math.floor((width-34)/45);
  let ctr = 0;

  return (
    <>
    <View style={styles.BallViewMainContainer}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%',paddingBottom:13}}>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Text style={styles.BallViewNameText}>{name}</Text>
          <Text style={styles.BallViewSetNumber}>{userSetName}</Text>
        </View>
        {status==='Live' && <Text style={styles.BallViewNameText}>{TeamCode1+'  v/s  '+TeamCode2}</Text>}
        <View style={{flexDirection:'row',alignItems:'center'}}>
          {lockStatus===false && status!=='Live' && <Icon name='pencil-outline' size={21} color='#dedede' style={{marginRight:15}} onPress={navigation}/>}
          <Icon name='share-variant-outline' size={21} color='#dedede' style={{marginRight:17}} />
          <Icon name='scoreboard-outline' size={21} color='#dedede' />
        </View>
      </View>
      <View style={styles.seperator2}></View>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
        <View style={[styles.BallLeftMainContainer,{alignItems:'flex-start',}]}>
          <Text style={styles.BallsLeftBallsText}>Balls</Text>
          <View style={{flexDirection:'row'}}>
            <Text style={styles.BallsLeftBallsMainText}>6</Text>
            <Text style={styles.BallsLeftBallsText}>/6</Text>
          </View>
        </View>
        {status!=='Live' && <Text style={styles.BallViewNameText}>{TeamCode1+'  v/s  '+TeamCode2}</Text>}
        {status==='Live' && <Text style={[styles.BallViewNameText,{fontSize:14.5,borderBottomWidth:0.6,borderBottomColor:'#dedede',paddingHorizontal:10}]}>{'Points: '+Points+'  ,  Rank: '+(Rank!=undefined?'#'+Rank:'—')}</Text>}
        <View style={[styles.BallLeftMainContainer,{alignItems:'flex-end',}]}>
          <Text style={styles.BallsLeftBallsText}>Runs </Text>
          <Text style={[styles.BallsLeftBallsMainText,{marginRight:4}]}>{totalRuns}</Text>
        </View>
      </View>
      <View style={{alignItems:'center',borderRadius:5,height:(userSet.length>size)?(status=='Upcoming')?176:201 :105,paddingTop:23}}>
      <BottomSheetFlatList
        data={userSet.length>0 && userSet}
        numColumns={Math.floor((width-34)/45)}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{justifyContent: 'center',marginBottom:18}}
        renderItem={({item,index}) => (<View style={{flexDirection:'column',alignItems:'center'}}>
          <View style={[styles.TabPattiItemContainer3,{backgroundColor:colors[item]}]}>
            {!skip.includes(item) && <Text style={styles.BallNumberingText1}>{(++ctr)}</Text>}
            <Text style={styles.TabPattiText2}>{item}</Text>
          </View>
          {status!=='Live' && <Text style={styles.BallText}>{TextEq[item]}</Text>}
          {status==='Live' && <Text style={[styles.NewBallText,{fontSize:(item!='1WD' && item!='1NB' && skip.includes(item))?8.7:9.5}]}>{TextEq[item]}</Text>}
          {status==='Live' && <View style={{flexDirection:'row',alignItems:'baseline',paddingTop:16}}><Text style={styles.PointsText}>{PointsArray[index]!=undefined && PointsArray[index]}</Text><Text style={[styles.PointsText,{fontSize:10}]}>{PointsArray[index]!=undefined && ' Pts'}</Text></View>}
        </View>)}
      />
      </View>
    </View>
    <ImageBackground source={require('../../../accessories/DreamBallLogos/ASDF.jpg')} style={{flex:1,flexDirection:'column',paddingHorizontal:12,paddingVertical:10}}>  
      <View style={styles.BallViewInfoMainContainer}>
        <View style={[styles.OverInfoContainer,{marginRight:35}]}>
          <Text style={styles.BallViewTotalRunsNumber}>{totalRuns}</Text>
          <Text style={styles.BallViewTotalRunsText}>Total Runs</Text>
        </View>
        <View style={[styles.OverInfoContainer,{marginLeft:35}]}>
          <Text style={styles.BallViewTotalRunsNumber1}>{`${userSet.filter(item => item === '6' || item === '4').length} (${userSet.filter(item => item === '4' || item === '6').join(',')})`}</Text>
          <Text style={styles.BallViewTotalRunsText1}>Boundaries</Text> 
        </View>
      </View>
      <View style={styles.BallViewInfoMainContainer}>
        <View style={[styles.OverInfoContainer,{marginRight:40}]}>
          <Text style={styles.BallViewTotalRunsNumber1}>{userSet.filter(item => item === 'W').length}</Text>
          <Text style={styles.BallViewTotalRunsText1}>Wickets</Text>
        </View>
        <View style={[styles.OverInfoContainer,{marginLeft:40}]}>
          <Text style={styles.BallViewTotalRunsNumber}>{userSet.filter(item => item === '1WD').length}</Text>
          <Text style={styles.BallViewTotalRunsText}>Wides</Text> 
        </View>
      </View>
    </ImageBackground>
    </>
  )
}

const styles = StyleSheet.create({
  BallViewMainContainer:{
    backgroundColor:'#262626',
    flexDirection:'column',
    alignItems:'center',
    paddingTop:25,
    borderTopLeftRadius:13,
    borderTopRightRadius:13,
    paddingHorizontal:12,
    paddingBottom:7
  },
  BallViewNameText:{
    color:'#dedede',
    fontFamily:'Poppins-Medium',
    fontSize:14
  },
  BallViewSetNumber:{
    color:'#dedede',
    backgroundColor:'#575757',
    paddingHorizontal:4,
    fontFamily:'Poppins-Medium',
    fontSize:12,
    borderRadius:3,
    marginLeft:3,
  },
  BallLeftMainContainer:{
    marginTop:10,
  },
  BallsLeftBallsText:{
    fontFamily:'Poppins-Medium',
    fontSize:13
  },
  BallsLeftBallsMainText:{
    fontFamily:'Poppins-SemiBold',
    fontSize:14.5,
    color:'#f6f7fb',
    position:'relative',
    bottom:1.5
  },
  BallViewInfoMainContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-evenly',
    marginTop:20
  },
  OverInfoContainer:{
    alignItems:'center',
  },
  BallViewTotalRunsText:{
    backgroundColor:'#dedede',
    paddingHorizontal:6,
    fontFamily:'Poppins-SemiBold',
    color:'#121212',
    borderRadius:3,
    fontSize:13
  },
  BallViewTotalRunsNumber:{
    color:'#dedede',
    fontFamily:'Poppins-SemiBold',
    fontSize:16,
    marginBottom:-1
  },
  BallViewTotalRunsText1:{
    backgroundColor:'#121212',
    paddingHorizontal:6,
    fontFamily:'Poppins-SemiBold',
    color:'#dedede',
    borderRadius:3,
    fontSize:13
  },
  BallViewTotalRunsNumber1:{
    color:'#dedede',
    fontFamily:'Poppins-SemiBold',
    fontSize:16,
    marginBottom:-1
  },
  TabPattiItemContainer3:{
    height: 38,
    width:45,
    alignItems:'center',
    justifyContent:'center',
    borderRadius:4,
    marginHorizontal:1.6
  },
  TabPattiText2:{
    color:'#f6f7fb',
    fontFamily:'Poppins-SemiBold',
    fontSize:14,
  },
  BallNumberingText1:{
    fontFamily:'Poppins-Medium',
    fontSize:9,
    paddingTop:5,
    position:'absolute',
    bottom:23.5,
    right:37.5,
    color:'#f6f7fb'
  },
  BallText:{
    fontFamily:'Poppins-Medium',
    fontSize:9.5,
    paddingTop:5,
    color:'#f6f7fb'
  },
  PointsText:{
    fontFamily:'Poppins-SemiBold',
    fontSize:14,
    color:'#f6f7fb',
  },
  NewBallText:{
    fontFamily:'Poppins-Medium',
    fontSize:9.5,
    position:'absolute',
    top:31,
    backgroundColor:'#dedede',
    color:'#121212',
    borderBottomLeftRadius:3,
    borderBottomRightRadius:3,
    width:45,
    textAlign:'center'
  }
})