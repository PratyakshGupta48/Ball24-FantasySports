import HeaderBlank from '../Headers/HeaderBlank';
import { Image, ScrollView, StyleSheet, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import React from 'react'
import { width } from '../Dimensions';

export default function WebViewForRules({navigation}) {
  return (<>
    <HeaderBlank navigation={() => navigation.goBack()} Heading={'Rules & Points System'} color='#1a1a1a' />
    <LinearGradient style={{flex:1}} colors={['#a8cfff', '#ffffff']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 0.2 }}>
      <ScrollView>
      <Image source={require('../accessories/DreamBallLogos/PointJJ.png')} resizeMethod='scale' style={styles.Image} />
      <Text style={{color:'#121212',fontFamily:'Poppins-Medium',fontSize:14,marginHorizontal:13,marginBottom:20}}>Abbreviations:{'\n'}<Text style={{fontFamily:'Poppins-Regular'}}>
        B - Bye,   LB - Leg Bye,   WD - Wide,   NB - No Ball,   
        </Text></Text>
      </ScrollView>

    </LinearGradient>

  </>)
}

const styles = StyleSheet.create({
  Image:{
    width:width-30,height:2.15*(width-30),alignSelf:'center',marginTop:20,borderRadius:10,marginBottom:10,
    borderWidth:0.3,
    borderColor:'#a1a1a1',
  }
})


// import React from 'react';
// import HeaderBlank from '../Headers/HeaderBlank';
// import { ScrollView, StyleSheet, Text, View } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';

// export default function WebViewForRules({ navigation }) {
//   const selected = ['0', '1', '2', '3', '4', '5', '6', 'WD', 'NB', 'W'];
//   const Live = ['0',"1,1WD,1NB,\n                  1LB,1B" ,"2,2WD,2NB,\n                   2LB,2B","3,3WD,3NB,\n                   3LB,3B","4,4NB,4WD,\n                   4LB,4B","5,5WD,5NB,\n                   5LB,5B","6,6NB,6WD,\n                   6LB,6B","1WD,2WD,3WD,\n                    4WD,5WD,6WD,\n                    7WD","1NB,2NB,3NB,\n                    4NB,5NB,6NB,\n                    7NB","W"]
//   const colors = {null:'#ffffff',"0":'#006269',"1":'#006269','1B':'#006269','1LB':'#006269','2LB':'#006269','3LB':'#006269','4LB':'#006269','5LB':'#006269','6LB':'#006269',"2":'#006269',"3":'#006269',"4":'#1e8e3e',"5":'#006269',"6":'#1e8e3e',"1WD":'#185ccc',"2WD":'#185ccc',"3WD":'#185ccc',"4WD":'#185ccc',"5WD":'#185ccc',"6WD":'#185ccc',"7WD":'#185ccc',"1NB":'#185ccc',"2NB":'#185ccc',"3NB":'#185ccc',"4NB":'#185ccc',"5NB":'#185ccc',"6NB":'#185ccc',"7NB":'#185ccc',"W":'#d93025'}

//   // const Live = [['0'], ['1,', '1WD,', '1NB,', '\n,', '1LB,', '1B'], ['2', '2WD', '2LB', '\n', '2NB'], ['3', '3WD', '3NB', '\n', '3LB'], ['4', '4LB', '4WD', '\n', '4NB'], ['5', '5WD', '5LB', '\n', '5NB'], ['6', '6LB', '6WD', '\n', '6NB'], ['1WD', '2WD', '3WD', '\n', '4WD', '5WD', '6WD', '\n', '7WD'], ['1NB', '2NB', '3NB', '\n', '4NB', '5NB', '6NB', '\n', '7NB'], ['W']];
//   const Points = ['10 Pts', '12 Pts for 1,1LB and 1B.\n6 Pts for 1WD and 1NB. ', '15 Pts for 2, 2B and 2LB.\n8 Pts for 2WD and 2NB.', '18 Pts for 3,3B and 3LB.\n9 Pts for 3NB and 3WD.', '22 Pts for 4,4B and 4LB.\n11 Pts for 4WD and 4NB.', '25 Pts for 5,5B and 5LB.\n13 Pts for 5WD and 5NB.', '30 Pts for 6,6B and 6LB.\n15 Pts for 6WD and 6NB.', '30 Pts for 1WD,2WD,3WD,4WD,5WD,6WD and 7WD.', '35 Pts for 1NB,2NB,3NB,4NB,5NB,6NB and 7NB.', '35 Pts'];

//   return (<>
//     <HeaderBlank navigation={() => navigation.goBack()} Heading={'Rules & Points System'} color='#1a1a1a' />
//     <LinearGradient colors={['#a8cfff', '#ffffff']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 0.2 }}>
//       <ScrollView style={styles.MainContainer}>
//         <Text style={styles.Heading}>Fantasy Points</Text>
//         <View style={styles.SmallHeadingsContainer}>
//           <Text style={styles.SmallHeading}>Selected      Live</Text>
//           <Text style={styles.SmallHeading}>Points</Text>
//         </View>
//         <View style={styles.SmallHeadingsContainer2}>
//           {selected.map((item, index) => (
//             <View key={index} style={{marginBottom: 10,flexDirection:'row',justifyContent:"space-between",alignItems:'center',borderBottomColor:'#a1a1a1',borderBottomWidth:0.5 }}>
//               {/* <Text style={[styles.TabPattiText2,{width:'50%'}]}>     {item}<Text>{(item!='1WD' && item!='1NB')?'           ': '     '}{Live[index].map((point,rowIndex)=><Text key={rowIndex}> {point}</Text>)}</Text></Text> */}
//               <Text style={[styles.TabPattiText2]}>     {item}<Text>{(item!='WD' && item!='NB')?'           ': '         '}{Live[index]}</Text></Text>
//               <Text style={styles.PointsText}>{Points[index]}</Text>
//             </View>
//           ))}
//         </View>
//       </ScrollView>
//     </LinearGradient>
//   </>);
// }

// const styles = StyleSheet.create({
//   MainContainer: {
//     backgroundColor: '#ffffff',
//     elevation: 2,
//     borderRadius: 7,
//     marginTop: 20,
//     marginBottom: 50,
//     marginHorizontal: 12,
//   },
//   Heading: {
//     fontSize: 15,
//     color: '#1a1a1a',
//     fontFamily: 'Poppins-Medium',
//     marginHorizontal: 12,
//     paddingBottom: 6,
//     borderBottomWidth: 0.7,
//     borderBottomColor: '#1a1a1a',
//     paddingTop:10
//   },
//   SmallHeadingsContainer: {
//     flexDirection: 'row',
//     paddingHorizontal: 12,
//     justifyContent: 'space-between',
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#a1a1a1'
//   },
//   SmallHeadingsContainer2: {
//     flexDirection: 'column',
//     paddingHorizontal: 12,
//     justifyContent: 'space-between',
//     paddingTop: 10
//   },
//   SmallHeading: {
//     fontSize: 13,
//     color: '#1a1a1a',
//     fontFamily: 'Poppins-Medium',
//     paddingTop: 6
//   },
//   TabPattiText2: {
//     color: '#1a1a1a',
//     fontFamily: 'Poppins-SemiBold',
//     borderRadius: 5,
//   },
//   PointsText:{
//     color:'#1141c1',
//     fontFamily:'Poppins-Medium',
//     fontSize:14,
//     width:'40%',
//     textAlign:'right'
//   }
// });
    