/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, FlatList, PermissionsAndroid, StyleSheet, TouchableOpacity, Text, Button } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { useNavigation } from '@react-navigation/native';

const SmsReport = () => {
  const navigation = useNavigation();
  const [smsList, setSmsList] = useState([]);
  const [selectedSms, setSelectedSms] = useState([]);
  const [hasSmsPermission, setHasSmsPermission] = useState(false);
  const [reportedSms, setReportedSms] = useState([]);
  const [manualPhoneNumber, setManualPhoneNumber] = useState('');
  const [manualMessage, setManualMessage] = useState('');

  useEffect(() => {
    // Check permission status each time the tab is pressed
    const unsubscribe = navigation.addListener('focus', () => {
      requestSmsPermission();
    });

    return unsubscribe;
  }, [navigation]);

  const requestSmsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: "SMS Permission",
          message: "This app needs access to your SMS to report spam messages.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setHasSmsPermission(true);
        fetchSms();
      } else {
        setHasSmsPermission(false);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const fetchSms = () => {
    const filter = {
      box: 'inbox', // 'inbox' or 'sent' 
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail) => {
        console.log('Failed to fetch SMS', fail);
      },
      (count, smsList) => {
        setSmsList(JSON.parse(smsList).slice(0, 100));
      },
    );
  };

  const toggleSmsSelection = (sms) => {
    setSelectedSms(prevSelectedSms => {
      if (prevSelectedSms.some(selected => selected.date === sms.date)) {
        return prevSelectedSms.filter(selected => selected.date !== sms.date);
      } else {
        return [...prevSelectedSms, sms];
      }
    });
  };

  const submitReport = async () => {
    if (!hasSmsPermission) {
      submitManualSmsReport();
      return;
    }

    try {
      const device_id = await DeviceInfo.getUniqueId();
      const reportData = selectedSms.map(sms => ({
        phone_number: sms.address,
        message: sms.body,
        device_id,
      }));

      const response = await axios.post('http://localhost:3000/api/report-sms', reportData);
      console.log(response.data);
      Alert.alert('Success', 'Reported successfully');
      setReportedSms(prevReportedSms => [...prevReportedSms, ...selectedSms]);
      setSelectedSms([]);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to report');
    }
  };

  const submitManualSmsReport = async () => {
    try {
      const device_id = await DeviceInfo.getUniqueId();
      const reportData = [{
        phone_number: manualPhoneNumber,
        message: manualMessage,
        device_id,
      }];

      const response = await axios.post('http://localhost:3000/api/report-sms', reportData);
      console.log(response.data);
      Alert.alert('Success', 'Reported successfully');
      setReportedSms(prevReportedSms => [...prevReportedSms, { address: manualPhoneNumber, body: manualMessage }]);
      setManualPhoneNumber('');
      setManualMessage('');
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to report');
    }
  };

  return (
    <View style={styles.container}>
      {hasSmsPermission ? (
        <FlatList
          data={smsList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.item,
                selectedSms.some(selected => selected.date === item.date) ? styles.selectedItem : styles.unselectedItem,
                reportedSms.some(reported => reported.date === item.date) && styles.reportedItem
              ]}
              onPress={() => toggleSmsSelection(item)}
            >
              <Text style={selectedSms.some(selected => selected.date === item.date) ? styles.selectedText : styles.unselectedText}>
                {`${item.address} - ${item.date} (${item.body})`}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View>
          <TextInput
            placeholder="Enter phone number"
            placeholderTextColor="#555555"
            value={manualPhoneNumber}
            onChangeText={text => setManualPhoneNumber(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Enter message"
            placeholderTextColor="#555555"
            value={manualMessage}
            onChangeText={text => setManualMessage(text)}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={submitManualSmsReport}
            disabled={!manualPhoneNumber || !manualMessage}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
      {hasSmsPermission && (
        <Button
          title="Submit"
          onPress={submitReport}
          disabled={selectedSms.length === 0}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    color: '#000000',
  },
  item: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#000',
  },
  selectedItem: {
    backgroundColor: '#0000ff',
  },
  unselectedItem: {
    backgroundColor: '#ffffff',
  },
  reportedItem: {
    backgroundColor: '#FFCCCB',
  },
  selectedText: {
    color: '#ffffff',
  },
  unselectedText: {
    color: '#0000ff',
  },
  button: {
    margin: 10,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#0000ff',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default SmsReport;
