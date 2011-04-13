var map;
var polygon = undefined;
var all_paths = [];
var all_markers = [];

$(document).ready(function(){
  $("#send").click(sendMessage);

  $('#text-input').keyup(function(e) {
    if(e.keyCode == 13) {
     sendMessage();
    }
  });

  $('#zoom_in').click(function() {
    map.setZoom(map.getZoom() + 1);
  });
  $('#zoom_out').click(function() {
    map.setZoom(map.getZoom() - 1);
  });


});

now.sayMyStuff= function(name, color){
  now.name = name
  now.color = color
  initPolygon();
}
// After connected to the server, let's init the map and this user's polygon.
now.ready(function() {
  var mapOptions = {
    zoom: 2,
    disableDefaultUI: true,
    scrollwheel:true,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  google.maps.event.addListener(map, 'click', addPoint);
  // Map won't load until centered or bounded.
  map.setCenter(new google.maps.LatLng(0,0));
});

//Chat stuff
now.receiveMessage = function(name, message, color, sameWriter){
  if(!sameWriter)
    $("#chat").append("<span style='color: "+color+"'>" + name + "</span>: ");
  $("#chat").append(escape(message)+"<br />");
}

sendMessage = function(){
    var msg = $("#text-input").val();
    if( msg != '') {
      now.distributeMessage(msg);
      $("#text-input").val('');
      $("#text-input").focus();
    }
  }

//Polygon stuff
now.receivePolygon = function(name, GeoJson, carbon){
  if(name != now.name){
    initPolygon();
    var zecoordinates = jQuery.parseJSON(GeoJson).coordinates;
    for (var i = 0, I = zecoordinates[0][0].length; i < I; ++i){
      addPointUsingLatLng(new google.maps.LatLng(zecoordinates[0][0][i][1],zecoordinates[0][0][i][0]), false);
    }
  }
};

function agree(){
  now.savepolygon(getGeojson());
}
function initPolygon() {
  if( typeof(polygon) == 'undefined') {
    polygon = new google.maps.Polygon({
      strokeWeight: 2,
      fillColor: '#FF6600',
      strokeColor: '#FF6600'
    });
    all_paths = new google.maps.MVCArray;
    all_markers =[];
    polygon.setMap(map);
    polygon.setPaths(new google.maps.MVCArray([all_paths]));
  } else {
    for(var i = all_paths.length-1; i >= 0; i--){
      all_paths.removeAt(i);
      var zemarker = all_markers.pop();
      zemarker.setMap(null);
    }
  }
}

var vertexIcon = new google.maps.MarkerImage('/images/vertex.png',
        new google.maps.Size(12, 12), // The origin for this image
        new google.maps.Point(0, 0), // The anchor for this image
        new google.maps.Point(6, 6)
        );

function addPoint(event) {
  addPointUsingLatLng(event.latLng)
}
function addPointUsingLatLng(latLng, propagate) {
  if (typeof(propagate) === 'undefined')
    propagate = true
  all_paths.insertAt(all_paths.length,latLng);

  var marker = new google.maps.Marker({
    position: latLng,
    map: map,
    draggable: true,
    icon: vertexIcon
  });
  all_markers.push(marker);
  marker.setTitle("#" + all_paths.length);
  if (propagate)
    propagateChanges();

  //Can only edit owns' vertices
  // Remove on click.
  google.maps.event.addListener(marker, 'click', function() {
    marker.setMap(null);
    for (var i = 0, I = all_markers.length; i < I && all_markers[i] != marker; ++i)
      ;
    all_markers.splice(i, 1);
    all_paths.removeAt(i);
    propagateChanges();
  });

  google.maps.event.addListener(marker, 'dragend', function() {
    for (var i = 0, I = all_markers.length; i < I && all_markers[i] != marker; ++i)
      ;
      all_paths.setAt(i, marker.getPosition());
      propagateChanges();
  });
}

function propagateChanges() {
  var geojson = getGeojson();
  now.distributePolygon(geojson);
}

function getGeojson(){
  /*adapted from Lifeweb's calculator.js*/
  var pathArray = [];
  var my_path = all_paths;
  var numPoints = my_path.length;
  for (var i = 0; i < numPoints; i++) {
    var point = my_path.getAt(i);
    var lat = point.lat();
    var lng = point.lng();
    pathArray.push([lng,lat]);
  }
    var geojson = $.toJSON({
      "type":"MultiPolygon",
      "coordinates":[[pathArray]]
    });
    return geojson;
}
