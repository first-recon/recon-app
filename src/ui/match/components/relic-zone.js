import React from 'react';
import { View, Text, TouchableHighlight, Image } from 'react-native';

function IncrementButton ({ label, onPress }) {
    return (
        <TouchableHighlight style={{ justifyContent: 'center', flex: 1 }} onPress={onPress}>
            <Text style={{ textAlign: 'center', fontSize: 48 }}>{label}</Text>
        </TouchableHighlight>
    );
}

function Relic ({ counter, imageData, onValueChange }) {
    return (
        <View style={{ flex: 3, flexDirection: 'row', justifyContent: 'space-between' }}>
            <IncrementButton label={'-'} onPress={() => onValueChange(-1)}/>
            <View style={{ flex: 2 }}>
                <Image style={{ width: 65, height: 65 }} source={imageData}/>
                <Text style={{ flex: 1, textAlign: 'center' }}>{counter}</Text>
            </View>
            <IncrementButton label={'+'} onPress={() => onValueChange(1)}/>
        </View>
    );
}

function Zone ({ data, index, onValueChange }) {
    return (
        <View style={{
            flex: 8,
            backgroundColor: 'lightgrey',
            borderWidth: 2,
            borderColor: 'grey',
            flexDirection: 'row',
        }}>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 24 }}>{index + 1}</Text>
            <Relic counter={data.facedown} imageData={require('./relic-tipped.png')} onValueChange={(step) => onValueChange(false, step)}/>
            <Relic counter={data.upright} imageData={require('./relic.png')} onValueChange={(step) => onValueChange(true, step)}/>
        </View>
    );
}

export default function RelicZone ({ zones, onValueChange }) {
    return (
        <View>
            {zones.map((z, i) => <Zone data={z} key={i} index={i} onValueChange={(isUpright, step) => onValueChange(i, isUpright, step)}/>)}
        </View>
    );
}