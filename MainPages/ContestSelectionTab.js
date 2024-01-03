import React,{useState,useEffect,useCallback} from 'react';
import {View,Text,StyleSheet,TouchableWithoutFeedback,SectionList,ScrollView ,TouchableOpacity} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { SkeletonContestSelection } from '../SkeletonPlaceholder';

export default function ContestSelectionTab({navigation}) {

  const {MatchId,uid,Team1,Team2,TeamCode1,TeamCode2,I1,I2,MatchLink} = useRoute().params;
  const [refresh,setRefresh] = useState(false);
  const [fourOvers,setFourOvers] = useState([]);
  const [fouroversCopy,setFourOversCopy] = useState([]);
  const [loadingSpinner,setLoadingSpinner] = useState(true);
  const [newUser,setNewUser] = useState()   
  const [sortApplied,setSortApplied] = useState(false);  //Sorting
  const [sortedItemLength,setSortedItemsLength] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortingFor,setSOrtingFor] = useState()

  const getNumberOfWinners = (item) => {
    const winnersPercentage = item.WinnersPercentage;
    return winnersPercentage.endsWith('%')? parseInt(winnersPercentage, 10): Math.round((parseInt(winnersPercentage, 10) * 100) / item.MaximumSpots);
  };
  const sortDataByPrizePool = (data, property) => {
    if (property === 'Entry') {
      setSOrtingFor(1)
      data.sort((a, b) => parseInt(a.Entry.substring(1), 10) - parseInt(b.Entry.substring(1), 10));
    } else if (property === 'MaximumSpots') {
      setSOrtingFor(2)
      data.sort((a, b) => a.MaximumSpots - b.MaximumSpots);
    } else if (property === 'PrizePool') {
      setSOrtingFor(3)
      data.sort((a, b) => parseInt(a.PrizePool.replace(',', ''), 10) - parseInt(b.PrizePool.replace(',', ''), 10));
    } else if (property === 'WinningPercentage') {
      setSOrtingFor(4)
      data.sort((a, b) => getNumberOfWinners(a) - getNumberOfWinners(b));
    } else if (property === 'Overs') {
      setSOrtingFor(5)
      data.sort((a,b) => a.Overs - b.Overs)
    }
    return sortOrder === 'asc' ? data : data.reverse();
  }; 
  const handleSort = (property) => {
    const flatData = fouroversCopy.reduce((acc, section) => acc.concat(section.data), []);
    const sortedData = sortDataByPrizePool([...flatData], property);
    setSortApplied(true);
    setSortedItemsLength(sortedData.length)
    setFourOvers([{ title:'Sorted Contests', data: sortedData }]);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  useEffect(() => {
    setLoadingSpinner(true);
    setSortApplied(false);
    setSOrtingFor();
    setTimeout(() => {
      const getContest = firestore().collection('AllMatches').doc(MatchId).collection('4oversContests').onSnapshot((QuerySnapshot) => {
        const FourOversContests = [];
        const FilteredAll = [[], [], [], [], [], [], []];
        setFourOvers([]);
        const filters = [
          { title: 'Mega Contest', type: 'Mega Contest', status: 'Upcoming', index: 0 },
          { title: 'Trending Now', type: 'Trending Now', status: 'Upcoming', index: 1 },
          { title: 'Only For Beginners', type: 'Only For Beginners', status: 'Upcoming', index: 2 },
          { title: 'High Entry=High Rewards', type: 'High Entry=High Rewards', status: 'Upcoming', index: 3 },
          { title: 'Head To Head', type: 'Head To Head', status: 'Upcoming', index: 4 },
          { title: 'Low Entry Contests', type: 'Low Entry Contests', status: 'Upcoming', index: 5 },
          { title: 'Winner Takes All', type: 'Winner Takes All', status: 'Upcoming', index: 6 },
        ];
        QuerySnapshot.forEach((documentSnapshot) => {
          const data = documentSnapshot.data();
          const index = filters.findIndex((filter) =>filter.type === data.Type && filter.status === data.ContestStatus && data.MaximumSpots - data.FilledSpots > 0);
          if (index !== -1) {
            const { title, index: filterIndex } = filters[index];
            FilteredAll[filterIndex].push({ ...data, key: documentSnapshot.id, title });
          }
        });
        FourOversContests.push(
          ...FilteredAll.filter((item) => item.length !== 0).map((item) => ({
            title: item[0].title,
            data: item,
          }))
        );
        setFourOvers(FourOversContests);
        setFourOversCopy(FourOversContests);
        setLoadingSpinner(false);
      });
      const userListener = firestore().collection('users').doc(uid).onSnapshot((documentSnapshot) => {
        setNewUser(documentSnapshot.data().Contest);
      });
      return () => { getContest(); userListener();};
    }, 500);
  }, [refresh]);
  
  const CardFormat = useCallback(({item}) => (
    <TouchableWithoutFeedback onPress={()=>{navigation.replace('ContestDetailNavigation',{Team1:Team1,Team2:Team2,MatchId:MatchId,Overs:item.Overs,ContestType:item.Type,PrizePool:item.PrizePool,Entry:item.Entry,uid:uid,TeamCode1:TeamCode1,TeamCode2:TeamCode2,MatchKey:item.key,MaximumSpots:item.MaximumSpots,FirstPosition:item.FirstPosition,WinnersPercentage:item.WinnersPercentage,Winnings:item.Winning,I1:I1,I2:I2,MatchLink:MatchLink,Free:item.Free,initialScreen:'ContestDisplay',Inning:item.Inning})}} style={{backgroundColor:'#ffffff'}}>
      <View style={styles.Card} elevation={3}> 
        <View style={styles.PrizeEntryTextContainer}>
          <Text style={styles.PrizeText}>Prize Pool</Text>
          <View style={styles.OversMentionContainer}>
            <Text style={styles.OversMentionText}>Innings-</Text>
            <Text style={[styles.OversMentionNumber,{paddingRight:5}]}>{item.Inning}</Text>
            <Text style={[styles.OversMentionText,{paddingLeft:5}]}>Over-</Text>
            <Text style={styles.OversMentionNumber}>{item.Overs}</Text>
          </View>
          <Text style={styles.PrizeText}>Entry</Text>
        </View>
        <View style={[styles.PrizeEntryTextContainer,{paddingTop:11,paddingBottom:3}]}>
          <View style={styles.PrizeMoneyContainer}>
            <Text style={styles.Rupee}>₹</Text>
            <Text style={styles.PrizeMoneyText}>{item.PrizePool}</Text>
          </View>
          <Text style={styles.EntryMoneyText} onPress={()=>{navigation.navigate('ContestDetailNavigation',{refresh:()=>{setRefresh(!refresh)},Team1:Team1,Team2:Team2,MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,MatchKey:item.key,ContestType:item.Type,Entry:item.Entry,Overs:item.Overs,uid:uid,PrizePool:item.PrizePool,MaximumSpots:item.MaximumSpots,I1:I1,I2:I2,WinnersPercentage:item.WinnersPercentage,Winning:item.Winnings,MatchLink:MatchLink,Free:item.Free,initialScreen:'AskForSet',Inning:item.Inning,m:'U'})}}>
            {(item.Free==true && (item.MaximumSpots-item.FilledSpots)>0)?((!newUser)?'Free 🤑':item.Entry) : ((item.Free!='true' && item.Entry) || (item.Type=='Mega Contest' && (item.MaximumSpots-item.FilledSpots)==0 && 'Full')) }
          </Text>
        </View>
        <View style={styles.ProgressLineContainer}></View>
        <View style={{backgroundColor:'#db2800',height:4,marginTop:-4,opacity:0.7,borderTopLeftRadius:5,borderBottomLeftRadius:5,width:((item.FilledSpots/item.MaximumSpots)*100)+'%'}}></View>
        <View style={styles.SpotsNumberContainer}>
          <Text style={styles.SpotsLeftNumber}>{item.MaximumSpots-item.FilledSpots} spots left</Text>
          <Text style={styles.TotalSpotsNumber}>{item.MaximumSpots} spots</Text>
        </View>
        <View style={styles.ExtraDetailsContainer}>
          <View style={styles.FirstIconContainer}>
            <Icon name='medal-outline' size={14} color='#666666'/>
          </View>
          <View style={styles.WinningMoneyContainer}>
            <Text style={styles.RupeeSymbol}>₹</Text>
            <Text style={styles.WinningMoneyText}>{item.FirstPosition}</Text>
          </View>
          <View style={styles.TrophyIconContainer}>
            <Icon name='trophy-outline' size={15} color='#666666'/>
          </View>
          <View style={styles.WinningMoneyContainer}>
            <Text style={styles.WinningMoneyText}>{item.WinnersPercentage}</Text>
          </View>
          <View style={styles.DeadlineContestContaioner}>
            <View style={styles.DeadlineContestIconContaioner}>
              <Icon name='clock-fast' size={18} color='#1141c1'/>
            </View>
            <View style={styles.WinningMoneyContainer}>
              <Text style={styles.DeadlineOverText}>{item.Overs>1?"Deadline "+(item.Overs-1):"Match Start"}</Text>
              {item.Overs>1 && <Text style={{marginBottom:10,color:'#1141c1',fontFamily:'Poppins-Medium',fontSize:8}}>th</Text>}
              {item.Overs>1 && <Text style={styles.DeadlineOverText}> over</Text>}
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  ));

  return (<>
    {loadingSpinner?<View style={{flex:1,backgroundColor:'#ffffff'}}><SkeletonContestSelection/></View>:(<>
      <ScrollView horizontal={true} style={{flex:1,maxHeight:25,borderBottomWidth:0.2,borderColor:'#b8b8b8',paddingTop:2.9,backgroundColor:'#ffffff',paddingLeft:4}}>
      <TouchableOpacity onPress={()=>{setRefresh(!refresh)}}><Text style={styles.TabPattiText}>All Contests</Text></TouchableOpacity>
      {[{ title:'Mega Contest'},{ title:'Trending Now'},{ title:'Only For Beginners'},{ title:'High Entry=High Rewards'},{ title:'Head To Head'},{ title:'Low Entry Contests'},{ title:'Winner Takes All'}].map((item) => (
        <TouchableOpacity key={item.title} onPress={() => {
          setLoadingSpinner(true);
          setFourOvers([...fouroversCopy].filter((fourovers) => fourovers.title === item.title));
          setLoadingSpinner(false);
        }}><Text style={styles.TabPattiText}>{item.title}</Text>
        </TouchableOpacity>)
      )}
    </ScrollView>
    <LinearGradient colors={['#f0f0f0','#ffffff']} start={{ x: 1, y: 0 }} end={{ x:0.8, y: 0.5 }} style={{height:35,backgroundColor:'#ffffff',flexDirection:'row',alignItems:'center',paddingLeft:11,zIndex:2}} elevation={4}>
      <Text style={styles.SortByText}>Sort By:</Text>
      <ScrollView horizontal={true} style={{flex:1}}>
        <TouchableOpacity style={{flexDirection:'row'}} onPress={()=>{handleSort('Overs')}}><Text style={[styles.SortPattiText,{color:sortingFor==5?'#1a1a1a':'#969696'}]}>Overs</Text>{sortingFor==5 && <Icon name={sortOrder=='asc'?'arrow-down-thin':'arrow-up-thin'} size={16} color='#1a1a1a' style={{marginLeft:-9,marginTop:1.5,marginRight:8}} />}</TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row'}} onPress={()=>{handleSort('Entry')}}><Text style={[styles.SortPattiText,{color:sortingFor==1?'#1a1a1a':'#969696'}]}>ENTRY</Text>{sortingFor==1 && <Icon name={sortOrder=='asc'?'arrow-down-thin':'arrow-up-thin'} size={16} color='#1a1a1a' style={{marginLeft:-9,marginTop:1.5,marginRight:8}} />}</TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row'}} onPress={()=>{handleSort('MaximumSpots')}}><Text style={[styles.SortPattiText,{color:sortingFor==2?'#1a1a1a':'#969696'}]}>SPOTS</Text>{sortingFor==2 && <Icon name={sortOrder=='asc'?'arrow-down-thin':'arrow-up-thin'} size={16} color='#1a1a1a' style={{marginLeft:-9,marginTop:1.5,marginRight:8}} />}</TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row'}} onPress={()=>{handleSort('PrizePool')}}><Text style={[styles.SortPattiText,{color:sortingFor==3?'#1a1a1a':'#969696'}]}>PRIZE POOL</Text>{sortingFor==3 && <Icon name={sortOrder=='asc'?'arrow-down-thin':'arrow-up-thin'} size={16} color='#1a1a1a' style={{marginLeft:-9,marginTop:1.5,marginRight:8}} />}</TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row'}} onPress={()=>{handleSort('WinningPercentage')}}><Text style={[styles.SortPattiText,{color:sortingFor==4?'#1a1a1a':'#969696'}]}>% Winners</Text>{sortingFor==4 && <Icon name={sortOrder=='asc'?'arrow-down-thin':'arrow-up-thin'} size={16} color='#1a1a1a' style={{marginLeft:-9,marginTop:1.5,marginRight:8}} />}</TouchableOpacity>
      </ScrollView>
    </LinearGradient>
    {sortApplied && <View style={styles.sortAppliedContainer}>
      <Text style={styles.SortedItemLength}>{sortedItemLength+' contests'}</Text>
      <View style={styles.PrizeMoneyContainer}>
        <Text style={styles.SortedItemLength}>1 Sort applied</Text>
        <Text style={styles.ClearText} onPress={()=>{setRefresh(!refresh)}}>CLEAR</Text>
      </View>
    </View>}
    {!loadingSpinner && <SectionList
      sections={fourOvers}       
      keyExtractor={(_,index) => index}
      renderItem={CardFormat}         
      renderSectionHeader={({ section: { title } }) =>(
        <View style={styles.FlatListHeaderContainer}>
          <View style={styles.TitleImageContainer}>
          {title==='Mega Contest'&&<FastImage source={require('../accessories/FantasyPointsSystem/MegaContest.png')} style={styles.ListHeaderImage}/>}
          {title==='Trending Now'&&<FastImage source={require('../accessories/FantasyPointsSystem/TrendingNow.png')} style={styles.ListHeaderImage}/>}
          {title==='Only For Beginners'&&<FastImage source={require('../accessories/FantasyPointsSystem/OnlyForBeginners.png')} style={styles.ListHeaderImage}/>}
          {title==='High Entry=High Rewards'&&<FastImage source={require('../accessories/FantasyPointsSystem/HighEntry=HighRewards.png')} style={styles.ListHeaderImage}/>}
          {title==='Head To Head'&&<FastImage source={require('../accessories/FantasyPointsSystem/HeadToHead.png')} style={styles.ListHeaderImage}/>}
          {title==='Low Entry Contests'&&<FastImage source={require('../accessories/FantasyPointsSystem/LowEntryContests.png')} style={styles.ListHeaderImage}/>}
          {title==='Winner Takes All'&&<FastImage source={require('../accessories/FantasyPointsSystem/WinnerTakesAll.png')} style={styles.ListHeaderImage}/>}
          {title==='Sorted Contests'&&<Icon name='sort' size={20} color='#1a1a1a'/>}
          <Text style={styles.FlatListHeaderText}>{title}</Text>
          </View>
        </View>
      )}
      renderSectionFooter={()=>(<View style={{height:8,backgroundColor:'#f0f0f0',marginTop:15}}></View>)}
      refreshing={false}
      onRefresh={()=>{setRefresh(!refresh)}}
      stickySectionHeadersEnabled
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={30}
      style={{backgroundColor:'#ffffff',flex:1}}
    />}
    <TouchableWithoutFeedback onPress={()=>{navigation.navigate('SetCreator',{MatchId:MatchId,TeamCode1:TeamCode1,TeamCode2:TeamCode2,I1:I1,I2:I2,uid:uid})}}>
      <View style={styles.NextButtonContainerFinal} elevation={2}>
        <Icon name='plus-circle-outline' color={'#f6f7fb'} size={18}/>
        <Text style={styles.NextButtonText}>  Create Set</Text>
      </View>
    </TouchableWithoutFeedback>
    </>)}
    </>
  )
}

const styles = StyleSheet.create({
  Card:{
    backgroundColor:'#ffffff',
    marginHorizontal:15,
    borderRadius:5,
    paddingHorizontal:10,
    marginBottom:15
  },
  PrizeEntryTextContainer:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
  },
  PrizeText:{
    color:'#969696',
    fontFamily:'Poppins-SemiBold',
    fontSize:12
  },
  OversMentionContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  OversMentionText:{
    color:'#969696',
    fontFamily:'Poppins-Medium',
    fontSize:12
  },
  OversMentionNumber:{
    color:'#696969',
    fontFamily:'Poppins-Medium',
    fontSize:12,
  },
  PrizeMoneyContainer:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  Rupee:{
    color:'#1a1a1a',
    fontSize:21,
    fontWeight:'600',
    alignSelf:'flex-start'
  },
  PrizeMoneyText:{
    color:'#1a1a1a',
    fontFamily:'Poppins-SemiBold',
    fontSize:20,
  },
  EntryMoneyText:{
    paddingHorizontal:22,
    paddingVertical:5,
    color:'#ffffff',
    fontWeight:'bold',
    backgroundColor:'#109e38',
    borderRadius:3
  },
  ProgressLineContainer:{
    marginTop:9,
    height:4,
    backgroundColor:'#ffe2db',
    opacity:0.8,
    borderRadius:5
  },
  SpotsNumberContainer:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginTop:4,
  },
  SpotsLeftNumber:{
    color:'#db2800',
    fontSize:12,
    fontFamily:'Poppins-Regular'
  },
  TotalSpotsNumber:{
    color:'#a1a1a1',
    fontSize:12,
    fontFamily:'Poppins-Regular'
  },
  ExtraDetailsContainer:{
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#fafafa',
    marginHorizontal:-10,
    marginTop:8,
    height:26,
    borderBottomLeftRadius:5,
    borderBottomRightRadius:5,
  },
  FirstIconContainer:{
    marginLeft:12,
    marginRight:4
  },
  WinningMoneyContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    marginTop:2.9
  },
  RupeeSymbol:{
    color:'#666666',
    alignSelf:'flex-start',
    fontSize:12
  },
  WinningMoneyText:{
    color:'#666666',
    fontFamily:'Poppins-Medium',
    fontSize:12
  },
  TrophyIconContainer:{
    marginLeft:20,
    marginRight:4,
  },
  DeadlineContestContaioner:{
    flexDirection:'row',
    alignItems:'center',
    position:'absolute',
    right:12,
  },
  DeadlineContestIconContaioner:{
    marginRight:4
  },
  DeadlineOverText:{
    color:'#1141c1',
    fontFamily:'Poppins-Medium',
    fontSize:11,
    lineHeight:20
  },
  FlatListHeaderContainer:{
    alignItems:'center',
    flexDirection:'row',
  },
  TitleImageContainer:{
    backgroundColor:'#ffffff',
    elevation:1,
    paddingHorizontal:7,
    borderBottomLeftRadius:5,
    borderBottomRightRadius:5,
    flexDirection:'row',
    paddingVertical:6,
    marginLeft:15,
    marginBottom:11,
  },
  FlatListHeaderText:{
    color:'#212121',
    fontFamily:'Poppins-Medium',
    fontSize:13,
    paddingLeft:7
  },  
  ListHeaderImage:{
    width:21,
    height:21
  },
  NextButtonContainerFinal:{
    position:'absolute',
    bottom:20,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#363636',
    alignSelf:'center',
    borderRadius:20,
    paddingHorizontal:20,
    paddingVertical:3
  },
  NextButtonText:{
    color:'#ffffff',
    fontFamily:'Poppins-Medium',
    marginTop:3,
    fontSize:13
  },
  TabPattiText:{
    color:'#787878',
    fontFamily:'Poppins-Medium',
    fontSize:12,
    paddingRight:8,
    paddingLeft:10
  },
  SortByText:{
    color:'#1a1a1a',
    fontFamily:'Poppins-Regular',
    fontSize:13,
    paddingRight:10
  },
  SortPattiText:{
    fontFamily:'Poppins-Regular',
    fontSize:13,
    marginHorizontal:10
  },
  sortAppliedContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    backgroundColor:'#ffffff',
    paddingHorizontal:12,
    paddingVertical:7,
    zIndex:2,
    elevation:4
  },
  SortedItemLength:{
    color:'#969696',
    fontFamily:'Poppins-Regular',
    fontSize:13
  },
  ClearText:{
    color:'#1a1a1a',
    fontFamily:'Poppins-Medium',
    fontSize:13,
    paddingLeft:10
  }
});