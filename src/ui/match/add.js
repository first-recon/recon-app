import React, { Component } from 'react';
import {
  ScrollView,
  Button,
  Picker,
  Alert,
  View,
  TextInput,
  Text
} from 'react-native';
import {
  TournamentDropdown,
  Comments,
  IncrementingNumber,
  Toggle
} from './components';
import MatchService from '../../services/match-service';
import TournamentService from '../../services/tournament-service';
import SettingsService from '../../services/settings-service';

import { getRuleAttribute, getRulesetObj } from '../../data/game-config';

const matchService = new MatchService();
const tournamentService = new TournamentService();
const settingsService = new SettingsService();

const COMMENTS_FIELD_LIMIT = 50;
export default class MatchAdd extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Add New Match for ${navigation.state.params.team.number}`
  });

  constructor (props) {
    super(props);

    this.state = {
      tournaments: [],
      levels: [
        {
          label: 'None',
          value: null
        },
        {
          label: '1/4',
          value: 'QF'
        },
        {
          label: 'Semi',
          value: 'SF'
        },
        {
          label: 'Final',
          value: 'FI'
        }
      ],
      team: props.navigation.state.params.team.number,
      tournament: 0,
      level: null,
      levelNum: 0,
      number: null,
      division: null,
      hasDivisions: false,
      alliance: 'RED',
      comments: '',
      data: getRulesetObj(),
      type: 'QUAL'
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
      .catch((error) => {
        console.log(error);
        Alert.alert('Could not save match', error.message);
      });
  }

  render () {
    const RuleCheck = ({ field }) => <Toggle
      style={{ height: 60, marginBottom: 10, padding: 10, borderColor: this.state.data[field] ? 'darkgreen' : 'darkgrey', borderWidth: 1 }}
      color={this.state.data[field] ? 'darkgreen' : 'white' }
      textColor={this.state.data[field] ? 'white' : '#4f4f4f'}
      value={this.state.data[field]}
      label={`${getRuleAttribute(field, "name")} ${this.state.data[field] ? '☑' : '☐'}`}
      onPress={() => {
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
      backgroundColor={this.state.data[field] > 0 ? 'darkgreen' : 'white'}
      textColor={this.state.data[field] > 0 ? 'white' : '#4f4f4f'}
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
          style={{ marginBottom: 10 }}
          tournament={this.state.tournament}
          onValueChange={((value) => this.setState({ tournament: value })).bind(this)}>
            {this.state.tournaments.map((t, i) => <Picker.Item key={i} label={`${t.season} - ${t.name}`} value={t.id}/>)}
        </TournamentDropdown>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Toggle
            style={{ flex: 3, height: 60 }}
            textColor="grey"
            textAlign="left"
            label={this.state.hasDivisions ? 'Divsions? ☑' : 'Divsions? ☐'}
            onPress={() => {
              const hasDivisions = !this.state.hasDivisions;
              this.setState(state => ({
                ...state,
                hasDivisions,
                division: hasDivisions ? '' : null
              }))
            }}/>
          <TextInput
            value={this.state.division || ''}
            editable={this.state.hasDivisions}
            style={{
              flex: 2,
              fontSize: 18
            }} placeholder="Name..."
            onChangeText={(value) => {
              this.setState(state => ({
                ...state,
                division: value
              }));
            }}
          />
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Toggle
            style={{ width: 80, height: 60 }}
            textColor="grey"
            textAlign="left"
            label={this.state.type === 'FINAL' ? 'Final ☑' : 'Final ☐'}
            onPress={(() => this.setState({ type: this.state.type === 'QUAL' ? 'FINAL' : 'QUAL' })).bind(this)}/>
          <Picker
            enabled={this.state.type === 'FINAL'}
            style={{ flex: 4, height: 60 }}
            selectedValue={this.state.level}
            onValueChange={(value) => this.setState(state => ({ ...state, level: value }))}>
              {this.state.levels.map(({ label, value }) => <Picker.Item key={value} label={label} value={value}/>)}
          </Picker>
          <TextInput
            keyboardType={'numeric'}
            value={`${this.state.levelNum || ''}`}
            editable={this.state.type === 'FINAL'}
            style={{
              flex: 2,
              fontSize: 18,
              textAlign: 'center'
            }} placeholder="Final #"
            onChangeText={(value) => {
              // FIXME: does not validate decimal points
              if (!isNaN(value)) {
                this.setState(state => ({
                  ...state,
                  levelNum: parseInt(value)
                }));
              }
            }}
          />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TextInput
            keyboardType={'numeric'}
            value={`${this.state.number || ''}`}
            style={{
              flex: 2,
              fontSize: 18,
              textAlign: 'center'
            }} placeholder="Match #"
            onChangeText={(value) => {
              // FIXME: does not validate decimal points
              if (!isNaN(value)) {
                this.setState(state => ({
                  ...state,
                  number: parseInt(value)
                }));
              }
            }}
          />
          <Toggle
            style={{}}
            color={this.state.alliance.toLowerCase()}
            label={this.state.alliance + ' Alliance'}
            onPress={(() => this.setState({ alliance: this.state.alliance === 'RED' ? 'BLUE' : 'RED' })).bind(this)}
          />
        </View>
        <Comments style={{ backgroundColor: 'lightgrey' }} textValue={this.state.comments} onChangeText={(value) => {
          if (value.length < COMMENTS_FIELD_LIMIT) {
            this.setState({
              comments: value
            });
          }
        }}/>
        <View style={{ borderTopWidth: 2, borderTopColor: 'darkgrey', marginBottom: 15, marginTop: 10 }}></View>
        {/* MATCH DATA */}
        <View>
          <RuleCheck field="auto_landing"/>
          <RuleCheck field="auto_sampling"/>
          <RuleCheck field="auto_claiming"/>
          <RuleCheck field="auto_parking"/>
        </View>
        <View>
          <Points field="tele_gold_mineral"/>
          <Points field="tele_silver_mineral"/>
          <Points field="tele_mineral_depot"/>
        </View>
        <View>
          <RuleCheck field="end_latched"/>
          <RuleCheck field="end_parked"/>
          <RuleCheck field="end_parked_fully"/>
        </View>
        {/* MATCH DATA */}
        <Button title="Save" onPress={this.saveMatch.bind(this)}/>
      </ScrollView>
    );
  }
}
