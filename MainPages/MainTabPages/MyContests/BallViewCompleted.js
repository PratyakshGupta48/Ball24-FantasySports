import { StyleSheet, Text, View, ImageBackground,FlatList} from 'react-native'
import React,{useMemo} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { width } from '../../../Dimensions';
 
const colors = {"0":'#006269',"1":'#006269',"2":'#006269',"3":'#006269',"4":'#1e8e3e',"5":'#006269',"6":'#1e8e3e',"1WD":'#185ccc',"1NB":'#185ccc',"2NB":'#185ccc',"3NB":'#185ccc',"4NB":'#185ccc',"5NB":'#185ccc',"7NB":'#185ccc',"W":'#d93025'}
const skip = ["1WD","1NB","2NB","3NB","4NB","5NB","7NB"];
const TextEq = {"0":'Zero',"1":'One',"2":'Two',"3":'Three',"4":'Four',"5":'Five',"6":'Six',"1WD":'1Wide',"1NB":'1NoBall',"2NB":'1NoBall+1',"3NB":'1NoBall+2',"4NB":'1NoBall+3',"5NB":'1NoBall+4',"7NB":'1NoBall+6',"W":'Wicket'}

function BallViewCompleted({name,userSetName,TeamCode1,TeamCode2,totalRuns,userSet,Points,PointsArray}) {
  const size = useMemo(() => Math.floor((width - 34) / 45), []);
  let ctr = 0;
  return (<>
  <View style={{height:500}}>
    <View style={styles.BallViewMainContainer}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%',paddingBottom:13}}>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Text style={styles.BallViewNameText}>{name}</Text>
          <Text style={styles.BallViewSetNumber}>{userSetName}</Text>
        </View>
        <Text style={styles.BallViewNameText}>{TeamCode1+'  v/s  '+TeamCode2}</Text>
        <View style={{flexDirection:'row',alignItems:'center'}}>
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
        <Text style={[styles.BallViewNameText,{fontSize:14.5,borderBottomWidth:0.6,borderBottomColor:'#dedede',paddingHorizontal:10}]}>{'Points: '+Points+'  ,  Rank: 1'}</Text>
        <View style={[styles.BallLeftMainContainer,{alignItems:'flex-end',}]}>
          <Text style={styles.BallsLeftBallsText}>Runs </Text>
          <Text style={[styles.BallsLeftBallsMainText,{marginRight:4}]}>{totalRuns}</Text>
        </View>
      </View>
      <View style={{alignItems:'center',borderRadius:5,height:(userSet.length>size)?201:105,paddingTop:23}}>
      <FlatList
        data={userSet.length>0 && userSet}
        numColumns={Math.floor((width-34)/45)}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{justifyContent: 'center',marginBottom:18}}
        renderItem={({item,index}) => (<View style={{flexDirection:'column',alignItems:'center'}}>
          <View style={[styles.TabPattiItemContainer3,{backgroundColor:colors[item]}]}>
            {!skip.includes(item) && <Text style={styles.BallNumberingText1}>{(++ctr)}</Text>}
            <Text style={styles.TabPattiText2}>{item}</Text>
          </View>
          <Text style={[styles.NewBallText,{fontSize:(item!='1WD' && item!='1NB' && skip.includes(item))?8.7:9.5}]}>{TextEq[item]}</Text>
          <View style={{flexDirection:'row',alignItems:'baseline',paddingTop:16}}><Text style={styles.PointsText}>{PointsArray[index]!=undefined && PointsArray[index]}</Text><Text style={[styles.PointsText,{fontSize:9,fontFamily:'Poppins-Regular'}]}>{PointsArray[index]!=undefined && ' Pts'}</Text></View>
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
  </View>
    </>
  )
}
export default React.memo(BallViewCompleted);

const styles = StyleSheet.create({
  BallViewMainContainer:{
    backgroundColor:'#262626',
    flexDirection:'column',
    alignItems:'center',
    paddingTop:25,
    borderTopLeftRadius:13,
    borderTopRightRadius:13,
    paddingHorizontal:12,
    paddingBottom:7,
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


// import { StyleSheet, Text, View ,StatusBar ,ScrollView ,ImageBackground} from 'react-native'
// import React,{useRef,useCallback,useEffect,useState} from 'react'
// import {useRoute} from '@react-navigation/native';
// import {height,width} from '../../../Dimensions';
// import Icon from 'react-native-vector-icons/Entypo';
// import FastImage from 'react-native-fast-image';
// import BottomSheet , {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
// // import BottomSheetInfo from '../../BottomSheetInfo';
// import firestore from '@react-native-firebase/firestore'; 

// export default function BallViewCompleted({navigation}) {
    
//   const route = useRoute();
//   const set = route.params.Set;
//   const Name = route.params.Name;
//   const Team = route.params.Team;
//   const Overs = route.params.Overs;
//   const overs = ((set).length)/6;

//   const MatchId = route.params.MatchId;
//   const MatchKey = route.params.MatchKey;
//   const TimeId = route.params.TimeId;

//   const [Points,setPoints] = useState([]);
//   const [PointsArray,setPointsArray] = useState([]);
//   const [Rank,setRank] = useState(null);
//   const [WonAmount,setWonAmount] = useState(null);

//   const dreamBallImages = {
//     '0': require('../../../accessories/DreamBallLogos/00.png'),
//     '1': require('../../../accessories/DreamBallLogos/11.png'),
//     '2': require('../../../accessories/DreamBallLogos/22.png'),
//     '3': require('../../../accessories/DreamBallLogos/33.png'),
//     '4': require('../../../accessories/DreamBallLogos/44.png'),
//     '6': require('../../../accessories/DreamBallLogos/66.png'),
//     'Wicket': require('../../../accessories/DreamBallLogos/77.png')    
//   };

//   const openBottomSheet2 = useCallback((index) => {
//     if(sheetRef2.current){
//       sheetRef2.current.snapToIndex(index);
//     }
//    },[]);
//    const renderBackdrop = useCallback((props)=>(
//     <BottomSheetBackdrop
//         {...props}
//         disappearsOnIndex={-1}
//         appearsOnIndex={0}
//         />
//    ))
//    const sheetRef2 = useRef(null);

//    useEffect(()=>{
//     firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).collection('Participants').doc(TimeId.toString()).get().then(documentSnapshot=>{
//       setPoints(documentSnapshot.data().PointsNumber);
//       setPointsArray(documentSnapshot.data().Points);
//       setRank(documentSnapshot.data().Rank);
//       setWonAmount(documentSnapshot.data().WinningAmount)
//     })
//    },[])

//   return (
//     <>
//     <StatusBar animated={true} backgroundColor="#036b1f"/>
    
//     <ImageBackground source={require('../../../accessories/DreamBallLogos/ASDF.jpg')} resizeMode='cover' style={{flex:1,height:height,flexDirection:'column'}}>  
//       <View style={styles.FirstC}>
//         <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:8,marginHorizontal:14}}>
//           <Icon name='cross' size={26} color='#ffffff' onPress={()=>{navigation.pop()}}/>
//           <FastImage source={require('../../../accessories/DreamBallLogos/logofinal.png')} style={{height:30,width:130,opacity:1,alignSelf:'center',marginTop:5}}/>
//           <Icon name='info-with-circle' color={'#f6f7fb'} size={20} onPress={()=>{openBottomSheet2(0)}}/>
//         </View>
//         <View style={styles.PointsContainer}>
//         <View style={styles.NameAndTeamContainer}>
//           <Text style={styles.Name}>{Name}</Text>
//           <View style={styles.TeamContainer}><Text style={styles.Team}>{Team}</Text></View>
//         </View>
//         <Text style={styles.TotalPointsText}>{Points+' Pts'}</Text>
//         </View>
//         <View style={styles.RanksWonContainer}>
//           {Rank!=undefined &&<Text style={styles.Name}>{'Rank #'+Rank}</Text>}
//           {WonAmount!=undefined &&<View style={styles.Seperator}></View>}
//           {WonAmount!=undefined &&<Text style={styles.Name}>{'Won Rs'+WonAmount}</Text>}
//         </View>
//       </View>
//       <View style={styles.SecondC}>
//         <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'flex-start'}}>
//           {Array.from({ length: overs }, (_, i) => (
//             <View key={i} style={styles.Over1}>
//               <Text style={styles.Over1Text}>{`OVER ${Overs[0] + i}`}</Text>
//               <View style={styles.Over1Scores}>
//                 {set.slice(i * 6, i * 6 + 6).map((value, j) => (
//                   <View key={j} style={styles.imagetextContainer}>
//                   <FastImage source={dreamBallImages[value]} style={styles.image}/>     
//                   <Text style={styles.imageText}>{value!='Wicket'?value+' run':value}</Text>
//                   <Text style={styles.PointsArrayText}>{PointsArray[j+i*6]}</Text>  
//                   </View>
//                 ))}
//               </View>
//             </View>
//           ))}
//         </ScrollView>
//       </View>
//     </ImageBackground>
//     {/* <BottomSheet
//       ref={sheetRef2}
//       snapPoints={[495]}
//       index={-1}
//       enablePanDownToClose={true}
//       enableOverDrag={false}
//       backdropComponent={renderBackdrop}
//       backgroundStyle={{backgroundColor:'#f6f7fb'}}
//     >
//       <BottomSheetInfo/>
//     </BottomSheet> */}
//     </>
//   )   
// }

// const styles = StyleSheet.create({  
//   FirstC:{
//     height:135,
//   },
//   SecondC:{
//     justifyContent:'space-evenly',
//     height:'85%',
//     flex:1
//   },
//   Over1:{
//     flexDirection:'column',
//     justifyContent:'center',
//     alignItems:'center',
//     paddingBottom:30
//   },
//   Over1Text:{
//     color:'#ffffff',
//     fontFamily:'Poppins-SemiBold',
//     fontSize:19,
//     paddingBottom:8,
//   },
//   Over1Scores:{
//     flexDirection:'row',
//     justifyContent:'space-between',
//     width:width,
//     paddingHorizontal:10
//   },
//   imagetextContainer:{
//     flexDirection:'column',
//     alignItems:'center',
//     justifyContent:'space-between'
//   },
//   image:{
//     width:width/6.5,
//     height:width/6.5,
//   },
//   imageText:{
//     color:'#ffffff',
//     fontFamily:'Poppins-Medium',
//     fontSize:13
//   },
//   PointsArrayText:{
//     color:'#ebebeb',
//     fontFamily:'Poppins-Medium',
//     fontSize:15
//   },
//   NameAndTeamContainer:{
//     flexDirection:'row',
//     alignItems:'center',
//     justifyContent:'center',
//     marginRight:10
//   },
//   Name:{
//     color:'#ffffff',
//     fontFamily:'Poppins-Medium',
//     fontSize:14,
//   },
//   TeamContainer:{
//     marginLeft:5,
//     backgroundColor:'#ffffff',
//     paddingHorizontal:3,
//     borderRadius:5,
//     opacity:0.8
//   },
//   Team:{
//     color:'#000000',
//     fontFamily:'Poppins-SemiBold',
//     fontSize:11,
//   },
//   TotalPointsText:{
//     color:'#ffffff',
//     textAlign:'center',
//     fontFamily:'Poppins-SemiBold',
//     fontSize:15,
//     marginLeft:10
//   },
//   PointsContainer:{
//     flexDirection:'row',
//     alignItems:'center',
//     justifyContent:'center',
//     marginTop:20,
//   },
//   RanksWonContainer:{
//     flexDirection:'row',
//     alignItems:'center',
//     justifyContent:'center',
//     marginTop:10
//   },
//   Seperator:{
//     height:20,
//     width:1,
//     backgroundColor:'#ffffff',
//     marginHorizontal:20,
//   }
// });