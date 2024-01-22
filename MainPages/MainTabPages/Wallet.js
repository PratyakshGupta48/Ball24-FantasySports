import React,{useEffect,useState} from 'react';
import {View,Text,TouchableWithoutFeedback,StyleSheet,ScrollView,ActivityIndicator,RefreshControl} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {height,width} from '../../Dimensions';
import {useIsFocused} from '@react-navigation/native'
import firestore from '@react-native-firebase/firestore'; 
import LinearGradient from 'react-native-linear-gradient';

function Wallet({navigation}) {

  const [AddedAmount,setAddedAmount] = useState(null);
  const [WinningAmount,setWinningAmount] = useState(null);
  const [DBCashBonus,setDBCashBonus] = useState(null);
  const [loadingSpinner,setLoadingSpinner] = useState(true);
  const [refresh,setRefresh] = useState(false);
  const isFocused = useIsFocused();
    
  useEffect(()=>{
    const unsubscribe = firestore().collection('users').doc(auth().currentUser.uid).onSnapshot(documentSnapshot=>{
      setAddedAmount(documentSnapshot.data().AddedAmount)
      setWinningAmount(documentSnapshot.data().WinningAmount)
      setDBCashBonus(documentSnapshot.data().DBCashBonus)
      setLoadingSpinner(false)
    })
    return ()=>unsubscribe;
  },[refresh,isFocused]);

  return ( <>
    <View style={styles.MainWholeContainer}>
      <LinearGradient colors={['#1141c1', '#002487']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.FirstWrapperContainer}>
        <Text style={styles.TotalMoneyAmount}>{'₹'+(AddedAmount+WinningAmount+DBCashBonus).toFixed(2)}</Text>
        <Text style={styles.TotalBalanceText}>Total Balance</Text>
      </LinearGradient>
      <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={()=>{setLoadingSpinner(true);setRefresh(!refresh)}}/>} style={styles.MainScrollView} >
        <View style={styles.ScrollViewInsideMain}>
          <View style={styles.AmountAddedCard} elevation={2}>
            <View style={styles.AmountAddedTxtPlusAmountConainer}>
              <Text style={styles.AmountAddedText}>Amount Added (Unutilised)</Text>
              <Text style={styles.AmountAddedAmount}>{'₹'+AddedAmount}</Text>
            </View>
            <Text style={styles.AddMoneytext} onPress={()=>navigation.navigate('AddCash')}>ADD CASH</Text>
          </View>
          <View style={styles.WinningsCard} elevation={2}>
            <Text style={styles.WinningsText}>Winnings</Text>
            <Text style={styles.WinningsAmount}>{'₹'+WinningAmount}</Text>
          </View>
          <View style={styles.DBCashBonusCard} elevation={2}>
            <Text style={styles.DBCashBonusText}>Ball24 Cash Bonus</Text>
            <Text style={styles.DBCashBonusAmount}>{'₹'+DBCashBonus}</Text>
            <View style={styles.iIconContainer}>
              <Icon name='cash-fast' size={35} color='#019401' style={{marginRight:8}}/>
              <Text style={styles.DBinfoText}>Maximum usable Ball24 Cash Bonus = 15% of Mega Contest's Entry Fees</Text>
            </View>
          </View>
          <TouchableWithoutFeedback onPress={()=>{navigation.navigate('Withdraw')}}>
            <View style={styles.WithdrawTextContainer} elevation={2}>
              <Icon name='bank-transfer-in' color={'#666666'} size={35} style={{marginRight:15}}/>
              <Text style={styles.WithdrawText}>Withdraw</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={()=>{navigation.navigate('Transactions')}}>
            <View style={styles.WithdrawTextContainer} elevation={2}>
              <Icon name='progress-clock' color={'#666666'} size={31} style={{marginRight:15}}/>
              <Text style={styles.WithdrawText}>Transaction History</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </ScrollView>   
    </View>
    {loadingSpinner && <ActivityIndicator 
      hidesWhenStopped={true}
      color="#1141c1"
      size="large"
      animating={true}
      style={styles.ActivityIndicator}
    />}
    </>
  );
}
export default Wallet;

const styles = StyleSheet.create({
  MainWholeContainer: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  ScrollViewInsideMain: {
    marginBottom: 70,
  },
  FirstWrapperContainer: {
    height: 120,
    backgroundColor: '#1141c1',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  TotalMoneyAmount: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: 23,
  },
  TotalBalanceText: {
    color: '#f7f7f7',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    paddingTop: 4,
    textAlign: 'center',
  },
  AmountAddedCard: {
    flexDirection: 'row',
    marginTop: 15,
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    height: 70,
    paddingHorizontal: 12,
    borderRadius: 9,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  AmountAddedTxtPlusAmountConainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  AmountAddedText: {
    color: '#666666',
    fontFamily: 'Poppins-Medium',
    fontSize: 11.3,
  },
  AmountAddedAmount: {
    color: '#121212',
    fontSize: 15,
  },
  AddMoneytext: {
    color: '#ffffff',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    backgroundColor: '#019401',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  WinningsCard: {
    flexDirection: 'column',
    marginTop: 15,
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    height: 70,
    paddingHorizontal: 12,
    borderRadius: 9,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14.2,
  },
  WinningsText: {
    color: '#666666',
    fontFamily: 'Poppins-Medium',
    fontSize: 11.3,
  },
  WinningsAmount: {
    color: '#121212',
    fontSize: 15,
  },
  DBCashBonusCard: {
    flexDirection: 'column',
    marginTop: 15,
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    paddingLeft: 12,
    borderRadius: 9,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14.2,
    marginBottom: 20,
    paddingRight: 40,
  },
  DBCashBonusText: {
    color: '#666666',
    fontFamily: 'Poppins-Medium',
    fontSize: 11.3,
  },
  DBCashBonusAmount: {
    color: '#121212',
    fontSize: 15,
  },
  iIconContainer: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.4,
    paddingLeft: 5,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    borderRadius: 3,
    borderColor: '#019401',
    paddingVertical: 5,
  },
  DBinfoText: {
    color: '#121212',
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    lineHeight: 13,
  },
  WithdrawTextContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    paddingLeft: 12,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 14.2,
    marginBottom: 20,
    paddingRight: 40,
  },
  WithdrawText: {
    fontFamily: 'Poppins-Medium',
    color: '#666666',
    marginTop: 3,
  },
  ActivityIndicator: {
    position: 'absolute',
    height: height - 130,
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    opacity: 1,
  },
});