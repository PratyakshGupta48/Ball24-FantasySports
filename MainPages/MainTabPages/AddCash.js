import { StyleSheet, Text, View ,TextInput ,ActivityIndicator ,StatusBar,Image,TouchableOpacity, LayoutAnimation, UIManager, Platform} from 'react-native'
import React, { useState ,useEffect ,useRef} from 'react'
import HeaderBlank from '../../Headers/HeaderBlank'
import {height,width} from '../../Dimensions';
import firestore from '@react-native-firebase/firestore'; 
import functions from '@react-native-firebase/functions';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import {useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function AddCash({navigation}) {

  const [inputValue,setInputValue] = useState(useRoute().params?useRoute().params.add:'₹150')
  const [phoneNumber,setphoneNumber] = useState(null)
  const [loadingSpinner,setLoadingSpinner] = useState(true);
  const [settingUp,setSettingUp] = useState(false);
  const [AddedAmount,setAddedAmount] = useState(null);
  const [WinningAmount,setWinningAmount] = useState(null);
  const [DBCashBonus,setDBCashBonus] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const showToast = (type,text1,text2) => Toast.show({type: type,text1: text1,visibilityTime:2500,position:'top',topOffset:0,text2: text2});


  useEffect(()=>{
    setLoadingSpinner(false)
    firestore().collection('users').doc(auth().currentUser.uid).onSnapshot(documentSnapshot=>{
      setphoneNumber(documentSnapshot.data().PhoneNumber)
      setAddedAmount(documentSnapshot.data().AddedAmount)
      setWinningAmount(documentSnapshot.data().WinningAmount)
      setDBCashBonus(documentSnapshot.data().DBCashBonus)
      setLoadingSpinner(false)
    })
  },[]);
  useEffect(() => {LayoutAnimation.easeInEaseOut();},[expanded]);

  if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental(true);

  const checkValue = async () => {
    let input = inputValue.substring(1);
    if(input.match(/^(?:[5-9]|[1-9]\d{1,3}|25000)$/)){
      setLoadingSpinner(true)
      setSettingUp(true);
      const startTransaction = functions().httpsCallable('Transaction');
      startTransaction({amount:input,uid:auth().currentUser.uid,phone:phoneNumber}).then(async res=>{
        if(res.data.code == "PAYMENT_INITIATED") navigation.navigate('PaymentGateway',{url:res.data.data.instrumentResponse.redirectInfo.url})
        else showToast('error','Something went wrong!','Hold tight.Our best engineers are onto it.');
      })
    }
    else if(input<5) showToast('info','Minimum deposit amount is ₹5','Please retry.');
    else if(input>25000) showToast('info','Maximum deposit amount is ₹25000','Please retry');
    else showToast('info','Invalid Amount','Please enter valid amount and retry');
  }
  
  const handleAmountChange = (text) => {
    if (text === '₹' || text === '₹0') setInputValue('₹');
    else if (text.startsWith('₹0')) setInputValue('₹' + text.substring(2));
    else if (text.startsWith('₹')) setInputValue(text);
    else setInputValue('₹' + text.replace(/^0+/, ''));
  };

  return (<>
    <StatusBar animated={true} backgroundColor="#121212"/>
    <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'Add cash'}/>
    <View style={{backgroundColor:'#ffffff'}}>
      <View style={styles.CurrentBalanceContainer}>
        <View style={styles.Row}>
          <Image source={require('../../accessories/DreamBallLogos/wallet.png')} style={{width:23,height:23}}/>
          <Text style={styles.CurrentBalanceText}>Current Balance</Text>
        </View>
        <Text style={styles.CurrentBalanceAmount}>{'₹'+(AddedAmount+WinningAmount)}</Text>
      </View>
      <LinearGradient colors={['#f0f7ff', '#ffffff']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.EnterAmountContainer}>
        <View style={styles.TextInputContainer}>
          <Text style={styles.ToAddText}>Amount to add</Text>
          <TextInput
            keyboardType='numeric'
            maxLength={6}
            selectionColor={'#969696'}
            value={inputValue}
            onChangeText={handleAmountChange}
            style={styles.TextInput}
          />
        </View>
        <Text style={styles.Helper1Text} onPress={()=>{setInputValue('₹500')}}>₹500</Text>
        <Text style={styles.Helper1Text} onPress={()=>{setInputValue('₹1000')}}>₹1,000</Text>
      </LinearGradient>

      <View style={styles.GSTDetailsContainer}>
        <TouchableOpacity onPress={()=>{setExpanded(!expanded)}} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}} activeOpacity={0.8}>
          <Text style={[styles.GSTText,{fontFamily:'Poppins-Medium'}]}>Add to current balance</Text>
          <Text style={[styles.GSTText,{fontSize:13,fontWeight:'600'}]}>{inputValue+'   '}{expanded ?<Icon name='chevron-up-circle-outline' size={14} color='#3b4d73'/>: <Icon name='chevron-down-circle-outline' size={14} color='#3b4d73'/>}</Text>
        </TouchableOpacity>
        {expanded && (<>
          <View style={styles.Seperator}></View>
          <View style={styles.Row}>
            <View style={styles.Row}>
              <Text style={[styles.GSTText,{color:'#242424',paddingTop:7,fontFamily:'Poppins-Regular'}]}>Deposit Amount (excl. Govt. Tax)   </Text>
              <Text style={{color:'#3b4d73',backgroundColor:'#f0f7ff',borderRadius:4,paddingHorizontal:7}}>I</Text>
            </View>
            <Text style={styles.GSTText2}>{'₹'+Math.floor((0.78125) * (inputValue.substring(1)) * 100) / 100}</Text>
          </View>
          <View style={styles.Seperator}></View>
          <View style={styles.Row}>
            <Text style={[styles.GSTText,{color:'#242424',paddingTop:9,fontFamily:'Poppins-Regular'}]}>Govt. Tax (28% GST)</Text>
            <Text style={[styles.GSTText2,{color:'#242424'}]}>{'₹'+Math.ceil((0.21875) * (inputValue.substring(1)) * 100) / 100}</Text>
          </View>
          <View style={styles.Seperator}></View>
          <View style={styles.Row}>
            <Text style={[styles.GSTText,{color:'#242424',paddingTop:9,fontFamily:'Poppins-Regular'}]}>Total</Text>
            <Text style={[styles.GSTText2,{color:'#242424'}]}>{inputValue}</Text>
          </View>
          <View style={styles.Row}>
            <View style={styles.Row}>
              <Icon name='sale' size={18} color='#109e38' style={{top:1.8}}/>
              <Text style={[styles.GSTText,{color:'#242424',paddingTop:9,fontFamily:'Poppins-Regular',textAlignVertical:'center'}]}> Ball24 Gift worth   </Text>
              <Text style={{color:'#3b4d73',backgroundColor:'#f0f7ff',borderRadius:4,paddingHorizontal:7}}>II</Text>
            </View>
            <Text style={styles.GSTText2}>{'₹'+Math.ceil((0.21875) * (inputValue.substring(1)) * 100) / 100}</Text>
          </View>
          <View style={styles.Seperator}></View>
          <View style={styles.Row}>
            <View style={styles.Row}>
              <Text style={[styles.GSTText,{color:'#242424',paddingTop:9,fontFamily:'Poppins-Regular',textAlignVertical:'center'}]}>Add to current balance   </Text>
              <Text style={{color:'#3b4d73',backgroundColor:'#f0f7ff',borderRadius:4,paddingHorizontal:7}}>I</Text>
              <Text style={{color:'#3b4d73'}}> + </Text>
              <Text style={{color:'#3b4d73',backgroundColor:'#f0f7ff',borderRadius:4,paddingHorizontal:7}}>II</Text>
            </View>
            <Text style={[styles.GSTText2,{fontSize:13.5,fontWeight:'600'}]}>{inputValue}</Text>
          </View></>
        )}
      </View>
      {/* <Image style ={{width:width-24,height:0.152*(width-24),borderRadius:5,alignSelf:'center',overlayColor:'white'}} source={require('../../accessories/DreamBallLogos/gstfree1gif.gif')}/> */}
      <Text style={styles.AddButtonText} onPress={checkValue}>{'Add '+inputValue}</Text>
    </View>
    {loadingSpinner && <><ActivityIndicator 
      hidesWhenStopped={true}
      color="#1141c1"
      size="large"
      animating={true}
      style={styles.ActivityIndicator}
     />{settingUp && <Text style={styles.SettingUp}>Redirecting to payments ....</Text>}
    </>}
    <Toast/>
    </>
  )
}

const styles = StyleSheet.create({
  CurrentBalanceContainer:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    paddingHorizontal:15,
    backgroundColor:'#ffffff',
    paddingVertical:13
  },
  CurrentBalanceText:{
    fontFamily:'Poppins-Regular',
    color:'#121212',
    fontSize:14,
    paddingLeft:10,
    marginTop:5
  },
  CurrentBalanceAmount:{
    fontSize:15,
    color:'#121212',
    fontWeight:'600'
  },
  EnterAmountContainer:{
    backgroundColor:'#ffffff',
    paddingVertical:20,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-evenly',
    height:80
  },
  TextInputContainer:{
    borderBottomColor:'#009e00',
    borderBottomWidth:1,
    width:width/2.4,
    backgroundColor:'#e8ffe3',
    borderTopLeftRadius:5,
    borderTopRightRadius:5,
    flexDirection:'column'
  },
  TextInput:{
    paddingLeft:13,
    color:'#121212',
    fontSize:18,
    letterSpacing:0.7,
    paddingVertical:8
  },
  ToAddText:{
    color:'#696969',
    fontFamily:'Poppins-Regular',
    fontSize:11,
    marginTop:3,
    marginLeft:12,
    marginBottom:-10
  },
  Helper1Text:{
    color:'#121212',
    fontSize:15,
    fontWeight:'500',
    borderWidth:0.7,
    borderColor:'#969696',
    borderRadius:8,
    paddingHorizontal:20,
    paddingVertical:10
  },
  AddButtonText:{
    color:'#ffffff',
    fontWeight:'700',
    fontSize:16,
    backgroundColor:'#109e38',
    textAlign:'center',
    marginTop:40,
    paddingVertical:12,
    marginHorizontal:12,
    borderRadius:4
  },
  ActivityIndicator: {
    position: 'absolute',
    height: height-130 ,
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    opacity: 1,
  },
  GSTDetailsContainer:{
    backgroundColor:'#ffffff',
    paddingVertical:7,
    borderRadius:8,
    borderWidth:1,
    borderColor:'#d0d9e8',
    marginHorizontal:12,
    paddingHorizontal:8
  },
  GSTText:{
    color:'#3b4d73',
    fontSize:12
  },
  GSTText2:{
    color:"#109e38",
    fontSize:13,
    fontWeight:'500'
  },
  Seperator:{
    backgroundColor:'#d0d9e8',
    height:0.5,
    marginTop:7
  },
  Row:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  SettingUp:{
    color:'#121212',
    fontSize:16,
    fontFamily:'Poppins-Medium',
    marginTop:30,
    textAlign:'center',
    flex:1
  },
})