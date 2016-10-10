function saveAndApply(){
  updateInputOptionEntity($("#selectionName").html(),$("#selectionType").html());
}

/**Returns a string containing a passed argument object's name and type,
if it has one.
@param {Argument} arg - Argument object*/
function argumentDescriptor(arg){
    if(typeof(arg.type)!="undefined"){
      return arg.name + " - " + arg.type;
    } else {
      return arg.name;
    }
}

/**Generates a selector from a list of arguments.
  *number will always be 1 or 2 because options apply
  *across at most two arguments.
  *i.e: when ?x takes some value, ?y adopts some transformation
  *I should see where I've called this function,
  *seems to me the number argument is... useless.
  *@param {array} argumentList - List of objects of type Argument.
  @param {number} number - The number of argument, this will always be a 1 or 2,
  and is used to differentiate between the two argument selectors in a predicates
  input page.
  */
function generateArgumentSelector(argumentList, number) {
    if(typeof(argumentList) != "undefined"){
    if(number>2||number<=0){
      console.log("invalid number passed to form generator: "+number);
    }
    var result = "<select id=\"arg"+number+"\">";
    for(var i = 0; i<argumentList.length;i++){
      result+="<option value=\""+argumentList[i].name+"\">"
            +   argumentDescriptor(argumentList[i])
            + "</option>";
    }
    return result += "</select>";
  } else return " null ";
}

/**Takes an object type as a string and returns all object that match as
 * a list of names.
 *@param {string} type - a type as specified in the pddl definition
 */
function getObjectListFromType(type) {
  var result = [];
  if(typeof(type)!="undefined"){
    Object.keys(objectOptions).forEach(function(key,index) {
      if(objectOptions[key].type==type){
        result.push(key);
      }
    });
    return result;
  } else {
      Object.keys(objectOptions).forEach(function(key,index) {
        result.push(key);
      });
    return result;
  }
}

/**Takes an array of object names and generates a html select object with
 * those objects as options, as well as a catch-all option.
 *@param {array} objectList - Array of object names
 */
function generateObjectSelector(objectList) {
  var result = "<select id=\"objectSelector\">";
  result += "<option value=\"anything\"> ** ANY ** </option>";
  for(var i=0;i<objectList.length;i++){
      result += "<option value=\"" + objectList[i] + "\">"
              + objectList[i] + "</option>"
  }
  return result + "</select>";
}

/**
 * Generates the input form for a predicate option. This is broken out from the
 * generic generateInputForm function because the predicate form is a little
 * more complicated.
 @param {string} name - Name of the predicate
 */
function generatePredicateInputForm(name) {
  var predicate = getObjectByName(name, predicates);
  var predicateHeader = "<div class=\"predicateOptionSpecification\">When "+ name + " is "
      + "<select id=\"truthiness\">"
      + "<option value=\"true\">True</option>"
      + "<option value=\"false\">False</option></select>"
      + " and " + generateArgumentSelector(predicate.arguments, 1)
      + " is <select id=\"objectSelector\"><option value=\"anything\"> ** ANY ** </option></select> then the transformation"
      + " below will be applied to the argument " + generateArgumentSelector(predicate.arguments, 2) + " : "
      + "</div>";

      return predicateHeader;
}

/**
 * Generates the input form from the passed arguments and returns it as an html div
 @param {string} name - name of the entity
 @param {string} inputtype - type of the entity
 */
function generateInputForm(name, inputtype) {

  //option input format:
  var imageUrlInput = "<div><p>ImageURL</p><textarea id=\"imageURL\" rows=\"1\" cols=\"25\"></textarea></div>";
  var positionInput = "<div><p>Location</p><textarea id=\"position\" rows=\"1\" cols=\"25\"></textarea></div>";
  var customCSS = "<div><p>Custom CSS Properties</p><textarea id=\"customCSS\" rows=\"1\" cols=\"25\"></textarea></div>";
  var sizeInput = "<div><p>Dimensions(W * H) </p><textarea id=\"size\" rows=\"1\" cols=\"25\"></textarea></div>";
  var spatialOptionsInput
      = "<div><p>Spatial Layout : </p><select id=\"spatialLayout\"><option value=\"free\">Free</option>"
      + "<option value=\"network\">Network</option>"
      + "<option value=\"grid\">Grid</option></select></div> "
      ;

  var unitsInput
      = "<div><p>Dimensions and Object Location Unit (% or px) : </p><select id=\"units\">"
      +"<option value=\"percent\" selected>Percent</option>"
      + "<option value=\"pixels\">Pixels</option></select></div>"
      ;
  var globalOptionsInput
      = "<div id=\"globalOptions\" data-type=\"global\">"
        + "<p>Stage Dimensions</p><textarea id=\"dimensions\" rows=\"1\" cols=\"25\"></textarea>"
        + unitsInput
        + "</div>"
      ;

  var objectOptions
      = imageUrlInput
      + positionInput
      + sizeInput
      + customCSS
      ;

  var predicateOptions
      = imageUrlInput
      + positionInput
      + sizeInput
      + customCSS
      ;

  var typeOptions
      = imageUrlInput
      + sizeInput
      + customCSS
      + spatialOptionsInput
      ;

  var result = "";

      switch (inputtype) {
        case 'type':      result += typeOptions;
                          break;
        case 'object':    result += objectOptions;
                          break;
        case 'constant':  result += objectOptions;
                          break;
        case 'predicate': result += generatePredicateInputForm(name);
                          result += predicateOptions;
                          break;
        case 'global':    result += globalOptionsInput;
                          break;
        default:          result += globalOptions;
                          break;
      }

      return "<div class=\"inputOptions\" style=\"margin:auto;\">" + result + "</div>"
}

/**
 * Generates a div containing a preview of a submitted predicate option.
 It includes a thumbnail of an image and the specified parameters.
 TODO: Should also contain a button to allow deletion of an option.
 @param {string} name - name of the predicate whose options are to be displayed.
 */
function generatePredicateOptionPreview(name){
  var result = '';
  if(predicateOptions[name].length>0) {
    for(var i = 0; i<predicateOptions[name].length;i++) {
      var pred = predicateOptions[name][i];
      result += "<div class=\"optionPreview\" onclick=\"writePredicateOption("+i+");\"><div>"
      + "When " + pred.name + " is " + pred.truthiness + " and "
      + pred.argument1 + " is " + pred.argument1_value + " animate "
      + pred.argument2 + "</div><div><img class=optionPreviewImage src=\""
      + pred.animation.image + "\"></img><br>"
      +"</div></div><div class=\"deletebutton\" onclick=\"deletePredicateOption('"+name+"',"+i+");\""
      + "\"><img src=\"images\\delete.png\" style=\"width:35px;height:35px;\"></img></div>";
    }
    $("#optionsPreview").html(result);
  }
  $("#optionsPreview").html(result);
}

/**
 * Generates a div containing a preview of the options for this object.
 It includes a thumbnail of an image and the specified parameters.
 @param {string} name - name of the object whose options are to be displayed.
 */
function generateObjectOptionPreview(name,type){
  var result = '';
  if(type == "type") {
    if (typeOptions[name].image!="undefined"){
      result += "<div class=\"optionPreview\"><div>"
      +"<img class=objectOptionPreviewImage src=\""
      + typeOptions[name].image + "\"></img>"
      +"</div></div>"}
  } else if (type == "object" || type == "constant") {
    if (objectOptions[name].image!="undefined"){
      result += "<div class=\"optionPreview\"><div>"
      +"<img class=objectOptionPreviewImage src=\""
      + objectOptions[name].image + "\"></img>"
      +"</div></div>"}
  }
  $("#optionsPreview").html(result);
  return;
}

/**Takes the users input
or a given entity and saves them in the requisite options object
from those defined in input_options_objects.js
@param {string} name - Name of the object
@param {string} optionType - Type of the object
*/
function updateInputOptionEntity(name, optionType) {
  var input;
  console.log("Updated: " +name+ " - "+ optionType);
  switch (optionType) {
    case "type":
      input = readTypeOption();
      updateTypeOption(name, input);
      console.log(typeOptions[name]);
      break;
    case "constant" :
      input = readObjectOption();
      updateObjectOption(name, input);
      console.log(objectOptions[name]);
      break;
    case "object":
      input = readObjectOption();
      updateObjectOption(name, input);
      console.log(objectOptions[name]);
      break;
    case "predicate":
      input = readPredicateOption();
      updatePredicateOption(name, input);
      generatePredicateOptionPreview(name);
      console.log(predicateOptions[name]);
      break;
    case "action":
      input = readActionOption();
      break;
    case "global":
      readGlobalOption();
      break;
    default :
      console.log("something went wrong trying to create an option entity");
  }
}

/**
 * Read the input from a type options input form
 */
function readTypeOption() {
  var image = $("#imageURL").val();
  var customCSS = $("#customCSS").val();
  var size = $("#size").val();
  var layout = $("#spatialLayout").val();
  var result = [image,customCSS,layout,size];
  return result;
}
/**
 * Write the values of an existing type option object
  @param {string} name - name of the type
 */
function writeTypeOption(name){
    $("#imageURL").val(typeOptions[name].image);
    $("#size").val(typeOptions[name].size);
    $("#customCSS").val(typeOptions[name].css);
    $("#spatialLayout").val(typeOptions[name].layout);
}

function updateTypeOption(name, input) {
  typeOptions[name] =
    new TypeOption(name, input[0], input[1], input[2], input[3]);
}


/**
 * Read the input from an object options input form
 */
function readObjectOption() {
    var image = $("#imageURL").val();
    var location = $("#position").val();
    var customCSS = $("#customCSS").val();
    var size = $("#size").val();
    var result = [image,location,size,customCSS];
  return result;
}

/**
 * Write the values of an existing object option object
  @param {string} name - name of the type
 */
function writeObjectOption(name) {
    $("#imageURL").val(objectOptions[name].image);
    $("#position").val(objectOptions[name].location);
    $("#customCSS").val(objectOptions[name].css);
    $("#size").val(objectOptions[name].size);

}

function updateObjectOption(name, input) {
  objectOptions[name].image=input[0];
  objectOptions[name].location=input[1];
  objectOptions[name].size=input[2];
  objectOptions[name].css=input[3];
}

/**
 * Read the input from a predicate options input form
 */
function readPredicateOption() {
    var truthiness = $("#truthiness").val();
    var argument1 = $("#arg1").val();
    var argument2 = $("#arg2").val();
    var argument1_value = $("#objectSelector").val();
    var animation = new AnimationOption($("#imageURL").val(), $("#position").val(), $("#customCSS").val(), $("#size").val());
    return [truthiness,argument1,argument2,argument1_value,animation];
}

//this is more complicated, it will need to write them like cards
/**
 * Write the values of existing predicate option objects to the
 preview area
  @param {integer} index - location of the option in the array of PredicateOption objects in predicateOptions.name
 */
function writePredicateOption(index) {
  var name = selectedInput.name;
  $("#truthiness").val(predicateOptions[name][index].truthiness);
  $("#arg1").val(predicateOptions[name][index].argument1);
  $("#arg2").val(predicateOptions[name][index].argument2);
  $("#objectSelector").val(predicateOptions[name][index].argument1_value);
  $("#imageURL").val(predicateOptions[name][index].animation.image);
  $("#position").val(predicateOptions[name][index].animation.location);
  $("#customCSS").val(predicateOptions[name][index].animation.css);
  $("#size").val(predicateOptions[name][index].animation.size);

}

function readActionOption() {

}

function readGlobalOption() {
    globalOptions.dimensions = $("#dimensions").val();
    globalOptions.units = $("#units").val();
}

function writeGlobalOption() {
    $("#dimensions").val(globalOptions.dimensions);
    $("#units").val(globalOptions.units);
}


function updatePredicateOption(name, input) {
  var pred = predicateOptions[name];
  //if any animation properties are defined
  if(Boolean(input[4].css) || Boolean(input[4].image) || Boolean(input[4].location) || Boolean(input[4].size)) {
    for(var i=0;i<pred.length;i++){
        if( pred[i].argument1==input[1]
            &&  pred[i].truthiness==input[0]
            &&  pred[i].argument2==input[2]
            &&  pred[i].argument1_value==input[3])
            {
              pred[i].animation=input[4];
              return;
            }
    } console.log("matching predicate option not found");
    predicateOptions[name].push(
      new PredicateOption(name, input[0], input[1], input[2], input[3], input[4])
    );
  }
}

function deletePredicateOption(name,index) {
  predicateOptions[name].splice(index,1);
  generatePredicateOptionPreview(name);
}
