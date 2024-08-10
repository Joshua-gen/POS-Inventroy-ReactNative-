import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, Modal, Button, TextInput, Platform } from 'react-native';
import { firebase } from '../config';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { printReceipt, selectPrinter } from './Print'; // Import the print functions

const db = firebase.firestore();

const Checkout = ({ navigation, route }) => {
  const { cartItems, clearCart } = route.params;
  const [items, setItems] = useState(cartItems); // Initialize items state with cartItems array
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPayment, setModalPayment] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const [payment, setPayment] = useState('');
  const [discount, setDiscount] = useState('');
  const [change, setChange] = useState(0);
  const taxRate = 12; // Example tax rate
  const [selectedPrinter, setSelectedPrinter] = useState(null); // Add state for selected printer

  // Function to calculate total amount including tax
  const calculateTotal = () => {
    const subtotal = Object.values(items).reduce((total, item) => total + item.newItemPrice * item.quantity, 0);
    return subtotal * (1 + taxRate / 100); // Calculate total including tax
  };

  // Function to calculate change to be returned to customer
  const calculateChange = (total, discountValue, paymentValue) => {
    const finalTotal = total - discountValue;
    return paymentValue - finalTotal;
  };

  // Function to update inventory after placing order
  const updateInventory = async () => {
    console.log('Items:', items); // Log items to check before updating

    const batch = db.batch();

    if (!Array.isArray(items)) {
      console.error('Items is not an array:', items);
      return; // Exit early if items is not an array
    }

    items.forEach(item => {
      const itemRef = db.collection('Inventory').doc(item.id);
      batch.update(itemRef, {
        newItemQuantity: firebase.firestore.FieldValue.increment(-item.quantity)
      });
    });

    try {
      await batch.commit();
      console.log('Inventory updated successfully');
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  };

  const handleCheckout = () => {
    // Validate if a table is selected for dine-in orders
    if (orderType === 'Dine In' && !selectedTable) {
      alert('Please select a table for dine in.');
      return;
    }
  
    // Validate if payment and discount fields are filled
    if (!payment || !discount) {
      alert('Please fill in all payment details to proceed.');
      return;
    }
  
    // Ensure the discount is a valid percentage
    const discountPercent = parseFloat(discount);
    if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      alert('Please enter a valid discount percentage between 0 and 100.');
      return;
    }
  
    // Calculate the total and the discount amount
    const totalBeforeDiscount = calculateTotal();
    const discountAmount = (totalBeforeDiscount * discountPercent) / 100;
    const totalAfterDiscount = totalBeforeDiscount - discountAmount;
  
    // Calculate change
    const paymentValue = parseFloat(payment) || 0;
  
    // Check if payment is sufficient
    if (paymentValue <= 0 || paymentValue < totalAfterDiscount) {
      alert('Payment must be cover the total amount.');
      return;
    }
  
    const changeValue = calculateChange(totalAfterDiscount, discountAmount, paymentValue);
    setChange(changeValue);
  
    // Prepare order details object to be stored in OrderRecords collection
    const orderDetails = {
      items, // Array of items in the order
      subtotal: totalBeforeDiscount,
      total: totalAfterDiscount,
      orderType, // Type of order (Dine In / Take Out)
      table: selectedTable ? selectedTable.number : null, // Selected table number for dine-in orders
      discount: discountAmount, // Discount amount applied to the order
      tax: totalBeforeDiscount * (taxRate / 100), // Tax amount
      payment: paymentValue, // Payment amount received from the customer
      change: changeValue, // Change to be returned to the customer
      timestamp: new Date(), // Timestamp when the order was placed
      status: 'Unfinished', // Set order status to Unfinished
    };
  
    // Add orderDetails to OrderRecords collection in Firestore
    db.collection('OrderRecords').add(orderDetails)
      .then(() => {
        // If order is successfully placed, update inventory
        updateInventory()
          .then(() => {
            // If inventory update is successful, show success alert and reset states
            alert('Order placed successfully!');
            setItems([]); // Clear items in the cart
            clearCart(); // Call clearCart function to reset cart in Orders component
            setSelectedTable(null); // Reset selected table state
            setOrderType(null); // Reset order type state
            setDiscount(''); // Clear discount input
            setPayment(''); // Clear payment input
            setChange(0); // Reset change state
  
            // Print receipt
            printReceipt(orderDetails, selectedPrinter);
  
            // Navigate back to Home screen with an empty cart
            navigation.navigate('Order', { cartItems: [] });
          })
          .catch(error => {
            // If inventory update fails, log error and show alert to user
            console.error('Error updating inventory: ', error);
            alert('Order placed, but failed to update inventory. Please check the inventory manually.');
          });
      })
      .catch(error => {
        // If placing order fails, log error and show alert to user
        console.error('Error placing order: ', error);
        alert('Failed to place order. Please try again.');
      });
  };
  

  // Effect to fetch tables data from Firestore on component mount
  useEffect(() => {
    const unsubscribe = db.collection('tables').onSnapshot((querySnapshot) => {
      const fetchedData = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() });
      });
      setTables(fetchedData);
    });

    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, []);

  // Function to handle table selection
  const handleSelectTable = (table) => {
    if (!table.occupied) {
      db.collection('tables').doc(table.id).update({ occupied: true })
        .then(() => {
          setSelectedTable(table);
          setModalVisible(false);
        })
        .catch((error) => {
          console.error('Error updating table occupancy:', error);
          alert('Failed to select table. Please try again.');
        });
    } else {
      alert('This table is currently occupied. Please select another table.');
    }
  };

  // Function to handle cancel button press
  const handleCancel = () => {
    setItems([]);
    setSelectedTable(null);
    setOrderType(null);
    navigation.navigate('Order');
  };

  // Function to handle print receipt button press
  const handlePrintReceipt = () => {
    const totalBeforeDiscount = calculateTotal();
    const discountPercent = parseFloat(discount) || 0;
    const discountAmount = (totalBeforeDiscount * discountPercent) / 100;
    const totalAfterDiscount = totalBeforeDiscount - discountAmount;
    const paymentValue = parseFloat(payment) || 0;
    const changeValue = calculateChange(totalAfterDiscount, discountAmount, paymentValue);
    const orderDetails = {
      items,
      subtotal: totalBeforeDiscount,
      total: totalAfterDiscount,
      orderType,
      table: selectedTable ? selectedTable.number : null,
      discount: discountAmount,
      tax: totalBeforeDiscount * (taxRate / 100),
      payment: paymentValue,
      change: changeValue,
      timestamp: new Date(),
    };
    printReceipt(orderDetails, selectedPrinter);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <FlatList
        data={Object.values(items)}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.newItemName} x {item.quantity}</Text>
            <Text style={styles.itemPrice}>P {item.newItemPrice * item.quantity}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      {selectedTable && (
        <Text style={styles.selectedTableText}>Selected Table: {selectedTable.number}</Text>
      )}
      {orderType && (
        <Text style={{fontSize: 16, fontWeight: 'bold'}}>Order Type: {orderType}</Text>
      )}
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={styles.dinebtn}
          onPress={() => { setModalVisible(true); setOrderType('Dine In'); }}
        >
          <Text style={styles.dinebtnText}>Dine in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.takebtn}
          onPress={() => setOrderType('Take Out')}
        >
          <Text style={styles.dinebtnText}>Take Out</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: P {calculateTotal().toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.checkoutbtn}
        onPress={() => setModalPayment(true)}
      >
        <Text style={styles.checkoutbtnText}>Proceed</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cancelbtn}
        onPress={handleCancel}
      >
        <Text style={styles.cancelbtnText}>Cancel</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => { setModalVisible(!modalVisible); }}
      >
        <View style={styles.modalView}>
          <View style={{ flexDirection: 'row', width: 332, height: 40, borderBottomWidth: 1, borderBottomColor: '#630436', }}>
              <View style={{ alignSelf: 'center', width: 120, marginLeft: 110, flexDirection: 'row' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#630436' }}>Available Tables</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ right: -75, top: 4 }}
              >
                <Ionicons name="close-sharp" size={30} color="#630436" />
              </TouchableOpacity>
            </View>
          <FlatList
            data={tables.filter(table => !table.occupied)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectTable(item)}>
                <View style={styles.tableContainer}>
                  <Text style={styles.tableText}>Table {item.number}</Text>
                  <Text style={styles.tableText}>{item.name} Seats</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalPayment}
        onRequestClose={() => { setModalPayment(!modalPayment); }}
      >
        <View style={styles.modalPayment}>
          <View style={{ flexDirection: 'row', width: 332, height: 40, borderBottomWidth: 1, borderBottomColor: '#630436', }}>
            <View style={{ alignSelf: 'center', width: 90, marginLeft: 140, flexDirection: 'row' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#630436' }}>Payment</Text>
            </View>
            <TouchableOpacity
              onPress={() => setModalPayment(false)}
              style={{ right: -70, top: 4 }}
            >
              <Ionicons name="close-sharp" size={30} color="#630436" />
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', marginTop: 10,}}>
            <Text style={{fontSize: 25}}>Total: </Text>
            <Text style={{fontSize: 25, fontWeight: 'bold'}}>P {calculateTotal().toFixed(2)}</Text>
          </View>

          <View style={{flexDirection: 'row', marginTop: 10}}>
            <Text style={{fontSize: 25}}>Change: </Text>
            <Text style={{fontSize: 25, fontWeight: 'bold'}}>P {change.toFixed(2)}</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter Discount"
            keyboardType="numeric"
            value={discount}
            onChangeText={(text) => {
              setDiscount(text);
              const discountValue = parseFloat(text) || 0;
              const paymentValue = parseFloat(payment) || 0;
              const total = calculateTotal();
              const changeValue = calculateChange(total, discountValue, paymentValue);
              setChange(changeValue);
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Payment"
            keyboardType="numeric"
            value={payment}
            onChangeText={(text) => {
              setPayment(text);
              const discountValue = parseFloat(discount) || 0;
              const paymentValue = parseFloat(text) || 0;
              const total = calculateTotal();
              const changeValue = calculateChange(total, discountValue, paymentValue);
              setChange(changeValue);
            }}
          />

          <TouchableOpacity 
            onPress={handleCheckout}
            style={styles.checkoutbtn1}
          >
            <Text  style={styles.checkoutbtnText}>Place Order</Text>
          </TouchableOpacity>

        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f3',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  totalContainer: {
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#630436',
  },
  totalText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dinebtn: {
    marginTop: 20,
    backgroundColor: '#630436',
    width: 150,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    alignItems: 'center',
  },
  takebtn: {
    marginTop: 20,
    backgroundColor: '#630436',
    width: 150,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#630436',
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
    marginBottom: 10,
  },
  dinebtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutbtn: {
    marginTop: 10,
    backgroundColor: '#630436',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  checkoutbtn1: {
    marginTop: 10,
    backgroundColor: '#630436',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: 300,
  },
  checkoutbtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelbtn: {
    marginTop: 10,
    backgroundColor: '#fdf2f3',
    borderWidth: 2,
    borderColor: '#630436',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelbtnText: {
    color: '#630436',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalPayment: {
    bottom: -300,
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
    zIndex:0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 3.525,
    shadowRadius: 9,
    elevation: 8,
  },

  modalView: {
    bottom: -20,
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
    zIndex:0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 3.525,
    shadowRadius: 9,
    elevation: 8,
  },

  tableContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#630436',
    marginTop: 10,
  },
  tableText: {
    fontSize: 18,
  },
  selectedTableText: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
    color: '#630436',
  },
});

export default Checkout;
