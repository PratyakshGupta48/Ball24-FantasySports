import { StyleSheet, Text, View, TouchableWithoutFeedback,ImageBackground,LayoutAnimation, UIManager, Platform, ActivityIndicator} from 'react-native'
import React,{useEffect,useState,useCallback} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import { BottomSheetScrollView, BottomSheetFlatList } from '@gorhom/bottom-sheet';

const colors = {"0":'#006269',"1":'#006269',"2":'#006269',"3":'#006269',"4":'#1e8e3e',"5":'#006269',"6":'#1e8e3e',"1WD":'#185ccc',"1NB":'#185ccc',"2NB":'#185ccc',"3NB":'#185ccc',"4NB":'#185ccc',"5NB":'#185ccc',"7NB":'#185ccc',"W":'#d93025'}
const skip = ["1WD","1NB","2NB","3NB","4NB","5NB","7NB"];
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

export default function SwitchSets({MatchId,uid,MatchKey,disableRefresh,oldSet,Id}) {

  const [setsData,setSetsData] = useState([]);
  const [selectedItemIndex,setSelectedItemIndex] = useState(-1);
  const [loadingSpinner,setLoadingSpinner] = useState(true);
  const [textVisible,setTextVisible] = useState(false);
  
  useEffect(() => {LayoutAnimation.configureNext(customLayoutAnimation)}, [setsData,textVisible]);
  useEffect(()=>{
    setTimeout(() => {
      firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(uid).get().then(documentSnapshot => {
        const data = documentSnapshot.data();
        const toRemoveSets = data.LockedStatus.filter(item => item.LockedFor === MatchKey).map(item => item.Name);
        const transformedData = Object.entries(data).filter(([key]) => key.startsWith('S')).map(([setName, set]) => ({ Name: setName, Set: set.flatMap(Object.values) }));
        const filteredData = transformedData.filter(setObj => !toRemoveSets.includes(setObj.Name));
        setSetsData(filteredData);
        setLoadingSpinner(false)
      });
    }, 600);
  },[])

  const handlePress = () => {
    if (selectedItemIndex !== -1) {
      setLoadingSpinner(true);
      const SwapSet = functions().httpsCallable('SwapSets');
      SwapSet({MatchId: MatchId,MatchKey: MatchKey,Id: Id,SetNumber: setsData[selectedItemIndex].Name,Name: oldSet,uid: uid}).then(() => {
        setLoadingSpinner(false);
        setTextVisible(true);
        disableRefresh()
      });
    }
  }

  const renderItem = useCallback(({item,index})=>{
    const Set = item.Set;
    const totalRuns = Set.reduce((acc, val) => acc + (isNaN(parseInt(val)) ? 0 : parseInt(val[0])), 0)
    let i = 0;
    const isItemSelected = selectedItemIndex === index; 
    return(
      <ImageBackground source={require('../accessories/DreamBallLogos/bannernew.jpg')} borderRadius={5} style={styles.BackgroundImage} elevation={7}>
        <TouchableWithoutFeedback onPress={()=>{setSelectedItemIndex(isItemSelected ? -1 : index)}}>
          <View style={styles.AccessoriesContainer}>
            <Text style={styles.SetNameText}>{'('+item.Name+')'}</Text>
            <View style={styles.ChooseIconContainer}>
              <Text style={styles.ChooseText}>Select</Text>
              <Icon name={isItemSelected?'radiobox-marked':'radiobox-blank'} size={20} color='#dedede' onPress={()=>{setSelectedItemIndex(isItemSelected ? -1 : index)}}/>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.SetMainContainer}>
          <BottomSheetScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{marginHorizontal:12,marginVertical:12}}>
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
          </BottomSheetScrollView>
          <View style={styles.ExtraDetContainer}>
            <Text style={styles.ExtraDetHeadText}>Total Runs: </Text>
            <Text style={[styles.ExtraDetAnsText,{paddingRight:15}]}>{totalRuns}</Text>
            <Text style={[styles.ExtraDetHeadText,{paddingLeft:15}]}>Boundaries: </Text>  
            <Text style={styles.ExtraDetAnsText}>{`${Set.filter((item) =>['6', '4', '6#', '6*', '4#', '6*'].includes(item)).length} (${Set.filter((item) =>['4', '6', '6#', '6*', '4#', '6*'].includes(item)).join(',')})`}</Text>
          </View> 
        </View>
      </ImageBackground>
    )
  })

  return (<>
      {loadingSpinner ? (<ActivityIndicator size={'large'} color={'#1141c1'}/>) : (<>
        {!textVisible && <Text style={styles.SelectText}>{setsData.length > 0 ? 'Switch Set' : 'No Avilable Sets Found'}</Text>}
        {!textVisible && 
          <BottomSheetFlatList
            data={setsData}
            renderItem={renderItem}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            keyExtractor={(item) => item.Name}
            contentContainerStyle={{paddingHorizontal:12}}
          />
        }
        {setsData.length > 0 && !textVisible && (<Text onPress={handlePress} style={selectedItemIndex!=-1?[styles.NextButtonText,{backgroundColor:'#009e00'}]:styles.NextButtonText}>CONFIRM</Text>)}
        {!loadingSpinner && textVisible && <View>
          <Icon name='check-circle-outline' size={55} color='#009e00' style={styles.DeadlineClockIcon} />
          <Text style={styles.DeadlineText}>Successfully switched</Text>
        </View>}
      </>)}
  </>);
}

const styles = StyleSheet.create({
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
  ChooseIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ChooseText: {
    color: '#dedede',
    fontFamily: 'Poppins-Medium',
    marginRight: 8,
    marginTop: 2,
  },
  NextButtonText: {
    textAlign: 'center',
    backgroundColor: '#b8b8b8',
    borderRadius: 4,
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    paddingTop: 9,
    paddingBottom: 2,
    height: 41,
    marginVertical:10,
    marginHorizontal:12
  },
  SelectText: {
    color: '#3b3b3b',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    paddingBottom: 5,
  },
  DeadlineClockIcon: {
    textAlign: 'center',
    marginTop: 5,
  },
  DeadlineText: {
    color: '#121212',
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  MultiplierText: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    fontSize: 11,
    color: '#fafcff',
  },
});