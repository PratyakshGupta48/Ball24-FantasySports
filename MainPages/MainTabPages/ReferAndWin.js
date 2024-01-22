import { StyleSheet, Text, View, Image, ScrollView, Animated,ActivityIndicator,StatusBar, TouchableOpacity,TouchableWithoutFeedback,LayoutAnimation, UIManager, Platform} from 'react-native'
import React, { useEffect, useState, useRef, useCallback} from 'react'
import { width,height } from '../../Dimensions';
import Clipboard from '@react-native-clipboard/clipboard';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import functions from '@react-native-firebase/functions';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import Modal from "react-native-modal";
import BottomSheet , {BottomSheetBackdrop} from '@gorhom/bottom-sheet'

if (Platform.OS === 'android')UIManager.setLayoutAnimationEnabledExperimental(true);
const customLayoutAnimation = {
  duration: 250,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
};
const percent = (403/height)*100;

export default function ReferAndWin({navigation}) {

  const uid = auth().currentUser.uid;
  const [referNumber,setReferNumber] = useState();
  const [referPoints,setReferPoints] = useState();
  const [email,setEmail] = useState("");
  const [mobile,setMobile] = useState()
  const [spinnerVisible,setSpinnerVisible] = useState(false);
  const [loadingSpinner,setLoadingSpinner] = useState(false);
  const [successMessage,setSuccessMessage] = useState(false);
  const [referCode,setReferCode] = useState(null);
  const [refresh,setRefresh] = useState(false);
  const [isModalVisible,setIsModalVisible] = useState(false);
  const [historyShown,setHistoryShown] = useState(false);
  const [image,setImage] = useState();
  const [prizeText,setPrizeText] = useState();
  const [redeemPoints,setRedeemPoints] = useState();
  const [noteText,setNoteText] = useState();
  const showToast = (type,text1,text2) => Toast.show({type: type,text1: text1,visibilityTime:5000,position:'top',topOffset:0,text2: text2});
  const sheetRef = useRef(null);
    
  const openBottomSheet = useCallback((index) => {
    setLoadingSpinner(false);
    setSuccessMessage(false);
    if(sheetRef.current) sheetRef.current.snapToIndex(index);
  },[]);
  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />);

  useEffect(() => {if(isModalVisible) LayoutAnimation.configureNext(customLayoutAnimation)}, [isModalVisible]);
  useEffect(() => {
    const unsubscribe = firestore().collection('users').doc(uid).onSnapshot(documentSnapshot => {
      setReferNumber(documentSnapshot.data().RefferalsOnThisName);
      setReferPoints(documentSnapshot.data().ReferPoints);
      setEmail(documentSnapshot.data().Email)
      setMobile(documentSnapshot.data().PhoneNumber)
      if (documentSnapshot.data().ReferCode !== null)
        setReferCode(documentSnapshot.data().ReferCode); 
    });
    const history = firestore().collection('users').doc(uid).collection('ReferHistory');
    history.get().then(querySnapshot=>setHistoryShown(querySnapshot.size>0));
    return () => unsubscribe();
  }, [refresh]);
    
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fade = () => {
    Animated.timing(fadeAnim, {toValue: 1,useNativeDriver: true }).start();
    setTimeout(() => Animated.timing(fadeAnim, {toValue: 0,duration: 1000,useNativeDriver: true }).start(), 2000);
  }

  const onShare = async () => {
    const options = {
      title: '🏏Ball24 💰',
      message: '🔥Predict & Win! 🎉 Download Ball24 now and predict scores in live match to win massive cash prizes and rewards! 🎉💸\n📲 Download the app at ball24.in\n💡 Use referral code ' + referCode + ' during sign-up for ₹50 cash!\n',
      url: "https://www.ball24.in",
    } 
    Share.open(options).then(res=>{}).catch(e=>{});
  };

  const generatorPressed = async () => {
    setSpinnerVisible(true)
    const generateReferCode = functions().httpsCallable('GenerateReferCode');
    generateReferCode({ uid: uid }).then(res=>{
      setReferCode(res.data.referCode);
      setSpinnerVisible(false);
    }).catch(e=>showToast('error','Oops! Something Went Wrong', 'We encountered an error. Please try again later.'));
  }

  const redeem50 = () => {
    setIsModalVisible(false);
    const redeem = functions().httpsCallable('RedeemFifty');
    redeem({uid:uid}).then(res=>{
      if(res.data==null)showToast('success','SUccessfully Redeemed','50 rs has been added to your wallet');
      else if (res.data === 'Funds')showToast('error','Insufficient Refer Points', 'Invite more friends to redeem this prize.');
      else if (res.data === 'Error')showToast('error','Oops! Something Went Wrong', 'We encountered an error. Please try again later.');
    }).catch(e=>showToast('error','Oops! Something Went Wrong', 'We encountered an error. Please try again later.'));
    setRefresh(!refresh)
  }
  
  const redeemPrize = () => {
    setLoadingSpinner(true);
    const redeem = functions().httpsCallable('RedeemPrize')
    redeem({uid:uid,Prize:prizeText,Point:redeemPoints,Email:email,Mobile:mobile}).then(res=>{
      setLoadingSpinner(false);
      if(res.data==null)setSuccessMessage(true);
      else if (res.data === 'Funds')showToast('error','Insufficient Refer Points', 'Invite more friends to redeem this prize.');
      else if (res.data === 'Error')showToast('error','Oops! Something Went Wrong', 'We encountered an error. Please try again later.');
    }).catch(e=>showToast('error','Oops! Something Went Wrong', 'We encountered an error. Please try again later.'));
    setRefresh(!refresh)
  }

  const prizeSetter = (image,text,points,note) => {
    setImage(image);
    setPrizeText(text);
    setRedeemPoints(points);
    setNoteText(note);
    openBottomSheet(0);
  }

  const redeemPrizes = (p) => {
    if(p>referPoints){
      showToast('error','Sorry! Not Enough Refer Points','Invite more friends and win exciting prizes.');
      return;
    }
    else if(p==10)
      setIsModalVisible(true)
    else if(p==25)
      prizeSetter(require('../../accessories/ReferImages/swiggy.png'),'Swiggy Rs.250 voucher',25,"You will recieve your swiggy voucher to your email and registered mobile number within 48-72 hours after verification.")
    else if(p==100)
      prizeSetter(require('../../accessories/ReferImages/hoodb.png'),'Ball24 Cricket Kit',100,"You will recieve a email and sms on registered mobile number with details asking for address and contact details to ship your Ball24 Cricket Kit to you.")
    else if(p==250)
      prizeSetter(require('../../accessories/ReferImages/prime.png'),'Amazon Prime 1Y subscription',250,"You will recieve your your Amazon Prime Video subscription voucher to your email and registered mobile number within 48-72 hours after verification.")
    else if(p==700)
      prizeSetter(require('../../accessories/ReferImages/amazonmain.png'),'Amazon ₹5000 voucher',700,"You will recieve your Amazon voucher to your email and registered mobile number within 48-72 hours after verification.")
    else if(p==2000)
      prizeSetter(require('../../accessories/ReferImages/airpods-apple.png'),'Apple AirPods',2000,"You will recieve a email and sms on registered mobile number with details asking for address and contact details to ship your Apple AirPods to you.")
    else if(p==5000)
      prizeSetter(require('../../accessories/ReferImages/Apple-iPad.png'),'Apple iPad',5000,"You will recieve a email and sms on registered mobile number with details asking for address and contact details to ship your Apple iPad to you.")
    else if(p==10000)
      prizeSetter(require('../../accessories/ReferImages/iphone.png'),'Apple iPhone',10000,"You will recieve a email and sms on registered mobile number with details asking for address and contact details to ship your Apple iPhone to you.")
    return;
  }

  return (<>
    <StatusBar animated={true} backgroundColor='#002487'/>
    <View style={{flex:1,backgroundColor:'#ffffff'}}>
    <LinearGradient colors={['#1141c1', '#002487']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.FirstWrapperContainer}>
      <Image source={require('../../accessories/ReferImages/referbannermain.png')} style={{marginLeft:(width-350)/2,width:340,height:96,marginTop:5}}></Image>
    </LinearGradient>
    <ScrollView>
      <View style={styles.WholePageContainer}>
        <View style={[styles.RefferalCodeConainerMain,{flexDirection:'column'}]} elevation={2}>
          <View style={styles.ReferralNumberContainer}>
            <Text style={styles.TotalRefersText}>Refer Points :</Text>
            <Text style={styles.TotalRefersNumber}>{referPoints}</Text>
            <Image source={require('../../accessories/ReferImages/bCoin2.png')} style={{width:25,height:25,marginLeft:3,marginBottom:4}}></Image>
          </View>
          <Text style={styles.FriendsJoined}>Friends Joined : {referNumber}</Text>
        </View>
        
        <View style={styles.ReferContainer} elevation={2}>
          <View style={styles.ImagesContainerOne}>
            <TouchableOpacity onPress={()=>{redeemPrizes(10)}}>
              <View style={styles.ImageiContiner}>
                <Image source={require('../../accessories/ReferImages/ball24.png')} style={{width:66,height:44}}></Image>
                <Text style={styles.PrizeTitle}>₹50 Ball24 Cash</Text>
                <Text style={styles.ReferNumber}>10 <Image source={require('../../accessories/ReferImages/bCoin2.png')} style={{width:14,height:14,marginLeft:3,marginBottom:4}}></Image></Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{redeemPrizes(25)}}>
              <View style={styles.ImageiContiner}>
                <Image source={require('../../accessories/ReferImages/swiggy.png')} style={{width:50,height:50}}></Image>
                <Text style={styles.PrizeTitle}>₹200 voucher</Text>
                <Text style={styles.ReferNumber}>25 <Image source={require('../../accessories/ReferImages/bCoin2.png')} style={{width:14,height:14,marginLeft:3,marginBottom:4}}></Image></Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{redeemPrizes(100)}}>
              <View style={styles.ImageiContiner}>
                <Image source={require('../../accessories/ReferImages/hoodb.png')} style={{width:50,height:50}}></Image>
                <Text style={styles.PrizeTitle}>Cricket Kit</Text>
                <Text style={styles.ReferNumber}>100 <Image source={require('../../accessories/ReferImages/bCoin2.png')} style={{width:14,height:14,marginLeft:3,marginBottom:4}}></Image></Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{redeemPrizes(250)}}>
              <View style={styles.ImageiContiner}>
                <Image source={require('../../accessories/ReferImages/prime.png')} style={{width:80,height:40}}></Image>
                <Text style={styles.PrizeTitle}>1Y Subscription</Text>
                <Text style={styles.ReferNumber}>250 <Image source={require('../../accessories/ReferImages/bCoin2.png')} style={{width:14,height:14,marginLeft:3,marginBottom:4}}></Image></Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.ImagesContainerOne}>
            <TouchableOpacity onPress={()=>{redeemPrizes(700)}}>
              <View style={styles.ImageiContiner}>
                <Image source={require('../../accessories/ReferImages/amazonmain.png')} style={{width:80,height:40}}></Image>
                <Text style={styles.PrizeTitle}>₹5000 voucher</Text>
                <Text style={styles.ReferNumber}>700 <Image source={require('../../accessories/ReferImages/bCoin2.png')} style={{width:14,height:14,marginLeft:3,marginBottom:4}}></Image></Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{redeemPrizes(2000)}}>
              <View style={styles.ImageiContiner}>
                <Image source={require('../../accessories/ReferImages/airpods-apple.png')} style={{width:60,height:60}}></Image>
                <Text style={styles.ReferNumber}>2000 <Image source={require('../../accessories/ReferImages/bCoin2.png')} style={{width:14,height:14,marginLeft:3,marginBottom:4}}></Image></Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{redeemPrizes(5000)}}>
              <View style={styles.ImageiContiner}>
                <Image source={require('../../accessories/ReferImages/Apple-iPad.png')} style={{width:50,height:57}}></Image>
                <Text style={styles.ReferNumber}>5000 <Image source={require('../../accessories/ReferImages/bCoin2.png')} style={{width:14,height:14,marginLeft:3,marginBottom:4}}></Image></Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{redeemPrizes(10000)}}>
              <View style={styles.ImageiContiner}>
                <Image source={require('../../accessories/ReferImages/iphone.png')} style={{width:73,height:73}}></Image>
                <Text style={styles.ReferNumber}>10000 <Image source={require('../../accessories/ReferImages/bCoin2.png')} style={{width:14,height:14,marginLeft:3,marginBottom:4}}></Image></Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.RefferalCodeConainer} elevation={2}>
          {referCode!=null ?<View>
            <Text style={styles.ReferralCodeText}>Refer Code</Text>
            <Text style={styles.ActualRefferalCodeText} selectable={true} onPress={()=>{Clipboard.setString(referCode);fade();}}>{referCode}</Text>
            <View style={{flexDirection:'row'}}>
              <Text style={styles.shareText}>Share </Text>
              <Icon name='share-variant-outline' size={25} color='#2e2e2e' style={{marginTop:10}} onPress={onShare}/>
            </View>
          </View> 
          :!spinnerVisible && <Text style={styles.GenerateReferText} onPress={generatorPressed}>Generate Refer Code</Text>}
          {spinnerVisible && <ActivityIndicator  hidesWhenStopped={true} color="#1141c1" size='small' animating={true}/>}
        </View>
        {historyShown && <TouchableWithoutFeedback onPress={()=>{navigation.navigate('ReferAndWinExtension')}}>
        <View style={[styles.RefferalCodeConainer,{flexDirection:'row',justifyContent:"flex-start",alignItems:'center'}]} elevation={2}>
          <Icon name='progress-clock' color={'#121212'} size={28} style={{marginRight:10}}/>
          <Text style={styles.HistoryText}>HISTORY</Text>
        </View>
        </TouchableWithoutFeedback>}
        <Animated.View style={[styles.CopiedContainer,{opacity:fadeAnim}]}>
          <Text style={styles.CopiedText}>Copied</Text>
        </Animated.View>
      </View>
    </ScrollView>

    <Modal isVisible={isModalVisible} animationIn={'slideInUp'} animationInTiming={350} animationOut={'slideOutDown'} animationOutTiming={350} backdropOpacity={0.5} onBackdropPress={()=>{setIsModalVisible(false)}} hideModalContentWhileAnimating={true}>
      <View style={{backgroundColor:'#ffffff',paddingTop:15,borderRadius:5,paddingHorizontal:12}}>
        <Text style={{color:'#121212',fontFamily:'Poppins-Medium',fontSize:13,textAlign:'center'}}>Do you want to redeem 10 Refer Points<Image source={require('../../accessories/ReferImages/bCoin2.png')} style={{width:14,height:14,marginLeft:3,marginBottom:4}}></Image> for a cash reward of 50 rupees?</Text>
        <Text style={styles.ConfirmationText} onPress={redeem50}>Confirm</Text>
      </View>
    </Modal>

    <BottomSheet
      ref={sheetRef}
      snapPoints={[percent+'%']}
      index={-1}
      enablePanDownToClose={true}
      enableOverDrag={true}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{backgroundColor:'#dbdbdb'}}
      backgroundStyle={{backgroundColor:'#ffffff'}}>
        <Image source={image} style={{height:150,alignSelf:'center'}} resizeMethod='scale' resizeMode='contain'></Image>
        <Text style={styles.PrizeText}>{prizeText}</Text>
        {email=="" && <Text style={styles.ConfirmationText2} onPress={()=>{navigation.navigate('AddEmail')}}>Verify your Email First  {"—>"}</Text>}
        {email!="" && !loadingSpinner && !successMessage && <Text style={styles.ConfirmationText2} onPress={redeemPrize} >Redeem {redeemPoints} <Image source={require('../../accessories/ReferImages/bCoin2.png')} style={{width:16,height:16,marginLeft:3,marginBottom:4}}></Image> for {prizeText}</Text>}
        {loadingSpinner && <ActivityIndicator hidesWhenStopped={true} color="#1141c1" size="small"  animating={true} style={{marginTop:13,marginBottom:12}}/>}
        {successMessage && <Text style={styles.SuccessMessage}><Icon name='checkbox-marked-circle-outline' color='#009e00' size={28}/> Request successfully placed {'\n'}A Confirmation mail has also been send to your email.</Text>}
        <Text style={styles.NoteText}>Note- {noteText}</Text>
    </BottomSheet>
    </View>
    </>
  )
}

const styles = StyleSheet.create({
  WholePageContainer: {
    flex: 1,
    paddingBottom: 30,
    backgroundColor: '#ffffff',
  },
  ReferContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 17,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 9,
  },
  ImagesContainerOne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  PrizeTitle: {
    color: '#2e2e2e',
    fontWeight: '800',
    fontSize: 11,
    maxWidth: (width - 48) / 4,
    marginTop: 10,
  },
  ImageiContiner: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ReferNumber: {
    color: '#7d0c0c',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
  },
  RefferalCodeConainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginHorizontal: 12,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 9,
    marginTop: 17,
    paddingVertical: 12,
  },
  ReferralCodeText: {
    color: '#2e2e2e',
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
  },
  ActualRefferalCodeText: {
    color: '#121212',
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    backgroundColor: '#ededed',
    width: width - 48,
    borderRadius: 6,
    height: 30,
    justifyContent: 'center',
    paddingLeft: 12,
    marginTop:5
  },
  shareText: {
    color: '#2e2e2e',
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    marginRight: 10,
    marginTop: 10,
  },
  RefferalCodeConainerMain: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginHorizontal: 12,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 9,
    marginTop: 20,
    paddingVertical: 12,
  },
  ReferralNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 9,
  },
  TotalRefersText: {
    color: '#2e2e2e',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  TotalRefersNumber: {
    color: '#121212',
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    marginLeft: 10,
  },
  CopiedText: {
    color: '#000000',
    fontSize: 12,
    backgroundColor: '#cccbca',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  CopiedContainer: {
    marginHorizontal: 12,
    alignItems: 'center',
  },
  GenerateReferText: {
    fontFamily: 'Poppins-Medium',
    color: '#ffffff',
    fontSize: 14,
    backgroundColor: '#029902',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginTop: 6,
    verticalAlign:'middle'
  },
  FirstWrapperContainer: {
    height: 120,
    backgroundColor: '#1141c1',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  FriendsJoined: {
    color: '#969696',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    paddingTop: 10,
  },
  ConfirmationText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    backgroundColor: '#009e00',
    borderRadius: 5,
    height: 41,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 7,
  },
  ConfirmationText2:{
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    backgroundColor: '#009e00',
    borderRadius: 3,
    height: 45,
    textAlign: 'center',
    textAlignVertical:'center',
    marginHorizontal:15
  },
  PrizeText:{
    color:'#969696',
    textAlign:'center',
    fontFamily:'Poppins-Medium',
    paddingTop:10,
    paddingBottom:15
  },
  NoteText:{
    color:'#969696',
    fontFamily:'Poppins-Medium',
    fontSize:12,
    marginHorizontal:15,
    marginTop:13,
  },
  HistoryText:{
    color:'#121212',
    fontFamily:'Poppins-Medium',
  },
  SuccessMessage:{
    color:'#242424',
    fontFamily:'Poppins-Medium',
    fontSize:14,
    marginHorizontal:10,
    textAlign:'center'
  }
});