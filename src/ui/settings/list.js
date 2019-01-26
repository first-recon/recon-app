import React, { Component } from "react";
import {
  View,
  Text,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  TouchableHighlight
} from "react-native";
import { TournamentEntry } from "./components";
import { FRButton } from '../components';

import TournamentService from "../../services/tournament-service";
import SettingsService from "../../services/settings-service";
import MatchService from "../../services/match-service";
import TeamService from "../../services/team-service";

const tournamentService = new TournamentService();
const settingsService = new SettingsService();
const matchService = new MatchService();
const teamService = new TeamService();

function deleteAllData() {
  tournamentService.deleteAll();
  matchService.deleteAll();
  teamService.deleteAll();
}

const style = {
  changeTournamentButton: {
    container: {
      marginBottom: 10
    }
  },
  deleteDataButton: {
    container: {
      backgroundColor: "red"
    },
    text: {
      fontWeight: "bold",
      fontSize: 24
    }
  },
  finalSaveButton: {
    container: {
      flex: 1
    }
  },
  finalDeleteButton: {
    container: {
      flex: 1,
      backgroundColor: "red"
    }
  },
  deleteDataModal: {
    justfyContent: "center"
  },
  deleteButtonsContainer: {
    flexDirection: 'row'
  }
};

export default class SettingsList extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: "Settings"
  });

  constructor(props) {
    super(props);
    this.state = {
      tournaments: [],
      tournamentFilterString: '',
      tournamentModalVisible: false,
      deleteModalVisible: false,
      settings: {
        currentTournament: 0
      }
    };
  }

  componentWillMount() {
    Promise.all([tournamentService.getAll(), settingsService.getAll()]).then(
      ([tournaments, settings]) => this.setState({ tournaments, settings })
    );
  }

  updateSettings(settings) {
    settingsService.update(settings).then(() => this.setState({ settings }));
  }

  toggleTournamentModal() {
    this.setState({
      tournamentModalVisible: !this.state.tournamentModalVisible
    });
  }

  toggleDeleteModal() {
    this.setState({ deleteModalVisible: !this.state.deleteModalVisible });
  }

  // FIXME: performance of tournamententry list rendering is awful pls fix
  render() {
    const currentTournament = this.state.tournaments.find(
      t => t.id === this.state.settings.currentTournament
    );
    const tournamentButtonText = currentTournament
      ? currentTournament.name
      : "Select Current Tournament";

    return (
      <View style={{ paddingLeft: 10, paddingRight: 10 }}>
        <View>
          <Text>
            {currentTournament
              ? currentTournament.name
              : "Please select a tournament"}
          </Text>
          <FRButton
            style={style.changeTournamentButton}
            title={"Change..."}
            onPress={() => this.toggleTournamentModal()}
          />
          <View style={{ alignItems: "center" }}>
            <FRButton
              style={style.deleteDataButton}
              title={"DELETE ALL DATA"}
              onPress={() => this.toggleDeleteModal()}
            />
          </View>
        </View>
        <Modal
          visible={this.state.tournamentModalVisible}
          onRequestClose={() => this.toggleTournamentModal()}
        >
          <TextInput
            onChangeText={val => this.setState({ tournamentFilterString: val })}
          />
          <ScrollView>
            {this.state.tournaments
              .filter(t => t.name.toLowerCase().includes(this.state.tournamentFilterString.toLowerCase()))
              .map(t => (
                <TournamentEntry
                  key={t.id}
                  tournament={t}
                  onPress={() => {
                    this.updateSettings(
                      Object.assign({}, this.state.settings, {
                        currentTournament: t.id
                      })
                    );
                    this.toggleTournamentModal();
                  }}
                />
              ))}
          </ScrollView>
        </Modal>
        <Modal
          style={style.deleteDataModal}
          visible={this.state.deleteModalVisible}
          onRequestClose={() => this.toggleDeleteModal()}
        >
          <View style={style.deleteButtonsContainer}>
            <FRButton style={style.finalSaveButton} title={'Do nothing'} onPress={() => this.toggleDeleteModal()}/>
            <FRButton style={style.finalDeleteButton} title={'DESTROY ALL THE THINGS!'} onPress={() => {
              deleteAllData();
              this.toggleDeleteModal();
              Alert.alert('Warning!', 'Please restart the app to see updated data');
            }}/>
          </View>
        </Modal>
      </View>
    );
  }
}
