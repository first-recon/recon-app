import React, { Component } from 'react';
import { View, Text, Alert, Dimensions, Vibration } from 'react-native';
import { RNCamera } from 'react-native-camera';
import MatchService from '../../../services/match-service';
import TeamService from '../../../services/team-service';
import { mapCSVToTeam, mapCSVToMatch } from '../helpers';

const matchService = new MatchService();
const teamService = new TeamService();

const { csvDelimiter } = require('../../../../config');

const SCREEN_WIDTH = Dimensions.get('window').width;

export default class Receive extends Component {
  static navigationOptions = () => ({
    title: 'Scan'
  });

  constructor (props) {
    super(props);
    this.state = {
      matchData: [],
      teamData: []
    };
  }

  render () {
    return (
      <View>
        <RNCamera
          style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
          onBarCodeRead={this.onBarCodeRead.bind(this)}
        />
        <Text>{'Teams'}</Text>
        <Text>{this.state.teamData.map(t => t.split('|')[2])}</Text>
        <Text>{'Matches'}</Text>
        {this.state.matchData.map((m, i) => {
          return (<Text key={i}>{`${m.split('|')[3]}`}</Text>);
        })}
      </View>
    );
  }

  onBarCodeRead (e) {
    const typeChar = e.data[0];
    const fields = e.data.slice(1, e.data.length).split(csvDelimiter);
    // TODO: improve this way of checking what type of data this is
    if (typeChar === 'T' && !this.state.teamData.find(t => t === e.data)) {
      this.setState({
        teamData: this.state.teamData.concat(e.data)
      });
      this.saveTeam(fields);
    } else if (typeChar === 'M' && !this.state.matchData.find(m => e.data === m)) {
      this.setState({
        matchData: this.state.matchData.concat(e.data)
      });
      this.saveMatch(fields);
    }
  }

  saveTeam (fields) {
    const team = mapCSVToTeam(fields);
    teamService.create(team)
      .then(() => {
        Vibration.vibrate();
      })
      .catch(error => console.log('ERROR:', error));
  }

  saveMatch (fields) {
    const match = mapCSVToMatch(fields);
    matchService.create(match)
      .then(() => {
        Vibration.vibrate();
      })
      .catch(error => console.log('ERROR:', error));
  }

}