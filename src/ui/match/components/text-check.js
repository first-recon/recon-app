import React from 'react';
import { TouchableHighlight, View, Text } from 'react-native';

const stateLabelStyleActive = {
    width: 50,
    height: 30,
    fontSize: 16,
    marginLeft: 10,
    backgroundColor: 'green',
    color: 'white',
    textAlign: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10
};

const stateLabelStyleInactive = Object.assign({}, stateLabelStyleActive, {  
    backgroundColor: 'red',
});

export default function TextCheck ({ value, label, labelOn, labelOff, onToggle }) {
    return (
        <TouchableHighlight style={{ marginBottom: 10 }} onPress={onToggle}>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 16, flex: 1 }}>{label}</Text>
                <Text style={value ? stateLabelStyleActive : stateLabelStyleInactive }>{value ? labelOn : labelOff}</Text>
            </View>
        </TouchableHighlight>
    );
}