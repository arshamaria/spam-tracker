/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, Alert, FlatList, PermissionsAndroid, StyleSheet, TouchableOpacity, Text, Button } from 'react-native';
import CallLogs from 'react-native-call-log';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { useFocusEffect } from '@react-navigation/native';

const CallReport = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [hasCallPermission, setHasCallPermission] = useState(false);
  const [callInfo, setCallInfo] = useState('');
  const [reportedCalls, setReportedCalls] = useState([]);
  const [manualPhoneNumber, setManualPhoneNumber] = useState('');
  const [manualCallInfo, setManualCallInfo] = useState('');

  const requestCallPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        {
          title: "Call Log Permission",
          message: "This app needs access to your call logs to report spam calls.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setHasCallPermission(true);
        fetchCallLogs();
      } else {
        setHasCallPermission(false);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const fetchCallLogs = async () => {
    try {
      const logs = await CallLogs.loadAll();
      setCallLogs(logs.slice(0, 100));
    } catch (error) {
      console.log('Failed to fetch call logs', error);
    }
  };

  const toggleCallSelection = (call) => {
    setSelectedCalls(prevSelectedCalls => {
      if (prevSelectedCalls.some(selected => selected.timestamp === call.timestamp)) {
        return prevSelectedCalls.filter(selected => selected.timestamp !== call.timestamp);
      } else {
        return [...prevSelectedCalls, call];
      }
    });
  };

  const submitReport = async () => {
    if (!hasCallPermission) {
      submitManualCallReport();
      return;
    }

    try {
      const device_id = await DeviceInfo.getUniqueId();
      const reportData = selectedCalls.map(call => ({
        phone_number: call.phoneNumber,
        call_duration: call.duration,
        device_id,
        ...(callInfo && { call_info: callInfo }),
      }));

      const response = await axios.post('http://localhost:3000/api/report-call', reportData);
      console.log(response.data);
      Alert.alert('Success', 'Reported successfully');
      setReportedCalls(prevReportedCalls => [...prevReportedCalls, ...selectedCalls]);
      setSelectedCalls([]);
      setCallInfo('');
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to report');
    }
  };

  const submitManualCallReport = async () => {
    try {
      const device_id = await DeviceInfo.getUniqueId();
      const reportData = [{
        phone_number: manualPhoneNumber,
        device_id,
        ...(manualCallInfo && { call_info: manualCallInfo }), // Include call_info only if provided
      }];

      const response = await axios.post('http://localhost:3000/api/report-call', reportData);
      console.log(response.data);
      Alert.alert('Success', 'Reported successfully');
      setReportedCalls(prevReportedCalls => [...prevReportedCalls, { phoneNumber: manualPhoneNumber, call_info: manualCallInfo }]);
      setManualPhoneNumber('');
      setManualCallInfo('');
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to report');
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!hasCallPermission) {
        requestCallPermission();
      }
    }, [hasCallPermission])
  );

  return (
    <View style={styles.container}>
      {hasCallPermission ? (
        <FlatList
          data={callLogs}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.item,
                selectedCalls.some(selectedCall => selectedCall.timestamp === item.timestamp) ? styles.selectedItem : styles.unselectedItem,
                reportedCalls.some(reportedCall => reportedCall.timestamp === item.timestamp) && styles.reportedItem
              ]}
              onPress={() => toggleCallSelection(item)}
            >
              <Text style={selectedCalls.some(selectedCall => selectedCall.timestamp === item.timestamp) ? styles.selectedText : styles.unselectedText}>
                {`${item.phoneNumber} - ${item.dateTime} (${item.duration}s)`}
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
            placeholder="Enter call information (optional)"
            placeholderTextColor="#555555"
            value={manualCallInfo}
            onChangeText={text => setManualCallInfo(text)}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={submitManualCallReport}
            disabled={!manualPhoneNumber}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
      {hasCallPermission && (
        <Button
          title="Submit"
          onPress={submitReport}
          disabled={selectedCalls.length === 0}
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

export default CallReport;
