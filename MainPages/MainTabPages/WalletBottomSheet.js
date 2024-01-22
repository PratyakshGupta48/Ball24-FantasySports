import React,{useState,useEffect} from 'react';
import {Text,View,StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'

export default function WalletBottomSheet({navigation}) {

  const [AddedAmount,setAddedAmount] = useState(null);
  const [WinningAmount,setWinningAmount] = useState(null);
  const [DBCashBonus,setDBCashBonus] = useState(null);

  useEffect(()=>{
    const unsubscribeWallet = firestore().collection('users').doc(auth().currentUser.uid).onSnapshot(documentSnapshot=>{
      setAddedAmount(documentSnapshot.data().AddedAmount)
      setWinningAmount(documentSnapshot.data().WinningAmount)
      setDBCashBonus(documentSnapshot.data().DBCashBonus)
    })
    return ()=>unsubscribeWallet;
  },[])

  return(<>
    <Text style={styles.TotalMoneyAmount}>{'₹'+(AddedAmount+WinningAmount+DBCashBonus).toFixed(2)}</Text>
    <Text style={styles.TotalBalanceText}>Total Balance</Text>
    <View style={styles.Seperator}></View>
    <View style={styles.AmountAddedCard}>
      <View style={styles.AmountAddedTxtPlusAmountConainer}>
        <Text style={styles.AmountAddedText}>AMOUNT ADDED (UNUTILISED)</Text>
        <Text style={styles.AmountAddedAmount}>{'₹'+AddedAmount}</Text>
      </View>
      <Text style={styles.AddMoneytext} onPress={navigation}>ADD CASH</Text>
    </View>
    <View style={styles.Seperator}></View>
    <View style={styles.WinningsCard}>
      <Text style={styles.AmountAddedText}>WINNINGS</Text>
      <Text style={styles.AmountAddedAmount}>{'₹'+WinningAmount}</Text>
    </View>
    <View style={styles.Seperator}></View>
    <View style={styles.WinningsCard}>
      <Text style={styles.AmountAddedText}>BALL24 CASH BONUS</Text>
      <Text style={styles.AmountAddedAmount}>{'₹'+DBCashBonus}</Text>
    </View>
    <View style={styles.iIconContainer}>
      <Icon name='cash-fast' size={35} color='#019401' style={{marginRight:8}}/>
      <Text style={styles.DBinfoText}>Maximum usable Ball24 Cash Bonus = 15%{'\n'} of Mega Contest's Entry Fees</Text>
    </View></>
  )
}

const styles = StyleSheet.create({
  TotalMoneyAmount:{
    color:'#5c5c5c',
    fontSize:27,
    fontWeight:'700',
    textAlign:'center',
    paddingTop:23
  },
  TotalBalanceText:{
    color:'#4a4a4a',
    fontSize:13,
    fontFamily:'Poppins-SemiBold',
    paddingTop:4,
    textAlign:'center',
    paddingBottom:4
  },
  AmountAddedCard:{
    flexDirection:'row',
    backgroundColor:'#ffffff',
    height:70,
    paddingHorizontal:20,
    justifyContent:'space-between',
    alignItems:'center'
  },
  AmountAddedTxtPlusAmountConainer:{
     flexDirection:'column',
     justifyContent:'space-between'
  },
  AmountAddedText:{
    color:'#666666',
    fontFamily:'Poppins-SemiBold',
    fontSize:11.3,
  },
  AmountAddedAmount:{
    color:'#121212',
    fontSize:15,
  },
  AddMoneytext:{
    color:'#ffffff',
    fontFamily:'Poppins-Medium',
    fontSize:14,
    backgroundColor:'#019401',
    borderRadius:5,
    paddingHorizontal:10,
    paddingVertical:6
  },
  WinningsCard:{
    flexDirection:'column',
    backgroundColor:'#ffffff',
    height:70,
    paddingHorizontal:20,
    justifyContent:'space-between',
    alignItems:'flex-start',
    paddingVertical:14.2
  },
  iIconContainer:{
    marginHorizontal:20,
    paddingHorizontal:8,
    flexDirection:'row',
    alignItems:'center',
    borderWidth:0.4,
    borderRadius:3,
    borderColor:'#019401',
    paddingVertical:5,
  },
  DBinfoText:{
    color:'#121212',
    fontFamily:'Poppins-Regular',
    fontSize:10,
    textAlign:'left'
  },
  Seperator:{
    backgroundColor:'#e3e3e3',
    height:0.5
  }
});