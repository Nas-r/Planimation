
/*
****************      GENERATE INPUT FORM    **********************
*/

/*When Load File is selected from the menu, present the file input field and
ensure the event handler is active*/
function loadFileSelector(){
  $("#inputOptions").html(
    "<br><br><br><input id=\"loadbutton\" type=\"file\">");
    $('#loadbutton').on('change', function(e){
      parseSavedFile(this.files[0]);
    });
}

/*Populate the input selector with all available configurable entities such as
constants, objects, prediucates, actions and types.*/
function createInputSelector() {
  var itemCell = "<td class=\"item\" onclick=\"selectInput(event);\"";
  var output = "";
  output += "<table id=\"inputTable\"><tbody><tr>"
          + "<td class=\"item\" onclick=\"loadFileSelector();\""+">Load Options</td></tr>";

  output +=  "<tr><td class=\"item\" onclick=\"selectInput(event);\" data-type=\"global\""+">Global Options</td></tr>";

  if(types.length>0){
    output += "<tr><td class=\"itemGroup\">Types</td></tr>";
    for(var i=0; i<types.length; i++){
        output += "<tr>" + itemCell + "data-type=\"type\">"
                + types[i] + "</td></tr>";
    }
  }

  if(constants.names.length>0) {
    output += "<tr><td class=\"itemGroup\">Constants</td></tr>";
    for(var i = 0; i<constants.names.length; i++){
      output += "<tr>" + itemCell + "data-type=\"constant\">"
              + constants.names[i] + "</td></tr>";
    }
  }

  if (objects.names.length>0){
    output += "<tr><td class=\"itemGroup\">Objects</td></tr>";
    for(var i = 0; i<objects.names.length; i++){
      output += "<tr>" + itemCell + "data-type=\"object\">"
              + objects.names[i] + "</td></tr>";
    }
  }

  if(predicates.length>0){
    output += "<tr><td class=\"itemGroup\">Predicates</td></tr>";
    for(var i = 0; i<predicates.length; i++){
      output += "<tr>" + itemCell + "data-type=\"predicate\">"
              + predicates[i].name + "</td></tr>";
    }
  }

  output += "</tbody></table>";
  return output;
}

/*Keep track of the currently selected objcet. This facilitates updating the
option's parameters when another is selected so the user doesn't have to trigger
the save/apply function every time they want to record changes.
@constructor
*/
function SelectedInput(name,type){
  this.name = name;
  this.type = type;
}

var selectedInput = new SelectedInput('', '');

/**
 * Return an object stored in an array of objects by it's name.
@param {string} name - name of the object
@param {array} collection - one of the the arrays yielded from the parser's output
*/
function getObjectByName(name, collection) {
  for(var i=0;i<collection.length;i++){
    if(collection[i].name==name) {
      return collection[i];
    }
  }
}

/**This is the function that runs when an item from the list of objects/types
is clicked. It loads the available options into the #inputOptions div*/
function selectInput(e) {
  //get the name of the selected option
  var name = e.target.innerHTML;
  var type = e.target.getAttribute('data-type');
  //update the previously selected option's parameters
  updateInputOptionEntity($("#selectionName").html(),$("#selectionType").html());

  //construct the input form
  var form = "";
  form += "<h1 id=\"selectionType\">" + type + "</h1>";
  form += "<h2 id=\"selectionName\">" + name + "</h2>";
  if(type=="object"||type=="constant"){
    if(objectOptions[name].type!="undefined"){
    form += "<h2 id=\"selectionObjectType\">" + objectOptions[name].type + "</h2>"}

  form+="<p></p>";}
  form += generateInputForm(name, type);

  //insert the input form
  $('#inputOptions').html(form);

  //Populate and activate the preview area if the option is a predicate
  if(type=="predicate"){
    $("#previewHeading").html("Existing Options");
    generatePredicateOptionPreview(name);
    var predicate = getObjectByName(name, predicates);
    var argument = $("#arg1").val();
    var argtype;
    if(types.length==0){
      $("#objectSelector").html(generateObjectSelector(getObjectListFromType()));
    } else {
      for(var i=0;i<predicate.arguments.length;i++){
          if(predicate.arguments[i].name==argument) {
            argtype=predicate.arguments[i].type;
          }
      }
      $("#objectSelector").html(generateObjectSelector(getObjectListFromType(argtype)));
    }
    /*set event handler to populate argument value options based on the first
    argument selected.*/
    $("#arg1").on('change', function(e) {
        argument = this.value;
        if(types.length==0){
          $("#objectSelector").html(generateObjectSelector(getObjectListFromType()));
        } else {
          for(var i=0;i<predicate.arguments.length;i++){
              if(predicate.arguments[i].name==argument) {
                argtype=predicate.arguments[i].type;
              }
          }
          $("#objectSelector").html(generateObjectSelector(getObjectListFromType(argtype)));
        }
    });
  } else {
    //TODO
    //If it's not a predicate, global options or load screen,
    //place an image preview based on the input image URL and the css Options
       $("#previewHeading").html("Preview");
       generateObjectOptionPreview(name,type);
}

//Load already saved values into the input form
//(so that options persist accross selections)
  switch (type) {
    case 'type':      writeTypeOption(name);
                      break;
    case 'object':    writeObjectOption(name);
                      break;
    case 'constant':  writeObjectOption(name);
                      break;
    case 'predicate': generatePredicateInputForm(name);
                      break;
    case 'global':    writeGlobalOption();
    default:
                      break;
   }
  selectedInput.type=type;
  selectedInput.name=name;
}
