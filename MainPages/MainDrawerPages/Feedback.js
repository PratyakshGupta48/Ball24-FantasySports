import { StyleSheet, Text, View, StatusBar, ScrollView,TextInput, ActivityIndicator } from 'react-native'
import React,{useState} from 'react'
import HeaderBlank from '../../Headers/HeaderBlank';
import {height} from '../../Dimensions';
import auth from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';

export default function Feedback({navigation}) {

  const uid = auth().currentUser.uid
  const [Feedback,setFeedback] = useState('')
  const [loadingSpinner,setLoadingSpinner] = useState(false);

  return (<>
    <StatusBar animated={true} backgroundColor="#000000"/>
    <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'Feedback'}/>
    <ScrollView style={styles.MainWholeContainer}>
      <View style={styles.MainCardComponent} elevation={3}>
        <Text style={styles.Tagline}>Help us Shape a New Era of Fantasy Cricket</Text>
        <TextInput
          style={styles.Textinput}
          onChangeText={setFeedback}
          value={Feedback}
          placeholder='Feedback....'
          placeholderTextColor="black"
          keyboardType="default"
          selectionColor="#969696"
          multiline={true}
          textAlign='left'
          textAlignVertical='top'
        />
        <Text style={styles.SubmitButton} onPress={()=>{
          if(Feedback!=''){
            setLoadingSpinner(true)
            const feedback = functions().httpsCallable('Feedback')
            feedback({uid:uid,Feedback:Feedback}).then(()=>{
              setLoadingSpinner(false)
              setFeedback('')
              alert('Thank you for your valuable feedback')
            })
          }
        }}>SUBMIT</Text>
      </View>
    </ScrollView>
    {loadingSpinner &&<ActivityIndicator 
      hidesWhenStopped={true}
      color="#1141c1"
      size="large"
      animating={true}
      style={styles.ActivityIndicator}
    />}
    </>
  )
}

const styles = StyleSheet.create({
  MainWholeContainer:{
    backgroundColor:'#ffffff',
    flex:1
  },
  MainCardComponent:{
    backgroundColor:'#ffffff',
    marginHorizontal:12,
    marginTop:20,
    marginBottom:20,
    paddingTop:15,
    paddingHorizontal:15,
    borderRadius:10,
    paddingBottom:15
  },
  Textinput:{
    color: 'black',
    fontSize: 15,
    fontFamily: 'Poppins-Light',
    letterSpacing: 0.5,
    height:250,
    backgroundColor: '#f5f5f5',
    borderRadius:10, 
    paddingHorizontal:7,
    paddingVertical:5
  },
  SubmitButton:{
    color:'#ffffff',
    fontFamily:'Poppins-SemiBold',
    fontSize:17,
    textAlign:'center',
    backgroundColor:'#009e00',
    marginTop:30,
    borderRadius:5,
    paddingVertical:5,
  },
  ActivityIndicator:{
    backgroundColor:'#ffffff',
    height:height
  },
  Tagline:{
    color:'#121212',
    fontFamily:'Poppins-Medium',
    textAlign:'center',
    fontSize:16,
    marginBottom:35
  }
})