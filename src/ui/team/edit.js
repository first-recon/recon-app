import React, { Component } from 'react';
import { TextInput, Button, View } from 'react-native';
import TeamService from '../../services/team-service';
import TeamModel from '../../db/models/team';
import { refreshTeamDetail } from '../actions';

const teamService = new TeamService();

export default class TeamEdit extends Component {

  constructor (props) {
    super(props);
    this.state = new TeamModel(props.navigation.state.params).data;
  }

  render () {
    return (
      <View>
        <TextInput
          multiline autoGrow
          style={{ height: 80 }}
          value={this.state.notes}
          placeholder="Notes..."
          onChangeText={(value) => this.setState({ notes: value })}/>
            <Button title="Save" onPress={() => {
              teamService.update(this.state.number, this.state)
                .then(() => {
                  refreshTeamDetail();
                  this.props.navigation.goBack();
                });
          }}
        />
      </View>
    );
  }

}
