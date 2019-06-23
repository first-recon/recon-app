import React from 'react';
import { View, Text, TouchableHighlight } from 'react-native';

/**
 * @param {string} label text to display on button
 * @param {string} color color to display on button
 * @param {func}   onPress function to call when value is changed
 */
export default function Toggle ({ style, label, color, textColor, fontSize, onPress, textAlign }) {
  return (
    <TouchableHighlight
    style={{
      ...style,
      backgroundColor: color,
      alignItems: 'center',
      justifyContent: 'center'
    }} onPress={onPress}>
      <Text style={{
        textAlign: textAlign || 'left',
        fontSize: fontSize || 20,
        color: textColor || 'white',
        paddingLeft: 5,
        paddingRight: 5
      }}>
        {label}
      </Text>
    </TouchableHighlight>
  );
}