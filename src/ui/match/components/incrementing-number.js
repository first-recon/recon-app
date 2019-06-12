import React from 'react'
import { View, Text, TouchableHighlight } from 'react-native'

import style from './components.style'

const HEIGHT = 60;

export default function IncrementingNumber ({ label, value, onIncrement, backgroundColor, textColor }) {
  const labelContainerStyle = {
    width: 30,
    height: HEIGHT,
    alignItems: 'center',
    justifyContent: 'center'
  };

  const labelStyle = {
    fontSize: 20,
    color: textColor || 'black'
  };

  function IncButton ({ style, label, clickHandler }) {
    const combinedStyle = {
      ...style,
      flex: 1,
      width: 50,
      height: HEIGHT,
      justifyContent: 'center',
      alignItems: 'center'
    };
  
    return (
      <TouchableHighlight style={combinedStyle} onPress={clickHandler}>
        <Text style={{ fontSize: 24, color: textColor }}>{label}</Text>
      </TouchableHighlight>
    );
  }

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      borderColor: backgroundColor || 'darkgrey',
      paddingLeft: 10,
      borderWidth: 1,
      backgroundColor
    }}>
      <Text style={{ flex: 1, fontSize: 20, color: textColor || '#4f4f4f' }}>{label}</Text>
      <View style={{ flexDirection: 'row', width: 120 }}>
        <IncButton style={{ borderRightWidth: 0 }} label="+" clickHandler={() => onIncrement(1)}/>
        <View style={labelContainerStyle}>
          <Text style={labelStyle}>{value}</Text>
        </View>
        <IncButton style={{ borderLeftWidth: 0 }} label="-" clickHandler={() => onIncrement(-1)}/>
      </View>
    </View>
  );
}
