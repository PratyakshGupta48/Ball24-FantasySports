import React from 'react'
import { useRoute } from '@react-navigation/native';
import WebView from 'react-native-webview';

export default function PaymentGateway() {
  return <WebView source={{ uri: useRoute().params.url }} javaScriptEnabled={true} domStorageEnabled={true} startInLoadingState={true} userAgent="Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Mobile Safari/537.36"/>
}
