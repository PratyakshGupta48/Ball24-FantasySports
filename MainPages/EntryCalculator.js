import React, {useEffect, useState} from 'react';
import {View,Text,StyleSheet,ActivityIndicator} from 'react-native';
import firestore from '@react-native-firebase/firestore'; 
import functions from '@react-native-firebase/functions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function EntryCalculator({MatchId,TeamCode1,TeamCode2,ContestType,MatchKey,Entry,uid,selectedScores,Free,navigation,navigation2,modalFix,disableModal,error}) {

  const EntryNumber = parseFloat(Entry.substring(1));
  const [Amount,setAmount] = useState(null);
  const [Name,setName] = useState(null);
  const [ProfileImage,setProfileImage] = useState(null);
  const [DBCashBonusUsable,setDBCashBonusUsable] = useState(null);
  const [JoiningAmount,setJoiningAmount] = useState(null);
  const [ConfirmText,setConfirmtext] = useState(null);
  const [newUser,setNewUser] = useState();
  const [loadingSpinner,setLoadingSpinner] = useState(true)
  const [shown,setShown] = useState(false);

  useEffect(()=>{
    const unsubscribe = firestore().collection('users').doc(uid).onSnapshot(documentSnapshot=>{
      const { AddedAmount, WinningAmount, DBCashBonus, Name, ProfileImage, Contest } = documentSnapshot.data();
      setAmount(AddedAmount+WinningAmount);
      setName(Name)
      setProfileImage(ProfileImage)
      setNewUser(Contest);
      const availableBalance = AddedAmount+WinningAmount;
      const repeatHandler = () => {
        setJoiningAmount(0)
        setConfirmtext('CONFIRM')
      };
      const repeatHandler2 = (DB) =>{
        const Balance = availableBalance + DB
        setDBCashBonusUsable(DB)
        if(Balance<EntryNumber){
          const joiningAmount = parseFloat((EntryNumber-Balance).toFixed(2));
          setJoiningAmount(joiningAmount);
          setConfirmtext('Add ₹'+joiningAmount+' and Join');
        }
        else repeatHandler()
      }
      if(!Contest && Free==true){
        repeatHandler()
        setDBCashBonusUsable(0)
      }
      else if(ContestType=='Mega Contest'){
        if(parseFloat(DBCashBonus)>=((15/100)*EntryNumber)) repeatHandler2(parseFloat(((15/100)*EntryNumber).toFixed(2)))
        else repeatHandler2(parseFloat(DBCashBonus)) 
      }
      else repeatHandler2(0)  
      setLoadingSpinner(false)
    })
    return ()=>{unsubscribe();}
  },[])

  const AddOrDeductCash = async () => {
    modalFix()
    setLoadingSpinner(true)
    function r(){
      setShown(true)
      setLoadingSpinner(false)
      setTimeout(() => navigation(), 500);
    }
    if(JoiningAmount!==0){
      navigation2(JoiningAmount)
      disableModal()
    }
    else if(JoiningAmount==0){
      let UniqueSetNumber;
      await firestore().collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets').doc(uid).get().then(documentSnapshot=>{
        UniqueSetNumber = (documentSnapshot.exists)?documentSnapshot.data().Count+1:1     
      })
      const functionDecider = !newUser && Free===true;
      const Participation = functions().httpsCallable(functionDecider?'ContestParticipationNewUser':'ContestParticipationOldUserJZero')
      Participation(functionDecider?{MatchId:MatchId,MatchKey:MatchKey,uid:uid,TeamCode1:TeamCode1,TeamCode2:TeamCode2,Name:Name,ProfileImage:ProfileImage,selectedScores:selectedScores,UniqueSetNumber:UniqueSetNumber}:
        {MoneyToBeDeducted:EntryNumber-DBCashBonusUsable,DBCashBonusUsable:DBCashBonusUsable,MatchId:MatchId,MatchKey:MatchKey,uid:uid,TeamCode1:TeamCode1,TeamCode2:TeamCode2,Name:Name,ProfileImage:ProfileImage,selectedScores:selectedScores,UniqueSetNumber:UniqueSetNumber}).then((res)=>{
        if(res.data==null)r();
        else if (res.data === 'Status')error('error','Contest Live','Sorry, the contest is live. Redirecting...');
        else if (res.data === 'Spots')error('Contest Full', 'Sorry, this contest is full.Please participate in another contest.');
        else if (res.data === 'Funds')error('Insufficient Balance', 'Please add money to your wallet first.');
        else if (res.data === 'Error')error('Oops! Something Went Wrong', 'We encountered an error. Please try again later.');
      }).catch(e=>error('Oops! Something Went Wrong', 'We encountered an error. Please try again later.'))
    }
  } 

  return (
    <View style={styles.BottomSheetMainContainer}>
    {!shown && <><View style={{...common}}>
      <Text style={styles.CurrentBalanceText}>🪙 Current Balance</Text>
      <Text style={styles.CurrentBalanceAmount}>{'₹'+(Amount % 1 !== 0? Amount.toFixed(2):Amount)}</Text>
    </View>
    <View style={{...common,marginTop:8}}>
      <Text style={styles.EntryText}>💵 Entry</Text>
      {(!newUser && Free=='true')?<Text style={styles.EntryAmount}>Free 🤑</Text>:<Text style={styles.EntryAmount}>{Entry}</Text>}
    </View>
    <View style={{...common,marginTop:8}}>
      <Text style={styles.UsableCashText}>Usable Cash Bonus</Text>
      <Text style={styles.UsableCashAmount}>{'₹'+DBCashBonusUsable}</Text>
    </View>
    <View style={styles.SeperatingLine}></View>
    <View style={{...common,marginTop:6}}>
      <Text style={styles.JoiningAmountText}>Joining Amount</Text>
      <Text style={styles.JoiningAmountAmount}>{'₹'+JoiningAmount}</Text>
    </View>
    <Text style={styles.ConfirmationText} onPress={AddOrDeductCash}>{ConfirmText}</Text>
    </>}

    {shown && <><Icon name='check-circle-outline' size={55} color='#009e00' style={styles.DeadlineClockIcon}/>
    <View style={styles.DeadlineTextContainer}>
      <Text style={styles.DeadlineText}>Successfully Participated</Text>
      <Text style={styles.RedirectingText}>Redirecting back...</Text>
    </View></>}

    {loadingSpinner && <ActivityIndicator 
      hidesWhenStopped={true}
      color="#1141c1"
      size="large"
      animating={true}
      style={styles.ActivityIndicator}
    />}
  </View>
  )
}

const common = {  flexDirection:'row',
  justifyContent:'space-between',
  alignItems:'center'}
const styles = StyleSheet.create({
  BottomSheetMainContainer:{
   paddingTop:30,
   paddingHorizontal:15,
   backgroundColor:'#ffffff',
   borderRadius:10,
   height:271,
   overflow:'hidden'
  },
  CurrentBalanceText:{
   color:'#121212',
   fontFamily:'Poppins-Medium',
   fontSize:15,
  },
  CurrentBalanceAmount:{
   color:'#121212',
   fontSize:15,
   fontWeight:'600'
  },
  EntryText:{
   color:'#121212',
   fontFamily:'Poppins-Regular',
   fontSize:15,
  },
  EntryAmount:{
   color:'#121212',
   fontSize:15,
   fontWeight:'400'
  },
  UsableCashText:{
   color:'#ec1c24',
   fontFamily:'Poppins-Medium',
   fontSize:13
  },
  UsableCashAmount:{
   color:'#ec1c24',
   fontSize:13,
   fontWeight:'500'
  },
  SeperatingLine:{
   height:1,
   backgroundColor:'#b8b8b8',
   marginTop:14
  },
  JoiningAmountText:{
   color:'#121212',
   fontFamily:'Poppins-Regular',
   fontSize:15
  },
  JoiningAmountAmount:{
   color:'#121212',
   fontSize:15,
   fontWeight:'500'
  },
  ConfirmationText:{
    color:'#ffffff',
    fontWeight:'800',
    fontSize:18,
    backgroundColor:'#009e00',
    borderRadius:5,
    height:41,
    textAlign:'center',
    marginTop:40,
    marginBottom:20,
    paddingTop:7
  },
  ActivityIndicator:{
   position:'absolute',
   height:271,
   alignSelf:'center',
   width:'100%',
   alignItems:'center',
   justifyContent:'center',
   backgroundColor:'#ffffff',
   opacity:0.99,
   borderRadius:10
  },
  DeadlineClockIcon:{
    textAlign:'center',
    marginTop:5
  },
  DeadlineTextContainer:{
    flexDirection:'column',
    alignItems:'center'
  },
  DeadlineText:{
    color:'#121212',
    fontFamily:'Poppins-Medium',
    fontSize:18,
    marginTop:8
  },
  RedirectingText:{
    color:'#a1a1a1',
    fontFamily:'Poppins-Medium',
    marginTop:10
  }
})