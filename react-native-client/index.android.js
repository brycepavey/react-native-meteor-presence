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
var username ;
var ddpClient;

var reactNativeClient = React.createClass({
  getInitialState: function() {
    return {
      anonDataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => !_.isEqual(row1, row2),
      }),
      loggedInDataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => !_.isEqual(row1, row2),
      }),
      loaded: false,
    };
  },

  componentDidMount: function() {
    ddpClient = new DDPClient({url: 'ws://10.0.3.2:3000/websocket'});

    ddpClient.connect(() =>
      {ddpClient.subscribe('anonUsers'),
      ddpClient.subscribe('loggedInUsers')}
    );

    // observe the users collections
    var anonObserver = ddpClient.observe("anonUsers");
    anonObserver.added = () => this.updateAnonRows(_.cloneDeep(_.values(ddpClient.collections.anonUsers)));
    anonObserver.changed = () => this.updateAnonRows(_.cloneDeep(_.values(ddpClient.collections.anonUsers)));
    anonObserver.removed = () => this.updateAnonRows(_.cloneDeep(_.values(ddpClient.collections.anonUsers)));

    var loggedInObserver = ddpClient.observe("loggedInUsers");
    loggedInObserver.added = () => this.updateLoggedInRows(_.cloneDeep(_.values(ddpClient.collections.loggedInUsers)));
    loggedInObserver.changed = () => this.updateLoggedInRows(_.cloneDeep(_.values(ddpClient.collections.loggedInUsers)));
    loggedInObserver.removed = () => this.updateLoggedInRows(_.cloneDeep(_.values(ddpClient.collections.loggedInUsers)));
  },

  updateAnonRows: function(rows) {
    this.setState({
     anonDataSource: this.state.anonDataSource.cloneWithRows(rows),
     loaded: true,
   });
  },

  updateLoggedInRows: function(rows) {
    this.setState({
     loggedInDataSource: this.state.loggedInDataSource.cloneWithRows(rows),
     loaded: true,
   });
  },

  render: function() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }

    return (
      <View style={styles.container}>
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
            Anon Users
          </Text>
        </View>
        <ListView
          dataSource={this.state.anonDataSource}
          renderRow={this.renderList}
          style={styles.listView}
        />
        <View>
          <Text style={styles.activeUsersHeader}>
            Logged in Users
          </Text>
        </View>
        <ListView
          dataSource={this.state.loggedInDataSource}
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
    textAlign: 'center',
    fontSize: 20,
    marginTop: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    backgroundColor: "#eeeeee"
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
    marginBottom: 20,
    backgroundColor: 'white',
  },
  loginButton: {
    textAlign: 'center',
    flex: 1,
    marginBottom: 20,
    backgroundColor: '#E0EAF1',
    paddingTop: 5,
  },
  loginLabels: {
    flex: 1,
    textAlign: 'left',
    marginBottom: 10,
    fontSize: 17,
    fontWeight: "bold"
  },
  loginEntry: {
    height: 30,
    borderColor: 'gray',
    borderWidth: 1,
    flex: 5,
    marginBottom: 20,
    paddingTop: 0,
    borderRadius: 2,
  }
});

AppRegistry.registerComponent('reactNativeClient', () => reactNativeClient);
