import React from 'react';
import { TextInput } from 'react-native';

export default function ({ style, textValue, onChangeText }) {
  return (
    <TextInput
      style={{ ...style, height: 40 }}
      multiline={false}
      placeholder={'Comments...'}
      onChangeText={onChangeText}
      value={textValue}
    />
  );
}