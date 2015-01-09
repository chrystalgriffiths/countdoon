if (Meteor.isClient) { 

  Template.main.helpers({
    completedTasks: function(){
      return Tasks.find({status:'completed'});
    },
    failedTasks: function(){
      return Tasks.find({status:'failed'});
    }
  });

  Template.main.events({
    'click .new-button': function(e){
      e.preventDefault();
      Router.go('/new');
    },
    'click .task-list__completed__list__task__action, click .task-list__failed__list__task__action': function(e){
      e.preventDefault();
      $(e.target).parent().parent().children().toggleClass('hidden');
    },
    'click .task-list__completed__list__task-other-actions__delete, click .task-list__failed__list__task-other-actions__delete': function(e){
      if (confirm("Are you sure?")){
        e.preventDefault();
        Tasks.remove(this._id);
      }      
    },
    'click .task-list__completed__list__task-other-actions__do-it-again, click .task-list__failed__list__task-other-actions__do-it-again': function(e){
      e.preventDefault();
      Router.go('task.show', {_id: this._id});    
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
