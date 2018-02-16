import React, { Component } from 'react';
import {
  Text,
  Button,
  Image,
  FlatList,
  View,
  Alert,
  TouchableHighlight,
  Dimensions,
  Picker,
  TextInput
} from 'react-native';

import TeamService from '../../services/team-service';
import MatchService from '../../services/match-service';

import { initRefreshTeamList } from '../actions';

import globalStyle from '../global.style.js';
import style from './list.style';

const teamService = new TeamService();

const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_PHONE = SCREEN_WIDTH < 500;

const NUM_OF_TILES = (() => {
  if (SCREEN_WIDTH < 360) {
    return 1;
  } else if (SCREEN_WIDTH < 500) {
    return 2;
  } else {
    return 4;
  }
})();
const TILE_MARGIN = (SCREEN_WIDTH) * 0.02;
const TILE_SIZE = ((SCREEN_WIDTH - TILE_MARGIN) / NUM_OF_TILES) - TILE_MARGIN;

const SORT_OPTIONS = {
  TOTAL: 0,
  AUTONOMOUS: 1,
  TELEOP: 2,
  ENDGAME: 3
}

function DataRow ({ label, data }) {
  return (
    <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
      <Text>{label}</Text>
      <Text>{!isNaN(data) ? Math.round(data) : data}</Text>
    </View>
  );
}

function Team ({ index, team, clickHandler }) {
  const isLastTile = (index + 1) % NUM_OF_TILES === 0;

  const teamStyle = {
    backgroundColor: 'white',
    borderWidth: 1, borderColor: 'lightgrey', borderRadius: 0,
    width: TILE_SIZE,
    flexDirection: 'column',
    padding: TILE_MARGIN
  };

  const teamNumberStyle = {
    fontSize: 32,
    color: 'black'
  };

  const teamNameStyle = {
    fontSize: 16
  };

  return (
    <View style={{ marginRight: isLastTile ? 0 : TILE_MARGIN }}>
      <TouchableHighlight style={{ borderRadius: IS_PHONE ? 60 : 0 }} onPress={() => clickHandler()}>
        <View style={teamStyle}>
          <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
            <Text style={teamNumberStyle}>{team.number}</Text>
            <Text style={{ fontSize: 26 }}>{team.isTop ? '☺' : ''}</Text>
          </View>
          <Text numberOfLines={1} style={teamNameStyle}>{team.name}</Text>
          <View style={{ borderTopWidth: 1, borderTopColor: 'darkgrey', marginTop: 5, paddingTop: 2 }}>
            <DataRow label={'Auto'} data={team.averageScores.autonomous}/>
            <DataRow label={'Teleop'} data={team.averageScores.teleop}/>
            <DataRow label={'End Game'} data={team.averageScores.endGame}/>
            <DataRow label={'Total'} data={team.averageScores.total}/>
            <DataRow label={'Times Dead'} data={team.timesDead}/>
          </View>
        </View>
      </TouchableHighlight>
    </View>
  );
}

function SortPicker ({ selectedValue, onValueChange }) {
  return (
    <Picker style={{ flex: 1 }} selectedValue={selectedValue} onValueChange={onValueChange}>
      {Object.keys(SORT_OPTIONS).map((key, i) => <Picker.Item key={i} label={key} value={SORT_OPTIONS[key]}/>)}
    </Picker>
  );
}

function createSections (sections, team, i, clickHandler) {
  const lastSection = sections[sections.length - 1];

  const renderedTeam = <Team key={i} index={i} team={team} clickHandler={clickHandler}/>;

  // every other team should be attached to the already created section
  if (lastSection && lastSection.teams.length < NUM_OF_TILES) {
    lastSection.teams.push(renderedTeam);
    sections[sections.length - 1] = lastSection;
  } else {

    // create new section
    const newSection = {
      teams: [renderedTeam]
    };
    sections = sections.concat(newSection);
  }

  return sections;
}

export default class TeamList extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'Teams',
    headerStyle: globalStyle.headerStyle,
    headerRight: (
      <View style={{ flexDirection: "row" }}>
        <Button title="Scan" onPress={() => navigation.navigate('TransferScreen')}/>
        <TouchableHighlight style={{ width: 46 }} onPress={() => navigation.navigate('SettingsListScreen')}>
          <Text style={{ fontSize: 28 }}>{'🔧'}</Text>
        </TouchableHighlight>
      </View>
    )
  });

  constructor (props) {
    super(props);

    this.state = {
      teams: [],
      filter: '',
      sort: SORT_OPTIONS.TOTAL
    };

    // initialize action for refreshing team list
    initRefreshTeamList(() => this.refresh());
  }

  componentWillMount () {
    this.refresh();
  }

  refresh () {

    // TODO: filtering system is pretty inefficient, refactor to move all filtering logic to UI
    teamService.getAll()
      .then((teams) => {
        this.setState({ teams });
      })
      .catch((error) => Alert.alert('Error :-(', error.message));
  }



  render () {

    // apply filter
    const filtered = this.state.teams.filter((t) => t.number.includes(this.state.filter));

    // sort
    filtered.sort(({ averageScores: a }, { averageScores: b }) => {
      switch (this.state.sort) {
        case SORT_OPTIONS.AUTONOMOUS:
          return b.autonomous - a.autonomous;
        case SORT_OPTIONS.TELEOP:
          return b.teleop - a.teleop;
        case SORT_OPTIONS.ENDGAME:
          return b.endGame - a.endGame;
        case SORT_OPTIONS.TOTAL:
        default:
          return b.total - a.total;
      }
    });

    const grouped = filtered.reduce((sections, team, i) => {
      return createSections(sections, team, i, () => {
        this.props.navigation.navigate('TeamDetailScreen', { ...team, refresh: () => this.refresh() });
      });
    }, []);

    const teamList = (
      <FlatList
        style={{ padding: TILE_MARGIN }}
        data={grouped}
        renderItem={({ index, item: section }) => {
          return (
            <View key={index} style={{ flex: 1, flexDirection: 'row', marginBottom: TILE_MARGIN }}>
              {section.teams}
            </View>
          );
        }}
        keyExtractor={(item, index) => index}
      />
    );

    return (
      <View>
        <View>
          <Button title="Add Team" onPress={() =>
            this.props.navigation.navigate('TeamAddScreen', { refresh: this.refresh.bind(this) })}/>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TextInput style={{ flex: 8 }} placeholder="Filter by team number..." onChangeText={filter => this.setState({ filter })}/>
          <SortPicker selectedValue={this.state.sort} onValueChange={sort => this.setState({ sort })}/>
        </View>
        {teamList}
      </View>
    );
  }
}
