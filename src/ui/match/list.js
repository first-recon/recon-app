import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import MatchService from '../../services/match-service';

const matchService = new MatchService();

function Tourney ({ tournament }) {
  const style = {
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    height: 50,
    justifyContent: 'center',
    paddingLeft: 5
  };

  return (
    <View style={style}>
      <Text style={{ fontWeight: 'bold' }}>{tournament.name}</Text>
    </View>
  );
}

function Match ({ match, detailClicked, editClicked }) {

  // TODO: move into seperate style file
  const style = {
    borderBottomWidth: 1,
    borderColor: 'lightgray',
    height: 70,
    backgroundColor: 'black'
  };

  return (
    <View style={style}>
      <TouchableOpacity style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white', padding: 10 }} activeOpacity={0.5} onPress={() => detailClicked()}>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ flex: 1, textAlign: 'left', fontSize: 36, color: 'darkgrey' }}>Q<Text style={{ color: 'black' }}>{match.number}</Text></Text>
        </View>
        <View style={{ flex: 2 }}>
          <Text style={{ fontSize: 18, textAlign: 'right' }}>
            <Text style={{ fontSize: 14, color: 'black' }}>
              {match.scores.stats.autonomous.total}
              <Text style={{ color: 'darkgrey' }}>A  </Text>
            </Text>
            <Text style={{ fontSize: 14, color: 'black' }}>
              {match.scores.stats.teleop.total}
              <Text style={{ color: 'darkgrey' }}>T  </Text>
            </Text>
            
            <Text style={{ fontSize: 14, color: 'black' }}>
              {match.scores.stats.endgame.total}
              <Text style={{ color: 'darkgrey' }}>E  </Text>
            </Text>
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}/>
            <Text style={{ textAlign: 'right', fontSize: 22, color: 'darkgrey', marginRight: 10 }}>{'Total'}</Text>
            <Text style={{ textAlign: 'right', fontSize: 22, color: 'black' }}>{`${match.scores.stats.total}`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default class MatchList extends Component {
  constructor (props) {
    super(props);

    this.state = {
      renderedMatchList: []
    };

    matchService.addListener('create', () => this.refresh());
    matchService.addListener('update', () => this.refresh());
  }

  componentWillMount () {
    this.refresh();
  }

  refresh () {
    matchService.get({ team: this.props.team.number })                    
      .then((matches) => {
        let lastTId;
        this.setState({
          renderedMatchList: matches.reduce((accum, match) => {
            const renderedMatch = <Match
                                    key={match.id}
                                    match={match}
                                    detailClicked={() => this.props.navigation.navigate('MatchDetailScreen', match)}
                                    editClicked={() => this.props.navigation.navigate('MatchEditScreen', { match, refresh: this.refresh.bind(this) })}/>;

            // insert new tourney name
            if (lastTId !== match.tournament.id) {
              const renderedTourney = <Tourney key={match.tournament.id} tournament={match.tournament}/>;
              accum = accum.concat(renderedTourney);
            }

            lastTId = match.tournament.id;
            return accum.concat(renderedMatch);
          }, [])
        });
      })
      .catch((error) => Alert.alert('Error', error.message));
  }

  render () {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView>
          {this.state.renderedMatchList}
        </ScrollView>
      </View>
    );
  }
}
