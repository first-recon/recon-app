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
                increment={rule.value}
                onIncrement={(value) => updateRule(rule.name, value)}
              /> :
              <TextCheck
                label={rule.name}
                labelOn="Yes"
                labelOff="No"
                value={rule.points > 0}
                onToggle={(value) => updateRule(rule.name, !rule.points)}
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
      ...this.props.navigation.state.params
    };
  }

  updateRule (name, points) {
    const newRules = this.state.data.rules.map((rule) => {
      let finalPoints = 0;

      // this is the rule we are editing
      if (rule.name === name) {

        // depending on the type of rule this is, either map a boolean
        // to a point value or just put the value into the current state
        switch (rule.type) {
          case 'boolean':
            finalPoints = points ? rule.value : 0;
            break;
          case 'number':
            if (rule.value) {

              /**
               * TODO: Passing in a positive number will increment by the
               * amount set for this rule in the gameConfig. Negative
               * will decrement. Should probably make this less awful
               * but nothing is coming to mind atm. Also the fact that
               * this page is so dynamic makes this a little more
               * interesting.
               */
              if (points > 0) {
                finalPoints += rule.value;
              } else if (points < 0) {
                finalPoints -= rule.value;
              }
            } else {
              finalPoints = points;
            }
        }
      }

      return Object.assign({}, rule, { points: finalPoints });
    });

    this.setState({
      data: {
        rules: newRules
      }
    });

    matchService.update(this.state.id, {
      data: {
        rules: newRules
      }
    })
    .catch((error) => {
      Alert.alert('Error updating match', error.message);
    });
  }

  render () {
    const rules = this.state.data.rules;
    const autonomous = rules.filter(r => r.period === 'autonomous');
    const teleop = rules.filter(r => r.period === 'teleop');
    const endgame = rules.filter(r => r.period === 'endgame');
    return (
      <ScrollView style={{flex: 1, padding: 10}}>
        <Category
          name={'Autonomous'}
          rules={autonomous}
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
