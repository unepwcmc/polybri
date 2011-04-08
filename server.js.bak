var express = require('express');

var app = express.createServer();

// Configuration

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


// Routes

app.get('/', function(req, res){
  res.render('edit', {locals: {
    title: 'NowJS + Express Example'
  }});
});

app.get('/index', function(req, res){
  res.render('index', {locals: {
    title: 'All accepted results'
  }});
});

app.listen(9001);


//Node here
var everyone = require("now").initialize(app);

everyone.now.distributeMessage= function(msg) {
  everyone.now.receiveMessage(this.now.name, msg, this.now.color );
}
var clients = 0;
var colors = ["red", "green", "blue", "purple", "lime"];
everyone.now.giveMeAColor= function(){
  this.now.color = colors[clients++];
}

function rand(n){
  return(Math.floor(Math.random()*n+1));
}
