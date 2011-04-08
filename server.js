var fs = require('fs');
var server = require('http').createServer(function(req, response){
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
  everyone.now.receiveMessage(this.now.name, msg);
}
