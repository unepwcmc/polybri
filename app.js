
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express',
    script: 'index'
  });
});

app.get('/edit', function(req, res){
  res.render('edit', {
    title: 'Express',
    script: 'edit'
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(9001);
  console.log("Express server listening on port %d", app.address().port);
}

//Now here
var everyone = require("now").initialize(app);

everyone.now.distributeMessage= function(msg) {
  everyone.now.receiveMessage(this.now.name, msg, this.now.color );
}

var clients = 0;
var colors = ["red", "green", "blue", "purple", "lime"];
var cool_names = ["The Game", "Rick Astley", "Trolololo", "G33K", "1337", "OVER 9000!", "Anon", "Gon", "It's a trap!"]
everyone.connected(function(){
        this.now.color = colors[clients];
        this.now.name = cool_names[rand(cool_names.length)-1];
        clients++;
});
function rand(n){
          return (Math.floor(Math.random()*n + 1));
}
