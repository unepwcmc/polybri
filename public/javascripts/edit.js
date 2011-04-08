
$(document).ready(function(){
   now.receiveMessage = function(name, message, color){
     $("#chat").append("<br><span style='color: "+color+"'>" + name + "</span>: " + message);
   }
   $("#send").click(function(){
     now.distributeMessage($("#text-input").val());
     $("#text-input").val("");
   });
});
  
