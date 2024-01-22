import React, { useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import WebView from 'react-native-webview';
import HeaderBlank from '../../Headers/HeaderBlank';

export default function PaymentGateway({ navigation }) {
  const webref = useRef(null);
  const style = `
    document.body.style.backgroundColor = '#ffffff';
    true;
  `;
  return (<>
    <HeaderBlank navigation={() => navigation.goBack()} Heading={'Add Cash'} color='#1a1a1a' />
    <WebView
      ref={webref}
      source={{ uri: useRoute().params.url }}
      javaScriptEnabled={true}
      injectedJavaScript={style}
      domStorageEnabled={true}
      startInLoadingState={true}
      userAgent="Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Mobile Safari/537.36"
    />
  </>);
}
