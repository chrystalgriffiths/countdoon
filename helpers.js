UI.registerHelper('formatCreatedAt', function(){
      return moment(this.createdAt).format('D MMM');      
});

getCurrentTask = function(){
  return Tasks.findOne(Session.get('currentTaskId'));
};

setStatus = function(status){
  Tasks.update(Session.get('currentTaskId'), {$set:{status: status}});
};