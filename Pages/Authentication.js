import React,{useState,useEffect,useRef} from 'react';
import {View,Text,StyleSheet,KeyboardAvoidingView,TextInput,ActivityIndicator,StatusBar,Linking,BackHandler} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { width,height } from '../Dimensions';
import auth from '@react-native-firebase/auth';
import HeaderBlank from '../Headers/HeaderBlank';
import functions from '@react-native-firebase/functions'; 
import firestore from '@react-native-firebase/firestore'; 
import { Keyboard } from 'react-native';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import Toast from 'react-native-toast-message';
import storage from '@react-native-firebase/storage';

function Authentication ({navigation}) {

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);
    return () => backHandler.remove();
  }, []);

  const showToast = (type,text1,text2) => Toast.show({type: type,text1: text1,visibilityTime:2500,position:'top',topOffset:0,text2: text2});

  const handleBackButtonPress = () => {
    if (visibleRef.current !==-1 && visibleRef.current !==1) setVisible(--visibleRef.current);
    else navigation.goBack();
    return true;
  };

  async function authenticateUser() {
    if (phoneNumber.match(/^\d{10}$/)) {
      setVisible(++visibleRef.current)
      const confirmation = await auth().signInWithPhoneNumber('+91'+phoneNumber).catch((e)=>{showToast('error','Invalid Phone Number','The entered number is invalid.')})
      setConfirm(confirmation);
    } else showToast('error','Invalid Phone Number','The entered number is invalid.')
  }

  const CountDownTimer =()=>{
    const [seconds, setSeconds] = useState(59);
    useEffect(() => {
      const intervalId = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }, []);
    useEffect(() => {
      if (seconds === 0) setCountdownShown(false)
    }, [seconds]);
    return <Text style={{color:'#1141c1',fontFamily:'monospace',textAlign:'center',fontWeight:'600',marginBottom:4,fontSize:12}}>{seconds}</Text>
  }
      
  async function signInWithPhoneNumber2(phoneNumber) {
    await auth().signInWithPhoneNumber('+91'+phoneNumber,true);
    setAttempts(attempts+1);       
  }

  const checkCode = async () => {
    if(code.match(/^\d{6}$/))
      try {
        setLoadingSpinner(true)
        await confirm.confirm(code);
      } catch (error) {
        setLoadingSpinner(false)
        showToast('error','Invalid OTP','The entered OTP is invalid.')
      } 
    else showToast('error','Invalid OTP','The entered OTP is invalid.')
  }

  function onAuthStateChanged(user){
    if(user){
      setLoadingSpinner(false)
      Keyboard.dismiss()
      if(user.displayName==null) {setVisible(1); visibleRef.current = 1;setPhoneNumber(user.phoneNumber)}
      else navigation.replace('MainStackNavigation',{screen:'Drawer',params:{screen:'MainTab',params:{screen:'Home'}}})
    }
  }

  const onPresso = async () => {
    const showError = (m1,m2) => {
      setLoadingSpinner(false);
      showToast('error',m1,m2)
    };
    if (name.length < 5) {
      showError('Invalid Name!','Name should be at least 5 characters');
      return;
    }
    if (!name.match(/^[a-zA-Z0-9_ .]{5,}$/)) {
      showError('Invalid Name!','Name can only contain A-Z, a-z, _, ., space');
      return;
    }
    setLoadingSpinner(true);
    const nameExists = await firestore().collection('users').where('Name', '==', name).get();
    if (!nameExists.empty) {
      showError('Name not available','Sorry!This name is already taken.Try another');
      return;
    }
    let referExists = null;
    if (referCode !== '') {
      if (!(referCode.toUpperCase()).match(/^[A-Z0-9]{7}$/)) {
        showError('Refer Code not found!','Refer Code does not exists');
        return;
      }
      referExists = await firestore().collection('users').where('ReferCode', '==', referCode).get();
      if (referExists.empty) {
        showError('Refer Code not found!','Refer Code does not exists');
        return;
      }
    }
    Keyboard.dismiss()
    setSettingUpText(true);
    try {
      const randomImageIndex = Math.floor(Math.random() * 10);
      const randomImageUrl = `/Avatars/${defaultAvatars[randomImageIndex]}`;
      storage().ref(randomImageUrl).getDownloadURL().then(async url=>{
        await auth().currentUser.updateProfile({displayName: name,photoURL:url});
        navigation.replace('MainStackNavigation',{screen: 'Drawer',params: {screen: 'MainTab'}});
        const NameEnteredCreateDoc = functions().httpsCallable('NameEnteredCreateDoc');
        await NameEnteredCreateDoc({ uid:auth().currentUser.uid, phoneNumber, name, refferedBy: referCode || null, Id:referExists?referExists.docs[0].id:null,photo:url});
      })
    } catch (error) {
      showError('Check your internet connection');
    }
  };

  const clickedValue = useRoute().params.ClickedValue;
  const [settingUp,setSettingUpText] = useState(false);
  const [loadingSpinner,setLoadingSpinner] = useState(false);
  const [confirm,setConfirm] = useState();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [onFocusDetector, setOnFocusDetector] = useState(false);
  const [placeholder, setPlaceholder] = useState('Mobile no.');

  const [code,setCode] = useState('');
  const [countdownShown,setCountdownShown] = useState(true);
  const [attempts,setAttempts] = useState(1);

  const [name, setName] = useState('');
  const [NextButtonstyle2, setNextButtonstyle2] = useState(false);
  const [referCode,setReferCode] = useState('');
  const [placeholder2,setPlaceholder2] = useState('Name');
  const [placeholderRefer,setPlaceholderRefer] = useState('Refer Code (Optional)');
  const defaultAvatars = ['b1.jpg','b2.jpg','b3.jpg','b4.jpg','b5.jpg','g1.jpg','g2.jpg','g3.jpg','g4.jpg','g5.jpg'];

  const [visible,setVisible] = useState(-1);
  const visibleRef = useRef(-1);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  return(<>
    <StatusBar animated={true} backgroundColor="#1141c1" />
    <HeaderBlank navigation={()=>(visible!=-1 && visible!=1 )? setVisible(--visibleRef.current):navigation.goBack()} Heading={clickedValue} color='#1141c1'/>
    {visible==-1 && <View style={styles.WholePageContainer}>
      <KeyboardAvoidingView style={styles.KeyboardAvoidingView}>
        <TextInput
          onFocus={() => { setOnFocusDetector(true); setPlaceholder('');}}
          style={onFocusDetector ? [styles.PhoneNumberInput,{fontSize:16,letterSpacing:1}] : styles.PhoneNumberInput}
          onChangeText={setPhoneNumber}
          value={phoneNumber}
          placeholder={placeholder}
          placeholderTextColor={'#969696'}
          keyboardType='numeric'
          maxLength={10}
          selectionColor={'#969696'}
        />
        <Text style={styles.youWillText}>You will receive an OTP for verification</Text>
        <Text onPress={authenticateUser} style={phoneNumber.match(/^\d{10}$/) ? [styles.RegisterLoginButton,{backgroundColor:'#009e00',color:'#ffffff'}]:styles.RegisterLoginButton}>{clickedValue}</Text>
        {clickedValue === 'REGISTER' && <View style={styles.tandcContainer}>
          <Text style={styles.tandcText}>By registering, i agree to Ball24's </Text>
          <Text style={[styles.tandcText,{color:'#1141c1'}]} onPress={() => Linking.openURL('https://ball24.in/pages/terms-conditions')}>T&Cs</Text>
        </View>}
      </KeyboardAvoidingView>
    </View>}

    {visible==0 && <View style={styles.WholePageContainer}>
      <Text style={styles.OtpSentToText}>OTP sent to {phoneNumber}</Text>
      <KeyboardAvoidingView style={styles.KeyboardAvoidingView}>
        <Text style={styles.EnterOTPText}>Enter the OTP you received</Text>
        <View style={styles.InputContainer}>
          <OTPInputView
            style={{width: '100%', height:70}}
            pinCount={6}
            autoFocusOnLoad
            codeInputFieldStyle={styles.underlineStyleBase}
            codeInputHighlightStyle={styles.underlineStyleHighLighted}
            onCodeChanged={setCode}
            code={code}
            selectionColor='#969696'
          />
        </View>
        <Text onPress={checkCode} style={code.length==6 ? [styles.RegisterLoginButton,{backgroundColor:'#009e00',color:'#ffffff'}]:styles.RegisterLoginButton}>NEXT</Text>
      </KeyboardAvoidingView>
      {countdownShown && <View style={styles.youShouldContainer}>
        <Text style={styles.youShouldText}>You should receive the OTP in </Text><CountDownTimer/><Text style={styles.secondsText}> seconds</Text>
      </View>}
      {!countdownShown && attempts<4 && <View style={styles.DidnotReceiveContainer}>
        <Text style={styles.DidnotReceiveText}>Didn't receive the OTP?</Text>
        <Text style={styles.ResendOTPText} onPress={()=>{signInWithPhoneNumber2(phoneNumber); setCountdownShown(true)}}> Resend OTP</Text>
      </View>}
    </View>}

    {visible==1 && <View style={styles.WholePageContainer}>
      <KeyboardAvoidingView style={styles.KeyboardAvoidingView}>
        <Text style={styles.EnterNameText}>Name</Text>
        <TextInput
          onFocus={() => {setNextButtonstyle2(true);setPlaceholder2('');}}
          onBlur={() => setPlaceholder2('Name')}
          style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Light',letterSpacing: 1,}]}
          onChangeText={setName}
          value={name}
          placeholder={placeholder2}
          placeholderTextColor="#969696"
          keyboardType="default"
          selectionColor="#969696"
          maxLength={40}
        />
        <Text style={styles.ThisWillText}>⋆ This name will be used in Leaderboard Rankings</Text>
        <TextInput
          onFocus={() => setPlaceholderRefer('')}
          onBlur={() => setPlaceholderRefer('Refer Code (Optional)')}
          style={[styles.PhoneNumberInput,{fontSize:15,fontFamily:'Poppins-Light'}]}
          onChangeText={setReferCode}
          value={referCode}
          placeholder={placeholderRefer}
          placeholderTextColor="#969696"
          keyboardType="default"
          maxLength={7}
          selectionColor="#969696"
        />
        <Text onPress={onPresso} style={NextButtonstyle2? [styles.RegisterLoginButton,{backgroundColor:'#009e00',color:'#ffffff'}]:styles.RegisterLoginButton}>NEXT</Text>
      </KeyboardAvoidingView>
    </View>}
    
    {loadingSpinner && <><ActivityIndicator 
      hidesWhenStopped={true}
      color="#1141c1"
      size="large"
      animating={true}
      style={styles.ActivityIndicator}
     />{settingUp && <Text style={styles.SettingUp}>Setting Up the Environment ....</Text>}
    </>}
    </>
  )
}

export default Authentication;

const styles = StyleSheet.create({
WholePageContainer:{
  flex:1,
  backgroundColor:'#ffffff',
},
KeyboardAvoidingView:{
  backgroundColor:'#ffffff',
  marginHorizontal:10,
  marginVertical:15,
  borderColor:'#c7c7c7',
  borderWidth:1,
  borderRadius:5,
  paddingBottom:20,
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
youWillText:{
  color:'#121212',
  fontSize:11,
  color:'#212121',
  fontFamily:'Poppins-Light',
  marginLeft:25,
  marginTop:3
},
RegisterLoginButton:{
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
tandcContainer:{
  alignItems:'center',
  marginTop:20,
  flexDirection:'row',
  justifyContent:'center',
},
tandcText:{
  color:'#4d4d4d',
  fontSize:12,
  fontFamily:'Poppins-Medium',
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
InputContainer:{
  marginHorizontal:19,
  marginTop:12,
  borderRadius:4
},
youShouldContainer:{
  alignItems:'center',
  marginTop:-8,
  flexDirection:'row',
  justifyContent:'center',
  alignContent:'center'
},
youShouldText:{
  color:'grey',
  fontFamily:'Poppins-Regular',
  fontSize:12,
},
secondsText:{
  color:'#1141c1',
  fontFamily:'Poppins-Regular',
  fontSize:12,
  marginBottom:2
},
DidnotReceiveContainer:{
  alignItems:'center',
  marginTop:-8,
  flexDirection:'row',
  justifyContent:'center',
  alignContent:'center',
},
DidnotReceiveText:{
  color:'grey',
  fontFamily:'Poppins-Regular',
  fontSize:13
},
ResendOTPText:{
  color:'#1141c1',
  fontFamily:'Poppins-Regular',
  fontSize:13
},
CopiedContainer:{
  alignItems:'center',
  position:'absolute',
  flexDirection:'row',
  justifyContent:'center',
  backgroundColor:'#ff6700',
  width:width,
  height:50,
  zIndex:10
},
EnterNameText: {
  color: '#969696',
  fontSize: 15,
  fontFamily: 'Poppins-Medium',
  textAlign:'center',
  marginTop:10
},
ThisWillText: {
  color: 'grey',
  fontSize: 11,
  fontFamily: 'Poppins-Medium',
  marginTop:8,
  marginLeft:18
},
SettingUp:{
  color:'#121212',
  fontSize:16,
  fontFamily:'Poppins-Medium',
  marginTop:15,
  textAlign:'center',
  flex:1
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
underlineStyleHighLighted: {
  borderColor: "#1141c1",
},
})