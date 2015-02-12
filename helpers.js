UI.registerHelper('formatCreatedAt', function(){
      return moment(this.createdAt).format('D MMM');      
});