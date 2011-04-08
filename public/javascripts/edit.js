
$(document).ready(function(){

   now.name = prompt("What's your name?", "");  
   now.receiveMessage = function(name, message, color){
     $("#chat").append("<br><span style='color: "+color+"'>" + name + "</span>: " + message);
   }
   $("#send").click(function(){
     now.distributeMessage($("#text-input").val());
     $("#text-input").val("");
   });
   now.giveMeAColor();    
});
  
