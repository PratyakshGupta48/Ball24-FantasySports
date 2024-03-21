import {View,Text,StyleSheet,FlatList,ImageBackground,ScrollView,TouchableWithoutFeedback,LayoutAnimation, UIManager, Platform} from 'react-native';
import React,{useEffect,useState,useCallback,useRef} from 'react';
import { useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; 
import { height, width } from '../Dimensions';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Tooltip from 'rn-tooltip';
import {BottomSheetModal,BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import BallView from './MainTabPages/MyContests/BallViewPage';
import SkeletonContent from '../SkeletonPlaceholder';
import auth from '@react-native-firebase/auth';

const snapPoint = 50000/height+'%';
if (Platform.OS === 'android')UIManager.setLayoutAnimationEnabledExperimental(true);
const customLayoutAnimation = {
  duration: 250,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
};

export default function MySets({navigation}) {

  const {MatchId,uid,TeamCode1,TeamCode2,I1,I2} = useRoute().params;
  const [mode,setMode] = useState();
  const [setsData,setSetsData] = useState([]);
  const [refresh,setRefresh] = useState(false);
  const name = auth().currentUser.displayName;
  const [loadingSpinner,setLoadingSpinner] = useState(true)
  const [userSetName,setUserSetName] = useState()
  const [userSet,setUserSet] = useState([])
  const [totalRuns,setTotalRuns] = useState()
  const [lockStatus,setLockStatus] = useState()
  const colors = {"0":'#006269',"1":'#006269',"2":'#006269',"3":'#006269',"4":'#1e8e3e',"5":'#006269',"6":'#1e8e3e',"1WD":'#185ccc',"1NB":'#185ccc',"2NB":'#185ccc',"3NB":'#185ccc',"4NB":'#185ccc',"5NB":'#185ccc',"7NB":'#185ccc',"W":'#d93025'}
  const skip = ["1WD","1NB","2NB","3NB","4NB","5NB","7NB"];

  const sheetRef2 = useRef(null);
  const openBottomSheet1 = useCallback(() => {sheetRef2.current?.present();}, []);
  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />)

  useEffect(() => {LayoutAnimation.configureNext(customLayoutAnimation)}, [setsData,loadingSpinner]);
  // useFocusEffect(
    useEffect(()=>{
      setLoadingSpinner(true);
      const dbref = firestore().collection('AllMatches').doc(MatchId);
      const unsubscribe1 = dbref.collection('ParticipantsWithTheirSets').doc(uid).onSnapshot(async (documentSnapshot) => {
        const data = documentSnapshot.data();
        if(data!=undefined){
          let lockedContestArray = {};
          const setObjPromises = Array.from({ length: data.Count }, async (_, i) => {
            const setName = 'S' + (i + 1);
            let lockedStatus;
            if(data.LockedStatus) lockedStatus = data.LockedStatus.filter(item => item.Name === setName);
            const lockedFor = lockedStatus?lockedStatus.map(item => item.LockedFor):[];
            let flag = false;
            for(let i=0 ; i<lockedFor.length ; i++){
              const lockedId = lockedFor[i];
              if(lockedContestArray[lockedId] == true){
                flag = true;
                break;
              }
              else if(lockedContestArray[lockedId] == false) continue;
              const document = await dbref.collection('4oversContests').doc(lockedId).get();
              if(document.data().ContestStatus=='Live'){
                flag=true;
                lockedContestArray[lockedId ]= true;
                break;
              }
              else lockedContestArray[lockedId] = false;
            }
            return {
              Name: setName,
              Set: (data[setName]).flatMap(Object.values),
              Lock: flag,
            };
          })
          const transformedData = await Promise.all(setObjPromises);
          setSetsData(transformedData);
        }
        setLoadingSpinner(false)
      });
  
      const unsubscribe2 = firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'modified' && change.doc.exists) {
            const contestData = change.doc.data();
            if (contestData.ContestStatus === 'Live') {
              setRefresh(!refresh)
              sheetRef2.current?.close()
            }
          }
        });
      });
      const unsubscribe3 = firestore().collection('AllMatches').doc(MatchId).onSnapshot(documentSnapshot=>setMode(documentSnapshot.data().Status))
      return () => {unsubscribe1();unsubscribe2();unsubscribe3();}
    },[refresh])
  // )

  const RenderItem = useCallback(({item})=>{
    const { Set, Name, Lock } = item;
    const handlePress = () => {
      setUserSetName(Name);
      setUserSet(Set);
      setTotalRuns(totalRuns);
      setLockStatus(Lock);
      openBottomSheet1();
    };
    const totalRuns = Set.reduce((acc, val) => acc + (isNaN(parseInt(val)) ? 0 : parseInt(val[0])), 0)
    let i = 0;
    return <TouchableWithoutFeedback onPress={handlePress}>
    <ImageBackground source={require('../accessories/DreamBallLogos/bannernew.jpg')} borderRadius={5} style={styles.BackgroundImage} elevation={10} >
      <View style={styles.AccessoriesContainer}>
        <View style={styles.NameSetNameContainer}>
          <Text style={styles.NameText}>{name.length>10?name.substring(0,10)+'...':name}</Text>
          <Text style={styles.SetNameText}>{'('+Name+')'}</Text>
        </View>
        {mode!='Completed' && <View style={styles.IconContainer}>
          <Icon name='fullscreen' size={20} color='#dedede' style={{paddingRight:10}} onPress={handlePress}/>
          {!Lock && <Icon name='pencil-outline' size={20} color='#dedede' onPress={()=>{navigation.navigate('BallEdit',{MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,uid:uid,I1:I1,I2:I2,SetName:Name})}}/>}
          {Lock &&<Tooltip popover={<Text style={styles.ToolTipText}>This set cannot be edited because you have used it to participate in a contest that is now live.</Text>} backgroundColor='#1141c1' height={80} width={250} ><Icon name='lock-outline' size={20} color='#dedede' /></Tooltip>}
          {/* <Icon name='share-variant-outline' size={20} color='#dedede' style={{paddingLeft:10}}/> */}
        </View>}
      </View>
      <View style={styles.SetMainContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{marginHorizontal:12,marginVertical:12}}>
          {Set.map((n,index) => {
            const item = !n.toString().endsWith('#') && !n.toString().endsWith('*') ? n : n.slice(0, -1);
            const backgroundColor = colors[item];
            const multiplierText = n.toString().endsWith('#') ? '2X' : (n.toString().endsWith('*') ? '1.5X' : '');
            return (
              <View key={index}>
                <View style={[styles.TabPattiItemContainer2, {backgroundColor}]}>
                  {!skip.includes(item) && <Text style={styles.BallNumberingText0}>{(++i)}</Text>}
                  <Text style={styles.TabPattiText2}>{item}</Text>
                </View>
                <Text style={styles.MultiplierText}>{multiplierText}</Text>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.ExtraDetContainer}>
          <Text style={styles.ExtraDetHeadText}>Total Runs: </Text>
          <Text style={[styles.ExtraDetAnsText,{paddingRight:15}]}>{totalRuns}</Text>
          <Text style={[styles.ExtraDetHeadText,{paddingLeft:15}]}>Boundaries: </Text>  
          <Text style={styles.ExtraDetAnsText}>{`${Set.filter((item) =>['6', '4', '6#', '6*', '4#', '6*'].includes(item)).length} (${Set.filter((item) =>['4', '6', '6#', '6*', '4#', '6*'].includes(item)).join(',')})`}</Text>
        </View> 
      </View>
    </ImageBackground>
    </TouchableWithoutFeedback>
  },[])

  return (<>
    {loadingSpinner ? (<View style={{ flex: 1, backgroundColor: '#ffffff', paddingTop:20 }}><SkeletonContent/></View>) : (<>
      <FlatList
        data={setsData}
        onRefresh={()=>setRefresh(!refresh)}
        refreshing={false}
        renderItem={RenderItem}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={20}
        keyExtractor={(item)=>item.Name}
        ListFooterComponent={()=>(<View style={{height:60}}></View>)}
        ListEmptyComponent={()=>(!loadingSpinner && <View style={{alignItems:'center',justifyContent:'center',flexDirection:'column',paddingTop:30}}>
          <FastImage source={require('../accessories/DreamBallLogos/vvk.jpg')} style={{width:width-100,height:width-100}}/>
          <Text style={{color:'#666666',textAlign:'center',fontFamily:'Poppins-Medium',fontSize:13,marginBottom:23,marginTop:-10}}>You haven't created a set yet! {"\n"}Start your journey of winning here</Text>
          <Text style={{paddingHorizontal:40,color:'#ffffff',backgroundColor:'#009e00',paddingVertical:7,fontFamily:'Poppins-Medium',borderRadius:8,fontSize:17}} onPress={()=>navigation.navigate('SetCreator',{MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,I1:I1,I2:I2,uid:uid})}>Create A Set</Text>
          </View>)}
        style={{flex:1,backgroundColor:setsData.length>0?'#ffffff':'#ffffff',paddingTop:20}}
      />
      {mode!='Completed' && <TouchableWithoutFeedback onPress={()=>navigation.navigate('SetCreator',{MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,I1:I1,I2:I2,uid:uid})}><View style={styles.NextButtonContainerFinal} elevation={3}>
        <Icon name='plus-circle-outline' color={'#f6f7fb'} size={17}/>
        <Text style={styles.NextButtonText}>  Create Set</Text>
      </View></TouchableWithoutFeedback>}
      <BottomSheetModal
        ref={sheetRef2}
        snapPoints={[snapPoint]}
        enablePanDownToClose={true}
        enableOverDrag={true}
        backdropComponent={renderBackdrop}
        handleStyle={{position:'absolute',alignSelf:'center'}}
        handleIndicatorStyle={{backgroundColor:'#ffffff'}}
        backgroundStyle={{borderTopLeftRadius:13,borderTopRightRadius:13}}>
          <BallView name={name} userSetName={userSetName} userSet={userSet} lockStatus={lockStatus} TeamCode1={TeamCode1} TeamCode2={TeamCode2} totalRuns={totalRuns} navigation={()=>{navigation.navigate('BallEdit',{MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,uid:uid,I1:I1,I2:I2,SetName:userSetName})}}/>
      </BottomSheetModal>
    </>)}</>
  );
}

const styles = StyleSheet.create({
  MainCardContainer: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
    elevation: 4,
    marginHorizontal: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    paddingVertical: 8,
  },
  IconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  ToolTipText: {
    color: '#ffffff',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  NextButtonContainerFinal: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#363636',
    alignSelf: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 3,
    borderWidth: 0.19,
    borderColor: '#ffffff',
  },
  NextButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins-Medium',
    marginTop: 3,
    fontSize: 13,
  },
  TabPattiItemContainer2: {
    minWidth: 37,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
    borderRadius: 4,
  },
  TabPattiText2: {
    color: '#f6f7fb',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  BallNumberingText0: {
    fontFamily: 'Poppins-Medium',
    fontSize: 7,
    position: 'absolute',
    bottom: 16.8,
    right: 31,
    color: '#f6f7fb',
  },
  BackgroundImage: {
    marginBottom: 25,
    marginHorizontal: 15,
    borderWidth: 4,
    borderColor: '#ffffff',
    borderRadius: 8,
    elevation: 4,
  },
  AccessoriesContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overlayColor: '#9c9c9c',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  NameSetNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  NameText: {
    color: '#dedede',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  SetNameText: {
    color: '#dedede',
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    paddingLeft: 9,
  },
  SetMainContainer: {
    alignItems: 'center',
    paddingTop: 6,
  },
  ExtraDetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
  },
  ExtraDetHeadText: {
    color: '#dedede',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  ExtraDetAnsText: {
    color: '#dedede',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  MultiplierText: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    fontSize: 11,
    color: '#fafcff',
  },
});