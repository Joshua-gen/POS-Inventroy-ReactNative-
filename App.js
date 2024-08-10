import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './Components/Home';
import Orders from './Components/Orders'; 
import Inventory from './Components/Inventory';
import Tables from './Components/Tables';
import Checkoutscreen from './Components/Checkoutscreen';

import Unfinish from './Components/Unfinish';
import Finish from './Components/Finish';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

import {firebase} from './config';

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator(); // Define Stack Navigator

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Feed"
      activeColor="white"
      labelStyle={{ fontSize: 12 }}
      barStyle={{ backgroundColor: '#630436', height: 70 }}
    >
      <Tab.Screen
        name="Feed"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={27} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Order"
        component={Orders}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color }) => (
            <Ionicons name="cart" size={27} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={Inventory}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="inventory" size={27} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" headerMode="none">
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen name="Tables" component={Tables} />
        <Stack.Screen name="Checkoutscreen" component={Checkoutscreen} />
        <Stack.Screen name="Unfinish" component={Unfinish} />
        <Stack.Screen name="Finish" component={Finish} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
