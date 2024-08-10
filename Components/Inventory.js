import React, { useState, useEffect } from "react";
import {Text, View, StyleSheet,FlatList ,TextInput,Button,Image, SafeAreaView, TouchableOpacity, Modal, TouchableHighlight } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import {firebase} from '../config';

import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';




const db = firebase.firestore();
const storage = firebase.storage();



const Inventory = ({navigation}) => {


  // Filtering modal
  const [modalFilter, setModalFilter] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState(null);

  // State to hold the fetched data from Firestore
  const [ItemName, setItemName] = useState([]);
  // State to hold the value of the input field for adding new data
  const [newItemName, setNewItemName] = useState('');
  // State to hold the id and value of the item being edited
  const [editItem, setEditItem] = useState({ id: null, newItemName: '', newItemQuantity: '', newItemPrice: '', newItemCategory: '' });

  const [ItemQuantity, setItemQuantity] = useState([]);
  // State to hold the value of the input field for adding new data
  const [newItemQuantity, setNewItemQuantity] = useState('');
  // State to hold the id and value of the item being edited

  // State to hold the fetched data from Firestore
  const [ItemPrice, setItemPrice] = useState([]);
  // State to hold the value of the input field for adding new data
  const [newItemPrice, setNewItemPrice] = useState('');

  // State to hold the fetched data from Firestore
  const [ItemCategory, setItemCategory] = useState([]);
  // State to hold the value of the input field for adding new data
  const [newItemCategory, setNewItemCategory] = useState('');


  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]); // State to hold unique categories
  

  // Image Picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageName(result.assets[0].uri.split('/').pop());
    }
  };


//READING
  // Effect hook to fetch data from Firestore on component mount
  useEffect(() => {
    // Function to unsubscribe from Firestore listener when component unmounts
    const unsubscribe = db.collection('Inventory').onSnapshot((querySnapshot) => {
      // Array to hold the fetched data
      const fetchedData = [];
      // Loop through the documents in the query snapshot

      const fetchedCategories = new Set();
      querySnapshot.forEach((doc) => {
        // Push each document's data along with its ID to the fetchedData array by its category
        const data = { id: doc.id, ...doc.data() };
        fetchedData.push(data);

        fetchedCategories.add(data.newItemCategory); // Add category to the set
      });
      // Update the data state with the fetched data
      setItemName(fetchedData);
      setItemQuantity(fetchedData);
      setItemPrice(fetchedData);
      setItemCategory(fetchedData);

      setCategories(Array.from(fetchedCategories)); // Convert set to array 
  
    });

    

    // Clean-up function to unsubscribe from Firestore listener when component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array to run effect only once on component mount


//CREATE
  // Function to add new data to Firestore
  const handleAddData = async () => {

    let imageUrl = '';
    if (image) {
      const response = await fetch(image);
      const blob = await response.blob();
      const ref = storage.ref().child(`images/${imageName}`);
      await ref.put(blob);
      imageUrl = await ref.getDownloadURL();
    }
    // Add the newData value entered by the user to the Firestore collection
    db.collection('Inventory').add({
      newItemName, 
      newItemQuantity: Number(newItemQuantity),
      newItemPrice: Number(newItemPrice).toFixed(2),
      newItemCategory,
      imageUrl,
      
    })
    .then(() => {
      // Log success message to the console and clear the input field
      console.log('Data added successfully!');
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemPrice('');
      setImage(null);
    })
    .catch((error) => {
      // Log error message to the console if there's an error adding data
      console.error('Error adding data: ', error);
    });
  };

//DELETE
  // Function to delete data from Firestore
const handleDeleteData = (id) => {
  // Delete the document from Firestore based on its ID
  db.collection('Inventory').doc(id).delete()
    .then(() => {
      // Log success message to the console
      console.log('Data deleted successfully!');
    })
    .catch((error) => {
      // Log error message to the console if there's an error deleting data
      console.error('Error deleting data: ', error);
    });
};


//UPDATE
  // Function to handle edit initiation
  const handleEditInitiate = (item) => {
    setEditItem({ id: item.id, newItemName: item.newItemName, newItemCategory: item.newItemCategory, newItemQuantity: Number(item.newItemQuantity),newItemPrice: Number(item.newItemPrice).toFixed(2), imageUrl: item.imageUrl });
  };

  // Function to handle data update
  const handleUpdateData = async () => {

    let imageUrl = editItem.imageUrl;
    if (image) {
      const response = await fetch(image);
      const blob = await response.blob();
      const ref = storage.ref().child(`images/${imageName}`);
      await ref.put(blob);
      imageUrl = await ref.getDownloadURL();
    }

    if (editItem.id) {
      // Update the document in Firestore based on its ID
      db.collection('Inventory').doc(editItem.id).update({
        newItemName: editItem.newItemName,
        newItemQuantity: Number(editItem.newItemQuantity),
        newItemPrice: Number(editItem.newItemPrice).toFixed(2),
        newItemCategory: editItem.newItemCategory,
        imageUrl,
      })
      .then(() => {
        // Log success message to the console and clear the edit state
        console.log('Data updated successfully!');
          setEditItem({ id: null, newItemName: '', newItemQuantity: '', newItemPrice: '', imageUrl: '' , newItemCategory: '', });
      })
      .catch((error) => {
        // Log error message to the console if there's an error updating data
        console.error('Error updating data: ', error);
      });
    }
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

const filteredItems = selectedCategory ? ItemName.filter(item => item.newItemCategory === selectedCategory) : ItemName;


  return (
      <View style={styles.container}>
      <View style={{width: '204%', height: 60, backgroundColor: '#630436', margin: -20, marginTop: -20, justifyContent: 'center'}}>
      <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: '3%', marginTop: '4%'}}>Inventory</Text>
      </View>
      <View style={{width: '100%', height: 40, marginTop: 20, flexDirection: 'row' , justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#630436', borderBottomWidth: 2}}>  
        <Text style={styles.subtitle1}>Stock List:</Text>
        
        <TouchableOpacity 
         style={{flexDirection: 'row',backgroundColor: '#630436',  height: 30, width: 130, justifyContent: 'center', alignItems: 'center', borderRadius: 5}}
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
      <View style={{ height: '80%'}}>
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
                  <Text style={styles.listItemText1}>Category: </Text>
                  <Text style={styles.listItemText}>{item.newItemCategory}</Text>
                </View>
                <View style={styles.listCon}>
                  <Text style={styles.listItemText1}>Name: </Text>
                  <Text style={styles.listItemText}>{item.newItemName}</Text>
                </View>
                <View style={styles.listCon}>
                  <Text style={styles.listItemText1}>Quantity: </Text>
                  <Text style={styles.listItemText}>{item.newItemQuantity}</Text>
                </View>
                <View style={styles.listCon}>
                  <Text style={styles.listItemText1}>Price: </Text>
                  <Text style={styles.listItemText}> P{item.newItemPrice}</Text>
                </View>
                </View>
              </View>

           <View style={styles.buttonsContainer}>
             
              <TouchableOpacity style={{ backgroundColor: 'white', padding: 10, height: 50, width: 50, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}
               onPress={() => handleEditInitiate(item)}>
                <AntDesign name="edit" size={22} color="#630436" />
              </TouchableOpacity>
              <TouchableOpacity style={{backgroundColor: '#white', padding: 10, height: 50, width: 50, borderRadius: 5, alignItems: 'center', justifyContent: 'center', }}
               onPress={() => handleDeleteData(item.id)}>
                <AntDesign name="delete" size={22} color="#630436" />
              </TouchableOpacity>
            </View>

          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      </View>

    

    
      
      {editItem.id && (
        <View style={styles.editSection}>
          <Text style={styles.subtitle}>Edit Item:</Text>
          <TextInput
            style={styles.input}
            value={editItem.newItemCategory}
            onChangeText={(text) => setEditItem({ ...editItem, newItemCategory: text })}
            placeholder="Edit Item Category"
            placeholderTextColor="#888"
            
          />
          <TextInput
            style={styles.input}
            value={editItem.newItemName}
            onChangeText={(text) => setEditItem({ ...editItem, newItemName: text })}
            placeholder="Edit Item Name"
            placeholderTextColor="#888"
            
          />
          <TextInput
            style={styles.input}
            value={editItem.newItemQuantity}
            onChangeText={(text) => setEditItem({ ...editItem, newItemQuantity: text })}
            placeholder="Edit Quatity"
            placeholderTextColor="#888"
            keyboardType="Numeric"
          />
           <TextInput
            style={styles.input}
            value={editItem.newItemPrice}
            onChangeText={(text) => setEditItem({ ...editItem, newItemPrice: text })}
            placeholder="Edit Price"
            placeholderTextColor="#888"
            keyboardType="Numeric"
          />

          {editItem.imageUrl && <Image source={{ uri: editItem.imageUrl }} style={styles.image} />}
          <TouchableOpacity style={{ backgroundColor: '#630436',  height: 30, width: 70, borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}
            onPress={pickImage}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Change</Text>
          </TouchableOpacity>

          

          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
            style={styles.Ecancel}
            title="Cancel" 
              onPress={() => setEditItem({ id: null, newItemName: '', newItemQuantity: '', newItemPrice: '', imageUrl: '', newItemCategory: '',  })}
            >
              <Text style={{fontWeight: 'bold', color: '#630436' }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.update}
              title="Update" 
              onPress={handleUpdateData}
              >
                <Text style={{fontWeight: 'bold', color: 'white'}}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      
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
            <View style={{alignSelf: 'center', width: 90, marginLeft: 126,}}>
              <Text style={{fontWeight: 'bold', fontSize: 16, color: '#630436'}}>Create Item</Text>
              </View>
               <TouchableOpacity
                onPress={() => setModalVisible(!modalVisible)}
                style={{right: -80, top: 4}}
                >
               <Ionicons name="close-sharp" size={30} color="#630436" />
              </TouchableOpacity>
            </View>

              <View style={{marginTop: 20}}>
              <Text style={{color: '#919191'}}>Set Item Image</Text>
              
              <View style={{flexDirection: 'row', width: 300, height: 70, marginBottom: 6}}>
                <TouchableOpacity
                  style={{borderColor: '#630436' , borderWidth: 2.5, width: 70, height: 70, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}
                  onPress={pickImage}
                    >
                    <Text style={{color: '#630436', fontWeight: 'bold', fontSize: 40 }}>+</Text>
                </TouchableOpacity>
                <View style={{marginLeft: 5}}>
                  {image && <Image source={{ uri: image }} style={styles.image} />}
                </View>
              </View>
               
              <Text style={{color: '#919191'}}>Set Item Category:</Text>
                 <TextInput
                  style={styles.input}
                  value={newItemCategory}
                  onChangeText={setNewItemCategory}
                  placeholder="Enter Item Category"
                  placeholderTextColor="#888"
                />

              <Text style={{color: '#919191'}}>Set Item Name</Text>
                
                <TextInput
                  style={styles.input}
                  value={newItemName}
                  onChangeText={setNewItemName}
                  placeholder="Enter Item Name"
                  placeholderTextColor="#888"
                />

               <Text style={{color: '#919191'}}>Set Quantity:</Text>
                 <TextInput
                  style={styles.input}
                  value={newItemQuantity}
                  onChangeText={setNewItemQuantity}
                  placeholder="Enter Quantity"
                  keyboardType="Numeric"
                  placeholderTextColor="#888"
                />

                <Text style={{color: '#919191'}}>Set Price:</Text>
                 <TextInput
                  style={styles.input}
                  value={newItemPrice}
                  onChangeText={setNewItemPrice}
                  placeholder="Enter Price"
                  keyboardType="Numeric"
                  placeholderTextColor="#888"
                />
                <View style={{width: '100%', flexDirection: 'row', marginTop: 10}}> 
                  <TouchableOpacity 
                     style={styles.cancel}
                     onPress={() => setModalVisible(!modalVisible)}
                    >
                     <Text style={{color:  '#630436', fontWeight: 'bold'}}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                      title="Add"
                      style={styles.createbtn} 
                      onPress={() => {
                          handleAddData();
                          setModalVisible(!modalVisible);
                        }}
                  >
                   <Text style={{color: 'white', fontWeight: 'bold'}}>Create</Text>
                  </TouchableOpacity>
                  
                 
                </View>
                 
              </View>
            </View>
        
        </Modal>
        

      
     <TouchableOpacity style={styles.openbtn}  onPress={() => setModalVisible(true)}>
        <View style={{flexDirection: 'row'}}>
          <Text style={{color: 'white', fontWeight: 'bold', fontSize: 17}}>Create Item</Text>
          <AntDesign name="plussquare" size={20} color="white" style={{marginLeft: 5}}/>
        </View>
     </TouchableOpacity>
    </View>
  );
  
  
  };

 

export default Inventory;


const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#fdf2f3',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 5
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#630436',
    marginBottom: 10,
    
  },
  subtitle1: {
    fontSize: 18,
    fontWeight: '600',
    color: '#630436',
  
    
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#630436',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
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
  listItemText1: {
    fontSize: 16,
    color: '#333',
  },
   listItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  listCon: {
    flexDirection: 'row',
    marginTop: 3,
    justifyContent: 'space-between'
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 5,
    marginLeft: '62%'
   
  },

  editSection: {
    marginTop: -350,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    borderColor: '#630436',
    borderWidth: 2,
  },

    modalView: {
   
    bottom: -245,
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
    height: 40,
    width: 300,
    borderRadius: 5, 
    alignSelf:'center',
    alignItems: 'center', 
    justifyContent:'center',
    bottom: -10,
   
 },
 createbtn: {
   backgroundColor: '#630436',
    padding: 10,
    height: 40,
    width: 150,
    borderRadius: 5, 
    alignSelf:'center',
    alignItems: 'center', 
     marginLeft: 5,

 

 },
 cancel:{
    borderColor: '#630436',
    borderWidth: 2.5,
    padding: 10,
    height: 40,
    width: 150,
    borderRadius: 5, 
    alignSelf:'center',
    alignItems: 'center', 
 },

 update:{
   backgroundColor: '#630436',
    padding: 10,
    height: 40,
    width: '50%',
    borderRadius: 5, 
    alignSelf:'center',
    alignItems: 'center', 
     marginLeft: 5,
 },

 Ecancel:{
   borderColor: '#630436',
    borderWidth: 2.5,
    padding: 10,
    height: 40,
    width: '50%',
    borderRadius: 5, 
    alignSelf:'center',
    alignItems: 'center', 
   
 },
 image: {
    width: 70,
    height: 70,
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

})