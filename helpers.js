UI.registerHelper('formatCreatedAt', function(){
      return moment(this.createdAt).format('D MMM');      
});

//Based on https://gist.github.com/mathiasbynens/428626

changeFavicon = function(src) {
   var link = document.createElement('link'),
       oldLink = document.getElementById('dynamic-favicon');

   link.id = 'dynamic-favicon';
   link.rel = 'shortcut icon';
   link.href = src;

   if (oldLink) {
    document.head.removeChild(oldLink);
   }

   document.head.appendChild(link);
};