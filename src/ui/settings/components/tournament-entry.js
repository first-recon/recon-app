import React, { Component } from 'react';
import { TouchableHighlight, Text } from 'react-native';

export default function TournamentEntry ({ tournament, onPress }) {
  return (
    <TouchableHighlight style={{ height: 45, marginLeft: 10, justifyContent: 'center' }} onPress={onPress}>
      <Text>{`${tournament.season} - ${tournament.name}`}</Text>
    </TouchableHighlight>
  );
};