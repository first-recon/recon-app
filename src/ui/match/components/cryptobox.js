import React, { Component } from 'react';
import { View, TouchableHighlight, Text } from 'react-native';

const BLOCK_STATE = {
    EMPTY: 0,
    GREY: 1,
    BROWN: 2,
    GREY_AUTO: 3,
    BROWN_AUTO: 4
};

function getBlockColor(blockStateNum) {
    switch (blockStateNum) {
        case BLOCK_STATE.EMPTY:
            return 'grey';
        case BLOCK_STATE.GREY_AUTO:
        case BLOCK_STATE.GREY:
            return 'lightgrey';
        case BLOCK_STATE.BROWN_AUTO:
        case BLOCK_STATE.BROWN:
            return 'brown';
    }
}

function Block ({ colIdx, blockIdx, block, updateBlockValue }) {
    const displayAutoText = block && block.isAuto;
    const autoTextColor = block && block.color === 'brown' ? 'white' : 'grey';
    return (
        <TouchableHighlight style={{
            height: 50,
            width: 50,
            backgroundColor: block ? block.color : 'grey',
            borderWidth: 1,
            borderColor: 'darkgrey',
            alignItems: 'center'
        }} onPress={() => {
            updateBlockValue(colIdx, blockIdx);
        }}>
            <Text style={{ textAlign: 'center', fontSize: 24, color: autoTextColor }}>{displayAutoText ? 'A' : ''}</Text>
        </TouchableHighlight>
    );
}

function Column ({ colIdx, blocks, updateBlockValue }) {
    return (
        <View>
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
            <View>
                <Text style={{ textAlign: 'center' }}>{label}</Text>
                <View style={{ backgroundColor: 'lightgrey', flexDirection: 'row' }}>
                    {columns.map((blocks, i) => {
                        return <Column key={i} colIdx={i} blocks={blocks} updateBlockValue={updateBlockValue}/>;
                    })}
                </View>
            </View>
        );
    }
}