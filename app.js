
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
var last_speaker = "";
everyone.now.distributeMessage= function(msg) {
  var sameWriter = (last_speaker == this.now.name);
  last_speaker = this.now.name;
  everyone.now.receiveMessage(this.now.name, msg, this.now.color, sameWriter);
}

everyone.now.distributePolygon= function(GeoJson) {
  everyone.now.receivePolygon(this.now.name, GeoJson );
}

var clients = 0;
var colors = ["green", "blue", "purple", "lime", "red"];
everyone.connected(function(){
  this.now.color = colors[clients];
  this.now.name = "Cool Guest"+clients;
  clients++;
});
