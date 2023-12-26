import React from 'react';
import {View,Text,StyleSheet,TouchableWithoutFeedback} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { DrawerContentScrollView,DrawerItemList} from "@react-navigation/drawer";
import { useNavigation } from '@react-navigation/native';
import { height } from '../../Dimensions';

function DrawerContent(props) {
  const navigation = useNavigation();
  return( 
    <View style={styles.WholePagecontainer}>
      <DrawerContentScrollView {...props} contentContainerStyle={{backgroundColor:'#ffffff'}}>
        <View style={styles.DrawerItemsContainer}>
          <DrawerItemList {...props} /> 
        </View>
      </DrawerContentScrollView>
      <TouchableWithoutFeedback onPress={()=>{navigation.navigate('HelpAndSupport')}}>
        <View elevation={10} style={styles.HelpContainer}>
          <Icon name='help-circle-outline' size={33} color='#121212'/>  
          <Text style={{color:'#121212',fontFamily:'Poppins-Medium',fontSize:15,marginLeft:13}}>Help & Support</Text>        
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

export default DrawerContent;

const styles = StyleSheet.create({
  WholePagecontainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  DrawerItemsContainer: {
    position: 'relative',
    top: -8,
    height: height,
  },
  HelpContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 20,
    height: 100,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e6e6e6',
  },
});