Tasks = new Mongo.Collection("tasks");
AnonUsers = new Mongo.Collection("anonUsers");
LoggedInUsers = new Mongo.Collection("loggedInUsers");


if(Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish("anonUsers", function() {
        return AnonUsers.find();
    });

    Meteor.publish("loggedInUsers", function() {
        return LoggedInUsers.find();
    });

    Meteor.startup(function() {
      AnonUsers.remove({});
      LoggedInUsers.remove({})
    });

    Meteor.onConnection(function(connection){
      var connID = connection.id;
      var loginDate = new Date();

      Meteor.call('addAnon', [connID], function(err, result){})

      connection.onClose(function(){
        AnonUsers.remove({
          username: connID
        });

        LoggedInUsers.remove({
          connectionId: connID
        });
      });
    });
}

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("anonUsers");
  Meteor.subscribe("loggedInUsers");

  Template.body.helpers({
    anonUsers: function () {
        if (Session.get("hideCompleted")) {
          // If hide completed is checked, filter tasks
          return AnonUsers.find();
        } else {
          // Otherwise, return all of the tasks
          return AnonUsers.find();
        }
    },
    loggedInUsers: function () {
      return LoggedInUsers.find();
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
        return AnonUsers.find().count() + LoggedInUsers.find().count();
    }
  });


  Template.task.helpers({
      isOwnder: function(){
          return this.owner === Meteor.userId();
      }
  });

  Template.body.events({
    "submit .change-name": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var username = event.target.text.value;

      // Insert user into the Logged In collection
      Meteor.call('addAnon', [username], function(err, result){})

      // // Clear form
      // event.target.text.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
  },
  "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addUser: function (user) {
    var annonId = this.connection.id

    AnonUsers.remove({
      username: annonId
    });

    LoggedInUsers.insert({
      connectionId: annonId,
      username: user,
      date: new Date()
    });
  },
  addAnon: function(id) {
    AnonUsers.insert({
      username: id,
      date: new Date()
    })
  },
});
