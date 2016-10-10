function createInitialStage(){
    $("#Window3").html("<div id=\"stage\">"
    + "</div>");
    for(var key in objectOptions){
      var object = objectOptions[key];
      var objectcontainer = "";
      objectcontainer += "<img src=\""+ object.image +"\" "
      + " id=\"" +object.name+"\""
      "\"></img>";
      $("#Window3").appendChild(objectcontainer);
      //place them on the stage where they're
      applyCSS(object);
    }
}

function applyCSS(object){
  var css = object.css.split(/[\n\r]/g);
  for (var item in css){
    var property = item.split(":");
    $("#"+object.name).css(property[0].trim(), property[1].trim());
  }
}
