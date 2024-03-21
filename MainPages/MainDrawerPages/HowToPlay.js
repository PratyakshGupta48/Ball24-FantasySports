import React, { useRef } from 'react';
import WebView from 'react-native-webview';
import HeaderBlank from '../../Headers/HeaderBlank';

export default function HowToPlay({navigation}) {
  const webref = useRef(null);
  return (<>
    <HeaderBlank navigation={() => navigation.goBack()} Heading={'Rules & Points System'} color='#1a1a1a' />
    <WebView
      ref={webref}
      source={{ uri: 'https://ball24.in/pages/Rules' }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      userAgent="Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Mobile Safari/537.36"
    />
  </>);
}
