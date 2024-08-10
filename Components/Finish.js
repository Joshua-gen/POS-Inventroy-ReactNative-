import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, FlatList, TextInput, Button, TouchableOpacity } from 'react-native';
import { firebase } from '../config';

import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const db = firebase.firestore();

const Finish = ({ navigation }) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const unsubscribe = db.collection('OrderRecords')
        .where('status', '==', 'Finished')
        .orderBy('timestamp', 'asc')
        .onSnapshot(querySnapshot => {
            const fetchedOrders = [];
            querySnapshot.forEach(doc => {
            fetchedOrders.push({ id: doc.id, ...doc.data() });
            });
            setOrders(fetchedOrders);
        });

        return () => unsubscribe();
    }, []);



  return (
    <View style={styles.container}>
       
       <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          style={{backgroundColor: "#630436", borderRadius: 5, width: 130, height: 33, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: '0%'}}
          > 
          <Ionicons name="chevron-back" size={18} color="white" />
          <Text style={{color: 'white', fontSize: 14, fontWeight: 'bold'}}>Back to Home</Text>
         
        </TouchableOpacity>

        <FlatList
                data={orders}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.orderContainer}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text>Order ID: </Text>
                      <Text style={{fontWeight: 'bold'}}>{item.id}</Text>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text>Table No. </Text>
                      <Text style={{fontWeight: 'bold'}}>{item.table}</Text>
                    </View>

                    {item.items && item.items.map((orderItem, index) => (
                        <View key={index} style={styles.itemContainer}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text>Item Name</Text>
                                <Text style={{fontWeight: 'bold'}}>{orderItem.newItemName} x {orderItem.quantity}</Text>
                            </View>
                        </View>
                    ))}
                    
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text>Total:  </Text>
                            <Text style={{fontWeight: 'bold', fontSize: 15}}> P {item.total.toFixed(2)}</Text>
                        </View>
                </View>
                )}
            />
    </View>
  );
};

export default Finish;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f3',
    padding: 20,
  },
  orderContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'left',
    shadowColor: '#000',
    margin: 5,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    
},
itemContainer: {
    marginTop: 5,
},
});
