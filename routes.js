Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('main');
  $('body').removeClass('good-time medium-time bad-time');
  Session.set('currentTaskId', undefined);
});

Router.route('/new', function () {
  this.render('task');
});

Router.route('/task/:_id', function () {  
  this.render('task', {
    data: function () {
      var currentTask = Tasks.findOne({_id: this.params._id});
      setUpTask(currentTask._id);
      return currentTask;
    }
  });  
}, {name: 'task.show'});