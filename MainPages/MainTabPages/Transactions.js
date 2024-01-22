import { StyleSheet, Text, View ,FlatList, ActivityIndicator, Image, TouchableWithoutFeedback} from 'react-native'
import React, { useState ,useEffect ,useCallback,useRef} from 'react'
import HeaderBlank from '../../Headers/HeaderBlank';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; 
import {height,width} from '../../Dimensions';
import { groupBy } from 'lodash';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet , {BottomSheetBackdrop} from '@gorhom/bottom-sheet';

export default function Transactions({navigation}) {

  const sheetRef1 = useRef(null);
  function openBottomSheet() {if (sheetRef1.current)sheetRef1.current.snapToIndex(0)}
  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />);
  const uid = auth().currentUser.uid;
  const [Transactions,setTransactions] = useState(null);
  const [loadingSpinner,setLoadingSpinner] = useState(true);
  const [refresh,setRefresh] = useState(false);
  const [tid,setTid] = useState(null);

  useEffect(()=>{
    setLoadingSpinner(true)
    firestore().collection('users').doc(uid).get().then(documentSnapshot=>{
      setTransactions((documentSnapshot.data().Transactions).reverse())
      setLoadingSpinner(false)
    })
  },[refresh])

  const WithdrawStatus = () => {
    const [status,setStatus] = useState(null);
    useEffect(()=>{
      firestore().collection('Withdrawal Requests').doc(uid+tid).get().then(doc=>{
        setStatus(doc.data().status);
      })
    },[])
    return <Text style={styles.WithdrawStatus}>   Status - {status} </Text>
  }

  const renderItem = ({ item }) => {
    let iconName='medal-outline',color='#0fa140',bgColor='#eef9f1',amt = '#464646',txt = '#464646';
    switch(item.context){
      case 'Refer And Win':{
        iconName = 'wallet-giftcard';
        amt = txt = '#0fa140';
        break;
      }
      case 'Withdraw':{
        iconName = 'bank-transfer-in';
        txt = '#0fa140';
        break;
      }
      case 'Deposit':{
        if(item.status=='success') iconName='bank-check';
        else if(item.status=='failed'){
          item.context = 'Deposit Failed'
          iconName = 'bank-remove';
          color = txt = '#cf4f15';
          bgColor = '#fef6f3';
          amt = '#737373';
        }
        break;
      }
      case 'Refund':{
        iconName = 'cash-refund';
        color = '#545454';
        bgColor = '#f5f5f5'
        break;
      }
      case 'Entry Paid':{
        color = '#545454';
        bgColor = '#f5f5f5'
        break;
      }
      case 'Winning':{
        amt = txt = '#0fa140';
        break;
      }
    }

    return (
      <TouchableWithoutFeedback onPress={()=>{if(item.context=='Withdraw'){setTid(item.tid);openBottomSheet(0)}}}>
      <View style={styles.TransactionItemContainer}>
        <Icon name={iconName} size={28} color={color} style={{marginLeft:10,backgroundColor:bgColor,width:40,height:40,borderRadius:100,textAlign:'center',textAlignVertical:'center'}}/>
        <View style={styles.NameTimeAmountContainer}>
          <View style={styles.NameTimeMatchContainer}>
            <Text style={[styles.Name,{color:txt}]}>{item.context}</Text>
            <Text style={styles.TimeMatch}><Text style={styles.TimeMatch}>{new Date(item.time).toLocaleTimeString() + (item.Extra != null ? ` | ${item.Extra}` : '') + ` | ${item.tid}`}</Text></Text>
          </View>
          <Text style={[styles.Amount, { color: amt }]}>{item.Amount === 'Free ' ? item.Amount : <>{item.type === 'Deposit' ? (item.Amount.includes('+')? '+(':'+') : (item.Amount.includes('+')? '-(':'-')}{item.Amount.includes('+') ? <>{item.Amount}{' '}<Image  source={require('../../accessories/ReferImages/cCoin.png')}  style={{ width: 14, height: 14, marginBottom: 4 }}/>{')'}</>: item.Amount}</>}</Text>
        </View>
      </View>
      </TouchableWithoutFeedback>
    );
  };

  const groupedTransactions = groupBy(Transactions, (transaction) => {
    return new Date(1000 * Math.round(transaction.time / 1000)).toDateString();
  });

  const renderGroupedTransactions = useCallback(({ item }) => <>
    <Text style={styles.DateText}>{item.date}</Text>
    {item.transactions.map((transaction, index) => (
      <View key={index}>
        {renderItem({ item: transaction })}
      </View>
    ))}</>
  , []);

  const groupedTransactionData = Object.entries(groupedTransactions).map(([date, transactions]) => {
    return {
      date,
      transactions,
    };
  });

  return (<>
    <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'Transactions'} color='#1a1a1a'/>
    {!loadingSpinner? <FlatList
      data={groupedTransactionData}
      renderItem={renderGroupedTransactions}
      keyExtractor={(item, index) => index.toString()}
      refreshing={false}
      onRefresh={() => setRefresh(!refresh)}
      style={{backgroundColor:'#ffffff',flex:1}}
    />:<ActivityIndicator 
      hidesWhenStopped={true}
      color="#1141c1"
      size="large"
      animating={true}
      style={styles.ActivityIndicator}
    />}
    <BottomSheet
      ref={sheetRef1}
      snapPoints={['10%']}
      index={-1}
      enablePanDownToClose={true}
      enableOverDrag={true}
      backdropComponent={renderBackdrop}
      handleStyle={{display:'none'}}
      backgroundStyle={{borderTopLeftRadius:13,borderTopRightRadius:13}}>
      {tid && <WithdrawStatus/>}
    </BottomSheet>
  </>)
}

const styles = StyleSheet.create({
  DateText: {
    height:25,
    backgroundColor:'#f5f5f5',
    paddingHorizontal:7,
    paddingTop:3,
    color: '#545454',
    fontFamily: 'Poppins-Regular',
    fontSize: 11.5,
  },
  ActivityIndicator: {
    position: 'absolute',
    height: height,
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    opacity: 1,
  },
  TransactionItemContainer:{
    flexDirection:'row',
    alignItems:'center',
  },
  NameTimeAmountContainer:{
    borderBottomColor:'#a8a8a8',
    borderBottomWidth:0.5,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingRight:12,
    width:width-50,
    paddingVertical:9
  },
  NameTimeMatchContainer:{
    flexDirection:'column',
    justifyContent:'space-between',
    alignItems:'flex-start',
    paddingLeft:10
  },
  TimeMatch:{
    color:'#737373',
    fontFamily:'Poppins-Regular',
    fontSize:10,
  },
  Name:{
    fontFamily:'Poppins-Medium',
    fontSize:14,
    paddingBottom:2
  },
  Amount:{
    fontWeight:'500',
    fontSize:14
  },
  WithdrawStatus:{
    color:'#464646',
    fontSize:15,
    textAlign:'center',
    marginTop:15,
    fontFamily:'Poppins-Medium'
  }
});