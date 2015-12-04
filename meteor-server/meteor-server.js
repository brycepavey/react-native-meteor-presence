Tasks = new Mongo.Collection("tasks");
ActiveUsers = new Mongo.Collection("activeUsers");

if(Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish("activeUsers", function() {
        return ActiveUsers.find();
    });

    Meteor.startup(function() {
      ActiveUsers.remove({});
    });

    Meteor.onConnection(function(connection){
      var connID = connection.id;
      var loginDate = new Date();

      ActiveUsers.insert({
        username: connID,
        date: loginDate
      });

      connection.onClose(function(){
        ActiveUsers.remove({
          username: connID
        });
      });
    });
}

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("activeUsers");

  Template.body.helpers({
    activeUsers: function () {
        if (Session.get("hideCompleted")) {
          // If hide completed is checked, filter tasks
          return ActiveUsers.find();
        } else {
          // Otherwise, return all of the tasks
          return ActiveUsers.find();
        }
      },
      hideCompleted: function () {
        return Session.get("hideCompleted");
      },
      incompleteCount: function () {
          return ActiveUsers.find().count();
      }
  });

  Template.task.helpers({
      isOwnder: function(){
          return this.owner === Meteor.userId();
      }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;

      // Insert a task into the collection
      Meteor.call("addTask", text);

      // Clear form
      event.target.text.value = "";
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



    ActiveUsers.update(
        { username: annonId },
        {
          username: user
        }
    );
  },
});
