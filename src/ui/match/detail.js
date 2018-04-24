import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';

import MatchService from '../../services/match-service';

const matchService = new MatchService();

function getMatchTitle (match) {
  return `${match.team.name} #${match.number}`;
}

function getTotalScore ({ data: { rules } }) {
  return rules.reduce((cScore, { points }) => (cScore + points), 0);
}

const STANDARD_TEXT_SIZE = 18;

function DetailCategory ({ name, rules }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontSize: STANDARD_TEXT_SIZE, fontWeight: 'bold' }}>{name}</Text>
      <View>
        {rules.map((rule, ri) => (
          <View key={ri} style={{ flexDirection: 'row', marginBottom: 5 }}>
            <Text style={{ flex: 5, fontSize: STANDARD_TEXT_SIZE }}>{rule.name}</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>{rule.points}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default class MatchDetail extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: getMatchTitle(navigation.state.params)
  });

  render () {
    const match = this.props.navigation.state.params;
    const autonomous = match.data.rules.filter(r => r.period === 'autonomous');
    const teleop = match.data.rules.filter(r => r.period === 'teleop');
    const endgame = match.data.rules.filter(r => r.period === 'endgame');
    return (
      <ScrollView>
        <View style={{ marginLeft: 10, marginRight: 10 }}>
          <Text style={{ fontSize: STANDARD_TEXT_SIZE + 10 }}>{`Total: ${getTotalScore(match)}`}</Text>
          <View>
            <DetailCategory name="Autonomous" rules={autonomous}/>
            <DetailCategory name="TeleOp" rules={teleop}/>
            <DetailCategory name="End Game" rules={endgame}/>
          </View>
          <View>
            <Text style={{ fontSize: STANDARD_TEXT_SIZE, fontWeight: 'bold' }}>{'Comments'}</Text>
            <Text style={{ fontSize: STANDARD_TEXT_SIZE }}>{match.comments}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}