
/*
****************      GENERATE INPUT FORM    **********************
*/
function createInputSelector() {
  var itemCell = "<td class=\"item\" onclick=\"selectInput(event);\"";
  var output = "";
  output += "<table id=\"inputTable\"><tbody><tr>"
          + itemCell + ">Global Options</td></tr>";
  //Input form for types
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

function SelectedInput(name,type){
  this.name = name;
  this.type = type;
}

var selectedInput = new SelectedInput('', '');

function getObjectByName(name, collection) {
  for(var i=0;i<collection.length;i++){
    if(collection[i].name==name) {
      return collection[i];
    }
  }
}

/*This is the function that runs when an item from the list of objects/types
is clicked. It loads the available options into the #inputOptions div*/
function selectInput(e) {
  var name = e.target.innerHTML;
  var type = e.target.getAttribute('data-type');
  console.log(type + " : "  + name);
  console.log(objectOptions[name]);
  console.log(selectedInput.name+ ":"+ selectedInput.type);
  updateInputOptionEntity($("#selectionName").html(),$("#selectionType").html());
  var form = "";
  form += "<h1 id=\"selectionType\">" + type + "</h1>";
  form += "<h2 id=\"selectionName\">" + name + "</h2>";
  if(type=="object"||type=="constant"){
    form += "<h2 id=\"selectionObjectType\">" + objectOptions[name].type + "</h2>"
  }
  form+="<p></p>";
  form += generateInputForm(name, type);

  $('#inputOptions').html(form);

  if(type=="predicate"){
    $("#previewHeading").html("Existing Options");
    generateOptionPreview(name);
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
  } else {    $("#previewHeading").html("Preview");
}
  switch (type) {
    case 'type':      writeTypeOption(name);
                      break;
    case 'object':    writeObjectOption(name);
                      break;
    case 'constant':  writeObjectOption(name);
                      break;
    case 'predicate': generatePredicateInputForm(name);
                      break;
    default:
                      break;
   }
  selectedInput.type=type;
  selectedInput.name=name;
}
