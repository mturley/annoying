// TODO put collections here (equiv to tables)

Data = {
  Sequences : new Meteor.Collection("Sequences"),
  newSequence : function() {
    return {
      title : "Untitled"
    };
  },
  getActiveSequence : function() {
    return Data.Sequences.findOne(State.getActiveSequenceId());
  }
};

State = {
  loggedIn : function() {
    return Meteor.user() != null;
  },
  setActiveSequenceId : function(sequenceId) {
    if(!State.loggedIn()) {
      console.warn("Can't set active sequence id, not logged in.");
      return;
    }
    Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile.activeSequenceId":sequenceId}})
  },
  getActiveSequenceId : function() {
    if(State.loggedIn()) return Meteor.user().profile.activeSequenceId;
    console.warn("Can't get active sequence id, not logged in.");
    return null;
  }
};

if (Meteor.isClient) {

  Template.body.githubURL = "http://github.com/mturley/annoying";
  Template.body.loggedIn = State.loggedIn;
  Template.body.hasActiveSequence = function() {
    return State.getActiveSequenceId() != null;
  };
  Template.body.activeSequenceId = State.getActiveSequenceId;

  Template.body.events({
    'click .btn.create-sequence' : function() {
      console.log("Clicked!");
      var sequenceId = Data.Sequences.insert(Data.NewSequence());
      State.setActiveSequenceId(sequenceId);
    }
  })

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
