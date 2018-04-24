import React from 'react';
import { View, Text, TouchableHighlight, Image, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_PHONE = SCREEN_WIDTH < 500;

function IncrementButton ({ label, onPress }) {
    return (
        <TouchableHighlight style={{ justifyContent: 'center', flex: 1 }} onPress={onPress}>
            <Text style={{ textAlign: 'center', fontSize: 48 }}>{label}</Text>
        </TouchableHighlight>
    );
}

function Relic ({ counter, imageData, onValueChange }) {
    return (
        <View style={{ width: 125, flexDirection: 'row' }}>
            <IncrementButton label={'-'} onPress={() => onValueChange(-1)}/>
            <View style={{ flex: 2 }}>
                <Image style={{ width: 65, height: 65 }} source={imageData}/>
                <Text style={{ flex: 1, textAlign: 'center', fontSize: 24 }}>{counter}</Text>
            </View>
            <IncrementButton label={'+'} onPress={() => onValueChange(1)}/>
        </View>
    );
}

function Zone ({ data, index, onValueChange }) {
    return (
        <View style={{
            width: IS_PHONE ? '100%' : '60%',
            backgroundColor: 'lightgrey',
            borderWidth: 1,
            borderColor: 'grey',
            flexDirection: 'row',
            padding: 10,
            marginBottom: 5
        }}>
            <Text style={{ flex: 1, textAlign: 'left', fontSize: 24, fontWeight: 'bold' }}>{index + 1}</Text>
            <View style={{ flexDirection: 'row', flex: 4, justifyContent: 'space-between' }}>
                <Relic counter={data.facedown} imageData={require('./relic-tipped.png')} onValueChange={(step) => onValueChange(false, step)}/>
                <Relic counter={data.upright} imageData={require('./relic.png')} onValueChange={(step) => onValueChange(true, step)}/>
            </View>
        </View>
    );
}

export default function RelicZone ({ zones, onValueChange }) {
    return (
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
            {zones.map((z, i) => <Zone data={z} key={i} index={i} onValueChange={(isUpright, step) => onValueChange(i, isUpright, step)}/>)}
        </View>
    );
}