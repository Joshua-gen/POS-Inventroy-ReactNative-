import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity , Image} from 'react-native';

import { firebase } from '../config';
import { MaterialIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';


const db = firebase.firestore();

const Home = ({ navigation }) => {
  const [totalTables, setTotalTables] = useState(0);
  const [occupiedTables, setOccupiedTables] = useState(0);
  const [unfinishorders, setUnfinishOrders] = useState(0); // State for unfinished orders count

  useEffect(() => {
    // Fetch total and occupied tables count
    const unsubscribeTables = db.collection('tables').onSnapshot((querySnapshot) => {
      const fetchedData = [];
      let occupiedCount = 0;

      querySnapshot.forEach((doc) => {
        const tableData = doc.data();
        fetchedData.push(tableData);
        if (tableData.occupied) {
          occupiedCount += 1;
        }
      });

      setTotalTables(fetchedData.length);
      setOccupiedTables(occupiedCount);
    });

    // Fetch count of unfinished orders
    const unsubscribeOrders = db.collection('OrderRecords').where('status', '==', 'Unfinished').onSnapshot((querySnapshot) => {
      setUnfinishOrders(querySnapshot.size); // Set the number of unfinished orders
    });

    return () => {
      unsubscribeTables();
      unsubscribeOrders();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={{width: '204%', height: 60, backgroundColor: '#630436', margin: -20, marginTop: -20,}}>
       <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: '3%', marginTop: '4%'}}>Home</Text>
      </View>
      <Image 
        style={{width: 90, height: 90, borderRadius: 100, marginTop: 50, alignSelf: 'center'}}
        source={require('../assets/mey.jpg')}
        />
      <View style={{ backgroundColor: '#fff', width: '100%', shadowColor: '#000', margin: 5, shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3, marginTop: 20 , height: 'auto', borderRadius: 5, padding: 10, marginTop: 30}}>
        <View style={{flexDirection: 'row'}}>
          <Text style={{fontSize: 16, color: '#630436', fontWeight: 'bold'}}>Tables </Text>
          <MaterialIcons name="table-restaurant" size={24} color="#630436" />
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text style={{fontSize: 16}}>No. of table occupied: </Text>
          <Text style={{fontSize: 18, fontWeight: 'bold', color: '#630436',}}>{occupiedTables}/{totalTables}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Tables')}
          style={{backgroundColor: '#630436', width: 200, flexDirection: 'row', height: 40, justifyContent: 'center', alignItems:'center', borderRadius: 5, marginTop: 5}}
        >
          <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>View Tables </Text>
          <MaterialIcons name="table-restaurant" size={24} color="white" />

        </TouchableOpacity>
      </View>

        <View style={{ backgroundColor: '#fff', width: '100%', shadowColor: '#000', margin: 5, shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3, marginTop: 20 , height: 'auto', borderRadius: 5, padding: 10, marginTop: 30}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{fontSize: 16, color: '#630436', fontWeight: 'bold'}}>Unfinish Orders</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={{fontSize: 16}}>No. of unfinish orders:  </Text>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#630436',}}>{unfinishorders}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Unfinish')}
            style={{backgroundColor: '#630436', width: 200, flexDirection: 'row', height: 40, justifyContent: 'center', alignItems:'center', borderRadius: 5, marginTop: 5}}
          >
            <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>View Queued Orders </Text>
            <Entypo name="list" size={24} color="white" />
           
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: '#fff', width: '100%', shadowColor: '#000', margin: 5, shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3, marginTop: 20 , height: 'auto', borderRadius: 5, padding: 10, marginTop: 30}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{fontSize: 16, color: '#630436', fontWeight: 'bold'}}>Order Transactions History</Text>
          </View>
        
          <TouchableOpacity 
            onPress={() => navigation.navigate('Finish')}
            style={{backgroundColor: '#630436', width: 200, flexDirection: 'row', height: 40, justifyContent: 'center', alignItems:'center', borderRadius: 5, marginTop: 5}}
          >
            <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>View Order Records </Text>
            <Entypo name="list" size={24} color="white" />
          </TouchableOpacity>
        </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f3',
    padding: 20,
  },
});
