import { StatusBar} from 'react-native'
import React from 'react'
import HeaderBlank from '../../Headers/HeaderBlank';
import Info from '../Info';

export default function FantasyPointSystem({navigation}) {
  return (
    <>
    <StatusBar animated={true} backgroundColor="#000000"/>

    <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'Dream Fantasy Points System '} color='#1a1a1a'/>

    <Info/>
    </>
  )
}