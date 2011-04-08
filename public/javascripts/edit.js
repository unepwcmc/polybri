$(document).ready(function(){

  //Chat stuff
  now.receiveMessage = function(name, message, color, sameWriter){
     if(!sameWriter){
       $("#chat").append("<span style='color: "+color+"'>" + name + "</span>: " + message+"<br />");
     }
     else{
       $("#chat").append(message+"<br />");
     }
   }
   $("#send").click(function(){
     if( $("#text-input").val() != ""){
       now.distributeMessage($("#text-input").val());
       $("#text-input").val("");
     }
   });
  //Polygon stuff
  now.receivePolygon = function(name, GeoJson){
  };
});
  
