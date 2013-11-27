LOCAL_SC = {
  clientID : "aa5c695a840b746033696f1739ec7adc",
  redirectURI : "http://localhost:3000/_oauth/soundcloud?close"
};
DEPLOYED_SC = {
  clientID : "e42173a435159aca42ca9fe01fc40bc4",
  redirectURI : "http://luper.meteor.com/_oauth/soundcloud?close"
};

SC_CREDS = LOCAL_SC;

Data = {
  Sequences : new Meteor.Collection("Sequences"),
  newSequence : function() {
    return {
      title : "Untitled"
    };
  },
  getActiveSequence : function() {
    return Data.Sequences.findOne(State.getActiveSequenceId());
  },

  Tracks : new Meteor.Collection("Tracks"),
  newTrack : function(sequenceId) {
    return {
      parentSequenceId : sequenceId
    };
  },

  Clips : new Meteor.Collection("Clips"),
  newClip : function(trackId) {
    return {
      parentTrackId : trackId,
      leftPx : 0,
      widthPx : 200
    };
  },
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

  if(document.location.href.indexOf("meteor") != -1) SC_CREDS = DEPLOYED_SC;

  Meteor.startup(function() {
    Session.set('recording', false);
    Session.set('recorderStatusText', "Not Recording");
  });

  Recorder = {
    recordNewClip : function() {
      //SC.connect(function() { // maybe don't need this?
      if(Soundcloud.ready()) {
        Session.set('recording', true);
        Session.set('recorderStatusText', "Please Wait...");
        SC.record({
          start: function() {
            window.setTimeout(function() {
              SC.recordStop();
              SC.recordUpload({
                track: { title: 'Luper Clip' }
              });
            }, 5000);
          }
        });
      }
      //});
    },
    stopRecording : function() {
      SC.recordStop();
      Session.set('recording', false);
      Session.set('recorderStatusText', "Uploading Your Audio...");
      SC.recordUpload({
        track: { title: 'Clip Recorded in Luper' }
      });
    }
  };

  /////////  BODY

  Template.body.githubURL = "http://github.com/mturley/annoying";
  Template.body.loggedIn = State.loggedIn;
  Template.body.hasActiveSequence = function() {
    return State.getActiveSequenceId() != null;
  };
  Template.body.activeSequenceId = State.getActiveSequenceId;

  Template.body.events({
    'click .btn.create-sequence' : function() {
      console.log("Clicked!");
      var sequenceId = Data.Sequences.insert(Data.newSequence());
      State.setActiveSequenceId(sequenceId);
    }
  });

  /////////  EDITOR

  Template.editor.activeSequenceId = State.getActiveSequenceId;
  Template.editor.recording = function() {
    return Session.get('recording');
  };
  Template.editor.recorderStatus = function() {
    return Session.get('recorderStatusText');
  };
  Template.editor.tracks = function() {
    return Data.Tracks.find({ parentSequenceId : State.getActiveSequenceId() });
  };
  Template.editor.clips = function() {
    var parentTrack = this;
    return Data.Clips.find({ parentTrackId : parentTrack._id });
  };

  Template.editor.events({
    'click .btn.start-recording' : function() {
      Recorder.recordNewClip();
    },
    'click .btn.stop-recording' : function() {
      Recorder.stopRecording();
    },
    'click .btn.add-track' : function() {
      Data.Tracks.insert(Data.newTrack(State.getActiveSequenceId()));
    },
    'click .btn.add-clip' : function() {
      var parentTrack = this;
      Data.Clips.insert(Data.newClip(parentTrack._id));
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
