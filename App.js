/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Router from './src/ui/router';
import scheduleTasks from './tasks';

// hook to fire any background tasks that need to schedule themselves
scheduleTasks();

export default class App extends Component {
  render() {
    return <Router/>
  }
}
