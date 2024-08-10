import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, FlatList, TextInput, Button, TouchableOpacity } from 'react-native';
import { firebase } from '../config';

import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const db = firebase.firestore();

const Tables = ({ navigation }) => {
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState('');
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    const unsubscribe = db.collection('tables').onSnapshot((querySnapshot) => {
      const fetchedData = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() });
      });
      setTables(fetchedData);
    });
    return () => unsubscribe();
  }, []);

  const handleAddTable = () => {
    if (newTable.trim() !== '') {
      const newTableNumber = tables.length + 1; // Generate sequential number for the new table
      db.collection('tables').add({
        name: newTable,
        number: newTableNumber, // Assign the generated number to the table
        occupied: false,
      })
        .then(() => {
          console.log('Table added successfully!');
          setNewTable('');
        })
        .catch((error) => {
          console.error('Error adding table: ', error);
        });
    }
  };
  
  const handleDeleteTable = (id, number) => {
    db.collection('tables').doc(id).delete()
      .then(() => {
        console.log('Table deleted successfully!');
        // Update table numbers for the remaining tables
        const updatedTables = tables.filter(table => table.number !== number);
        updatedTables.forEach((table, index) => {
          db.collection('tables').doc(table.id).update({
            number: index + 1,
          })
          .then(() => {
            console.log(`Table ${table.id} updated successfully!`);
          })
          .catch((error) => {
            console.error(`Error updating table ${table.id}: `, error);
          });
        });
      })
      .catch((error) => {
        console.error('Error deleting table: ', error);
      });
  };
  

  const handleEditTable = (item) => {
    setEditItem(item);
    setNewTable(item.name);
  };

  const handleUpdateTable = () => {
    if (editItem && newTable.trim() !== '') {
      db.collection('tables').doc(editItem.id).update({
        name: newTable,
        occupied: editItem.occupied,
      })
        .then(() => {
          console.log('Table updated successfully!');
          setEditItem(null);
          setNewTable('');
        })
        .catch((error) => {
          console.error('Error updating table: ', error);
        });
    }
  };

  const toggleOccupied = (id, occupied) => {
    db.collection('tables').doc(id).update({
      occupied: !occupied,
    })
      .then(() => {
        console.log('Table status updated successfully!');
      })
      .catch((error) => {
        console.error('Error updating table status: ', error);
      });
  };

  return (
    <View style={styles.container}>
      <View style={{width: '100%', alignContent: 'center', alignItems: 'center', flexDirection: 'row', borderBottomColor: '#630436', borderBottomWidth: 2, height: 50, }}>
        <Text style={styles.subtitle1}>Table list: </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          style={{backgroundColor: "#630436", borderRadius: 5, width: 130, height: 33, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: '35%'}}
          > 
          <Ionicons name="chevron-back" size={18} color="white" />
          <Text style={{color: 'white', fontSize: 14, fontWeight: 'bold'}}>Back to Home</Text>
         
        </TouchableOpacity>

      
      </View>

      <FlatList
        data={tables.sort((a, b) => a.number - b.number)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <View style={styles.tableContainer}>
              <View style={{marginLeft: 6}}>
                <Text style={{ fontSize: 14, color:"#630436", fontWeight: 'bold'}}>Table {item.number}</Text>
              </View>

            <View style={styles.tableInfo}>
                <View style={{ width: 110, flexDirection: 'row' }}>
                  <Text>Size: </Text>
                  <Text style={styles.tableName}>{item.name} Seats</Text>
                </View>

                <View style={{ width: 170, flexDirection: 'row' }}>
                  <View style={[styles.statusDot, { backgroundColor: item.occupied ? 'green' : 'red' }]} />
                  <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{item.occupied ? 'Occupied' : 'Not Occupied'}</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              <TouchableOpacity 
               style={{marginLeft: 6}}
               onPress={() => handleEditTable(item)}>
                <AntDesign name="edit" size={18} color="#630436" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={{marginLeft: 10}}
                onPress={() => handleDeleteTable(item.id, item.number)}>
                <AntDesign name="delete" size={18} color="#630436" />
              </TouchableOpacity>

              <TouchableOpacity
               style={{right: -40, backgroundColor: '#630436', borderRadius: 5, width: 180, height: 30, justifyContent: 'center', alignItems: 'center'}}
               onPress={() => toggleOccupied(item.id, item.occupied)} 
              >
                <Text style={{color: 'white', fontSize: 14, fontWeight: 'bold'}}>{item.occupied ? "Mark as Not Occupied" : "Mark as Occupied"} </Text>
              </TouchableOpacity>
             
            </View>
    </View>
  )}
/>

      <View style={{marginTop: 10, borderTopColor: '#630436', borderTopWidth: 2}}>
        <Text style={{fontSize: 16, color: '#630436', fontWeight: 'bold', textAlign: 'center'}}>Create & Edit Table</Text>
        <TextInput
            style={styles.input}
            placeholder="Enter table seats"
            keyboardType="Numeric"
            value={newTable}
            onChangeText={setNewTable}
        />

        {editItem ? (
        <TouchableOpacity onPress={handleUpdateTable} style={[styles.button, { backgroundColor: "#630436" }]}>
            <Text style={styles.buttonText}>Update Table</Text>
        </TouchableOpacity>
        ) : (
        <TouchableOpacity onPress={handleAddTable} style={[styles.button, { backgroundColor: "#630436" }]}>
            <Text style={styles.buttonText}>Add Table</Text>
        </TouchableOpacity>
        )}
      </View>

    </View>
  );
};

export default Tables;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f3',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#630436',
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
    marginBottom: 10,
  },
  tableContainer: {
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
  tableInfo: {
    marginLeft: 6,
    marginTop: 3,
    flexDirection: 'row',
    
  },
  subtitle1: {
    fontSize: 18,
    fontWeight: '600',
    color: '#630436',
    
  
    
  },
  tableName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  occupiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
   
    marginLeft: 20,
  },
  statusDot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    marginRight: 5,
    marginTop: 2

  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#630436',
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
