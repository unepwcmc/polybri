//Put your javascriptzzz here
$(document).ready(function(){
  
  //Chat code
  now.name = prompt("What's your name?", "");  
  now.receiveMessage = function(name, message){
    $("#chat").append("<br>" + name + ": " + message);
  }
  
  $("#send-button").click(function(){
    now.distributeMessage($("#text-input").val());
    $("#text-input").val("");
  });
  
});
