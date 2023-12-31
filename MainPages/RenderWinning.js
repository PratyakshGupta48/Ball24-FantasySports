import { StyleSheet, Text, View, FlatList } from 'react-native'
import React,{useCallback} from 'react'
import { useRoute } from '@react-navigation/native';

export default function RenderWinning() {
  const Winning = useRoute().params.Winning;
  const RenderWinning = useCallback(({item})=><>
    <View style={styles.RankAndWinningsNumbersContainer}>
      <View style={styles.RankAndWinningsTextContainer}><Text style={[styles.RankNumber,{color:'#969696'}]}># </Text><Text style={styles.RankNumber}>{item.Spot}</Text></View> 
      <Text style={styles.WinningsNumber}>{'₹ '+item.PrizeMoney}</Text>
    </View>
    <View style={styles.Line}></View></>
  )
  return (
    <FlatList
      data={Winning}
      ListHeaderComponent={()=><>
        <View style={styles.RankAndWinningsTextContainer}>
          <Text style={styles.RankText}>Rank</Text>
          <Text style={styles.RankText}>Winnings</Text>
        </View>
        <View style={styles.Line}></View></>
      }
      ListFooterComponent={()=><Text style={styles.WinningsNoteText}>In case of a tie for a winning position or an unfilled contest, the prize money may vary from the initially stated amount. Moreover, the Indian government mandates a 30% TDS deduction on Net Winnings from Ball24, as per the proposed section 194BA of the Income-tax Act, 1961.</Text>}
      renderItem={RenderWinning}
      style={styles.Winnings}
    />
  )
}

const styles = StyleSheet.create({
  Winnings: {
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: '#ffffff',
    flex: 1,
  },
  RankAndWinningsTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  RankText: {
    color: '#969696',
    fontFamily: 'Poppins-Regular',
  },
  Line: {
    backgroundColor: '#dbdbdb',
    height: 0.4,
  },
  RankAndWinningsNumbersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  RankNumber: {
    color: '#1a1a1a',
    fontWeight: '500',
  },
  WinningsNumber: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  WinningsNoteText: {
    color: '#969696',
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    textAlign: 'center',
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 5,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 5,
  },
});