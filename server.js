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

app.listen(9001);


//Node here
var everyone = require("now").initialize(app);

everyone.now.distributeMessage= function(msg) {
  everyone.now.receiveMessage(this.now.name, msg, ["red", "blue"][rand(2)-1] );
}

function rand(n){
  return(Math.floor(Math.random()*n+1));
}
