import React, { Component } from 'react';
import { TextInput, Button, View } from 'react-native';
import TeamService from '../../services/team-service';

const teamService = new TeamService();

export default class TeamEdit extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.number} Notes`
  });

  constructor (props) {
    super(props);
    this.state = props.navigation.state.params;
  }

  refresh () {
    teamService.getByNumber(this.state.number)
      .then(team => {
        this.setState(state => ({
          ...state,
          notes: team.notes
        }));
      });
  }

  componentDidMount () {
    this.refresh();
  }

  render () {
    return (
      <View>
        <TextInput
          multiline autoGrow
          style={{ height: 80 }}
          value={this.state.notes}
          placeholder={`Notes on ${this.state.number}...`}
          onChangeText={(value) => this.setState({ notes: value })}/>
            <Button title="Save" onPress={() => {
              teamService.update(this.state.number, this.state)
                .then(() => this.props.navigation.goBack());
          }}
        />
      </View>
    );
  }

}
