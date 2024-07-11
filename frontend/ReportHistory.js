/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { useFocusEffect } from '@react-navigation/native';

const ReportHistory = () => {
  const [reportHistory, setReportHistory] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchReportHistory();
    }, [])
  );

  const fetchReportHistory = async () => {
    try {
      const device_id = await DeviceInfo.getUniqueId();
      const response = await axios.get(`http://localhost:3000/api/report-history/${device_id}`);
      setReportHistory(response.data);
    } catch (error) {
      console.error('Error fetching report history:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reportHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>{`Type: ${item.type}`}</Text>
            <Text style={styles.text}>{`Phone Number: ${item.phone_number}`}</Text>
            {item.type === 'SMS' && <Text style={styles.text}>{`Message: ${item.message}`}</Text>}
            {item.type === 'Call' && item.call_info && <Text style={styles.text}>{`Call Info: ${item.call_info}`}</Text>}
            {item.type === 'Call' && item.call_duration !== null && <Text style={styles.text}>{`Call Duration: ${item.call_duration}s`}</Text>}
            <Text style={styles.text}>{`Report Time: ${new Date(item.report_time).toLocaleString()}`}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  item: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    marginVertical: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333', // Darker color for text
  },
});

export default ReportHistory;
