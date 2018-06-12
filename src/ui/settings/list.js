import React, { Component } from 'react';
import { View, Text, Button, Modal, ScrollView, TextInput } from 'react-native';
import { TournamentEntry } from './components';

import TournamentService from '../../services/tournament-service';
import SettingsService from '../../services/settings-service';

const tournamentService = new TournamentService();
const settingsService = new SettingsService();

export default class SettingsList extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'Settings'
  });

  constructor (props) {
    super(props);
    this.state = {
      tournaments: [],
      tournamentFilterString: '',
      tournamentModalVisible: false,
      settings: {
        currentTournament: 0
      }
    };
  }

  componentWillMount () {
    Promise.all([tournamentService.getAll(), settingsService.getAll()])
      .then(([tournaments, settings]) => this.setState({ tournaments, settings }));
  }

  updateSettings (settings) {
    settingsService.update(settings)
      .then(() => this.setState({ settings }));
  }

  toggleTournamentModal () {
    this.setState({ tournamentModalVisible: !this.state.tournamentModalVisible });
  }

  // FIXME: performance of tournamententry list rendering is awful pls fix
  render () {
    const currentTournament = this.state.tournaments.find(t => t.id === this.state.settings.currentTournament);

    const tournamentButtonText = currentTournament ? currentTournament.name : "Select Current Tournament";
    return (
      <View style={{ paddingLeft: 10, paddingRight: 10 }}>
        <View>
          <Text>{currentTournament ? currentTournament.name : 'Please select a tournament'}</Text>
          <Button title={"Change..."} onPress={() => this.toggleTournamentModal()}/>
        </View>
        <Modal visible={this.state.tournamentModalVisible} onRequestClose={() => this.toggleTournamentModal()}>
          <TextInput onChangeText={(val) => this.setState({ tournamentFilterString: val })}/>
          <ScrollView>
            {
              this.state.tournaments
                .filter(t => t.name.includes(this.state.tournamentFilterString))
                .map(t => <TournamentEntry key={t.id} tournament={t} onPress={() => {
                  this.updateSettings(Object.assign({}, this.state.settings, { currentTournament: t.id }));
                  this.toggleTournamentModal();
                }}/>)
            }
          </ScrollView>
        </Modal>
      </View>
    );
  }
}