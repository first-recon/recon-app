import React from 'react';
import { View, Text, TextInput } from 'react-native';

export default function ({ number, onChangeText }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <TextInput
        keyboardType={'numeric'}
        value={`${number || ''}`}
        style={{ flex: 3,  }} placeholder="Match #"
        onChangeText={onChangeText}
      />
    </View>
  );
}