import React, { Component } from 'react';
import {
  View,
  Button,
  Text,
  Image,
  Alert,
  Modal,
  Dimensions,
  ScrollView
} from 'react-native';
import { FRButton } from '../components';
import QRCode from 'qrcode';
import SvgUri from 'react-native-svg-uri';

import MatchList from '../match/list.js';
import MatchModel from '../../db/models/match';
import TeamModel from '../../db/models/team';
import TeamService from '../../services/team-service';
import MatchService from '../../services/match-service';
import { genQRCode } from '../transfer/helpers';

import globalStyle from '../global.style.js';

const SCREEN_WIDTH = Dimensions.get('window').width;

const teamService = new TeamService();
const matchService = new MatchService();

const DetailRow = (({ label, value }) => {
  return (
    <View style={{ flexDirection: 'row' }}>
      {label ? <Text style={{ fontSize: 18, fontWeight: 'bold', marginRight: 10 }}>{label}</Text> : null}
      <Text style={{ fontSize: 18 }}>{value}</Text>
    </View>
  );
});

const DetailContainer = (({ title, children, fallback }) => {
  return (
    <View>
      <Text style={{ fontWeight: 'bold', fontSize: 23 }}>{title}</Text>
      {children}
    </View>
  );
});

export default class TeamDetail extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.number} - ${navigation.state.params.name}`,
    headerStyle: globalStyle.headerStyle
  });

  constructor (props) {
    super(props);
    this.state = {
      modalVisible: false,
      qrCodes: [],
      team: this.props.navigation.state.params
    };

    // whenever teamService.update is called, we will request notification of that update
    this.teamUpdateListenerId = teamService.addListener('update', () => this.refresh());
    this.matchUpdateListenerId = matchService.addListener('create', () => this.refresh());
  }

  refresh() {
    teamService.getByNumber(this.state.team.number)
      .then(team => this.setState(state => ({
        ...state,
        team
      })));
  }

  toggleModal () {
    this.setState({ modalVisible: !this.state.modalVisible });
  }

  componentDidMount () {
    const teamData = this.props.navigation.state.params;
    const teamModel = new TeamModel(teamData);
    Promise.all([
      genQRCode(teamModel.toCSV(), QRCode, 'T'),
      ...(teamData.matches ? teamData.matches.map((match) => {
        const matchModel = new MatchModel({
          ...match,
          data: JSON.stringify(match.data),
          scores: JSON.stringify(match.scores)
        });
        return genQRCode(matchModel.toCSV(), QRCode, 'M');
      }) : {})
    ])
    .then((qrCodes) => this.setState({ qrCodes }))
    .catch((error) => Alert.alert('Error creating QR code', error.message));
  }

  componentWillUnmount () {
    teamService.removeListener(this.updateListenerId);
  }

  // TODO: break Modal into seperate component
  render () {
    const team = this.state.team;

    const qrModal = (
      <Modal
          visible={this.state.modalVisible}
          animationType={'slide'}
          onRequestClose={() => this.toggleModal()}
        >
        <View>
          <Button title="Close" onPress={() => this.toggleModal()}/>
          <ScrollView>
            <View style={{ height: (this.state.qrCodes.length * SCREEN_WIDTH) + 40 }}>
              {this.state.qrCodes.map((qrCode, i) => (
              <SvgUri
                key={i}
                height={SCREEN_WIDTH}
                width={SCREEN_WIDTH}
                svgXmlData={qrCode}
              />
            ))}
            </View>
          </ScrollView>
        </View>
        </Modal>
    );

    const details = (
      <View>
        <DetailRow label={'Auto'} value={team.stats.auto}/>
        <DetailRow label={'Teleop'} value={team.stats.teleop}/>
        <DetailRow label={'End Game'} value={team.stats.endgame}/>
        <DetailRow label={'Total'} value={team.stats.total}/>
      </View>
    );

    const teamDetails = (
      <View style={{ flexDirection: 'row', height: 60 }}>
        <FRButton style={{ container: { flex: 1, backgroundColor: 'darkgreen' } }} title="+ Match" onPress={() => {this.props.navigation.navigate('MatchAddScreen', { team: team, refresh: this.refresh.bind(this) })}}/>
        <FRButton style={{ container: { flex: 1 } }} title="Share" onPress={() => this.toggleModal()}/>
        <FRButton style={{ container: { flex: 1, backgroundColor: '#a2a500' } }} title="Notes" onPress={() => this.props.navigation.navigate('TeamEditScreen', team)}/>
        <FRButton style={{ container: { flex: 1, backgroundColor: '#a50000' } }} title="Delete" onPress={() => {
          teamService.delete(team.number)
            .then(() => {
              this.refresh();
              navigation.goBack();
            })
            .catch((error) => {
              if (error.name === 'DbDeleteOpError') {
                Alert.alert('Can\'t Delete This Team', error.message);
              } else {
                Alert.alert('Unknown Error', error.message);
              }
            });
        }}/>
      </View>
    );

    return (
      <View style={{ flex: 1, flexDirection: 'column' }}>
        {qrModal}
        {teamDetails}
        <View style={{ flex: 2 }}>
          <MatchList team={team} navigation={this.props.navigation}/>
        </View>
      </View>
    );
  }
}
