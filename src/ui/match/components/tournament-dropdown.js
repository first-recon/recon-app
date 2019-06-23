import React from 'react';
import { View, Text, Picker } from 'react-native';

export default function ({ style, tournament, onValueChange, children }) {
  return (
    <View style={{ ...style, flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ flex: 1, fontSize: 18 }}>{'Event'}</Text>
      <Picker style={{ flex: 5 }} selectedValue={tournament} onValueChange={onValueChange}>
        {children}
      </Picker>
    </View>
  );
}