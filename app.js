/**
 * Module dependencies.
 */

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
	// need to check no. vertices before firing off carbon analysis
  everyone.now.receivePolygon(this.now.name, GeoJson, this.now.color, oldskoolCarbon(GeoJson));
}

var clients = 0;
var colors = ["green", "blue", "purple", "lime", "red", "gray", "silver", "darkred", "darkgreen", "darkblue"];
everyone.connected(function(){
  this.now.color = colors[(clients%10)];
  this.now.name = "Cool Guest"+clients;
  clients++;
  this.now.sayMyStuff(this.now.name, this.now.color);
});


var pg = require('pg');
var conString = "pg://postgres:postgres@localhost:5432/polybri";

everyone.now.savepolygon=function(geoJson)
{
    savePolygonasGeoJson(this.now.name, geoJson);
}

everyone.now.retrievePolygons= function() {
    retrieveGeojsonPolygons(function(result){
        var features = [];
        for (var i = 0; i < result.rows.length; i++)
        {
            features.push('{"geometry":' + result.rows[i].geojson + '}');
        }
        everyone.now.receiveAllPolygons(features);
    });
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
  var query = "INSERT INTO polygons (the_geom) VALUES (ST_GeomFromText('" + wkt + "'))" ;

  pg.connect(conString, function(err, client) {
    client.query(query, function(err, result) {
        if(err) {
         console.log(err);
        }
    });
  });
}

function savePolygonasGeoJson(name, geoJson)
{

  var query = "INSERT INTO polygons (name1, name2, geoJson) VALUES ('" + name + "','" + 'other person' + "','" + geoJson + "')" ;

  pg.connect(conString, function(err, client) {
    client.query(query, function(err, result) {
        if(err) {
         console.log(err);
        }
    });
  });
}

// function getCarbonHeight(geojson){
//   var dataObj = {"area":'10000',"geojson": geojson}; 
// 
//   $.ajax({
//     type: 'POST',
//     url: "http://ec2-174-129-149-237.compute-1.amazonaws.com/carbon",	
//     //url: "/carbon",
//     data: dataObj,
//     cache: false,
//     dataType: 'json',
//     success: function(result){
//       return 'success arse'
//       // return $().number_format(Math.floor(result.sum_Band1), {numberOfDecimals:0, decimalSeparator: '.', thousandSeparator: ' '});
//       },
//       error:function (xhr, ajaxOptions, thrownError){
//         return 'arse'
//       }
// });
// }

function oldskoolCarbon(geojson){
	console.log(geojson);
	var dataObj = JSON.stringify({"area":'10000',"geojson": geojson}); 
	var self = this
	
	var connection = http.createClient(4567, 'ec2-174-129-149-237.compute-1.amazonaws.com')
	var request = connection.request("POST", "/carbon", { 
	   'host':'ec2-174-129-149-237.compute-1.amazonaws.com', 
	   "User-Agent": "NodeJS HTTP Client", 
	   'Content-Length': dataObj.length, 
	 }); 
	
	request.addListener('response', function(response){
	    var data = '';

	    response.addListener('data', function(chunk){ 
	        data += chunk; 
	    });
	    response.addListener('end', function(){
	        console.log(data);
	    });
	});

	request.write(dataObj);
	request.end();

}
