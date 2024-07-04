import { StyleSheet, Text, View ,StatusBar, FlatList,Image} from 'react-native'
import React, { useState ,useEffect ,useCallback} from 'react'
import HeaderBlank from '../../Headers/HeaderBlank';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; 
import SkeletonContent from '../../SkeletonPlaceholder';

export default function Transactions({navigation}) {

  const [Transactions,setTransactions] = useState(null);
  const [loadingSpinner,setLoadingSpinner] = useState(true);
  const [refresh,setRefresh] = useState(false);
  const uid = auth().currentUser.uid;
  const prizeImage = {
    10:require('../../accessories/ReferImages/cpy2.png'),
    25:require('../../accessories/ReferImages/swiggy.png'),
    100:require('../../accessories/ReferImages/hoodb.png'),
    250:require('../../accessories/ReferImages/prime.png'),
    700:require('../../accessories/ReferImages/amazonmain.png'),
    2000:require('../../accessories/ReferImages/airpods-apple.png'),
    5000:require('../../accessories/ReferImages/Apple-iPad.png'),
    10000:require('../../accessories/ReferImages/iphone.png')
  }

  useEffect(()=>{
    setLoadingSpinner(true)
    const Array = [];
    firestore().collection('users').doc(uid).collection('ReferHistory').get().then(querySnapshot=>{
      querySnapshot.forEach(documentSnapshot=>{
        Array.push({
          ...documentSnapshot.data()
        })
      })
      setTransactions(Array.reverse());
      setLoadingSpinner(false);
    })
  },[refresh])

  const renderTransactions = useCallback(({ item }) =>
    <View style={styles.TransactionContainer}>
      <View style={styles.ImageTextContainer}>
        <Image source={prizeImage[item.Points]} style={item.Points==25?{height:40,width:40,marginRight:7}:{height:50,width:50}} resizeMethod='scale' resizeMode='contain'></Image>
        <View style={styles.TextDateContainer}>
          <Text style={styles.PrizeText}>{item.Prize}</Text>
          <Text style={styles.DateText}>{new Date(item.time).toLocaleString()}</Text>
        </View>
      </View>
      <Text style={styles.PointsText}>{"-"+item.Points+' '}<Image source={require('../../accessories/ReferImages/bCoin2.png')} style={{width:16,height:16}}></Image></Text>
    </View>
  , []);

  return (<>
    <StatusBar animated={true} backgroundColor="#121212"/>
    <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'Redeem History'} color='#1a1a1a'/>
    {loadingSpinner?<View style={{flex:1,backgroundColor:'#ffffff'}}><SkeletonContent/></View>:
      <FlatList
        data={Transactions}
        renderItem={renderTransactions}
        keyExtractor={(item) => item.time}
        refreshing={false}
        onRefresh={() => setRefresh(!refresh)}
        initialNumToRender={10}
      />
    }</>
  )
}

const styles = StyleSheet.create({
  TransactionContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    backgroundColor:'#ffffff',
    paddingHorizontal:12,
    paddingVertical:6,
    borderBottomColor:'#dbdbdb',
    borderBottomWidth:1,
  },
  ImageTextContainer:{
    alignItems:'center',
    flexDirection:'row',
    justifyContent:'flex-start'
  },
  TextDateContainer:{
    flexDirection:'column',
    alignItems:'flex-start',
    justifyContent:'space-between',
    marginLeft:10
  },
  PrizeText:{
    color:'#121212',
    fontFamily:'Poppins-Medium',
    fontSize:13,
    paddingBottom:8
  },
  DateText:{
    color:'#969696',
    fontFamily:'Poppins-Medium',
    fontSize:11,
  },
  PointsText:{
    color:'#121212',
    fontFamily:'Poppins-SemiBold',
  }
})