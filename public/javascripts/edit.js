
$(document).ready(function(){

   now.name = prompt("What's your name?", "");  
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
   now.giveMeAColor();    
});
  
