UI.registerHelper('formatCreatedAt', function(){
      return moment(this.createdAt).format('D MMM');      
});

getCurrentTask = function(){
  return Tasks.findOne(Session.get('currentTaskId'));
};

setStatus = function(status){
  Tasks.update(Session.get('currentTaskId'), {$set:{status: status}});
};

setUpTask = function(currentTaskId){
  Session.set('currentTaskId', currentTaskId);
  var currentTask = getCurrentTask();

  duration = moment.duration((currentTask.originalDuration));
  Session.set('currentHour', duration.hours());
  Session.set('currentMinute', duration.minutes());
  Session.set('currentSecond', duration.seconds());
};