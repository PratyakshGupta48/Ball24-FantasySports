import { StyleSheet, Text, View ,StatusBar, FlatList, ActivityIndicator} from 'react-native'
import React, { useState ,useEffect ,useCallback} from 'react'
import HeaderBlank from '../../Headers/HeaderBlank';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; 
import {height,width} from '../../Dimensions';
import { groupBy } from 'lodash';

export default function Transactions({navigation}) {

  const [Transactions,setTransactions] = useState(null);
  const [loadingSpinner,setLoadingSpinner] = useState(true);
  const [refresh,setRefresh] = useState(false);


  useEffect(()=>{
    setLoadingSpinner(true)
    const user = auth().currentUser;
    const uid = user.uid;

    firestore().collection('users').doc(uid).get().then(documentSnapshot=>{
        setTransactions((documentSnapshot.data().Transactions).reverse())
        setLoadingSpinner(false)
    })
  },[refresh])

//   const renderItem = useCallback(({item})=> item.Amount!='₹0' && (
//     <View style={item.Type=='Credit'?styles.WholeContainerCredit:item.Type=='Withdrawn'?styles.WholeContainerWithdrawn:item.Type=='Debit'?styles.WholeContainerDebit:styles.WholeContainerDebit} elevation={4}>
//         <View style={styles.TimeContainer}><Text style={styles.DateText}>{new Date(1000*Math.round(item.Time/1000)).toLocaleString()}</Text></View>
//         <View style={styles.FlexMainContainer}>
//             <View style={styles.ContextToContainer}>
//                 <Text style={styles.ContextText}>{item.Context}</Text>
//                 {item.Context=='Withdraw' && <Text style={styles.statusText}>{item.Status}</Text>}
//                 <Text style={styles.ToText}>{item.Type+((item.Type==('Credit')||item.Type==('Withdrawn'))?' to ':' from ')+item.To}</Text>
//             </View>
//             <View style={styles.MoneyContainer}>
//                 <Text style={styles.AmountText}>{item.Amount}</Text>
//             </View>
//         </View>
//     </View>
//   ),[])

const renderItem = useCallback(({ item }) => {
    if (item.Amount === '₹0') {
      return null;
    }

    return (
      <View style={item.Type == 'Credit' ? styles.WholeContainerCredit : item.Type == 'Withdrawn' ? styles.WholeContainerWithdrawn : item.Type == 'Debit' ? styles.WholeContainerDebit : styles.WholeContainerDebit}>
        <View style={styles.FlexMainContainer}>
          <View style={styles.ContextToContainer}>
            <Text style={styles.ContextText}>{item.Context}</Text>
            {item.Context == 'Withdraw' && <Text style={styles.statusText}>{item.Status}</Text>}
            <Text style={styles.ToText}>{item.Type + ((item.Type == ('Credit') || item.Type == ('Withdrawn')) ? ' to ' : ' from ') + item.To}</Text>
          </View>
          <View style={styles.MoneyContainer}>
            <Text style={styles.AmountText}>{item.Amount}</Text>
          </View>
        </View>
      </View>
    );
  }, []);

  const groupedTransactions = groupBy(Transactions, (transaction) => {
    return new Date(1000 * Math.round(transaction.Time / 1000)).toLocaleDateString();
  });

  const renderGroupedTransactions = useCallback(({ item }) => {
    return (<View style={styles.GroupContainer}>
        <View style={styles.TimeContainer}><Text style={styles.DateText}>{item.date}</Text></View>
        {item.transactions.map((transaction) => (
          <View key={transaction.Id}>
            {renderItem({ item: transaction })}
          </View>
        ))}
      </View>);
  }, []);

  const groupedTransactionData = Object.entries(groupedTransactions).map(([date, transactions]) => {
    return {
      date,
      transactions,
    };
  });


  return (
    <>
    <StatusBar animated={true} backgroundColor="#121212"/>
  
    <HeaderBlank navigation={()=>{navigation.goBack();}} Heading={'Transactions'}/>

    {!loadingSpinner &&    <View style={styles.MainWholeContainer}>
      <FlatList
        data={groupedTransactionData}
        renderItem={renderGroupedTransactions}
        keyExtractor={(item, index) => index.toString()}
        refreshing={false}
        onRefresh={() => setRefresh(!refresh)}
      />
    </View>}
    {loadingSpinner && 
    <View style={styles.ActivityIndicator}>
      <ActivityIndicator 
      hidesWhenStopped={true}
      color="#1141c1"
      size="large"
      animating={true}
      />
    </View>}
    </>
  )
}

const styles = StyleSheet.create({
    MainWholeContainer:{
        backgroundColor:'#fafafa',
        flex:1,
    },
    WholeContainerDebit:{
        // marginBottom:10,
        backgroundColor:'#ffffff',
    },
    WholeContainerCredit:{
        backgroundColor:'#f0fcf3',
        // marginBottom:10,
    },
    WholeContainerWithdrawn:{
        backgroundColor:'#f0f7fc',
        // marginBottom:10,
    },
    TimeContainer:{
        height:30,
        backgroundColor:'#ffffff',
        paddingHorizontal:10,
        flexDirection:'row',
        alignItems:'center',
        borderBottomColor:'#bdbdbd',
        borderBottomWidth:0.3,
        borderTopColor:'#bdbdbd',
        // borderTopWidth:0.5,
    },
    GroupContainer:{
        marginBottom:20,
        borderBottomColor:'#bdbdbd',
        borderBottomWidth:0.5,
        borderTopWidth:0.5
    },
    DateText:{
        color:'#121212',
        fontFamily:'Poppins-Medium',
        fontSize:11.5,
    },
    FlexMainContainer:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        borderBottomColor:'#bdbdbd',
        borderBottomWidth:0.2,
        marginRight:20,
        width:width
    },
    ContextToContainer:{
        flexDirection:'column',
        paddingLeft:10
    },
    ContextText:{
        color:'#050094',
        fontFamily:'Poppins-SemiBold',
        fontSize:16,
        paddingTop:10,
        paddingBottom:7,
    },
    statusText:{
        color:'#121212',
        paddingBottom:6,
        fontFamily:'Poppins-Medium',
        fontSize:12,
        marginTop:-8
    },
    ToText:{
        color:'#ad0006',
        fontFamily:'Poppins-Medium',
        fontSize:12,
        paddingBottom:6
    },
    MoneyContainer:{
        paddingRight:12
    },
    AmountText:{
        color:'#121212',
        fontWeight:'700',
        fontSize:14.5
    },
    ActivityIndicator:{
        position:'absolute',
        height:height,
        width:width,
        alignItems:'center',
        justifyContent:'center',
        zIndex:900,
        backgroundColor:'#ffffff',
        opacity:1,
    },
})