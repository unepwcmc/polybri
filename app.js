/**
 * Module dependencies.
 */

var jQuery = require('jquery');

var express = require('express');
var http = require('http')
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

app.get('/polygons',function(req, res){
    retrieveGeojsonPolygons(function(result){
        var features = [];
        for (var i = 0; i < result.rows.length; i++)
        {
            features.push({"type":"Feature","geometry": jQuery.parseJSON(result.rows[i].geojson)});
        }
        res.contentType('json');
        res.send({"type":"FeatureCollection","features": features});
    });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(80);
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
	// need to check no. vertices before firing off carbon analysis
  everyone.now.receivePolygon(this.now.name, GeoJson, oldskoolCarbon(GeoJson));
}

var clients = 0;
var colors = ["green", "blue", "purple", "lime", "red", "gray", "silver", "darkred", "darkgreen", "darkblue"];
everyone.connected(function(){
  this.now.color = colors[(clients%10)];
  clients++;
  this.now.sayMyStuff(this.now.name, this.now.color);
});


var pg = require('pg');
var conString = "pg://postgres:postgres@localhost:5432/polybri";

everyone.now.savepolygon=function(geoJson)
{
    savePolygonasGeoJson(this.now.name, geoJson);
}

function retrieveGeojsonPolygons(callback)
{
  pg.connect(conString, function(err, client) {
    client.query("SELECT name1, name2, geojson from polygons", function(err, result) {
        if(err) {
         console.log(err);
        }
        else
        {
          console.log("number of polygons retrieved: %d",result.rows.length);
          return callback(result);
        }
    });
  });
}


function retrievePolygon(callback)
{
  var query = "SELECT ST_AsText(the_geom) as geometry FROM polygons";

  pg.connect(conString, function(err, client) {
    client.query(query, function(err, result) {
        if(err) {
         console.log(err);
        }
        else
        {
          return callback(result.rows[0].geometry);
        }
    });
  });
}

function savePolygon(wkt)
{
  var query = "INSERT INTO polygons (the_geom) VALUES (ST_GeomFromText($1))" ;

  pg.connect(conString, function(err, client) {
    client.query({text:query, values:[wkt]}, function(err, result) {
        if(err) {
         console.log(err);
        }
    });
  });
}

function savePolygonasGeoJson(name, geoJson)
{
  var query = "INSERT INTO polygons (name1, name2, geoJson) VALUES ($1,'other person',$2)" ;

  pg.connect(conString, function(err, client) {
  client.query({
    text: query,
    values: [name, geoJson]
  }, function(err, result) {
        if(err) {
         console.log(err);
        }
    });
  });
}



function oldskoolCarbon(geojson){
	console.log(geojson);
	var dataObj = JSON.stringify({"area":'10000',"geojson": geojson}); 
	
	var connection = http.createClient(4567, 'ec2-174-129-149-237.compute-1.amazonaws.com')
	var request = connection.request("POST", "/carbon", { 
	   'host':'ec2-174-129-149-237.compute-1.amazonaws.com', 
	   "User-Agent": "NodeJS HTTP Client", 
	   'Content-Length': dataObj.length 
	 }); 
        console.log("sending request to " + 
                        request.url + ", headers " +
                        request.headers + ", method " +
                        request.method
                        );
	
	request.addListener('response', function(response){
            console.log("received response: ");
	    var data = '';

	    response.addListener('data', function(chunk){ 
	        console.log("received data chunk: " + data);
	        data += chunk; 
	    });
	    response.addListener('end', function(){
	        console.log(data);
	    });
	});

	//request.write(dataObj);
	request.end();
}
