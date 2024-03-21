import { StyleSheet, Text, View, StatusBar, Image, TouchableWithoutFeedback, ScrollView} from 'react-native'
import React,{useEffect, useState,useRef,useCallback}  from 'react'
import BottomSheet , {BottomSheetBackdrop,BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {width} from '../../Dimensions';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import LinearGradient from 'react-native-linear-gradient';

export default function Profile({navigation}) {
  
  const user = auth().currentUser;
  const uid = user.uid;
  const [image,setImage] = useState(user.photoURL);
  const [phoneNumber,setPhoneNumber] = useState('');
  const [originalName,setOriginalname] = useState('');
  const [teamName,setTeamName] = useState('');
  const [email,setEmail] = useState('');
  const [dateOfBirth,setDateOfBirth] = useState('');
  const [gender,setGender] = useState('');

  useEffect(()=>{
    firestore().collection('users').doc(uid).onSnapshot(documentSnapshot=>{
      setPhoneNumber(documentSnapshot.data().PhoneNumber)
      setOriginalname(documentSnapshot.data().OriginalName)
      setTeamName(documentSnapshot.data().Name)
      setEmail(documentSnapshot.data().Email)
      setDateOfBirth(documentSnapshot.data().DateOfBirth)
      setGender(documentSnapshot.data().Gender)
    })
  },[])

  const avatarArray = [
    {l:'https://firebasestorage.googleapis.com/v0/b/ball-24.appspot.com/o/Avatars%2Fb1.jpg?alt=media&token=5c6bd98a-7961-42bc-856d-f11fde416456'},
    {l:'https://firebasestorage.googleapis.com/v0/b/ball-24.appspot.com/o/Avatars%2Fb2.jpg?alt=media&token=e8d8e1ad-8497-41f8-a91c-549b88ec66de'},
    {l:'https://firebasestorage.googleapis.com/v0/b/ball-24.appspot.com/o/Avatars%2Fb3.jpg?alt=media&token=696829ec-41d5-4b61-a02f-1194d31e1434'},
    {l:'https://firebasestorage.googleapis.com/v0/b/ball-24.appspot.com/o/Avatars%2Fb4.jpg?alt=media&token=b1f2d556-7cd9-4bc6-8c55-80f1ae4f4251'},
    {l:'https://firebasestorage.googleapis.com/v0/b/ball-24.appspot.com/o/Avatars%2Fb5.jpg?alt=media&token=baa781d8-84f0-485b-99a9-109d64191958'},
    {l:'https://firebasestorage.googleapis.com/v0/b/ball-24.appspot.com/o/Avatars%2Fg1.jpg?alt=media&token=a95f82fc-2283-4607-b582-ced3fe939c31'},
    {l:'https://firebasestorage.googleapis.com/v0/b/ball-24.appspot.com/o/Avatars%2Fg2.jpg?alt=media&token=2e24b1df-0498-42e9-8532-8fec0457888b'},
    {l:'https://firebasestorage.googleapis.com/v0/b/ball-24.appspot.com/o/Avatars%2Fg3.jpg?alt=media&token=1a281139-a06d-48fb-bd81-6af052aaf076'},
    {l:'https://firebasestorage.googleapis.com/v0/b/ball-24.appspot.com/o/Avatars%2Fg4.jpg?alt=media&token=3432f62a-3032-4270-9291-2c069e52d89d'},
    {l:'https://firebasestorage.googleapis.com/v0/b/ball-24.appspot.com/o/Avatars%2Fg5.jpg?alt=media&token=30f1a1f6-9b2d-41fe-b868-80884b50de44'},
  ]

  const sheetRef = useRef(null);
  
  const openBottomSheet = useCallback((index) => {
    if(sheetRef.current) sheetRef.current.snapToIndex(index);
   },[]);

   const renderBackdrop = useCallback((props)=><BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0}/>)

   return (<>
    <StatusBar animated={true} backgroundColor="#002487" />
    <View style={styles.MainContainer}>
      <LinearGradient colors={['#1141c1', '#002487']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ImagebackgroundContainer}>
        <Icon name='arrow-left' size={25} color="white" style={styles.icon} onPress={()=>{navigation.goBack()}}/>
        <Text style={styles.ProfileText}>Profile</Text>
        <TouchableWithoutFeedback onPress={()=>{openBottomSheet(0)}}>
          <Image style={styles.ProfilePictureStyle} source={{uri:image}}></Image>
        </TouchableWithoutFeedback>
        <Text style={styles.TeamNameText}>{teamName}</Text>
      </LinearGradient>
      <ScrollView> 
        <View style={{marginBottom:50}}>
          {originalName!='' && <View style={styles.NameContainer} elevation={2}>
            <Text style={styles.NameText}>NAME</Text>
            <Text style={styles.NameValue}>{originalName}</Text>
          </View>} 
          <View style={styles.NameContainer} elevation={2}>
            <Text style={styles.NameText}>MOBILE</Text>
            <Text style={styles.NameValue}>{phoneNumber}</Text>
          </View>
          <View style={styles.NameContainerForEmail} elevation={2}>
            <Text style={styles.NameText}>EMAIL</Text>
            {email!='' && <Text style={styles.NameValue}>{email}</Text>}
            {email=='' && <Text style={styles.AddEmailtext} onPress={()=>{navigation.navigate('AddEmail',{uid:uid})}}>ADD EMAIL</Text>}
            {email!='' && <Icon name='pencil-outline' size={25} color="#555555" onPress={()=>{navigation.navigate('AddEmail',{uid:uid})}}/>}
          </View>
          {dateOfBirth!='' && <View style={styles.NameContainer} elevation={2}>
            <Text style={styles.NameText}>DATE OF BIRTH</Text>
            <Text style={styles.NameValue}>{dateOfBirth}</Text>
          </View>}
          {gender!='' && <View style={styles.NameContainer} elevation={2}>
            <Text style={styles.NameText}>GENDER</Text>
            <Text style={styles.NameValue}>{gender}</Text>
          </View>}
          <TouchableWithoutFeedback onPress={()=>{navigation.navigate('ReferAndWin',{ReferCode:teamName})}}>
            <View style={styles.ReferContainer} elevation={2}>
              <View style={styles.ImagesContainerOne}>
                <View style={styles.ImageiContiner}>
                  <Image source={require('../../accessories/ReferImages/cpy2.png')} style={{width:50,height:44}}></Image>
                  <Text style={styles.PrizeTitle}>₹50 Ball24 Cash</Text>
                </View>
                <View style={styles.ImageiContiner}>
                  <Image source={require('../../accessories/ReferImages/swiggy.png')} style={{width:50,height:50}}></Image>
                  <Text style={styles.PrizeTitle}>₹200 voucher</Text>
                </View>
                <View style={styles.ImageiContiner}>
                  <Image source={require('../../accessories/ReferImages/hoodb.png')} style={{width:50,height:50}}></Image>
                </View>
                <View style={styles.ImageiContiner}>
                  <Image source={require('../../accessories/ReferImages/prime.png')} style={{width:80,height:40}}></Image>
                  <Text style={styles.PrizeTitle}>1Y Subscription</Text>
                </View>
              </View>
              <View style={styles.ImagesContainerOne}>
                <View style={styles.ImageiContiner}>
                  <Image source={require('../../accessories/ReferImages/amazonmain.png')} style={{width:80,height:40}}></Image>
                  <Text style={styles.PrizeTitle}>₹5000 voucher</Text>
                </View>
                <View style={styles.ImageiContiner}>
                  <Image source={require('../../accessories/ReferImages/airpods-apple.png')} style={{width:60,height:60}}></Image>
                </View>
                <View style={styles.ImageiContiner}>
                  <Image source={require('../../accessories/ReferImages/Apple-iPad.png')} style={{width:50,height:57}}></Image>
                </View>
                <View style={styles.ImageiContiner}>
                  <Image source={require('../../accessories/ReferImages/iphone.png')} style={{width:73,height:73}}></Image>
                </View>
              </View>
              <Text style={styles.ReferSentenceText}>Refer and Win!</Text>
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.LogOutContainer}>
            <Icon name='power' size={22} color="#444444" style={styles.LogOuticon} onPress={()=>{auth().signOut().then(()=>{navigation.replace('RegOrLog')})}}/>
            <Text style={styles.LogOutText}>LOGOUT</Text>
          </View>
        </View>
      </ScrollView> 
    </View>
    <BottomSheet
      ref={sheetRef}
      snapPoints={['20%']}
      index={-1}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{backgroundColor:'#ffffff'}}
    ><>
      <Text style={styles.ChooseAvatar}>Choose Your Avatar</Text>
      <BottomSheetFlatList
        data={avatarArray}
        horizontal={true}
        keyExtractor={(_, index) => index}
        renderItem={({item})=>
          <TouchableWithoutFeedback onPress={()=>{
            setImage(item.l)
            auth().currentUser.updateProfile({photoURL:item.l})
            const updateImage = functions().httpsCallable('ProfileImage')
            updateImage({uid:uid,url:item.l}).catch(e=>error('Oops! Something Went Wrong', 'We encountered an error. Please try again later.'));
          }}>
            <Image style={styles.AvatarChooseImage} source={{uri:item.l}}></Image>
          </TouchableWithoutFeedback>
        }
      /></>
    </BottomSheet>
    </>
  )
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  ImagebackgroundContainer: {
    height: 180,
    backgroundColor: '#1141c1',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 5,
  },
  ProfilePictureStyle: {
    height: 90,
    width: 90,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginBottom: 10,
    top: -13,
  },
  ProfileText: {
    color: '#ffffff',
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    paddingBottom: 10,
    top: -10,
  },
  TeamNameText: {
    color: '#ffffff',
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    top: -13,
  },
  NameContainer: {
    flexDirection: 'column',
    marginTop: 15,
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 9,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
  },
  NameText: {
    color: '#666666',
    fontFamily: 'Poppins-Medium',
    fontSize: 11.3,
  },
  NameValue: {
    color: '#121212',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  icon:{
    position:'relative',
    alignSelf:'flex-start',
    top:8,
    left:8
  },
  AddEmailtext: {
    color: '#ffffff',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    backgroundColor: '#019401',
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  NameContainerForEmail: {
    flexDirection: 'row',
    marginTop: 15,
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 9,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
  },
  ReferContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 30,
    width: width - 24,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
  },
  ImagesContainerOne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  PrizeTitle: {
    color: '#2e2e2e',
    fontWeight: '800',
    fontSize: 10,
    maxWidth: (width - 48) / 4,
    marginTop: 7,
  },
  ImageiContiner: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ReferSentenceText: {
    color: '#121212',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  LogOutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    marginTop: 20,
  },
  LogOutText: {
    color: '#444444',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginTop: 2,
  },
  ChooseAvatar: {
    color: '#969696',
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    alignSelf: 'center',
    marginBottom: 14,
  },
  AvatarChooseImage: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginHorizontal: 5,
    borderWidth: 1.5,
    borderColor: '#dbdbdb',
  },
});