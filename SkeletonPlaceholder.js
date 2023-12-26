import React from 'react';
import { View} from 'react-native';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

export default function SkeletonContent () {
  return <SkeletonPlaceholder backgroundColor='#f2f2f2' highlightColor='#fafcff'>
    <View style={{marginTop: 6,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
    <View style={{marginTop: 6,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
    <View style={{marginTop: 6,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
    <View style={{marginTop: 6,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
    <View style={{marginTop: 6,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
    <View style={{marginTop: 6,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
    <View style={{marginTop: 6,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
  </SkeletonPlaceholder> 
}

export function SkeletonContestSelection () {
  return <SkeletonPlaceholder backgroundColor='#f2f2f2' highlightColor='#fafcff'>
    <View style={{height:25}}/>
    <View style={{height:35,marginTop:1}}/>
    <View style={{height:150,marginTop:15,marginHorizontal:14,borderRadius:8}}/>
    <View style={{height:150,marginTop:15,marginHorizontal:14,borderRadius:8}}/>
    <View style={{height:150,marginTop:15,marginHorizontal:14,borderRadius:8}}/>
    <View style={{height:150,marginTop:15,marginHorizontal:14,borderRadius:8}}/>
    <View style={{height:150,marginTop:15,marginHorizontal:14,borderRadius:8}}/>
    <View style={{height:150,marginTop:15,marginHorizontal:14,borderRadius:8}}/>
  </SkeletonPlaceholder>
}

export function SkeletonOneLiner () {
  return <SkeletonPlaceholder backgroundColor='#f2f2f2' highlightColor='#fafcff'>
    <View style={{height:38,borderRadius:6}}/>
  </SkeletonPlaceholder>
}

export function SkeletonOneBoxer () {
  return <SkeletonPlaceholder backgroundColor='#f2f2f2' highlightColor='#fafcff'>
    <View style={{height:130,borderRadius:10}}/>
  </SkeletonPlaceholder>
}

export function SkeletonContentOne () {
  return <SkeletonPlaceholder backgroundColor='#f8f8f8' highlightColor='#fafcff'>
    <View style={{marginTop: 20,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
    <View style={{marginTop: 6,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
    <View style={{marginTop: 6,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
    <View style={{marginTop: 6,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
    <View style={{marginTop: 6,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
    <View style={{marginTop: 6,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
    <View style={{marginTop: 6,marginHorizontal:15 ,height: 140 ,borderRadius:12,marginBottom:13}}/>
  </SkeletonPlaceholder> 
}
