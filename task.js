Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient){
  Template.task.rendered = function(){
      if(!!Session.get('currentTaskId')){
        $('.start-button').show();
      }
    }

  Template.task.helpers({
    taskName: function(){
      var name = "Name the task";

      Tracker.autorun(function() {
        if(!!Session.get('currentTaskId')){
          name = this.action;
        }
      });

       return name;
    },
    taskTime: function(){
      var time = "Set the time";
      if(!!Session.get('currentTaskId')){
        time = this.originalDuration;
      }
       return time;
    }
  });

  Template.task.events({
    'click .back-button': function(e){
      Session.set('done', true);
      e.preventDefault();
      Router.go('/');
    },
    'click .task__title': function(e){
      var title = e.target;
      title.contentEditable = true;
    },
    'click .task__time': function(e){
      var time = e.target;
      time.contentEditable = true;

      if (time.textContent === "Set the time"){
        time.textContent = "";
        $(time).append(formatCurrentDuration(moment.duration("00:01:00")));
      }

      $('.start-button').show();
    },
    'click .start-button': function(e){
      var button,
          action,
          currentDuration,
          originalDurationInSeconds,
          task,
          timer,
          time,
          newDuration,
          newDurationInSeconds;

      e.preventDefault();
      button = e.target;

      if ($('.start-button').hasClass('done-button')){
        Session.set('done', true);        
        Tasks.update(Session.get('currentTaskId'), {$set:{status:'completed'}});
        Router.go('/');
      }

      else{
        //Style changes
        $('body').addClass('good-time');
        $('.start-button').addClass('done-button');
        $('.start-button__text').text("Done");

        Session.set('done', false);

        if (Session.equals('currentTaskId', undefined)){

          //Add the task
          action = $('.task__title').text().trim();
          currentDuration = $('.task__time').text();          
          task = Tasks.insert({action:action,
                       status:"failed",
                       originalDuration:currentDuration,
                       createdAt:new Date()
                     });

          originalDurationInSeconds = moment.duration(Tasks.findOne(task).originalDuration).seconds();
          Session.set('currentTaskId', task);
        }
        else{
          originalDurationInSeconds = moment.duration(Tasks.findOne(Session.get('currentTaskId')).originalDuration).seconds();
        }

        currentDuration = moment.duration($('.task__time').text());
        
        timer = Meteor.setInterval(function(){

          newDuration = currentDuration.subtract(1, 's');
          newDurationInSeconds = newDuration.seconds();

          if (newDurationInSeconds !== -1 && !Session.equals('done', true)){
            $('.task__time').empty();
            $('.task__time').append(formatCurrentDuration(newDuration));

            if(newDurationInSeconds <= (originalDurationInSeconds / 2)){
              $('body').removeClass('good-time');
              $('body').addClass('medium-time');
            }
            if(newDurationInSeconds <= (originalDurationInSeconds * 0.1)){
              $('body').removeClass('medium-time');
              $('body').addClass('bad-time');
            }
          }          
          else{
            Meteor.clearInterval(timer);
            if(!Session.equals('done', true))
              Meteor.setTimeout(function(){
                Router.go('/');
              }, 1000)
          }
        }, 1000);
        
      }      
    }
  });
  
}

