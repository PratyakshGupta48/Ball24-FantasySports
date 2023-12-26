import { StyleSheet, Text, View ,StatusBar, ActivityIndicator, TextInput, TouchableWithoutFeedback, ScrollView} from 'react-native'
import React, { useState ,useRef ,useCallback } from 'react'
import firestore from '@react-native-firebase/firestore'; 
import auth from '@react-native-firebase/auth';
import HeaderBlank from '../../Headers/HeaderBlank';
import {height,width} from '../../Dimensions';
import {useRoute} from '@react-navigation/native';
import functions from '@react-native-firebase/functions';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet , {BottomSheetBackdrop} from '@gorhom/bottom-sheet';

const Tab = createMaterialTopTabNavigator();


export default function Withdraw_BankAccount({navigation}) {

    const route = useRoute();
    const BankDetails = route.params.BankDetails;
    const Message = route.params.Message;
    const Amount = route.params.Amount
    
    const [Name,setName] = useState(BankDetails.Name)
    const [AccountNumber,setAccountNumber] = useState(BankDetails.AccountNumber)
    const [confirmAccountNumber,setConfirmAccountNumber] = useState(BankDetails.AccountNumber)
    const [IFSC,setIFSC] = useState(BankDetails.IFSC)
    const [validationError,setValidationError] = useState('')
    const [loadingSpinner,setLoadingSpinner] = useState(false)

    const user = auth().currentUser;
    const uid = user.uid;

    const sheetRef1 = useRef(null);

    const openBottomSheet1 = useCallback((index) => {
      if(sheetRef1.current){
        sheetRef1.current.snapToIndex(index);
      }
    },[]);
    const renderBackdrop = useCallback((props)=>(
      <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          />
    ))

    const HandleButtonPress = async () => {
        if(Name!='' && /^[a-z A-Z]+$/.test(Name)){
          setValidationError('')
          if(AccountNumber!='' && isNaN(AccountNumber)==false && /^[0-9]+$/.test(AccountNumber)){
            setValidationError('')
            if(confirmAccountNumber===AccountNumber){
              setValidationError('')
              if(IFSC!='' && IFSC.length==11 && /^[A-Za-z0-9]+$/.test(IFSC) && IFSC.charAt(4)==0){
                setValidationError('')
                setLoadingSpinner(true)
                let index;
                await firestore().collection('users').doc(uid).get().then(documentSnapshot=>{
                  index = ((documentSnapshot.data().Transactions).length)
                })
                let Withdraw = functions().httpsCallable('Withdraw')
                Withdraw({Amount:Amount,uid:uid,AccountNumber:AccountNumber,IFSC:IFSC,Name:Name,index:index}).then(()=>{
                  setLoadingSpinner(false)
                  openBottomSheet1(0)
                  setTimeout(() => {
                    navigation.navigate('Wallet')
                  }, 1600);
                })
              }
              else{
                setValidationError('Invalid IFSC Code')
              }
            }
            else{
              setValidationError('"Confirm Account Number" does not match "Account Number"')
            }
          }
          else{
            setValidationError('Invalid Account Number')
          }
        }
        else{
          setValidationError('Invalid Name Entered')
        }
    }

  return (
    <>
    <StatusBar animated={true} backgroundColor="#121212"/>
  
    <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'Withdraw - Bank Account'}/>

    <ScrollView>
    <View style={styles.EnterAmountContainer}>
      <Text style={styles.EnterAmountText}>Name:</Text>
    </View>

    <View style={styles.TextInputContainer}>
       <TextInput
         style={styles.Textinput}
         placeholder="Name                                                                        "
         placeholderTextColor="#969696"
         keyboardType="default"
         selectionColor="#969696"
         onChangeText={setName}
         value={Name}
       />
    </View>
    <View style={styles.EnterAmountContainer}>
      <Text style={styles.EnterAmountText}>Account Number:</Text>
    </View>

    <View style={styles.TextInputContainer}>
       <TextInput
         style={styles.Textinput}
         placeholder="Account Number                                                                       "
         placeholderTextColor="#969696"
         keyboardType="numeric"
         selectionColor="#969696"
         onChangeText={setAccountNumber}
         value={AccountNumber}
         maxLength={18}
       />
    </View>
    <View style={styles.EnterAmountContainer}>
      <Text style={styles.EnterAmountText}>Confirm Account Number:</Text>
    </View>

    <View style={styles.TextInputContainer}>
       <TextInput
         style={styles.Textinput}
         placeholder="Account Number                                                                        "
         placeholderTextColor="#969696"
         keyboardType="numeric"
         selectionColor="#969696"
         onChangeText={setConfirmAccountNumber}
         value={confirmAccountNumber}
         maxLength={18}
       />
    </View>
    <View style={styles.EnterAmountContainer}>
      <Text style={styles.EnterAmountText}>IFSC Code:</Text>
    </View>

    <View style={styles.TextInputContainer}>
       <TextInput
         style={styles.Textinput}
         placeholder="IFSC Code                                                                        "
         placeholderTextColor="#969696"
         keyboardType="default"
         selectionColor="#969696"
         onChangeText={setIFSC}
         value={IFSC}
         maxLength={11}
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
       <Text style={styles.SendOtpButton}>Withdraw ₹{Amount}</Text>
     </TouchableWithoutFeedback>
   </View>
    </ScrollView>

    <BottomSheet
      ref={sheetRef1}
      snapPoints={['32%']}
      index={-1}
      enablePanDownToClose={false}
      enableOverDrag={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{backgroundColor:'#f6f7fb'}}
      >
        <Icon name='check-circle-outline' size={55} color='#009e00' style={styles.DeadlineClockIcon}/>
        <View style={styles.DeadlineTextContainer}>
            <Text style={styles.DeadlineText}>Successfully Placed Request</Text>
            <Text style={styles.RedirectingText}>Money will be deposited within 48-72 hours.</Text>
            <Text style={styles.RedirectingText}>Redirecting back...</Text>
        </View>
    </BottomSheet>

    {loadingSpinner && <View style={styles.ActivityIndicator}>
     <ActivityIndicator 
     hidesWhenStopped={true}
     color="#1141c1"
     size="large"
     animating={true}
     />
   </View>}
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
        fontSize:14
      },
      TextInputContainer: {
        borderBottomColor: 'black',
        borderBottomWidth: 0.8,
        marginHorizontal: 19,
        marginTop:8,
        paddingLeft: 13,
        borderRadius: 4,
      },
      Textinput: {
        color: 'black',
        fontSize: 15,
        fontFamily: 'Poppins-Regular',
        letterSpacing:1,
      },
      SendOtpButtonContainer: {
        marginHorizontal: 19,
        backgroundColor: '#009400',
        marginTop: 25,
        paddingVertical: 12,
        borderRadius: 4,
      },
      SendOtpButton:{
        textAlign: 'center',
        color: '#ffffff',
        fontSize: 16,
        fontWeight:'900'
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
      ActivityIndicator:{
        position:'absolute',
        height:height,
        width:width,
        alignItems:'center',
        justifyContent:'center',
        zIndex:900,
        backgroundColor:'#ffffff',
        opacity:1,
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
      },
})