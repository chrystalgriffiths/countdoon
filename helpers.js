UI.registerHelper('formatCreatedAt', function(){
      return moment(this.createdAt).format('D MMM');      
});

formatCurrentDuration = function(duration){

  var hourClass, minuteClass, secondClass, durationHours, durationMinutes, durationSeconds;
  
  hourClass = duration.hours() === 0 ? 'hour' : 'hour active';
  minuteClass = duration.minutes() === 0 && (hourClass.indexOf('active') === -1) ? 'minute' : 'minute active';
  secondClass = duration.seconds() === 0 && (minuteClass.indexOf('active') === -1) ? 'second' : 'second active';

  durationHours = duration.hours() < 10 ? "0" + duration.hours() : duration.hours();
  durationMinutes = duration.minutes() < 10 ? "0" + duration.minutes() : duration.minutes();
  durationSeconds = duration.seconds() < 10 ? "0" + duration.seconds() : duration.seconds();

  return "<span class= '" + hourClass + "'>" + durationHours + ":</span><span class= '" + minuteClass + "'>" + durationMinutes + ":</span><span class= '" + secondClass + "'>" + durationSeconds + "</span>"  
}

getCurrentTask = function(){
  return Tasks.findOne(Session.get('currentTaskId'));
}

setStatus = function(status){
  Tasks.update(Session.get('currentTaskId'), {$set:{status: status}});
}