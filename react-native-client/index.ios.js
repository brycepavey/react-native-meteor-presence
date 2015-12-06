/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  Image,
  ListView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
} = React;

var _ = require('lodash');
var DDPClient = require("ddp-client");
var username = '';
var ddpClient;

var reactNativeClient = React.createClass({
  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => !_.isEqual(row1, row2),
      }),
      loaded: false,
    };
  },

  componentDidMount: function() {
    ddpClient = new DDPClient({url: 'ws://localhost:3000/websocket'});

    ddpClient.connect(() => ddpClient.subscribe('annonUsers'));

    // observe the lists collection
    var observer = ddpClient.observe("annonUsers");
    observer.added = () => this.updateRows(_.cloneDeep(_.values(ddpClient.collections.annonUsers)));
    observer.changed = () => this.updateRows(_.cloneDeep(_.values(ddpClient.collections.annonUsers)));
    observer.removed = () => this.updateRows(_.cloneDeep(_.values(ddpClient.collections.annonUsers)));
  },

  updateRows: function(rows) {
    this.setState({
     dataSource: this.state.dataSource.cloneWithRows(rows),
     loaded: true,
   });
  },

  render: function() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }

    return (
      <View style={styles.container}>

        <Text style={styles.loginLabels}>
          Username
        </Text>
        <TextInput
          style={styles.loginEntry}
          placeholder="Enter a username"
          onChangeText={(text) => this.logUsername({text})}
          value = {username}
        />
        <TouchableHighlight onPress={this.loginUser}>
          <Text style={styles.loginButton}>
            Login
          </Text>
        </TouchableHighlight>
        <View>
          <Text style={styles.activeUsersHeader}>
            Currently Active Users
          </Text>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderList}
          style={styles.listView}
        />
      </View>
    );
  },

  logUsername: function(text) {
    this.username = text;


    console.log(text);
    console.log(this.username.text);
  },

  loginUser: function() {
    ddpClient.call('addUser', [this.username.text], function(err, result){
    })
  },

  renderLoadingView: function() {
    return (
      <View style={styles.container}>
        <Text>
          Loading lists...
        </Text>
      </View>
    );
  },

  renderList: function(list) {
    return (
      <View style={styles.flowRight}>
        <Text style={styles.name}>{list.username}</Text>
        <Text style={styles.name}>{list.date}</Text>
      </View>
    );
  },
});

var styles = StyleSheet.create({
  activeUsersHeader: {
    flex: 1,
    alignSelf: 'center',
    fontSize: 20,
    paddingTop: 100,
    paddingBottom: 20
  },
  container: {
    padding: 20,
    marginTop: 65,
  },
  name: {
    flex: 5,
    fontSize: 14,
  },
  flowRight: {
    flexDirection: 'row',
    alignSelf: 'stretch'
  },
  incompleteCount: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    color: '#2196F3',
  },
  listView: {
    paddingTop: 2,
    backgroundColor: 'white',
  },
  loginButton: {
    textAlign: 'center',
    flex: 5,
  },
  loginLabels: {
    flex: 1,
    textAlign: 'left'
  },
  loginEntry: {
    height: 30,
    borderColor: 'gray',
    borderWidth: 1,
    flex: 5,
    marginBottom: 20
  }
});

AppRegistry.registerComponent('reactNativeClient', () => reactNativeClient);
