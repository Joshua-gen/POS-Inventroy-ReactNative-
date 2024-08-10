import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { firebase } from '../config';
import { Ionicons } from '@expo/vector-icons';

const db = firebase.firestore();

const Unfinish = ({ navigation }) => {

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const unsubscribe = db.collection('OrderRecords')
            .where('status', '==', 'Unfinished')
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

    const handleFinishOrder = (orderId) => {
        db.collection('OrderRecords').doc(orderId).update({ status: 'Finished' })
            .then(() => {
                alert('Order marked as finished');
            })
            .catch(error => {
                console.error('Error finishing order: ', error);
            });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                style={styles.backButton}
            >
                <Ionicons name="chevron-back" size={18} color="white" />
                <Text style={styles.backButtonText}>Back to Home</Text>
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
                        <TouchableOpacity onPress={() => handleFinishOrder(item.id)} style={styles.finishButton}>
                            <Text style={styles.finishButtonText}>Finish Order</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

export default Unfinish;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fdf2f3',
        padding: 20,
    },
    backButton: {
        backgroundColor: "#630436",
        borderRadius: 5,
        width: 130,
        height: 33,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: '0%',
        marginBottom: 20,
    },
    backButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
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
    finishButton: {
        marginTop: 10,
        backgroundColor: '#630436',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    finishButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
