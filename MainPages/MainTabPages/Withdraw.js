import { StyleSheet, Text, View ,TextInput,Image,KeyboardAvoidingView, ActivityIndicator,TouchableOpacity, LayoutAnimation, UIManager, Platform, Keyboard} from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import firestore from '@react-native-firebase/firestore'; 
import auth from '@react-native-firebase/auth';
import HeaderBlank from '../../Headers/HeaderBlank';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { width } from '../../Dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import functions from '@react-native-firebase/functions';
import {BottomSheetBackdrop,BottomSheetModal,BottomSheetScrollView} from '@gorhom/bottom-sheet';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental(true);
export default function Withdraw({navigation}) {

  const sheetRef1 = useRef(null);
  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0}/>)
  const handlePresentModalPress = useCallback(() => {sheetRef1.current?.present();}, []);
  const handleClosePress = () => sheetRef1.current.close();

  const uid = auth().currentUser.uid;
  const [inputValue,setInputValue] = useState('₹150');
  const [availableBalance,setAvailableBalance] = useState(null);
  const [bankDetails,setBankDetails] = useState(null);
  const [upi,setUpi] = useState(null);
  const [email,setEmail] = useState(null)
  const [panCard,setPanCard] = useState(null);
  const [OriginalName,setOriginalName] = useState(null);
  const [bottomSheetDecider,setBottomSheetDecider] = useState(-1);
  const [isItemSelected,setIsItemSelected] = useState(false);
  const showToast = (type,text1,text2) => Toast.show({type: type,text1: text1,visibilityTime:5000,position:'top',topOffset:0,text2: text2});

  useEffect(()=>{
    const unsubscribe = firestore().collection('users').doc(uid).onSnapshot(documentSnapshot=>{
      setAvailableBalance(documentSnapshot.data().WinningAmount)
      setBankDetails(documentSnapshot.data().BankAccount)
      setUpi(documentSnapshot.data().upi)
      setPanCard(documentSnapshot.data().PanCard)
      setEmail(documentSnapshot.data().Email)
      setOriginalName(documentSnapshot.data().OriginalName)
    })
    return ()=>unsubscribe;
  },[]);

  const CalculateNetWinnings = () => {
    const [Deposit,setDeposits] = useState(0);
    const [Withdrawed,setWithdrawed] = useState(0);
    const [Opening,setOpening] = useState(0);
    const [prevNetWinning,setPrevNetWinning] = useState(0);
    const [netWinning,setNetWinning] = useState(0);
    const [expanded,setExpanded] = useState(false)
    const time = new Date()
    const financialYear = time.getMonth() >= 3 ? time.getFullYear() : time.getFullYear() - 1
    const [spinner,setSpinner] = useState(false);

    useEffect(() => {if(expanded)LayoutAnimation.easeInEaseOut();},[expanded]);
    useEffect(()=>{
      const db = firestore().collection('users').doc(uid).collection(`FinancialYear${financialYear}`)
      let net = 0;
      db.onSnapshot(querySnapshot=>{
        querySnapshot.forEach(documentSnapshot=>{
          if(documentSnapshot.exists){
            if(documentSnapshot.id=='Deposits'){ setDeposits(documentSnapshot.data().DepositsAggregate||0); net -= documentSnapshot.data().DepositsAggregate||0}
            if(documentSnapshot.id=='Withdraw'){ setWithdrawed(documentSnapshot.data().WithdrawAggregate||0); net += documentSnapshot.data().WithdrawAggregate||0}
            if(documentSnapshot.id=='Opening Balance'){ setOpening(documentSnapshot.data().Amount||0); net -= documentSnapshot.data().Amount||0 }
            if(documentSnapshot.id=='PreviousNetWinnings'){ setPrevNetWinning(documentSnapshot.data().NetWinningsAggregate||0); net -= documentSnapshot.data().NetWinningsAggregate||0 }
          }
        })
        setNetWinning(net + Number(inputValue.substring(1)))
      })
      // .then(()=>{
      // })
    },[]);

    const handleConfirm = async () => {
      let input = inputValue.substring(1);
      if(/\b(?:[5-9]\d|[1-9]\d{2,4}|100000)\b/.test(input) && isItemSelected && input>=50){
        if(input<=availableBalance){
          setSpinner(true)
          let input = inputValue.substring(1);
          let index;
          await firestore().collection('users').doc(uid).get().then(documentSnapshot=> index = (documentSnapshot.data().Transactions).length)
          let Withdraw = functions().httpsCallable('Withdraw')
          Withdraw({Email:email,Amount:input,tds:(netWinning>0?0.3*netWinning:0).toFixed(2),netWinning:netWinning.toFixed(2),pan:panCard,OriginalName:OriginalName,uid:uid,mode:isItemSelected=='U'?upi:'*'.repeat(bankDetails.AccountNumber.length - 4) + bankDetails.AccountNumber.slice(-4),AccountNumber:bankDetails?bankDetails.AccountNumber:null,IFSC:bankDetails?bankDetails.IfscCode:null,Name:bankDetails?bankDetails.AccountHolder:"",upi:upi,To:isItemSelected=='U'?'upi':'bank',index:index}).then(()=>{
            setSpinner(false)
            handleClosePress()
            showToast('success','Withdrawal Successful','You can check status from Transaction section')
            setTimeout(() => navigation.goBack(), 3000);
          }).catch('error','Somethin Went Wrong','Please try again later');
        }
        else showToast('info','Not enough Winning balance','Withdrawal amount is greater than available winning balance')
      }
      else if(!isItemSelected) showToast('info','No option Selected','Select between UPI or Bank and then proceed.')
      else if(input<50) showToast('info','Minimum withdraw amount is ₹50','Please retry.');
      else if(input>100000) showToast('info','Maximum withdraw amount is ₹1,00,000','Please retry');
      else showToast('info','Invalid Amount','Please enter valid amount and retry');
    }

    return (
      <View style={styles.TDSBottomSheetContainer}>
        <Text style={styles.TDSWithdrawAmt}>{'₹'+(inputValue.substring(1)-(netWinning>0?0.3*netWinning:0)).toFixed(2)}</Text>
        <Text style={styles.TDSWithdrawText}>Withdraw (After TDS)</Text>
        <View style={{flexDirection:'column',borderTopEndRadius:30,borderTopStartRadius:30,backgroundColor:'#ffffff',paddingTop:20}}>
          <View style={styles.TDSSubContainers}>
            <Text style={styles.TDSTexts}>Withdrawal Amount</Text>
            <Text style={styles.TDSAmountsTexts}>{inputValue}</Text>
          </View>
          <View style={[styles.TDSSubContainers,{paddingTop:7}]}>
            <View style={{flexDirection:'row',alignItems:'center'}}>
            <Image source={require('../../accessories/DreamBallLogos/satya.png')} style={{width:25,height:39.08}}></Image>
            <Text style={styles.TDSTexts}>  TDS Applicable</Text>
            </View>
            <Text style={[styles.TDSAmountsTexts,{color:'#cf4f15'}]}>{'₹'+(netWinning>0?0.3*netWinning:0).toFixed(2)}</Text>
          </View>

          <View style={styles.GSTDetailsContainer}>
            <TouchableOpacity onPress={()=>{setExpanded(!expanded)}} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}} activeOpacity={0.8}>
              <Text style={[styles.GSTText,{fontFamily:'Poppins-Medium'}]}>See how TDS is calculated</Text>
              <Text style={[styles.GSTText,{fontSize:13,fontWeight:'600'}]}>{'₹'+(netWinning>0?0.3*netWinning:0).toFixed(2)+'   '}{expanded ?<Icon name='chevron-up-circle-outline' size={14} color='#3b4d73'/>: <Icon name='chevron-down-circle-outline' size={14} color='#3b4d73'/>}</Text>
            </TouchableOpacity>
            {expanded && (<>
              <View style={styles.Seperator}></View>
              <View style={styles.Row}>
                <View style={styles.Row}>
                  <Text style={[styles.GSTText,{color:'#242424',paddingTop:7,fontFamily:'Poppins-Regular'}]}>Aggregate of amount withdrawn{'\n'}during the Financial Year </Text>
                  <Text style={{color:'#3b4d73',backgroundColor:'#f0f7ff',borderRadius:4,paddingHorizontal:7}}>A</Text>
                </View>
                <Text style={[styles.GSTText2,{color:'#242424'}]}>{'₹'+(Withdrawed+Number(inputValue.substring(1)))}</Text>
              </View>
              <View style={styles.Row}>
                <View style={styles.Row}>
                  <Text style={[styles.GSTText,{color:'#242424',paddingTop:7,fontFamily:'Poppins-Regular'}]}>Aggregate amount of deposits{'\n'}during the Financial Year</Text>
                  <Text style={{color:'#3b4d73',backgroundColor:'#f0f7ff',borderRadius:4,paddingHorizontal:7}}>B</Text>
                </View>
                <Text style={[styles.GSTText2,{color:'#242424'}]}>{'₹'+Deposit}</Text>
              </View>
              <View style={styles.Row}>
                <View style={styles.Row}>
                  <Text style={[styles.GSTText,{color:'#242424',paddingTop:7,fontFamily:'Poppins-Regular'}]}>Opening Balance {'\n'}at the beginning of the Financial Year{'\n'}(Excluding Ball24 Cash Bonus)</Text>
                  <Text style={{color:'#3b4d73',backgroundColor:'#f0f7ff',borderRadius:4,paddingHorizontal:7}}>C</Text>
                </View>
                <Text style={[styles.GSTText2,{color:'#242424'}]}>{'₹'+Opening}</Text>
              </View>
              <View style={styles.Row}>
                <View style={styles.Row}>
                  <Text style={[styles.GSTText,{color:'#242424',paddingTop:7,fontFamily:'Poppins-Regular'}]}>Net winnings comprised in earlier{'\n'}withdrawals if tax has been{'\n'}deducted on such withdrawal </Text>
                  <Text style={{color:'#3b4d73',backgroundColor:'#f0f7ff',borderRadius:4,paddingHorizontal:7}}>E</Text>
                </View>
                <Text style={[styles.GSTText2,{color:'#242424'}]}>{prevNetWinning>0?'₹'+prevNetWinning:'NIL'}</Text>
              </View>
              <View style={styles.Seperator}></View>
              <View style={[styles.Row,{paddingTop:7}]}>
                <View style={styles.Row}>
                  <Text style={[styles.GSTText,{color:'#242424',fontFamily:'Poppins-Regular',textAlignVertical:'center'}]}>Net Winnings      </Text>
                  <Text style={{color:'#3b4d73',backgroundColor:'#f0f7ff',borderRadius:4,paddingHorizontal:7}}>A</Text>
                  <Text style={{color:'#3b4d73'}}>-(</Text>
                  <Text style={{color:'#3b4d73',backgroundColor:'#f0f7ff',borderRadius:4,paddingHorizontal:7}}>B</Text>
                  <Text style={{color:'#3b4d73'}}>+</Text>
                  <Text style={{color:'#3b4d73',backgroundColor:'#f0f7ff',borderRadius:4,paddingHorizontal:7}}>C</Text>
                  <Text style={{color:'#3b4d73'}}>+</Text>
                  <Text style={{color:'#3b4d73',backgroundColor:'#f0f7ff',borderRadius:4,paddingHorizontal:7}}>E</Text>
                  <Text style={{color:'#3b4d73'}}>)</Text>
    
                </View>
                <Text style={[styles.GSTText2,{fontSize:13.5,fontWeight:'600'}]}>{'₹'+netWinning}</Text>
              </View>
              <View style={styles.Seperator}></View>
              <View style={[styles.Row,{paddingTop:7}]}>
                <View style={styles.Row}>
                  <Text style={[styles.GSTText,{color:'#242424',fontFamily:'Poppins-Regular'}]}>TDS   </Text>
                  <Text style={{color:'#3b4d73',backgroundColor:'#f0f7ff',borderRadius:4,paddingHorizontal:7}}>[ 30% of Net Winnings ]</Text>
                </View>
                <Text style={[styles.GSTText2,{color:'#cf4f15'}]}>{'₹'+(netWinning>0?0.3*netWinning:0).toFixed(2)}</Text>
              </View>
              </>
            )}
          </View>

          <View style={[styles.TDSSubContainers,{marginTop:20}]}>
            <View style={{flexDirection:'row',alignItems:'center'}}>
            <Image source={isItemSelected=='U'?require('../../accessories/DreamBallLogos/upilogo.png'):require('../../accessories/DreamBallLogos/banklogo.png')} style={{width:isItemSelected=='U'?60:35,height:isItemSelected=='U'?16.22:35}}></Image>
            <Text style={styles.TDSTexts}>  Withdraw (After TDS)</Text>
            </View>
            <Text style={[styles.TDSAmountsTexts,{color:'#109e38'}]}>{'₹'+(inputValue.substring(1)-(netWinning>0?0.3*netWinning:0)).toFixed(2)}</Text>
          </View>
          {spinner?<ActivityIndicator color={'#1141c1'} size={'small'}/>:<Text style={[styles.AddButtonText,{backgroundColor:'#109e38'}]} onPress={handleConfirm}>Confirm</Text>}
        </View>
      </View>
    )
  }

  const handleAmountChange = (text) => {
    if (text === '₹' || text === '₹0') setInputValue('₹');
    else if (text.startsWith('₹0')) setInputValue('₹' + text.substring(2));
    else if (text.startsWith('₹')) setInputValue(text);
    else setInputValue('₹' + text.replace(/^0+/, ''));
  };

  const HandleButtonPress = async () => {
    let input = inputValue.substring(1);
    if(/\b(?:[5-9]\d|[1-9]\d{2,4}|100000)\b/.test(input) && isItemSelected && input>=50){
      if(input<=availableBalance){
        setBottomSheetDecider(2)
        handlePresentModalPress()
        Keyboard.dismiss()
      }
      else showToast('info','Not enough Winning balance','Withdrawal amount is greater than available winning balance')
    }
    else if(!isItemSelected) showToast('info','No option Selected','Select between UPI or Bank and then proceed.')
    else if(input<50) showToast('info','Minimum withdraw amount is ₹50','Please retry.');
    else if(input>100000) showToast('info','Maximum withdraw amount is ₹1,00,000','Please retry');
    else showToast('info','Invalid Amount','Please enter valid amount and retry');
  }

  const RenderUpi = () => {
    const [id,setId] = useState('');
    const [loading,setLoading] = useState(false)
    const HandleUpiLink = () => {
      if(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/.test(id)){
        setLoading(true)
        const AddUpi = functions().httpsCallable('AddUpiBank');
        AddUpi({bank:null,upi:id,uid:uid}).then(async res=>{
          setLoading(false)
          showToast('success','UPI Id linked successfully!');
          handleClosePress()
        }).catch(e=>{showToast('error','Something went wrong!','Please try again later.');setLoading(false);handleClosePress()});
      }
      else showToast('error','Invalid UPI ID!','Please enter correct upi id and try again.');
    }
    return(<>
      <KeyboardAvoidingView style={styles.KeyboardAvoidingView}>
      <Image source={require('../../accessories/DreamBallLogos/upilogo.png')} style={{width:90,height:24.33,alignSelf:'center'}}></Image>
        <Text style={styles.EnterNameText}>Enter UPI id</Text>
        <TextInput
          style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular'}]}
          onChangeText={setId}
          value={id}
          placeholder={'UPI Id'}
          placeholderTextColor="#969696"
          keyboardType="default"
          selectionColor="#969696"
          maxLength={40}
        />
        <Text style={styles.ThisWillText}>⋆ Enter correct UPI ID to withdraw money</Text>
      </KeyboardAvoidingView>
      <Text style={styles.ImportantNoteHeading}>*Important Note-{'\n'}<Text style={{fontSize:12}}>Make sure that you have entered correct details for UPI/Bank Account. We are unable to cross verify the details. Your money will be transferred to the added UPI ID/Bank Account if the bank accepts.{'\n'}{'\n'}You can see the status of your transactions in Withdrawals History. In case of any errors, we will refund your money back into your Ball24 account within 7 working days.{'\n'}{'\n'}Please contact our support in case of any issues. We will help in resolving your concerns.</Text></Text>
      {loading?<ActivityIndicator color={'#1141c1'} size={'small'} />:<Text style={[styles.AddButtonText,{backgroundColor:/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/.test(id)?'#109e38':'#999999'}]} onPress={HandleUpiLink}>Link UPI ID</Text>}
    </>)
  }

  const RenderBank = () => {
    const [name,setName] = useState();
    const [number,setNumber] = useState();
    const [confirmNumber,setConfirmNumber] = useState();
    const [ifsc,setIfsc] = useState('');
    const [loading,setLoading] = useState(false);
    const HandleUpiLink = () => {
      if(/^[a-z A-Z]+$/.test(name)&&/^[0-9]+$/.test(number) && number===confirmNumber && /^[A-Za-z0-9]+$/.test(ifsc)){
        setLoading(true)
        const AddUpi = functions().httpsCallable('AddUpiBank');
        AddUpi({bank:null,upi:null,bank:'notNULL',AccountHolder:name,AccountNumber:number,IfscCode:ifsc,uid:uid}).then(async res=>{
          setLoading(false)
          showToast('success','Bank Account linked successfully!');
          handleClosePress()
        }).catch(e=>{showToast('error','Something went wrong!','Please try again later.');setLoading(false);handleClosePress()});
      }
      else showToast('error','Invalid Bank Account Details!','Please enter correct details and try again.');
    }
    return(<>
      <BottomSheetScrollView>
      <KeyboardAvoidingView style={styles.KeyboardAvoidingView}>
        <Image source={require('../../accessories/DreamBallLogos/banklogo.png')} style={{width:40,height:40,alignSelf:'center',marginBottom:30}}></Image>
        <Text style={styles.EnterNameTextBank}>Enter Bank Account Holder Name -</Text>
        <TextInput
          style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular',marginTop:0,marginBottom:30}]}
          onChangeText={setName}
          value={name}
          placeholder={'Account Holder Name'}
          placeholderTextColor="#969696"
          keyboardType="default"
          selectionColor="#969696"
          maxLength={40}
        />
        <Text style={styles.EnterNameTextBank}>Enter Bank Account Number -</Text>
        <TextInput
          style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular',marginTop:0,marginBottom:30}]}
          onChangeText={setNumber}
          value={number}
          placeholder={'Account Number'}
          placeholderTextColor="#969696"
          keyboardType="default"
          selectionColor="#969696"
          maxLength={40}
        />
        <Text style={styles.EnterNameTextBank}>Re-enter Bank Account Number -</Text>
        <TextInput
          style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular',marginTop:0,marginBottom:30,}]}
          onChangeText={setConfirmNumber}
          value={confirmNumber}
          placeholder={'Confirm Account Number'}
          placeholderTextColor="#969696"
          keyboardType="default"
          selectionColor="#969696"
          maxLength={40}
        />
        <Text style={styles.EnterNameTextBank}>Enter IFSC Code -</Text>
        <TextInput
          style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular',marginTop:0}]}
          onChangeText={setIfsc}
          value={ifsc}
          placeholder={'IFSC Code'}
          placeholderTextColor="#969696"
          keyboardType="default"
          selectionColor="#969696"
          maxLength={40}
        />
      </KeyboardAvoidingView>
      <Text style={styles.ImportantNoteHeading}>*Important Note-{'\n'}<Text style={{fontSize:12}}>Make sure that you have entered correct details for UPI/Bank Account. We are unable to cross verify the details. Your money will be transferred to the added UPI ID/Bank Account if the bank accepts.{'\n'}{'\n'}You can see the status of your transactions in Withdrawals History. In case of any errors, we will refund your money back into your Ball24 account within 7 working days.{'\n'}{'\n'}Please contact our support in case of any issues. We will help in resolving your concerns.</Text></Text>
      </BottomSheetScrollView>
      {loading?<ActivityIndicator color={'#1141c1'} size={'small'} />:<Text style={[styles.AddButtonText,{backgroundColor:(/^[a-z A-Z]+$/.test(name)&&/^[0-9]+$/.test(number) && number===confirmNumber && ifsc.length>0 && /^[A-Za-z0-9]+$/.test(ifsc))?'#109e38':'#999999',marginBottom:15,marginTop:15}]} onPress={HandleUpiLink}>Link Bank Account</Text>}
    </>)
  }

  return (<>
    <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'Withdraw'} color='#1a1a1a'/>
    <View style={styles.CurrentBalanceContainer}>
      <View style={styles.Row}>
        <Image source={require('../../accessories/DreamBallLogos/wallet.png')} style={{width:23,height:23}}/>
        <Text style={styles.CurrentBalanceText}>Winning Balance</Text>
      </View>
      <Text style={styles.CurrentBalanceAmount}>{'₹'+(availableBalance)}</Text>
    </View>
    <LinearGradient colors={['#f0f7ff', '#ffffff']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.EnterAmountContainer}>
      <View style={styles.TextInputContainer}>
        <Text style={styles.ToAddText}>Amount to withdraw</Text>
        <TextInput
          keyboardType='numeric'
          maxLength={6}
          selectionColor={'#969696'}
          value={inputValue}
          onChangeText={handleAmountChange}
          style={styles.TextInput}
        />
      </View>
    </LinearGradient>
    <Text style={styles.WithdrawMethodText}>Withdraw Methods:</Text>
    <Text style={styles.ExtraDetail}>Use Bank Transfer when you withdraw more than Rs.50,000</Text>
    <View style={styles.WithdrawMethodsContainer}>
      <View style={styles.WithdrawMethod}>
        <View style={styles.ImageNAmeDetailsContainer}>
          <Image source={require('../../accessories/DreamBallLogos/upilogo.png')} style={{width:60,height:16.22}}></Image>
          <View style={styles.NameAndDetailContainer}>
            <Text style={styles.Name}>UPI</Text>
            {upi!=null &&<View style={styles.ImageNAmeDetailsContainer}><Text style={styles.Detail}>{upi}   </Text><Text style={[styles.LinkText,{fontSize:11,paddingHorizontal:4,paddingVertical:1,color:'#1a457c',backgroundColor:'#f5f5f5'}]} onPress={()=>{setBottomSheetDecider(0);handlePresentModalPress();}}>Change</Text></View>}
          </View>
        </View>
        {!upi && <Text style={styles.LinkText} onPress={()=>{setBottomSheetDecider(0);handlePresentModalPress();}}>Link UPI</Text>}
        {upi && <Icon name={isItemSelected=='U'?'radiobox-marked':'radiobox-blank'} size={20} color='#696969' onPress={()=>{setIsItemSelected('U')}}/>}
      </View>
      <View style={styles.WithdrawMethod}>
        <View style={styles.ImageNAmeDetailsContainer}>
          <Image source={require('../../accessories/DreamBallLogos/banklogo.png')} style={{width:45,height:45,marginLeft:7,marginRight:8}}></Image>
          <View style={styles.NameAndDetailContainer}>
            <Text style={styles.Name}>Bank Account</Text>
            {bankDetails!=null && bankDetails.AccountNumber && <View style={styles.ImageNAmeDetailsContainer}><Text style={styles.Detail}>{'*'.repeat(bankDetails.AccountNumber.length - 4) + bankDetails.AccountNumber.slice(-4)}   </Text><Text style={[styles.LinkText,{fontSize:11,paddingHorizontal:4,paddingVertical:1,color:'#1a457c',backgroundColor:'#f5f5f5'}]} onPress={()=>{setBottomSheetDecider(1);handlePresentModalPress();}}>Change</Text></View>}
          </View>
        </View>
        {!bankDetails && <Text style={styles.LinkText} onPress={()=>{setBottomSheetDecider(1);handlePresentModalPress();}}>Link Bank</Text>}
        {bankDetails && bankDetails.AccountNumber && <Icon name={isItemSelected=='B'?'radiobox-marked':'radiobox-blank'} size={20} color='#696969' onPress={()=>{setIsItemSelected('B')}}/>}
      </View>
    </View>
    {(upi || bankDetails)&& <Text style={[styles.AddButtonText,{backgroundColor:(isItemSelected && inputValue.substring(1)>=50 && inputValue.substring(1)<=availableBalance)?'#109e38':'#999999'}]} onPress={HandleButtonPress}>Withdraw</Text>}
    <BottomSheetModal
      ref={sheetRef1}
      snapPoints={['90%']}
      enablePanDownToClose={true}
      enableOverDrag={true}
      backdropComponent={renderBackdrop}
      handleStyle={{display:'none'}}
      backgroundStyle={{borderTopLeftRadius:13,borderTopRightRadius:13}}>
        {bottomSheetDecider==0 && <RenderUpi/>}
        {bottomSheetDecider==1 && <RenderBank/>}
        {bottomSheetDecider==2 && <CalculateNetWinnings/>}
    </BottomSheetModal>
  </>)
}

const styles = StyleSheet.create({
  CurrentBalanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    paddingVertical: 13,
  },
  CurrentBalanceText: {
    fontFamily: 'Poppins-Regular',
    color: '#121212',
    fontSize: 14,
    paddingLeft: 10,
    marginTop: 5,
  },
  CurrentBalanceAmount: {
    fontSize: 15,
    color: '#121212',
    fontWeight: '600',
  },
  EnterAmountContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 80,
  },
  TextInputContainer: {
    borderBottomColor: '#009e00',
    borderBottomWidth: 1,
    width: width / 2.4,
    flexDirection: 'column',
  },
  TextInput: {
    color: '#121212',
    fontSize: 20,
    letterSpacing: 0.7,
    paddingVertical: 8,
    textAlign: 'center',
  },
  ToAddText: {
    color: '#696969',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginTop: 3,
    marginBottom: -5,
    textAlign: 'center',
  },
  AddButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    backgroundColor: '#999999',
    textAlign: 'center',
    marginTop: 28,
    paddingVertical: 12,
    marginHorizontal: 12,
    borderRadius: 4,
  },
  WithdrawMethodText: {
    fontFamily: 'Poppins-Medium',
    color: '#121212',
    fontSize: 14,
    paddingLeft: 10,
    marginTop: 30,
  },
  ExtraDetail: {
    fontFamily: 'Poppins-Medium',
    color: '#696969',
    fontSize: 11,
    paddingLeft: 10,
    marginBottom: 30,
  },
  WithdrawMethodsContainer: {
    paddingHorizontal: 12,
    flexDirection: 'column',
  },
  ImageNAmeDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  WithdrawMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#a8a8a8',
    borderBottomWidth: 0.5,
    justifyContent: 'space-between',
  },
  NameAndDetailContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  Name: {
    color: '#121212',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  Detail: {
    fontFamily: 'Poppins-Medium',
    color: '#696969',
    fontSize: 11,
  },
  LinkText: {
    color: '#ffffff',
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    backgroundColor: '#1a457c',
    borderRadius: 3,
    paddingHorizontal: 9,
    paddingVertical: 2,
    textAlign: 'right',
  },
  KeyboardAvoidingView: {
    backgroundColor: '#ffffff',
    marginHorizontal: 10,
    marginVertical: 15,
    paddingBottom: 20,
  },
  PhoneNumberInput: {
    color: '#121212',
    fontSize: 16,
    borderBottomColor: '#121212',
    borderBottomWidth: 0.8,
    marginHorizontal: 19,
    marginTop: 25,
    backgroundColor: '#fafafa',
    paddingLeft: 13,
    borderRadius: 4,
    paddingVertical: 10,
    height: 48,
  },
  EnterNameText: {
    color: '#1a1a1a',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginTop: 10,
  },
  EnterNameTextBank: {
    color: '#696969',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    textAlign: 'left',
    paddingLeft: 21,
  },
  ThisWillText: {
    color: 'grey',
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    marginTop: 8,
    marginLeft: 18,
  },
  ImportantNoteHeading: {
    color: '#464646',
    marginHorizontal: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#fafafa',
    borderRadius: 5,
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  GSTDetailsContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d9e8',
    marginHorizontal: 12,
    paddingHorizontal: 8,
    marginTop: 15,
  },
  GSTText: {
    color: '#3b4d73',
    fontSize: 12,
  },
  GSTText2: {
    color: '#109e38',
    fontSize: 13,
    fontWeight: '500',
  },
  Seperator: {
    backgroundColor: '#d0d9e8',
    height: 0.5,
    marginTop: 7,
  },
  Row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  TDSBottomSheetContainer: {
    backgroundColor: '#e8edef',
    borderTopStartRadius: 13,
    borderTopEndRadius: 13,
  },
  TDSWithdrawAmt: {
    color: '#109e38',
    fontWeight: '800',
    fontSize: 35,
    textAlign: 'center',
  },
  TDSWithdrawText: {
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    fontSize: 15,
    paddingBottom: 12,
  },
  TDSSubContainers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 12,
  },
  TDSTexts: {
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  TDSAmountsTexts: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '500',
  },
});