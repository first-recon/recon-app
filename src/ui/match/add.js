import React, { Component } from 'react';
import {
  Text,
  View,
  ScrollView,
  Switch,
  TextInput,
  Button,
  Picker,
  TouchableHighlight,
  Alert
} from 'react-native';
import {
  TournamentDropdown,
  MatchNumberField,
  AllianceToggle,
  Comments,
  Cryptobox,
  RelicZone,
  TextCheck
} from './components';
import { refreshTeamList } from '../actions';
import MatchService from '../../services/match-service';
import TeamService from '../../services/team-service';
import TournamentService from '../../services/tournament-service';
import SettingsService from '../../services/settings-service';

const matchService = new MatchService();
const teamService = new TeamService();
const tournamentService = new TournamentService();
const settingsService = new SettingsService();

// TODO: figure out some way of having a real multiline text field so that we can get rid of this character limit
const COMMENTS_FIELD_LIMIT = 130;

const INITIAL_CRYPTOBOX_STATE = [
  [null, null, null, null], // column L
  [null, null, null, null], // column C
  [null, null, null, null], // column R
];

function getNextBlock (current) {
  if (!current) {
    return { color: 'lightgrey', isAuto: false };
  } else if (current.color === 'lightgrey' && !current.isAuto) {
    return { color: 'brown', isAuto: false };
  } else if (current.color === 'brown' && !current.isAuto) {
    return { color: 'lightgrey', isAuto: true };
  } else if (current.color === 'lightgrey' && current.isAuto) {
    return { color: 'brown', isAuto: true };
  }

  return null;
}

export default class MatchAdd extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Add New Match for ${navigation.state.params.team.name}`
  });

  constructor (props) {
    super(props);

    this.state = {
      team: props.navigation.state.params.team.number,
      tournament: 0,
      alliance: 'RED',
      diceRoll: -1, // 0 = L, 1 = C, 2 = R
      tournamentOptions: [],
      comments: '',
      commentsHeight: 40,
      allianceJewelOnPlatform: false,
      robotInSafeZone: false,
      robotBalanced: false,
      cryptoboxes: [
        INITIAL_CRYPTOBOX_STATE,
        INITIAL_CRYPTOBOX_STATE
      ],
      relicZones: [
        { facedown: 0, upright: 0 },
        { facedown: 0, upright: 0 },
        { facedown: 0, upright: 0 }
      ]
    };
  }

  componentDidMount () {
    Promise.all([tournamentService.getAll(), settingsService.getAll()])
      .then(([tournaments, settings]) => {
        this.setState({
          tournament: settings.currentTournament,
          tournamentOptions: tournaments.map((tourney, i) => <Picker.Item key={i} label={tourney.name} value={tourney.id}/>)
        });
      });
  }

  updateBlockValue (boxIdx, colIdx, blockIdx) {
    const cryptoboxes = JSON.parse(JSON.stringify(this.state.cryptoboxes));
    cryptoboxes[boxIdx][colIdx][blockIdx] = getNextBlock(cryptoboxes[boxIdx][colIdx][blockIdx]);
    this.setState({ cryptoboxes });
  }

  updateRelics (zoneIdx, isUpright, step) {
    const updated = JSON.parse(JSON.stringify(this.state.relicZones));
    if (isUpright) {
      updated[zoneIdx].upright += step;
    } else {
      updated[zoneIdx].facedown += step;
    }

    const validations = updated.reduce((validations, { facedown, upright }) => {
      return {
        totalRelics: validations.totalRelics + facedown + upright,
        noNegatives: !validations.noNegatives ? false : !(facedown < 0 || upright < 0)
      };
    }, {totalRelics: 0, noNegatives: true});

    if (validations.totalRelics < 5 && validations.noNegatives) {
      this.setState({ relicZones: updated });
    }
  }

  saveMatch () {

    if (this.state.diceRoll === -1) {
      Alert.alert('Coud not score match!', 'Please enter dice roll.');
      return;
    }

    const scoredMatch = matchService.buildMatchScores(this.state);

    matchService.create(scoredMatch)
      .then(() => {
        refreshTeamList();
        this.props.navigation.state.params.refresh();
        this.props.navigation.goBack();
      })
      .catch((error) => Alert.alert('Could not save match', error.message));
  }

  render () {
    return (
      <ScrollView style={{flex: 1, flexDirection: 'column', marginLeft: 10, marginRight: 10}}>
        <TournamentDropdown
          tournament={this.state.tournament}
          onValueChange={((value) => this.setState({ tournament: value })).bind(this)}>
            {this.state.tournamentOptions}
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
        <TextCheck
          label={'Alliance Jewel on Platform?'}
          labelOn={'Yes'}
          labelOff={'No'}
          value={this.state.allianceJewelOnPlatform}
          onToggle={() => this.setState({ allianceJewelOnPlatform: !this.state.allianceJewelOnPlatform })}
        />
        <TextCheck
          label={'Robot Parked in Safe Zone?'}
          labelOn={'Yes'}
          labelOff={'No'}
          value={this.state.robotInSafeZone}
          onToggle={() => this.setState({ robotInSafeZone: !this.state.robotInSafeZone })}
        />
        <TextCheck
          label={'Robot Balanced?'}
          labelOn={'Yes'}
          labelOff={'No'}
          value={this.state.robotBalanced}
          onToggle={() => this.setState({ robotBalanced: !this.state.robotBalanced })}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ flex: 2, fontSize: 16, marginRight: 5 }}>Dice Roll</Text>
          <TextInput
            style={{ flex: 7, fontSize: 16 }}
            keyboardType="numeric"
            placeholder="Enter dice roll..."
            onChangeText={(val) => {
              this.setState({ diceRoll: Number(val) });
            }}
          />
        </View>
        <View style={{ marginBottom: 15 }}>
          <Text style={{ textAlign: 'center', fontSize: 22 }}>Cryptoboxes</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Cryptobox label={'1'} data={this.state.cryptoboxes[0]} updateBlockValue={(colIdx, blockIdx) => this.updateBlockValue(0, colIdx, blockIdx)}/>
            <Cryptobox label={'2'} data={this.state.cryptoboxes[1]} updateBlockValue={(colIdx, blockIdx) => this.updateBlockValue(1, colIdx, blockIdx)}/>
          </View>
        </View>
        <View>
          <Text style={{ textAlign: 'center', fontSize: 22 }}>Relic Zones</Text>
          <RelicZone zones={this.state.relicZones} onValueChange={this.updateRelics.bind(this)}/>
        </View>
        <Button title="Save" onPress={this.saveMatch.bind(this)}/>
      </ScrollView>
    );
  }
}
