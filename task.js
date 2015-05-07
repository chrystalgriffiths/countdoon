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
    'keydown .task__title': function(e){
      var keyCode = e.keyCode;
      if(keyCode === 13 || keyCode === 9){
        e.preventDefault();
        $('.task__time').click().focus();
      }
    },
    'click .task__time': function(e){
      var time = e.target;
      time.contentEditable = true;

      if (time.textContent === "Set the time"){
        $('.task__time').empty().append("<span class ='timespan' id='lh'>0</span> \
                                          <span class='timespan' id='rh'>0</span> \
                                          <span>:</span> \
                                          <span class='timespan' id='lm'>0</span> \
                                          <span class='timespan' id='rm'>1</span> \
                                          <span>:</span> \
                                          <span class='timespan' id='ls'>0</span> \
                                          <span class='timespan' id='rs'>0</span>");
      }

      $('.start-button').show();
    },
    'click .task__time .timespan': function(e){
      var timespan = e.target;
      $(timespan).siblings().removeClass('active');
      $(timespan).addClass('active');
    },
    'keydown .task__time': function(e){
      var self = e.target;
      var keyCode = e.keyCode;
      var character = "";

      e.preventDefault();
      if(keyCode === 13){
        $('.start-button').click();
      }
      else if (keyCode === 9){
        //TODO tab bits
        // $(self).find('span.active')

      }
      else if (!isNaN(character = String.fromCharCode(keyCode))){
        $(self).find('span.active').text(character);
      }
    },
    'click .start-button': function(e){
      var self = this.action ? this : TaskService.getTask(Session.get("currentTaskId")),
          currentDuration,
          intervalWorker,
          originalDurationInSeconds,
          newClass,
          newTask,
          newTaskId,
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
                     originalDuration:$('.task__time').text().replace(/ /g,''),
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

        intervalWorker = new Worker(Meteor.absoluteUrl('javascript/interval.js'));
        
        intervalWorker.onmessage = function(event){

          var interval = event.data;

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
            intervalWorker.terminate();
            if(!Session.equals('done', true)){
              TaskService.setTaskStatus(self._id, 'failed');
              Meteor.setTimeout(function(){
                changeFavicon(Meteor.absoluteUrl('images/no-time.gif?v=2'));
                Router.go('/');
              }, 1000);
            }
          }
        };
      }      
    }
  });
  
}

