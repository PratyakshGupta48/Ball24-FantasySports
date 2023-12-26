import { StyleSheet, Text, View ,StatusBar, TextInput, TouchableWithoutFeedback} from 'react-native'
import React, { useState, useEffect } from 'react'
import firestore from '@react-native-firebase/firestore'; 
import auth from '@react-native-firebase/auth';
import HeaderBlank from '../../Headers/HeaderBlank';

export default function Withdraw({navigation}) {

  const [availableBalance,setAvailableBalance] = useState(null)
  const [enteredAmount,setEnteredAmount] = useState('')
  const [validationError,setValidationError] = useState('')
  const [bankDetails,setBankDetails] = useState(null)
  const [buttonMessage,setButtonMessage] = useState('')

  useEffect(()=>{
    const user = auth().currentUser;
    const uid = user.uid;
    firestore().collection('users').doc(uid).get().then(documentSnapshot=>{
      setAvailableBalance(documentSnapshot.data().WinningAmount)
      setBankDetails(documentSnapshot.data().BankAccount)
      if((documentSnapshot.data().BankAccount).Name==""){
        setButtonMessage('Add Bank Account')
      }
      else{
        setButtonMessage('Withdraw to Bank Account')
      }
    })
  },[])

  const HandleButtonPress = () => {
    if(enteredAmount!='' && isNaN(enteredAmount)==false){
      setValidationError('')
      if(enteredAmount<=availableBalance){
        if(enteredAmount>=50){
          setValidationError('')
          navigation.navigate('Withdraw_BankAccount',{BankDetails:bankDetails,Message:buttonMessage,Amount:enteredAmount})
        }
        else{
          setValidationError('Minimum Withdrawal amount is Rs.50')
        }
      }
      else{
        setValidationError('Not Enough Balance')
      }
    }
    else{
      setValidationError('Incorrect Amount Entered')
    }
  }

  return (
    <>
   <StatusBar animated={true} backgroundColor="#121212"/>
  
   <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'Withdraw'}/>

   <View style={styles.EnterAmountContainer}>
      <Text style={styles.EnterAmountText}>Enter the amount to withdraw</Text>
   </View>

   <View style={styles.EnterAmountContainer}>
      <Text style={styles.EnterAmountText}>Available Balance : Rs. {availableBalance}</Text>
   </View>

   <View style={styles.TextInputContainer}>
      <Text style={styles.RupeeSymbol}>₹ </Text>
      <TextInput
        style={styles.Textinput}
        placeholder="Enter Amount to withdraw                                                                                        "
        placeholderTextColor="black"
        keyboardType="numeric"
        selectionColor="black"
        onChangeText={setEnteredAmount}
        value={enteredAmount}
      />
   </View>

   {validationError != '' && (
      <View style={styles.validationErrorContainer}>
        <Text style={styles.validationErrorText}>{validationError}</Text>
      </View>
    )}

   <View style={styles.SendOtpButtonContainer}>
     <TouchableWithoutFeedback onPress={()=>{
      HandleButtonPress()
     }}>
       <Text style={styles.SendOtpButton}>{buttonMessage}</Text>
     </TouchableWithoutFeedback>
   </View>
    </>
  )
}

const styles = StyleSheet.create({
  EnterAmountContainer:{
    marginTop:15,
    marginLeft:10
  },
  EnterAmountText:{
    color:'#666666',
    fontFamily:'Poppins-Medium',
    fontSize:13
  },
  TextInputContainer: {
    borderBottomColor: 'black',
    borderBottomWidth: 0.8,
    marginHorizontal: 19,
    marginTop: 25,
    paddingLeft: 13,
    borderRadius: 4,
    flexDirection:'row',
    alignItems:'center'
  },
  Textinput: {
    color: 'black',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    letterSpacing:1,
  },
  RupeeSymbol:{
    color:'#121212',
    fontSize:19,
    position:'relative',
    top:-2
  },
  SendOtpButtonContainer: {
    marginHorizontal: 19,
    backgroundColor: '#009400',
    marginTop: 25,
    paddingVertical: 8,
    borderRadius: 4,
  },
  SendOtpButton:{
    textAlign: 'center',
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  validationErrorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  validationErrorText: {
    color: '#bf1120',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
})