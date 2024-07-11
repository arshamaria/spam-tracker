/* eslint-disable prettier/prettier */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import CallReport from './CallReport';
import SmsReport from './Smsreport';
import ReportHistory from './ReportHistory';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Report Call"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Report Call') {
              iconName = 'phone';
            } else if (route.name === 'Report SMS') {
              iconName = 'envelope';
            } else if (route.name === 'Report History') {
              iconName = 'history';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Report Call" component={CallReport} />
        <Tab.Screen name="Report SMS" component={SmsReport} />
        <Tab.Screen name="Report History" component={ReportHistory} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
