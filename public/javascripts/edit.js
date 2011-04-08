$(document).ready(function(){

  //Chat stuff
   now.receiveMessage = function(name, message, color){
     $("#chat").append("<br><span style='color: "+color+"'>" + name + "</span>: " + message);
   }
   $("#send").click(function(){
     var msg = $("#text-input").val();
     if( msg != '') {
       now.distributeMessage(msg);
       $("#text-input").val('');
     }
   });

  //Polygon stuff
  now.receivePolygon = function(name, GeoJson){

  };

});

var poly;
var markers = [];
var path = new google.maps.MVCArray;

function startPolygon() {
  poly = new google.maps.Polygon({
    strokeWeight: 2,
    fillColor: '#FF6600',
    strokeColor: '#FF6600'
  });
  poly.setMap(map);
  poly.setPaths(new google.maps.MVCArray([path]));

  google.maps.event.addListener(map, 'click', addPoint);
}

function submitPolygon() {
  $('#done').addClass('loading');
  if (MAX_POLYGON_AREA_KM2 > 0) {
    var area = google.maps.geometry.spherical.computeArea(poly.getPath());
    if (area > MAX_POLYGON_AREA_KM2 * 1000 * 1000) {
      alert("Your polygon is too large (" + Math.round(area / 1000 / 1000) + " km2), please limit its area to " + MAX_POLYGON_AREA_KM2 + " km2.");
      $('#done').removeClass('loading');
      return false;
    }
  }

  var dataObj = {"geometry": polys2geoJson([poly])};
  var type = submission_target["http_verb"] || "PUT";
  var url = submission_target["url"];
  $.ajax({
    type: type,
    url: url,
    data: dataObj,
    cache: false,
    dataType: 'json',
    success: function(result) {
      if (typeof(result.id) != "undefined") {
        window.location = '/polygons';
      } else {
        alert(result.error || "Unknown error while uploading polygon.\nIs the polygon too big?\nOr perhaps its edges intersect each-other?");
      }
      $('#done').removeClass('loading');
    },
    error:function (xhr, ajaxOptions, thrownError) {
      alert(thrownError || "Error submitting data.");
      $('#done').removeClass('loading');
    }
  });
}

/*adapted from Lifeweb's calculator.js*/
function polys2geoJson(polygons) {
  var polys = [];
  for (var i = 0; i < polygons.length; i++) {
    var pol = polygons[i];
    var polyArray = [];
    var pathArray = [];
    var numPoints = path.length;
    for (var i = 0; i < numPoints; i++) {
      var lat = path.getAt(i).lat();
      var lng = path.getAt(i).lng();
      pathArray.push([lng,lat]);
    }

    var first = path.getAt(0);
    pathArray.push([first.lng(),first.lat()]); //google maps will automatically close the polygon; PostGIS requires the last coordinate to be repeated
    polyArray.push(pathArray);
    polys.push(polyArray);
  }

  return $.toJSON({
    "type":"MultiPolygon",
    "coordinates":polys
  });
}
