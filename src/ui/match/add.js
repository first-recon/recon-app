import React, { Component } from 'react';
import {
  ScrollView,
  Button,
  Picker,
  Alert
} from 'react-native';
import {
  TournamentDropdown,
  MatchNumberField,
  AllianceToggle,
  Comments,
  IncrementingNumber,
  TextCheck
} from './components';
import MatchService from '../../services/match-service';
import TournamentService from '../../services/tournament-service';
import SettingsService from '../../services/settings-service';

import { getRuleAttribute, getRulesetObj } from '../../data/game-config';

const matchService = new MatchService();
const tournamentService = new TournamentService();
const settingsService = new SettingsService();

// TODO: figure out some way of having a real multiline text field so that we can get rid of this character limit
const COMMENTS_FIELD_LIMIT = 130;

export default class MatchAdd extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Add New Match for ${navigation.state.params.team.number}`
  });

  constructor (props) {
    super(props);

    this.state = {
      team: props.navigation.state.params.team.number,
      tournament: 0,
      tournaments: [],
      number: null,
      alliance: 'RED',
      comments: '',
      data: getRulesetObj()
    };
  }

  componentDidMount () {
    Promise.all([tournamentService.getAll(), settingsService.getAll()])
      .then(([tournaments, settings]) => {
        this.setState({
          tournament: settings.currentTournament,
          tournaments: tournaments
        });
      });
  }

  saveMatch () {
    matchService.create(this.state)
      .then(() => {
        this.props.navigation.state.params.refresh();
        this.props.navigation.goBack();
      })
      .catch((error) => Alert.alert('Could not save match', error.message));
  }

  render () {
    const RuleCheck = ({ field }) => <TextCheck
      value={this.state.data[field]}
      label={getRuleAttribute(field, "name")}
      labelOn={"Yes"}
      labelOff={"No"}
      onToggle={() => {
        this.setState(state => ({
          ...state,
          data: {
            ...state.data,
            [field]: !this.state.data[field]
          }
        }));
      }}
    />;

    const Points = ({ field }) => <IncrementingNumber
      label={getRuleAttribute(field, 'name')}
      value={this.state.data[field]}
      onIncrement={(val) => {
        let tmpVal = this.state.data[field];
        tmpVal += val;
        this.setState(state => ({
          ...state,
          data: {
            ...state.data,
            [field]: tmpVal
          }
        }));
    }}/>;

    return (
      <ScrollView style={{flex: 1, flexDirection: 'column', marginLeft: 10, marginRight: 10}}>
        <TournamentDropdown
          tournament={this.state.tournament}
          onValueChange={((value) => this.setState({ tournament: value })).bind(this)}>
            {this.state.tournaments.map((t, i) => <Picker.Item key={i} label={`${t.season} - ${t.name}`} value={t.id}/>)}
        </TournamentDropdown>
        <MatchNumberField number={this.state.number} onChangeText={(value) => {
          // FIXME: does not validate decimal points
          if (!isNaN(value)) {
            this.setState({
              number: parseInt(value)
            });
          }
        }}/>
        <AllianceToggle
          alliance={this.state.alliance}
          onPress={(() => this.setState({ alliance: this.state.alliance === 'RED' ? 'BLUE' : 'RED' })).bind(this)}/>
        <Comments textValue={this.state.comments} onChangeText={(value) => {
          if (value.length < COMMENTS_FIELD_LIMIT) {
            this.setState({
              comments: value
            });
          }
        }}/>
        {/* MATCH DATA */}
        <RuleCheck field="auto_landing"/>
        <RuleCheck field="auto_sampling"/>
        <RuleCheck field="auto_claiming"/>
        <RuleCheck field="auto_parking"/>
        <Points field="tele_gold_mineral"/>
        <Points field="tele_silver_mineral"/>
        <Points field="tele_mineral_depot"/>
        <RuleCheck field="end_latched"/>
        <RuleCheck field="end_parked"/>
        <RuleCheck field="end_parked_fully"/>
        {/* MATCH DATA */}
        <Button title="Save" onPress={this.saveMatch.bind(this)}/>
      </ScrollView>
    );
  }
}
