import React, { Component } from 'react';
import { View, TouchableHighlight, Text, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_PHONE = SCREEN_WIDTH < 500;

const BLOCK_STATE = {
    EMPTY: 0,
    GREY: 1,
    BROWN: 2,
    GREY_AUTO: 3,
    BROWN_AUTO: 4
};

function Block ({ colIdx, blockIdx, block, updateBlockValue }) {
    const displayAutoText = block && block.isAuto;
    const autoTextColor = block && block.color === 'brown' ? 'white' : 'grey';
    return (
        <TouchableHighlight style={{
            flex: 1,
            height: IS_PHONE ? 50 : 100,
            backgroundColor: block ? block.color : 'grey',
            borderWidth: 1,
            borderColor: 'darkgrey',
            justifyContent: 'center'
        }} onPress={() => {
            updateBlockValue(colIdx, blockIdx);
        }}>
            <Text style={{ textAlign: 'center', fontSize: IS_PHONE ? 24 : 72, color: autoTextColor }}>{displayAutoText ? 'A' : ''}</Text>
        </TouchableHighlight>
    );
}

function Column ({ colIdx, blocks, updateBlockValue }) {
    return (
        <View style={{ flex: 1 }}>
            {blocks.map((block, i) => <Block key={i} colIdx={colIdx} blockIdx={i} block={block} updateBlockValue={updateBlockValue}/>)}
        </View>
    );
}

export default class Cryptobox extends Component {
    shouldComponentUpdate (nextProps) {
        const { data } = nextProps;
        const newData = data.reduce((combined, col) => {
            return combined.concat(col);
        }, []);
        const oldData = this.props.data.reduce((combined, col) => {
            return combined.concat(col);
        }, []);

        const dataChanged = newData.findIndex((newBlock, i) => {
            const oldBlock = oldData[i];

            if (!newBlock && !oldBlock) {
                return false;
            }

            if (!newBlock && oldBlock) {
                return true;
            }

            if (newBlock && !oldBlock) {
                return true;
            }

            if (newBlock && !oldBlock) {
                return true;
            }

            const diffBlockColor = newBlock.color !== oldBlock.color;
            const diffAuto = newBlock.isAuto !== oldBlock.isAuto;

            return diffBlockColor || diffAuto;
        }) > -1;

        return dataChanged;
    }

    render () {
        const { label, data: columns, boxIdx, updateBlockValue } = this.props;
        return (
            <View style={{ width: '47%' }}>
                <Text style={{ height: 40, textAlign: 'center' }}>{label}</Text>
                <View style={{ flex: 1, backgroundColor: 'lightgrey', flexDirection: 'row' }}>
                    {columns.map((blocks, i) => {
                        return <Column key={i} colIdx={i} blocks={blocks} updateBlockValue={updateBlockValue}/>;
                    })}
                </View>
            </View>
        );
    }
}