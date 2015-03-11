Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient){

  TaskService = {
    addTask: function(task){
      return Tasks.insert(task);
    },
    getTask: function(taskId){
      return Tasks.findOne(taskId);
    },
    getCompletedTasks: function(){
      return Tasks.find({status:'completed'});
    },
    getFailedTasks: function(){
      return Tasks.find({status:'failed'});
    },
    getOriginalDuration: function(taskId){
      return moment.duration((TaskService.getTask(taskId).originalDuration));
    },
    getOriginalDurationInSeconds: function(taskId){
      return TaskService.getOriginalDuration(taskId).as('seconds');
    },
    setTaskStatus: function(taskId, status){
      Tasks.update(taskId, {$set:{status: status}});
    },
    removeTask: function(taskId){
      Tasks.remove(taskId);
    },
    setup: function(taskId){
      var duration = TaskService.getOriginalDuration(taskId);

      Session.set('currentTaskId', taskId);
      Session.set('currentHour', duration.hours());
      Session.set('currentMinute', duration.minutes());
      Session.set('currentSecond', duration.seconds());
    }
  };

   Template.task.rendered = function(){
      if(!!Session.get('currentTaskId')){
        $('.start-button').show();
      }
    };

  Template.task.helpers({
    currentTask: function(){
      return !!Session.get('currentTaskId');
    },
    getName: function(){
       return this.action || "Name the task";
    },
    currentHour: function(){
       var hour = Session.get("currentHour");
       return hour < 10 ? "0" + hour : hour;
    },
    currentMinute: function(){
       var minute = Session.get("currentMinute");
       return minute < 10 ? "0" + minute : minute;
    },
    currentSecond: function(){
       var second = Session.get("currentSecond");
       return second < 10 ? "0" + second : second;
    },
    hourClass: function(){
      return (Session.get('currentHour') <= 0) ? "" : "active";
    },
    minuteClass: function(){
      return ((Session.get('currentMinute') <= 0) && (Session.get('currentHour') <= 0)) ? "" : "active";
    },
    secondClass: function(){
      return ((Session.get('currentSecond') <= 0) && (Session.get('currentMinute') <= 0) && (Session.get('currentHour') <= 0)) ? "" : "active";
    }
  });

  Template.task.events({
    'click .back-button': function(e){
      Session.set('done', true);
      TaskService.setTaskStatus(this._id, 'failed');
      e.preventDefault();
      changeFavicon(Meteor.absoluteUrl('images/no-time.gif?v=2'));
      Router.go('/');
    },
    'click .task__title': function(e){
      var title = e.target;

      if (Session.equals('currentTaskId', undefined)){
        title.contentEditable = true;
      }
    },
    'click .task__time': function(e){
      var time = e.target;
      time.contentEditable = true;

      if (time.textContent === "Set the time"){
        time.textContent = "00:01:00";
      }

      $('.start-button').show();
    },
    'click .start-button': function(e){
      var self = this.action ? this : TaskService.getTask(Session.get("currentTaskId")),
          before,
          currentDuration,
          originalDurationInSeconds,
          newClass,
          newTask,
          newTaskId,
          timer,
          newDuration,
          newDurationInSeconds;

      e.preventDefault();

      //Clicking the done button
      if ($('.start-button').hasClass('done-button')){
        Session.set('done', true);        
        TaskService.setTaskStatus(self._id, 'completed');
        changeFavicon(Meteor.absoluteUrl('images/no-time.gif?v=2'));
        Router.go('/');
      }
      else{
        //They've clicked the start button - start the timer

        //Style changes - get task ready to be done
        $('body').addClass('good-time');
        $('.start-button').addClass('done-button');
        $('.start-button__text').text("Done");
        changeFavicon(Meteor.absoluteUrl('images/good-time.gif?v=2'));

        Session.set('done', false);

        if (Session.equals('currentTaskId', undefined)){

          newTask = {action:$('.task__title').text().trim(),
                     status:"failed",
                     originalDuration:$('.task__time').text(),
                     createdAt:new Date()};

          newTaskId = TaskService.addTask(newTask);
          TaskService.setup(newTaskId);
          self = TaskService.getTask(newTaskId);
        }

        originalDurationInSeconds = TaskService.getOriginalDurationInSeconds(self._id);

        currentDuration = moment.duration({
          hours: Session.get('currentHour'),
          minutes: Session.get('currentMinute'),
          seconds: Session.get('currentSecond')
        });

        before = new Date();
        
        timer = Meteor.setInterval(function(){
          var now = new Date();
          var elapsedTime = (now.getTime() - before.getTime());

          //Recover the motion lost while tab inactive.
          var interval = Math.floor(elapsedTime/1000);

          before = new Date();

          newDuration = currentDuration.subtract(interval, 's');
          newDurationInSeconds = newDuration.as('seconds');

          if (newDurationInSeconds > -1 && !Session.equals('done', true)){
            Session.set("currentHour", newDuration.hours());
            Session.set("currentMinute", newDuration.minutes());
            Session.set("currentSecond", newDuration.seconds());

            if(newDurationInSeconds <= (originalDurationInSeconds / 2)){
              newClass = 'medium-time';

              $('body').removeClass('good-time');
              $('body').addClass(newClass);

              changeFavicon(Meteor.absoluteUrl('images/' + newClass + '.gif?v=2'));
            }
            if(newDurationInSeconds <= (originalDurationInSeconds * 0.1)){
              newClass = 'bad-time';

              $('body').removeClass('medium-time');
              $('body').addClass(newClass);

              changeFavicon(Meteor.absoluteUrl('images/' + newClass + '.gif?v=2'));
            }
          }          
          else{
            Meteor.clearInterval(timer);
            if(!Session.equals('done', true)){
              TaskService.setTaskStatus(self._id, 'failed');
              Meteor.setTimeout(function(){
                changeFavicon(Meteor.absoluteUrl('images/no-time.gif?v=2'));
                Router.go('/');
              }, 1000);
            }
          }
        }, 1000);
        
      }      
    }
  });
  
}

