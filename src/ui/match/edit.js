import React, { Component } from 'react';
import {
  Text,
  View,
  Switch,
  TextInput,
  Button,
  Alert,
  ScrollView
} from 'react-native';
import { TextCheck, IncrementingNumber } from './components';
import MatchService from '../../services/match-service';
import { getRulesForPeriod } from '../../data/game-config';

const matchService = new MatchService();

function Category ({ name, rules, updateRule }) {
  return (
    <View>
      <Text style={{ fontSize: 20, textAlign: 'center' }}>{name}</Text>
      {rules.map((rule, i) => {
        return (
          <View key={i} style={{ marginBottom: 10, height: 50 }}>
            {rule.type === 'number' ?
              <IncrementingNumber
                label={rule.name}
                value={rule.points}
                onIncrement={(value) => updateRule(rule.code, value)}
              /> :
              <TextCheck
                label={rule.name}
                labelOn="Yes"
                labelOff="No"
                value={rule.points > 0}
                onToggle={() => updateRule(rule.code, !rule.points)}
              />}
          </View>
        );
      })}
    </View>
  );
}

export default class MatchEdit extends Component {
  constructor (props) {
    super(props);
    this.state = {
      ...this.props.navigation.state.params.match
    };
  }

  updateRule(code, newValue) {
    matchService.update(this.state.id, {
      ...this.state,
      data: {
        ...this.state.data,
        [code]: newValue
      }
    })
    .then(updated => {
      this.setState(state => ({
        ...state,
        ...updated
      }));
      this.props.navigation.state.params.refresh();
    });
  }

  render() {

    const pointsToRules = r => ({ ...r, points: this.state.data[r.code] });
    const auto = getRulesForPeriod('autonomous').map(pointsToRules);
    const teleop = getRulesForPeriod('teleop').map(pointsToRules);
    const endgame = getRulesForPeriod('endgame').map(pointsToRules);

    return (
      <ScrollView style={{ flex: 1, padding: 10 }}>
        <Category
          name={'Autonomous'}
          rules={auto}
          updateRule={this.updateRule.bind(this)}
        />
        <Category
          name={'TeleOp'}
          rules={teleop}
          updateRule={this.updateRule.bind(this)}
        />
        <Category
          name={'End Game'}
          rules={endgame}
          updateRule={this.updateRule.bind(this)}
        />
      </ScrollView>
    );
  }
}
