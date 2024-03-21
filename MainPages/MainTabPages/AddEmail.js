import {View,Text,StyleSheet,TextInput,StatusBar,KeyboardAvoidingView,ActivityIndicator} from 'react-native';
import React, { useState } from 'react'
import HeaderBlank from '../../Headers/HeaderBlank';
import functions from '@react-native-firebase/functions';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import OTPInputView from '@twotalltotems/react-native-otp-input';

export default function AddEmail({navigation}) {
 
  const uid = auth().currentUser.uid;
  const [email, setEmail] = useState("");
  const [OTP,setOTP] = useState('');
  const [S,SetS] = useState(null);
  const [placeholder,setPlaceholder] = useState('abc@gmail.com');
  const [confirmVisi,setConfirmVisi] = useState(false);
  const [showSpinner,setShowSpinner] = useState(false)
  const showToast = (type,text1,text2) => Toast.show({type: type,text1: text1,visibilityTime:2500,position:'top',topOffset:0,text2: text2});

  return (<>
    <StatusBar animated={true} backgroundColor="#000000"/>
    <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'Enter Email'} color='#1a1a1a'/>
    <View style={{flex:1,backgroundColor:'#ffffff'}}>
    {confirmVisi==false && <Text style={styles.BSVerifyMail}>Enter the email you would like to use :</Text>}
    {confirmVisi==false && <KeyboardAvoidingView style={styles.KeyboardAvoidingView}>
      <TextInput
        onFocus={() => { setPlaceholder('');}}
        onBlur={()=>setPlaceholder('abc@gmail.com')}
        style={styles.PhoneNumberInput}
        onChangeText={setEmail}
        value={email}
        placeholder={placeholder}
        placeholderTextColor={'#969696'}
        keyboardType='email-address'
        maxLength={80}
        selectionColor={'#969696'}
      />
      <Text style={styles.youWillText}>You will receive an OTP for verification</Text>
      <Text style={email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)?[styles.BSSendOTPText,{backgroundColor:'#009e00',color:'#ffffff'}]:styles.BSSendOTPText} onPress={()=>{
        if(email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)){
          setConfirmVisi(true);
          const sendOTP = functions().httpsCallable('sendEmail')
          sendOTP({email:email}).then(res=>{
            if(!isNaN(res.data))SetS(res.data)
            if (res.data === 'Error')error('Oops! Something Went Wrong', 'We encountered an error. Please try again later.');
          }).catch(e=>error('Oops! Something Went Wrong', 'We encountered an error. Please try again later.'));
        }
        else showToast('error',"Invalid Email Address","Please enter a valid email address.")
      }}>SEND OTP</Text>
    </KeyboardAvoidingView>}
    {confirmVisi==true && <>
    <Text style={styles.OtpSentToText}>OTP sent to {email}</Text>
    <KeyboardAvoidingView style={styles.KeyboardAvoidingView}>
      <Text style={styles.EnterOTPText}>Enter the OTP you received</Text>
      <View style={styles.InputContainer}>
        <OTPInputView
          style={{width: '100%', height:70}}
          pinCount={6}
          autoFocusOnLoad
          codeInputFieldStyle={styles.underlineStyleBase}
          codeInputHighlightStyle={{borderColor: "#1141c1"}}
          onCodeChanged={setOTP}
          code={OTP}
          selectionColor='#969696'
        />
      </View>
      {!showSpinner?<Text style={OTP.length==6?[styles.BSSendOTPText,{backgroundColor:'#009e00',color:'#ffffff'}]:styles.BSSendOTPText} onPress={()=>{
        if(OTP.length==6 && OTP==S){
          setShowSpinner(true)
          auth().currentUser.updateProfile({email:email})
          const AddEmail = functions().httpsCallable('AddEmail')
          AddEmail({uid:uid,email:email}).then(()=>{
            setShowSpinner("")
            showToast('success','SUccessfully Verified','Your email has been verified successfully.Redirecting...');
            setTimeout(() => navigation.pop(), 3000);
          }).catch(e=>error('Oops! Something Went Wrong', 'We encountered an error. Please try again later.'));
        }
        else showToast('error','Invalid OTP',"Please enter a valid OTP and try again.")
      }}>CONFIRM OTP</Text>:<ActivityIndicator hidesWhenStopped={true} color="#1141c1" size="small"  animating={true} style={{marginTop:32}}/>}
    </KeyboardAvoidingView>
    </>}
    

    </View>
   </> 
  )
}

const styles = StyleSheet.create({
  KeyboardAvoidingView:{
    backgroundColor:'#ffffff',
    marginHorizontal:10,
    marginVertical:15,
    borderColor:'#c7c7c7',
    borderWidth:1,
    borderRadius:5,
    paddingBottom:20,
  },
  youWillText:{
    color:'#121212',
    fontSize:11,
    color:'#212121',
    fontFamily:'Poppins-Light',
    marginLeft:25,
    marginTop:3
  },
  PhoneNumberInput:{
    color:'#121212',
    fontSize:16,
    borderBottomColor:'#969696',
    borderBottomWidth:.8,
    marginHorizontal:19,
    marginTop:25,
    backgroundColor:'#fafafa',
    paddingLeft:13,
    borderRadius:4,
    paddingVertical:10,
    height:48
  },
  BSVerifyMail:{
    color:'#454545',
    marginTop:25,
    fontFamily:'Poppins-Medium',
    fontSize:14,
    marginHorizontal:12
  },
  BSSendOTPText:{
    backgroundColor:'#cccccc',
    marginHorizontal:19,
    borderRadius:4,
    paddingVertical:8,
    marginTop:25,
    textAlign:'center',
    color:'#969696',
    fontFamily:'Poppins-SemiBold',
    fontSize:16
  },
  OtpSentToText:{
    color:'grey',
    fontSize:13,
    fontFamily:'Poppins-Regular',
    marginTop:12,
    marginLeft:12
  },  
  EnterOTPText:{
    color:'grey',
    textAlign:'center',
    marginTop:9
  },   
  underlineStyleBase: {
    width: 40,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 1.2,
    color:'#121212',
    fontSize:16,
    fontFamily:'Poppins-Light',
  },
  InputContainer:{
    marginHorizontal:19,
    marginTop:12,
    borderRadius:4
  },
})