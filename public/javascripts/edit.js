
var map;
var polygons = [];
var my_path = new google.maps.MVCArray;
var my_markers = [];

$('#zoom_in').click(function() {
  map.setZoom(map.getZoom() + 1);
});
$('#zoom_out').click(function() {
  map.setZoom(map.getZoom() - 1);
});


  now.sayMyName= function(name){
    now.name = name
  }
  now.sayMyColor= function(color){
    now.color = color
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

    initPolygon(now.name);
    google.maps.event.addListener(map, 'click', addPoint);

    // Map won't load until centered or bounded.
    map.setCenter(new google.maps.LatLng(0,0));
  });

  //Chat stuff
  now.receiveMessage = function(name, message, color, sameWriter){
  if(!sameWriter)
    $("#chat").append("<span style='color: "+color+"'>" + name + "</span>: ");
    $("#chat").append(message+"<br />");
  }

  $("#send").click(function(){
     var msg = $("#text-input").val();
     if( msg != '') {
       now.distributeMessage(msg);
       $("#text-input").val('');
       $("#text-input").focus();
     }
   });

  //Polygon stuff
  now.receivePolygon = function(name, GeoJson){
    if(name != now.name){
      initPolygon(name);
      var zecoordinates = jQuery.parseJSON(GeoJson).coordinates;
      for (var i = 0, I = zecoordinates[0][0].length; i < I; ++i){
        addPointUsingLatLng(new google.maps.LatLng(zecoordinates[0][0][i][1],zecoordinates[0][0][i][0]), false);
      }
    }
  };


function initPolygon(owner) {
  var poly = polygons[owner];
  if( typeof(poly) == 'undefined') {
    poly = new google.maps.Polygon({
      strokeWeight: 2,
      fillColor: '#FF6600',
      strokeColor: '#FF6600'
    });
    poly.setMap(map);
    poly.setPaths(new google.maps.MVCArray([my_path]));
    polygons[owner] = poly;
  } else {
    // TODO: clear poly and path.
  }
}

var vertexIcon = new google.maps.MarkerImage('/images/vertex.png',
        new google.maps.Size(12, 12), // The origin for this image
        new google.maps.Point(0, 0), // The anchor for this image
        new google.maps.Point(6, 6)
        );

function addPoint(event) {
  addPointUsingLatLng(event.latLng, true)
}
function addPointUsingLatLng(latLng, propagate) {
  my_path.insertAt(my_path.length,latLng);

  var marker = new google.maps.Marker({
    position: latLng,
    map: map,
    draggable: true,
    icon: vertexIcon
  });
  my_markers.push(marker);
  marker.setTitle("#" + my_path.length);

  if(propagate)
   propagateChanges();

  // Remove on click.
  google.maps.event.addListener(marker, 'click', function() {
    marker.setMap(null);
    for (var i = 0, I = my_markers.length; i < I && my_markers[i] != marker; ++i)
      ;
    my_markers.splice(i, 1);
    my_path.removeAt(i);
    if(propagate)
      propagateChanges();
  });

  google.maps.event.addListener(marker, 'dragend', function() {
    for (var i = 0, I = my_markers.length; i < I && my_markers[i] != marker; ++i)
      ;
      my_path.setAt(i, marker.getPosition());
      if(propagate)
        propagateChanges();
  });
}

function propagateChanges() {
/*adapted from Lifeweb's calculator.js*/
  var pathArray = [];
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
  now.distributePolygon(geojson);
}

