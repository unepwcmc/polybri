var fs = require('fs'),
    http = require('http');
var server = http.createServer(function(req, response){
  fs.readFile(__dirname+'/public/edit.html', function(err, data){
    response.writeHead(200, {'Content-Type':'text/html'}); 
    response.write(data);  
    response.end();
  });
});
server.listen(9001);

//Node here
var everyone = require("now").initialize(server);

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
