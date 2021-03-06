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
      var task = this.params._id;
      TaskService.setup(task);
      return TaskService.getTask(task);
    }
  });  
}, {name: 'task.show'});