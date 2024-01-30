import React,{useEffect,useState,useRef,useCallback} from 'react';
import {View,Text,TouchableWithoutFeedback,StyleSheet,ScrollView,RefreshControl,Image,TextInput, ActivityIndicator} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {width} from '../../Dimensions';
import {useIsFocused} from '@react-navigation/native'
import firestore from '@react-native-firebase/firestore'; 
import LinearGradient from 'react-native-linear-gradient';
import BottomSheet,{BottomSheetBackdrop,BottomSheetModal,BottomSheetScrollView} from '@gorhom/bottom-sheet';
import DatePicker from 'react-native-date-picker'
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import functions from '@react-native-firebase/functions';
import Toast from 'react-native-toast-message';

function Wallet({navigation}) {

  const sheetRef1 = useRef(null);
  const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0}/>)
  const handlePresentModalPress = useCallback(() => {sheetRef1.current?.present();}, []);
  const handleClosePress = () => sheetRef1.current.close();

  const [AddedAmount,setAddedAmount] = useState(null);
  const [WinningAmount,setWinningAmount] = useState(null);
  const [DBCashBonus,setDBCashBonus] = useState(null);
  const [Pan,setPan] = useState(null);
  const [refresh,setRefresh] = useState(false);
  const isFocused = useIsFocused();
    
  useEffect(()=>{
    const unsubscribe = firestore().collection('users').doc(auth().currentUser.uid).onSnapshot(documentSnapshot=>{
      setAddedAmount(documentSnapshot.data().AddedAmount)
      setWinningAmount(documentSnapshot.data().WinningAmount)
      setDBCashBonus(documentSnapshot.data().DBCashBonus)
      setPan(documentSnapshot.data().Pan)
    })
    return ()=>unsubscribe;
  },[refresh,isFocused]);

  const VerifyPan = () => {
      const sheetRef2 = useRef(null);
      function openBottomSheet() {if (sheetRef2.current)sheetRef2.current.snapToIndex(0)}
      const handleClosePress2 = () => sheetRef2.current.close();
      const showToast = (type,text1,text2) => Toast.show({type: type,text1: text1,visibilityTime:5000,position:'top',topOffset:0,text2: text2});
  
      const [name,setName] = useState();
      const [Pan,setPan] = useState();
      const [date, setDate] = useState(new Date())
      const [open, setOpen] = useState(false)
      const [image,setImage] = useState(null)
      const [imageWidth, setImageWidth] = useState(0);
      const [imageHeight, setImageHeight] = useState(0);
      const [flat,setFlat] = useState();
      const [area,setArea] = useState();
      const [Pincode,setPincode] = useState();
      const [city,setCity] = useState();
      const [state,setState] = useState();
      const [loading,setLoading] = useState(false);
  
      const handleImageLoad = (event) => {
        const { width, height } = event.nativeEvent.source;
        setImageWidth(width);
        setImageHeight(height);
      };
      const aspectRatio = imageWidth && imageHeight ? imageWidth / imageHeight : 1; 
  
      const handleImageSelection = async (source) => {
        const {assets} = await source({
          mediaType: 'photo',
          quality: 1,
        });
        setImage(assets[0].uri)
        handleClosePress2()
      };
      
      const OptionItem = ({ icon, text, onPress }) => <View style={styles.Option1Container}>
        <Icon name={icon} size={35} color='#696969' onPress={onPress} />
        <Text style={styles.Option1Text}>{text}</Text>
      </View>
  
      const check = () => {
        if((/^[a-z A-Z]+$/.test(name)&&/[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(Pan) && date.toDateString()!=new Date().toDateString() && image && /[A-Za-z0-9'\.\-\s\,]/.test(flat) && /[A-Za-z0-9'\.\-\s\,]/.test(area) && /^[1-9][0-9]{5}$/.test(Pincode) && /[A-Za-z0-9'\.\-\s\,]/.test(city) && /[A-Za-z0-9'\.\-\s\,]/.test(state)))return true;
        else return false;
      }
  
      const HandlePan = async () => {
        if(check()){
          setLoading(true)
          await storage().ref('/KYC_PanCard/'+new Date().toDateString()+auth().currentUser.uid).putFile(image);
          const VerifyPan = functions().httpsCallable('VerifyPan');
          VerifyPan({uid:auth().currentUser.uid,name:name,Pan:Pan,date:date.toDateString().toString(),image:new Date().toDateString().toString()+auth().currentUser.uid,flat:flat,area:area,Pincode:Pincode,city:city,state:state}).then(res=>{
            setLoading(false)
            showToast('success','PAN Card is under review.!');
            handleClosePress()
          }).catch(e=>{showToast('error','Something went wrong!','Please try again later.');setLoading(false);handleClosePress()});
        }
        else showToast('error','Invalid Details!','Please check the details and try again.');
      }
  
      return(<>
        <Icon name='card-account-details-outline' size={28} color='#1a1a1a' style={{alignSelf:'center',marginTop:15}}></Icon>
        <Text style={styles.VerifyPanText}> Verify PAN</Text>
        <BottomSheetScrollView>
          <Text style={styles.EnterNameTextBank}>Name</Text>
          <TextInput
            style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular',marginTop:0,marginBottom:20}]}
            onChangeText={setName}
            value={name}
            placeholder={'Enter full name as per PAN card'}
            placeholderTextColor="#969696"
            keyboardType="default"
            selectionColor="#969696"
            maxLength={100}
          />
  
          <Text style={styles.EnterNameTextBank}>PAN</Text>
          <TextInput
            style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular',marginTop:0,marginBottom:20}]}
            onChangeText={setPan}
            value={Pan}
            placeholder={'Enter your 10 digit PAN'}
            placeholderTextColor="#969696"
            keyboardType="default"
            selectionColor="#969696"
            maxLength={10}
          />
  
          <Text style={styles.EnterNameTextBank}>Date of Birth</Text>
          <Text onPress={()=>{setOpen(true)}} style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular',marginTop:0,marginBottom:20,color:date.toDateString()==new Date().toDateString()?'#969696':'#121212'}]}>{date.toDateString()==new Date().toDateString()?'dd / mm / yyyy':date.toLocaleDateString()}</Text>
          <DatePicker mode='date' modal theme='light' open={open} date={date} maximumDate={new Date()} onConfirm={(date) => { setOpen(false) ;setDate(date) ;}}onCancel={() => setOpen(false)}/>
  
          <Text style={styles.EnterNameTextBank}>PAN card front side</Text>
          <Text onPress={openBottomSheet} style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular',marginTop:0,marginBottom:image?5:20,color:image?'#109e38':'#969696'}]}>{image?'✔ PAN Card Added':'+ Add PAN Card Image'}</Text>
          {image && <Text onPress={openBottomSheet} style={[styles.EnterNameTextBank,{color:'#1141c1',fontSize:12,textAlign:'right',marginRight:12}]}>Change</Text>}
          {image &&<Image source={{ uri: image }} style={{width: width - 24,alignSelf: 'center',borderRadius: 10,marginBottom: 20,aspectRatio: aspectRatio}} onLoad={handleImageLoad}/>}
         
          <Text style={styles.EnterNameTextBank}>Flat, House no., Building</Text>
          <TextInput
            style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular',marginTop:0,marginBottom:20}]}
            onChangeText={setFlat}
            value={flat}
            placeholder={'Enter your address'}
            placeholderTextColor="#969696"
            keyboardType="default"
            selectionColor="#969696"
            maxLength={100}
          />
  
          <Text style={styles.EnterNameTextBank}>Area, Street, Sector, Village</Text>
          <TextInput
            style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular',marginTop:0,marginBottom:20}]}
            onChangeText={setArea}
            value={area}
            placeholder={'Enter your address'}
            placeholderTextColor="#969696"
            keyboardType="default"
            selectionColor="#969696"
            maxLength={100}
          />
  
          <Text style={styles.EnterNameTextBank}>Pincode</Text>
          <TextInput
            style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular',marginTop:0,marginBottom:20}]}
            onChangeText={setPincode}
            value={Pincode}
            placeholder={'Enter 6 digits pin code'}
            placeholderTextColor="#969696"
            keyboardType="number-pad"
            selectionColor="#969696"
            maxLength={6}
          />
  
          <Text style={styles.EnterNameTextBank}>City</Text>
          <TextInput
            style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular',marginTop:0,marginBottom:20}]}
            onChangeText={setCity}
            value={city}
            placeholder={'Enter your city'}
            placeholderTextColor="#969696"
            keyboardType="default"
            selectionColor="#969696"
            maxLength={40}
          />
  
          <Text style={styles.EnterNameTextBank}>State</Text>
          <TextInput
            style={[styles.PhoneNumberInput,{fontFamily: 'Poppins-Regular',marginTop:0,marginBottom:20}]}
            onChangeText={setState}
            value={state}
            placeholder={'Enter your state'}
            placeholderTextColor="#969696"
            keyboardType="default"
            selectionColor="#969696"
            maxLength={50}
          /> 
          <Text style={styles.ImportantNoteHeading}>*Important Note-{'\n'}<Text style={{fontSize:12}}>Make sure that you have entered correct details for PAN Card. {'\n'}Verification will take 1-3 days.</Text></Text>
        </BottomSheetScrollView>
  
        {loading?<ActivityIndicator color={'#1141c1'} size={'small'} />:<Text style={[styles.AddButtonText,{backgroundColor:check()?'#109e38':'#999999',marginBottom:15,marginTop:15}]} onPress={HandlePan}>Verify Pan</Text>}
        
        <BottomSheet
          ref={sheetRef2}
          snapPoints={['20%']}
          index={-1}
          enablePanDownToClose={true}
          enableOverDrag={true}
          backdropComponent={renderBackdrop}
          handleStyle={{display:'none'}}
          backgroundStyle={{borderTopLeftRadius:13,borderTopRightRadius:13,backgroundColor:'#ffffff'}}><>
            <Text style={[styles.Option1Text,{fontSize:15,textAlign:'center',marginBottom:30,marginTop:10}]}>Add PAN Card Image</Text>
            <View style={styles.OptionsContainer}>
              <OptionItem icon='camera' text='Camera' onPress={() => handleImageSelection(launchCamera)}/>
              <OptionItem icon='image' text='Gallery' onPress={() => handleImageSelection(launchImageLibrary)}/>
            </View></>
        </BottomSheet>
      </>)
  }

  return ( <>
    <View style={styles.MainWholeContainer}>
      <LinearGradient colors={['#1141c1', '#002487']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.FirstWrapperContainer}>
        <Text style={styles.TotalMoneyAmount}>{'₹'+(AddedAmount+WinningAmount+DBCashBonus).toFixed(2)}</Text>
        <Text style={styles.TotalBalanceText}>Total Balance</Text>
      </LinearGradient>
      <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={()=>{setRefresh(!refresh)}}/>}>
        <View style={styles.AmountAddedCard} elevation={2}>
          <View style={styles.AmountAddedTxtPlusAmountConainer}>
            <Text style={styles.AmountAddedText}>Amount Added (Unutilised)</Text>
            <Text style={styles.AmountAddedAmount}>{'₹ '+AddedAmount}</Text>
          </View>
          <Text style={styles.AddMoneytext} onPress={()=>navigation.navigate('AddCash')}>ADD CASH</Text>
        </View>
        <View style={[styles.AmountAddedCard,{flexDirection: 'column',alignItems: 'flex-start'}]} elevation={2}>
          <Text style={styles.AmountAddedText}>Winnings</Text>
          <Text style={styles.AmountAddedAmount}>{'₹ '+WinningAmount}</Text>
        </View>
        <View style={[styles.AmountAddedCard,{flexDirection:'column',alignItems:'flex-start',marginBottom: 20,paddingRight: 40,}]} elevation={2}>
          <Text style={styles.AmountAddedText}><Image  source={require('../../accessories/ReferImages/cCoin.png')}  style={{ width: 14, height: 14, }}/> Ball24 Cash Bonus</Text>
          <Text style={styles.AmountAddedAmount}>{'₹ '+DBCashBonus}</Text>
          <View style={styles.iIconContainer}>
            <Icon name='cash-fast' size={35} color='#019401' style={{marginRight:8}}/>
            <Text style={styles.DBinfoText}>Maximum usable Ball24 Cash Bonus = 10% of Mega Contest's Entry Fees</Text>
          </View>
        </View>
        <TouchableWithoutFeedback onPress={()=>{
          if(Pan==="Not Verified"){
            handlePresentModalPress()
          }
          else if(Pan==="Verified"){
            navigation.navigate('Withdraw')
          }
        }}>
          <View style={styles.WithdrawTextContainer} elevation={2}>
            <Icon name='bank-transfer-in' color={'#666666'} size={35} style={{marginRight:15}}/>
            <Text style={styles.WithdrawText}>Withdraw</Text>
            {Pan=="Pending" && <Text style={{color:'#cf4f15',fontFamily:'Poppins-Medium',fontSize:12,paddingLeft:40}}>Pan Verification{'\n'}(Under Review)</Text>}
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={()=>{navigation.navigate('Transactions')}}>
          <View style={styles.WithdrawTextContainer} elevation={2}>
            <Icon name='progress-clock' color={'#666666'} size={31} style={{marginRight:15}}/>
            <Text style={styles.WithdrawText}>Transaction History</Text>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>   
    </View>
    {Pan=="Not Verified" && <BottomSheetModal
      ref={sheetRef1}
      snapPoints={['95%']}
      enablePanDownToClose={false}
      enableOverDrag={true}
      backdropComponent={renderBackdrop}
      handleStyle={{display:'none'}}
      // handleIndicatorStyle={{backgroundColor:'#a1a1a1'}}
      backgroundStyle={{borderTopLeftRadius:13,borderTopRightRadius:13,backgroundColor:'#ffffff'}}>
        {Pan==='Not Verified' && <VerifyPan/>}
    </BottomSheetModal>}
    </>
  );
}
export default Wallet;

const styles = StyleSheet.create({
  MainWholeContainer: {
    backgroundColor: '#ffffff',
    flex: 1,
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
    borderRadius: 9,
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
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
    paddingBottom:7
  },
  AmountAddedAmount: {
    color: '#1a1a1a',
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
  VerifyPanText:{
    color:'#1a1a1a',
    fontSize:15,
    fontFamily:'Poppins-Medium',
    textAlign:'center',
    paddingBottom:10
  },
  PhoneNumberInput: {
    color: '#121212',
    fontSize: 14,
    borderColor: '#e7e7e7',
    borderWidth: 0.8,
    marginHorizontal: 12,
    paddingLeft: 13,
    borderRadius: 10,
    paddingVertical: 10,
    height: 48,
  },
  EnterNameTextBank: {
    color: '#1a1a1a',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'left',
    paddingLeft:12,
    paddingBottom:4
  },
  ThisWillText: {
    color: 'grey',
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    marginTop: 8,
    marginLeft: 18,
  },
  ImportantNoteHeading: {
    color: '#1a1a1a',
    marginHorizontal: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#fafafa',
    borderRadius: 5,
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
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
  OptionsContainer:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  Option1Container:{
    flexDirection:'column',
    alignItems:'center',
    marginHorizontal:25
  },
  Option1Text:{
    color:'#696969',
    fontFamily:'Poppins-Medium',
    fontSize:13
  }
});