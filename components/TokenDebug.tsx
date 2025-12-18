import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TokenDebug() {
  const [token, setToken] = useState<string | null>(null);

  const checkToken = async () => {
    const storedToken = await AsyncStorage.getItem("token");
    setToken(storedToken);
    console.log("Debug - Token:", storedToken);
  };

  useEffect(() => {
    checkToken();
  }, []);

  const clearToken = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    console.log("Token cleared");
  };

  return (
    <View style={{ padding: 10, backgroundColor: '#f0f0f0' }}>
      {/* <Text>Token Debug:</Text> */}
      {/* <Text>Token exists: {token ? 'YES' : 'NO'}</Text> */}
      {/* <Text>Token length: {token?.length || 0}</Text> */}
      {/* <TouchableOpacity onPress={checkToken} style={{ padding: 5, backgroundColor: 'lightblue' }}>
        <Text>Check Token</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={clearToken} style={{ padding: 5, backgroundColor: 'lightcoral' }}>
        <Text>Clear Token</Text>
      </TouchableOpacity> */}
    </View>
  );
}