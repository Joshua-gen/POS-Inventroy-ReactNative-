import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, FlatList, Image , TouchableOpacity, Modal} from 'react-native';
import { firebase } from '../config';
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Alert } from 'react-native';



const db = firebase.firestore();
const storage = firebase.storage();

const Orders = ({ navigation }) => {

    // Filtering modal
  const [modalFilter, setModalFilter] = useState(false);
  // Cart modal 
  const [modalVisible, setModalVisible] = useState(false);
  

  // State to hold the fetched data from Firestore
  const [items, setItems] = useState([]);
  const [cartItems, setCartItems] = useState({});

  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]); // State to hold unique categories
  

  // Effect hook to fetch data from Firestore on component mount
  useEffect(() => {
    // Function to unsubscribe from Firestore listener when component unmounts
    const unsubscribe = db.collection('Inventory').onSnapshot((querySnapshot) => {
      // Array to hold the fetched data
      const fetchedData = [];
      const fetchedCategories = new Set();
      querySnapshot.forEach((doc) => {
        // Push each document's data along with its ID to the fetchedData array by its category

        const data = { id: doc.id, ...doc.data() };
        fetchedData.push(data);
        fetchedCategories.add(data.newItemCategory); // Add category to the set
      });
      // Update the data state with the fetched data
      setItems(fetchedData);
      setCategories(Array.from(fetchedCategories)); // Convert set to array
    });

    // Clean-up function to unsubscribe from Firestore listener when component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array to run effect only once on component mount



  const addToCart = (item) => {
    if (item.newItemQuantity === 0) {
      Alert.alert('Out of Stock', `${item.newItemName} is currently out of stock and cannot be added to the cart.`);
      return;
    } else if (item.newItemQuantity <= 4) {
      Alert.alert('Low Stock', `${item.newItemName} is low on stock. Only ${item.newItemQuantity} left.`);
    }
  
    setCartItems(prevCartItems => {
      const newCartItems = { ...prevCartItems };
      if (newCartItems[item.id]) {
        newCartItems[item.id].quantity += 1;
      } else {
        newCartItems[item.id] = { ...item, quantity: 1 };
      }
      return newCartItems;
    });
  };

  const adjustQuantity = (itemId, delta) => {
    setCartItems(prevCartItems => {
        const newCartItems = { ...prevCartItems };
        const item = newCartItems[itemId];
        if (item) {
            if (delta > 0 && item.quantity >= item.newItemQuantity) {
                // Prevent increasing quantity beyond the available stock
                Alert.alert('Cannot Increase Quantity', `Only ${item.newItemQuantity} of ${item.newItemName} available in stock.`);
                return newCartItems;
            }
            item.quantity += delta;
            if (item.quantity <= 0) {
                delete newCartItems[itemId];
            }
        }
        return newCartItems;
    });
};


  const removeItem = (itemId) => {
    setCartItems(prevCartItems => {
      const newCartItems = { ...prevCartItems };
      delete newCartItems[itemId];
      return newCartItems;
    });
  };

  const calculateTotal = () => {
    return Object.values(cartItems).reduce((total, item) => total + item.newItemPrice * item.quantity, 0);
  };

  // Function to filter items based on the selected category
  const handleFilterCategory = (category) => {
    setSelectedCategory(category);
    setModalFilter(false);
  };

  const handleResetFilter = () => {
    setSelectedCategory('');
    setModalFilter(false);
  };

  const handleCombinedPress = () => {
    setModalVisible(!modalVisible);
    navigation.navigate('Checkoutscreen', { cartItems: Object.values(cartItems), clearCart }); // Pass array of items and clearCart function
  };
  
  
  // Function to clear the cart
  const clearCart = () => {
    setCartItems({});
  };

  // Filtered items based on selected category
  const filteredItems = selectedCategory ? items.filter(item => item.newItemCategory === selectedCategory) : items;



  return (
    <View style={styles.container}>
      <View style={{width: '204%', height: 60, backgroundColor: '#630436', margin: -20, marginTop: -20, justifyContent: 'center'}}>
      <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: '3%', marginTop: '4%'}}>Orders</Text>
        
        </View>
      <View style={{width: '100%', height: 40, marginTop: 20, flexDirection: 'row' , justifyContent: 'space-between',alignItems: 'center', borderBottomColor: '#630436', borderBottomWidth: 2}}>  
        <Text style={styles.subtitle1}>Menu:</Text>
        <TouchableOpacity 
        style={{flexDirection: 'row', backgroundColor: '#630436',  height: 30, width: 130, justifyContent: 'center', alignItems: 'center', borderRadius: 5}}
        onPress={() => setModalFilter(true)}
        >
          <Text style={{color: 'white', fontWeight: 'bold'}}>Filter Category </Text>
          <Ionicons name="filter" size={18} color="white" />
        </TouchableOpacity>

        <Modal
        animationType="toggle"
        transparent={true}
        visible={modalFilter}
        >
      
          <View style={styles.modalFilter}>
          <View style={{flexDirection: 'row', width: 300, height: 40, borderBottomWidth: 1,  // Set the width of the bottom border
    borderBottomColor: '#630436', marginTop: -30}}>     
            <View style={{alignSelf: 'center', width: 120, marginLeft: 100,}}>
              <Text style={{fontWeight: 'bold', fontSize: 16, color: '#630436'}}>Filter Category</Text>
              </View>
               <TouchableOpacity
                onPress={() => setModalFilter(!modalFilter)}
                style={{right: -55, top: 4}}
                >
               <Ionicons name="close-sharp" size={30} color="#630436" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={handleResetFilter}
              style={{marginTop: 10, padding: 10, backgroundColor: '#fdf2f3', borderRadius: 5, borderColor: '#630436', borderWidth: 2 }}
            >
              <Text style={{ fontWeight: 'bold' ,color: 'black'}}>Show All</Text>
            </TouchableOpacity>
           
            {categories.map((category) => (
              <TouchableOpacity 
              key={category} 
              onPress={() => handleFilterCategory(category)}
              style={{marginTop: 10, padding: 10, backgroundColor: selectedCategory === category ? '#630436' : '#fdf2f3', borderRadius: 5, borderColor: '#630436', borderWidth: 2 }}
              >
                <Text style={{ fontWeight: 'bold' ,color: selectedCategory === category ? 'white' : 'black'}}>{category}</Text>
              </TouchableOpacity>
            ))}
            
            
          
          </View>
       
      </Modal>
      

      </View>
      <View style={{ height: '80%', }}>
        <FlatList
          data={filteredItems}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View style={{ flexDirection: 'row', width: '100%' }}>
                <View style={{width: 80, }}>
                  {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={{width: 100, height: 100}} />}
                </View>
                <View style={{flexDirection: 'column', marginLeft: "10%", width: "60%"}}>
                <View style={styles.listCon}>
                  <Text style={styles.listItemText}>{item.newItemName}</Text>
                  
                </View>
                <View style={styles.listCon}>
                  <Text style={styles.listItemText1}>Left:</Text>
                  <Text style={styles.listItemText}> {item.newItemQuantity}</Text>
                </View>
                <View style={styles.listCon}> 
                  <Text style={{fontSize: 30, fontWeight: 'bold'}}>P{item.newItemPrice}</Text>
                </View>
                  <TouchableOpacity 
                    style={{ flexDirection: 'row', marginLeft: 60, marginTop: 13, backgroundColor: '#630436', height: 37, width: 130, borderRadius: 5, alignSelf:'center', alignItems: 'center', justifyContent: 'center'}}
                    onPress={() => addToCart(item)}
                  >
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Add to cart </Text>
                    <FontAwesome5 name="cart-plus" size={18} color="white" />
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>
         
            <View style={styles.modalView}>
            <View style={{flexDirection: 'row', width: 332, height: 40, borderBottomWidth: 1,  // Set the width of the bottom border
    borderBottomColor: '#630436',}}>     
            <View style={{alignSelf: 'center', width: 90, marginLeft: 145,flexDirection: 'row'}}>
              <Text style={{fontWeight: 'bold', fontSize: 16, color: '#630436'}}>Cart </Text>
              <Entypo name="shopping-cart" size={24} color="#630436" />
              </View>
               <TouchableOpacity
                onPress={() => setModalVisible(!modalVisible)}
                style={{right: -70, top: 4}}
                >
               <Ionicons name="close-sharp" size={30} color="#630436" />
              </TouchableOpacity>
            </View>


                <FlatList
                data={Object.values(cartItems)}
                renderItem={({ item }) => (
                  <View style={{width: 340, borderRadius: 5, marginTop: 5, flexDirection: 'row', height: 80, backgroundColor: '#fdf2f3', borderBlockColor: '#630436', borderWidth: 2}}>
                    <View style={{width: 80, }}>
                      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={{width: 70, height: 76, borderRadius: 3}} />}
                    </View>
                    <View style={{flexDirection:'column', width: 120}}>
                      <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 5}}>{item.newItemName}</Text>
                      <Text style={{fontSize: 20, marginTop: 5, fontWeight: 'bold'}}>P{item.newItemPrice}</Text>
                    </View>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity onPress={() => adjustQuantity(item.id, -1)}>
                        <AntDesign name="minuscircleo" size={22} color="#630436" />
                      </TouchableOpacity>

                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => adjustQuantity(item.id, 1)}>
                        <AntDesign name="pluscircleo" size={22} color="#630436" />
                      </TouchableOpacity>
                      
                    </View>
                    <View style={{ alignItems: 'center', justifyContent: 'center', alignContent: 'center', width: 55}}>
                     <TouchableOpacity style={{marginLeft: 15}} onPress={() => removeItem(item.id)}>
                        <Fontisto name="shopping-basket-remove" size={22} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                keyExtractor={(item) => item.id}
              />

              
                <View style={{marginBottom: '5%', width: '100%', flexDirection: 'row', height: 70, justifyContent: 'center', alignItems: 'center'}}>
                  <View style={{width: 180, height: 60, borderRadius: 5, borderColor: '#630436', borderWidth: 3  }}>
                    <View style={{flexDirection: 'column', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={{fontSize: 14, marginTop: -3, marginBottom: 7, marginLeft: -127}}>Total: </Text>
                      <Text style={{fontSize: 30, fontWeight: 'bold', marginTop: -15}}>P {calculateTotal().toFixed(2)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.openbtn} onPress={handleCombinedPress}>
                        <Text style={{color: 'white', fontWeight: 'bold', fontSize: 17}}>Check out</Text> 
                  </TouchableOpacity>
                </View>

              </View> 
              
        </Modal>
     
       

      <View style={{width: '100%', flexDirection: 'row', height: 70,justifyContent: 'center', alignItems: 'center', borderTopWidth: 2, borderTopColor: '#630436'}}>
        <View style={{width: 180, backgroundColor: '#fdf2f3', height: 60, borderRadius: 5, borderColor: '#630436', borderWidth: 3  }}>
          <View style={{flexDirection: 'column', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 14, marginTop: -3, marginBottom: 7, marginLeft: -127}}>Total: </Text>
            <Text style={{fontSize: 30, fontWeight: 'bold', marginTop: -15}}>P {calculateTotal().toFixed(2)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.openbtn}  onPress={() => setModalVisible(true)}>
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 17}}>View Cart </Text> 
              <Entypo name="shopping-cart" size={24} color="white" />

              {Object.keys(cartItems).length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{Object.keys(cartItems).length}</Text>
                </View>
              )}
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f3',
    padding: 20,
  },
  listItem: {
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
  listCon: {
    flexDirection: 'row',
    marginTop: 3,
  },
  listItemText1: {
    fontSize: 16,
    color: '#333',
  },
  listItemText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 5,
    marginBottom: 10,
  },
  subtitle1: {
    fontSize: 18,
    fontWeight: '600',
    color: '#630436',
    
    
  },

  modalView: {
   
    bottom: '0%',
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
   openbtn:{ 
    backgroundColor: '#630436',
    padding: 10,
    height: 60,
    width: 160,
    borderRadius: 5, 
    alignSelf:'center',
    alignItems: 'center', 
    justifyContent:'center',
    marginLeft: 5,
    flexDirection: 'row'
   
 },

quantityControl: {
  flexDirection: 'row',
  alignItems: 'center',
  width: 80,
},
quantityText: {
  marginHorizontal: 10,
  fontSize: 18,
  fontWeight: 'bold',
},

modalFilter: {
  margin: 20,
  backgroundColor: 'white',
  borderRadius: 20,
  padding: 35,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
},
cartBadge: {
  backgroundColor: 'red',
  borderRadius: 10,
  padding: 5,
  position: 'absolute',
  top: -10,
  right: -10
},
cartBadgeText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 12
},

dinebtn:{ 
  backgroundColor: '#630436',
  padding: 10,
  height: 60,
  width: 160,
  borderRadius: 5, 
  alignSelf:'center',
  alignItems: 'center', 
  justifyContent:'center',
  marginLeft: 5,
  flexDirection: 'row',
  marginTop: 10
 
},

modalCheckout: {
  marginTop: "135%",
  bottom: '0%',
  height: '100%',
  width: '100%',
  backgroundColor: '#fdf2f3',
  zIndex:0,
  alignItems: 'center',
  shadowColor: '#000',
  borderTopWidth: 2, 
  borderTopColor:  '#630436',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 3.525,
  shadowRadius: 9,
  elevation: 8,
},

});
