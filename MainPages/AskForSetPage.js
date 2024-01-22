import { StyleSheet, Text, View, TouchableWithoutFeedback,FlatList,ImageBackground,ScrollView, ActivityIndicator,LayoutAnimation, UIManager, Platform,} from 'react-native'
import React,{useEffect,useState,useCallback,useRef} from 'react'
import {useFocusEffect, useRoute} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { height } from '../Dimensions';
import EntryCalculatorAskForSet from './EntryCalculatorAskForSet';
import Toast from 'react-native-toast-message';
import {BottomSheetModal,BottomSheetBackdrop} from '@gorhom/bottom-sheet';

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

export default function AskForSetPage({navigation}) {

  const sheetRef1 = useRef(null);
  const handlePresentModalPress = useCallback(() => {sheetRef1.current?.present();}, []);
  const handleClosePress = () => sheetRef1.current.close()
  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior={isPriceModalFixed?'none':'close'}/>);
  const {MatchId,TeamCode1,TeamCode2,Team1,Team2,I1,I2,ContestType,MatchKey,Entry,uid,MatchLink,Free} = useRoute().params;
  const [selectedItemIndices, setSelectedItemIndices] = useState([]);
  const [setsData,setSetsData] = useState(null);
  const [refresh,setRefresh] = useState(false);
  const [isPriceModalFixed,setIsPriceModalFixed] = useState(false);
  const colors = {"0":'#006269',"1":'#006269',"2":'#006269',"3":'#006269',"4":'#1e8e3e',"5":'#006269',"6":'#1e8e3e',"1WD":'#185ccc',"1NB":'#185ccc',"2NB":'#185ccc',"3NB":'#185ccc',"4NB":'#185ccc',"5NB":'#185ccc',"7NB":'#185ccc',"W":'#d93025'}
  const skip = ["1WD","1NB","2NB","3NB","4NB","5NB","7NB"]; 
  const showToast = (type,text1,text2) => Toast.show({type: type,text1: text1,visibilityTime:2500,position:'top',topOffset:20,text2: text2});
  const navigateToBallSelection = () => navigation.navigate('BallSelection');

  useEffect(() => {if(selectedItemIndices)LayoutAnimation.configureNext(customLayoutAnimation);}, [selectedItemIndices]);
  useFocusEffect(
    useCallback(() => {
      setIsPriceModalFixed(false)
      const participantsListener = firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(uid).onSnapshot(async (documentSnapshot) => {
        const data = documentSnapshot.data();
        if (data !== undefined) {
          let toRemoveSets = [];
          if (data.LockedStatus)toRemoveSets = data.LockedStatus.filter((item) => item.LockedFor === MatchKey).map((item) => item.Name);
          const setObjPromises = Array.from({ length: data.Count }, (_, i) => {
            const setName = 'S' + (i + 1);
            return {
              Name: setName,
              Set: (data[setName]).flatMap(Object.values),
            };
          });
          const transformedData = await Promise.all(setObjPromises);
          const filteredData = transformedData.filter((setData) => !toRemoveSets.includes(setData.Name));
          // if (filteredData.length === 0)navigateToBallSelection();
          // else 
          // if(filteredData.length!==0)
          setSetsData(filteredData);
        } 
        // else navigateToBallSelection();
      });
      const listener2 = firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey).onSnapshot(document=>{
        setIsPriceModalFixed((prevIsPriceModalFixed) => {
          if (!prevIsPriceModalFixed && document.data().MaximumSpots - document.data().FilledSpots <= 0) showToast('error', 'Contest Full', 'Sorry, the spots for this contest are filled.Redirecting...')
          if(!prevIsPriceModalFixed && (document.data().ContestStatus === 'Live' || document.data().ContestStatus === 'Completed')) showToast('error','Contest Live','Sorry, the contest is live. Redirecting...')
          return prevIsPriceModalFixed;
        });
      })
      return () => {participantsListener();listener2();}
    }, [refresh])
  );

  const renderItem = useCallback(({item,index})=>{
    const Set = item.Set;
    const totalRuns = Set.reduce((acc, val) => acc + (isNaN(parseInt(val)) ? 0 : parseInt(val[0])), 0)
    let i = 0;
    const isItemSelected = selectedItemIndices.includes(index)
    return(<>
      <ImageBackground source={require('../accessories/DreamBallLogos/bannernew.jpg')} borderRadius={5} style={styles.BackgroundImage} elevation={7}>
        <TouchableWithoutFeedback onPress={()=>{selectedItemIndices.includes(index)?setSelectedItemIndices(selectedItemIndices.filter(i => i !== index)):setSelectedItemIndices([...selectedItemIndices, index])}}>
          <View style={styles.AccessoriesContainer}>
            <Text style={styles.SetNameText}>{'('+item.Name+')'}</Text>
            <View style={styles.ChooseIconContainer}>
              <Text style={styles.ChooseText}>Select</Text>
              <Icon name={isItemSelected?'radiobox-marked':'radiobox-blank'} size={20} color='#deded'/>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.SetMainContainer}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{marginHorizontal:12,marginVertical:12}}>
            {Set.map((n,index) => 
              <View key={index} style={[styles.TabPattiItemContainer2,{backgroundColor:colors[n]}]}>
                {!skip.includes(n) && <Text style={styles.BallNumberingText0}>{(++i)}</Text>}
                <Text style={styles.TabPattiText2}>{n}</Text>
              </View>
            )}
          </ScrollView>
          <View style={styles.ExtraDetContainer}>
            <Text style={styles.ExtraDetHeadText}>Total Runs: </Text>
            <Text style={[styles.ExtraDetAnsText,{paddingRight:15}]}>{totalRuns}</Text>
            <Text style={[styles.ExtraDetHeadText,{paddingLeft:15}]}>Boundaries: </Text>  
            <Text style={styles.ExtraDetAnsText}>{`${Set.filter(item => item === '6' || item === '4').length} (${Set.filter(item => item === '4' || item === '6').join(',')})`}</Text>      
          </View> 
        </View>
      </ImageBackground>
      </>
    )
  })
  
  return (<>
    <View style={styles.MainWholeContainer}>
      <TouchableWithoutFeedback onPress={navigateToBallSelection}>
        <View style={styles.UseDefaultContainer} elevation={3}>
          {setsData==null && <ActivityIndicator 
            hidesWhenStopped={true}
            color="#1141c1"
            size="small" 
            animating={true}
            style={{paddingRight:20,marginBottom:3}}
          />}
          <Icon name='plus-circle-outline' color={'#737373'} size={18} style={{paddingRight:5,marginBottom:2}}/>
          <Text style={styles.UseDefaultText}>Create Set </Text>
        </View>
      </TouchableWithoutFeedback>
      {setsData && setsData.length>0 &&<View style={styles.UsePreviousMainContainer} elevation={3}>
        <Text style={styles.UseDefaultText}>Select Set</Text>
        <FlatList
          data={setsData}
          onRefresh={()=>setRefresh(!refresh)} 
          refreshing={false}
          renderItem={renderItem}  
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          keyExtractor={(item) => item.Name}
        />
        <Text onPress={()=>{if(selectedItemIndices.length>0){handlePresentModalPress();setIsPriceModalFixed(false);}}} style={selectedItemIndices.length>0 ? [styles.NextButtonContainer,{backgroundColor:'#009e00'}] : styles.NextButtonContainer}>CONFIRM</Text>
        {setsData && selectedItemIndices.length>0 && <Text style={[styles.YouCan,{textAlign:'left',marginBottom:0}]}>Selected- {selectedItemIndices.map(index=>setsData[index].Name?setsData[index].Name:null).join(', ')}</Text>}
      </View>}
      {setsData && setsData.length>0 && <Text style={styles.YouCan}>Note-You can edit the sets later from 'My Contests' section before match deadline passes.</Text>}
    </View>
    {selectedItemIndices.length>0 && setsData && <BottomSheetModal
      ref={sheetRef1}
      snapPoints={['35%']}
      enablePanDownToClose={!isPriceModalFixed}
      enableOverDrag={true}
      detached={true}
      bottomInset={420}
      containerStyle={{marginHorizontal:15}}
      backdropComponent={renderBackdrop}
      handleStyle={{position:'absolute',alignSelf:'center'}}
      handleIndicatorStyle={{backgroundColor:'#ffffff'}}
      backgroundStyle={{borderTopLeftRadius:13,borderTopRightRadius:13}}>
      <EntryCalculatorAskForSet AskForSet={selectedItemIndices.map(index=>setsData[index].Name)} MatchId={MatchId} TeamCode1={TeamCode1} TeamCode2={TeamCode2} ContestType={ContestType} MatchKey={MatchKey} Entry={Entry} uid={uid} Free={Free} navigation={()=>{
        setSelectedItemIndices([])
        navigation.goBack();
        // navigation.replace('ContestSelection',{Team1:Team1,Team2:Team2,TeamCode1:TeamCode1,TeamCode2:TeamCode2,MatchId:MatchId,uid:uid,I1:I1,I2:I2,MatchLink:MatchLink})
        }} navigation2={(ja)=>navigation.navigate('AddCash',{add:'₹'+Math.ceil(ja)})} modalFix={()=>{setIsPriceModalFixed(true)}} disableModal={handleClosePress} error={(err,err2)=>{handleClosePress();showToast('error',err,err2)}} />
    </BottomSheetModal>}
    </>
  )
}

const styles = StyleSheet.create({
  MainWholeContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  UseDefaultContainer: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
    marginHorizontal: 13,
    borderRadius: 7,
    paddingVertical: 6,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems:'center'
  },
  UsePreviousMainContainer: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
    marginHorizontal: 13,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxHeight: height - 205,
  },
  UseDefaultText: {
    color: '#737373',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    textAlign: 'center',
  },
  YouCan: {
    color: '#737373',
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
    marginHorizontal: 10,
    fontSize: 11,
    marginBottom: 10,
  },
  ChooseIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ChooseText: {
    color: '#121212',
    fontFamily: 'Poppins-Medium',
    marginRight: 8,
    marginTop: 2,
  },
  NextButtonContainer: {
    textAlign: 'center',
    backgroundColor: '#b8b8b8',
    borderRadius: 8,
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    width: '100%',
    borderWidth: 4,
    borderColor: '#ffffff',
    paddingTop: 12,
    paddingBottom: 2,
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
    borderWidth: 4,
    borderColor: '#ffffff',
    borderRadius: 8,
    elevation: 2,
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
  SetNameText: {
    color: '#dedede',
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
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
});