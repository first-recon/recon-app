import React from "react";
import {
    Text,
    TouchableHighlight
} from "react-native";

export default function FRButton({ style = {}, title, onPress }) {
    return (
      <TouchableHighlight
        style={{
          backgroundColor: "#3399ff",
          padding: 5,
          justifyContent: 'center',
          ...style.container
        }}
        onPress={onPress}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 18,
            textAlign: 'center',
            ...style.text
          }}
        >
          {title}
        </Text>
      </TouchableHighlight>
    );
  }