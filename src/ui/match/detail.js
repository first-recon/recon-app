import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';

import { getRuleset } from '../../data/game-config';

function getMatchTitle (match) {
  return `${match.team.name} #${match.number}`;
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

    const rules = getRuleset();

    const hydrateRulesWithPoints = (period) => {
      return rules
        .filter(r => r.period === period)
        .map(r => {
          return {
            ...r,
            points: match.scores[r.code]
          }
        });
    };

    const autoRules = hydrateRulesWithPoints('autonomous');
    const teleopRules = hydrateRulesWithPoints('teleop');
    const endgameRules = hydrateRulesWithPoints('endgame');

    return (
      <ScrollView>
        <View style={{ marginLeft: 10, marginRight: 10 }}>
          <Text style={{ fontSize: STANDARD_TEXT_SIZE + 10 }}>{`Total: ${match.scores.stats.total}`}</Text>
          <View>
            <DetailCategory name="Autonomous" rules={autoRules}/>
            <DetailCategory name="TeleOp" rules={teleopRules}/>
            <DetailCategory name="End Game" rules={endgameRules}/>
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