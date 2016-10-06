/**The input domain text file
 * @global
 */
var domain_file;
/**The input problem text file
 * @global
 */
var problem_file;
/**The input plan text file
 * @global
 */
var plan_file;

/**Global store of parsed predicates
 * @global
 */
var predicates;
/**Global store of parsed objects
 * @global
 */
var objects;
/**Global store of parsed constants
 * @global
 */
var constants;
/**Global store of parsed types
 * @global
 */
var types;

/*
****************      LOAD TEST FILES     **********************
*/

$(document).ready(function(){

        $('#inputdomain').on('change', function(e){
            domain_file=this.files[0];
        });

        $('#inputproblem').on('change', function(e){
            problem_file=this.files[0];
          });

        $('#inputplan').on('change', function(e){
            plan_file=this.files[0];
        });

        $('#loadbutton').on('change', function(e){
          parseSavedFile(this.files[0]);
        });

});

function readFile(file, callback){
    var reader = new FileReader();
    reader.onload = callback
    reader.readAsText(file);
}

/*
****************      PARSE LOADED FILES     **********************
*/

/**Parses the loaded plan and returns a list of actions
  *@param {array} domain - Objects from parsed domain file. [types, constants, predicates, actionList]
  *@param {array} problem - Objects from the parsed problem file. [objects, startPredicates]
  *@param {function} callback - the function that will run on the parsed files.
  */
function parseSolution(domain, problem, callback) {
    readFile(plan_file, function(e) {
      try {
        plan=null;
        plan = Plan_Parser.parse(e.target.result);
        console.log(plan);

      } catch (x) {
        console.log(x);
      } finally {callback(domain,problem,plan);}
    });
}

/**Parses the loaded problem and returns lists of objects
NOTE: Sometimes has problems if the file ends in an RPAREN,
I think the parser misses the EOF token when this is the case, adding a
whitespace character at the end seems to fix it. Could be some weird
CRLF v LF based bug, but I've covered both line endings in the parser
  *@param {array} domain - Objects from parsed domain file. [types, constants, predicates, actionList]
  *@param {function} callback - the function that will run on the parsed files.
  */
function parseProblem(domain, callback) {
      readFile(problem_file, function(e) {
        try {
          problem=null;
          problem = PDDL_Parser.parse(e.target.result);
          console.log(problem);

        } catch (x) {
          console.log(x);
        } finally {return parseSolution(domain,problem,callback);}
      });
}

/**Parses the loaded domain file and returns a lists of objects
  *@param {function} callback - the function that will run on the parsed files.
  */
function parseDomain(callback) {
  readFile(domain_file, function(e) {
    try {
      domain=null;
      domain = PDDL_Parser.parse(e.target.result);
      console.log(domain);

    } catch (x) {
      console.log(x);
    } finally {parseProblem(domain, callback);}
  });
}

/**
 *
 Shouldmt be called getInput, this function is passed as a callbasck to
 parseDomain becasue FileReader runs ASYNC and I need to ensure files are prased
 before the rest of the script is exectured]
 *@param {array} domain - Objects from parsed domain file. [types, constants, predicates, actionList]
 *@param {array} problem - Objects from the parsed problem file. [objects, startPredicates]
 *@param {array} plan - Objects from parsed plan file. [actions]
 */
function getInput(domain,problem,plan) {
  types = domain[0];
  constants = domain[1];
  predicates = domain[2];
  objects = problem[0];

  var inputSelector = createInputSelector();
  document.getElementById("Window1").style.display="none";
  document.getElementById("Window2").style.display="block";
  createAnimationObjects();
  $("#inputSelector").append(inputSelector);
  generateInputForm();
  $("#submitInputs").append("<p></p><input id=\"submitInputs\" type=\"button\" "
        + "value=\"Submit Input\" onclick=\"createAnimationObjects();\">");
}

function parseInputFiles() {
    parseDomain(getInput);
}
/**
 * Options for the entire animation.
 * used to store the stage dimensions.
 * @global
 */
var globalOptions;

/**
 * Used to store options specified on types as an assosciative array
 * for fast lookup.
 * @global
 */
var typeOptions = {};
/**
 * Used to store options specified on objects as an assosciative array
 * for fast lookup.
 * @global
 */
var objectOptions = {};
/**
 * Used to store options specified on predicates as an assosciative array
 * for fast lookup. For predicates, each key points to a list of objects of
 * type predicateOption.
 * @global
 */
var predicateOptions = {};

/**
 * Store options that will be applied as default to all objects of the
 * corresponding type.
 *  @constructor
 */
function TypeOption(name, image ,css, layout) {
  this.name=name;
  this.image=image;
  this.css=css;
  this.layout = layout;
}

/**
 * Store options that define global parameters such as the stage dimensions
 * @param {array} stageDimensions - The dimensions of the animation stage in pixels
 *  @constructor
 */
function GlobalOption(stageDimensions) {
    this.dimensions = stageDimensions;
}


/**
 * Store options that will be applied to an object
 *  @constructor
    @param {string} name - The object's name
    @param {string} type - If typed, the type, else undefined
    @param {string} image - URL of the image to use to represent the object on stage
    @param {array} location - The current coordinates of the object on the stage
    @param {string} css - The transformations to apply by default to the input image
 */
function ObjectOption(name, type, image, location, css) {
    this.name=name;
    this.type=type;
    this.image=image;
    this.location=location;
    this.css = css;
}

//NOTE: If constants and objects don't share the same namespace
//I'll have to create a separate type and store for constants.
//: Usually you use either constants or objects depending if you want them
//in the problem def or domain file.
//predicate options apply on conditionals consisting of at most two arguments,
//as well as a (truth)value


/**
 * Store options that will be applied to an object given a defined predicate outcome
 @param {string} name - The name of the predicate
 @param {boolean} truthiness - Does this apply when the predicate eveluates to true or false
@param {string} argument1 - The first argument to the predicate
@param {string} argument1 - The second argument to the predicate
@param {string} argumentValue - The value taken by the first argument
@param {AnimeationOption} animation - {image,location,css, transition_image}
 *  @constructor
 */
function PredicateOption(name, truthiness, argument1, argument2, argumentValue, animation) {
  this.name = name; //predicate name
  this.truthiness = truthiness;
  this.argument1 = argument1;
  this.argument2 = argument2;
  this.argument1_value = argumentValue;
  this.animation = animation;
}

function ActionOption(name, parameter){
  this.name=name;
  this.parameter=parameter;
  //hmm, how do I handle an arbitrary number of parameters?
  //do I treat action rules the same as predicate rules?
}


function AnimationOption(image, location, css, transition_image){
    this.image=image;
    this.location = location;
    this.css = css;
    this.transition_image = transition_image;
}

function createAnimationObjects(){
  if (predicates.length>0){
    for(var i=0;i<predicates.length;i++){
      predicateOptions[predicates[i].name] = [];
    }
  }
  //types objects and constants
  if (types.length>0){
    for (var i =0; i<types.length;i++) {
      typeOptions[types[i]] = new TypeOption(types[i]);
    }
    var typeCounter = 0;
    var type = "";
    for (var i=0;i<constants.names.length;i++) {
      if(i<constants.typeIndex[typeCounter]) {
        type=constants.types[typeCounter];
      } else {
        typeCounter++;
        type=constants.types[typeCounter];
      }
      var name = constants.names[i];
      objectOptions[name] = new ObjectOption(name, type);
      objectOptions[name].location = [0,0];
    }
    typeCounter=0;
    for (var i=0;i<objects.names.length;i++) {
      if(i<objects.typeIndex[typeCounter]) {
        type=objects.types[typeCounter];
      } else {
        typeCounter++;
        type=objects.types[typeCounter];
      }
      var name = objects.names[i];
      objectOptions[name] = new ObjectOption(name, type);
      objectOptions[name].location = [0,0];
    }
  } else {
    for (var i=0;i<constants.names.length;i++) {
      var name = constants.names[i];
      objectOptions[name] = new ObjectOption(name);
      objectOptions[name].location = [0,0];
    }
    for (var i=0;i<objects.names.length;i++) {
      var name = objects.names[i];
      objectOptions[name] = new ObjectOption(name);
      objectOptions[name].location = [0,0];
    }
  }

  console.log(objectOptions);
//I won't do this prepopulation for predicate and action options because
//they need to be created upon input submission. In fact this was probably
//entirely unnecessary except for allowing me to attach the types easily

}

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

/*Return an object stored in an array of objects by it's name.
collection here refers to the arrays yielded from the parser's output.*/
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
  }
  form+="<p></p>";
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
    default:
                      break;
   }
  selectedInput.type=type;
  selectedInput.name=name;
}
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

  var spatialOptionsInput
      = "<div><p>Spatial Layou : </p><select id=\"spatialLayout\"><option value=\"free\">Free</option>"
      + "<option value=\"network\">Network</option>"
      + "<option value=\"grid\">Grid</option></div>"
      ;

  var globalOptionsInput
      = spatialOptionsInput
      ;

  var objectOptions
      = imageUrlInput
      + positionInput
      + customCSS
      ;

  var predicateOptions
      = imageUrlInput
      + positionInput
      + customCSS
      ;

  var typeOptions
      = imageUrlInput
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
                          result += imageUrlInput
                                  + positionInput
                                  + customCSS;
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
  var layout = $("#spatialLayout").val();
  var result = [image,customCSS,layout];
  return result;
}
/**
 * Write the values of an existing type option object
  @param {string} name - name of the type
 */
function writeTypeOption(name){
    $("#imageURL").val(typeOptions[name].image);
    $("#customCSS").val(typeOptions[name].css);
    $("#spatialLayout").val(typeOptions[name].layout);
}

/**
 * Read the input from an object options input form
 */
function readObjectOption() {
    var image = $("#imageURL").val();
    var location = $("#position").val();
    var customCSS = $("#customCSS").val();
    var result = [image,location,customCSS];
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
}

/**
 * Read the input from a predicate options input form
 */
function readPredicateOption() {
    var truthiness = $("#truthiness").val();
    var argument1 = $("#arg1").val();
    var argument2 = $("#arg2").val();
    var argument1_value = $("#objectSelector").val();
    var animation = new AnimationOption($("#imageURL").val(), $("#position").val(), $("#customCSS").val());
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
}

function readActionOption() {

}


function updateTypeOption(name, input) {
  typeOptions[name] =
    new TypeOption(name, input[0], input[1], input[2]);
}

function updateObjectOption(name, input) {
  objectOptions[name].image=input[0];
  objectOptions[name].location=input[1];
  objectOptions[name].css=input[2];
}

function updatePredicateOption(name, input) {
  var pred = predicateOptions[name];
  //if any animation properties are defined
  if(Boolean(input[4].css) || Boolean(input[4].image) || Boolean(input[4].location)) {
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
/*all animations should accept a duration parameter.
Perhaps I should a) store this as a multiple of itself
and scale using anime.speed, (to allow fast forwarding)
and b) replace with with a 'speed' input with 3/5 discrete
steps.*/

function translate(item, destination, path, relativePosition, duration){
  /*destination can be a set of coordinates or an identifier
  relativePosition is an optional argument (for example, if target is
  an identifier relatePosition might be onTop so the object moves ontop
  of the target position)*/
  /*Path will be a user defined SVG line definition to allow non-linear
   movement*/
}

function animate(item, animation){

}

function scale(item, factor){

}
/*Serialize and output the animation options objects*/

function download(text, name, type) {
    updateInputOptionEntity(name,type);
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}

function downloadAnimationOptions() {
  var saveFile  = JSON.stringify([typeOptions,objectOptions,predicateOptions]);
  download(saveFile, 'animation_options.txt', 'text/plain');
}
/*Deserialize the saved objects from txt file and repopulate based on whether
the objects/predicates/etc exist in the newly parsed problem. Should
provide some feedback on things that are no longer found.*/

function parseSavedFile(file){
  readFile(file, function(e) {
    try{
    var objects = JSON.parse(e.target.result);
  } catch(x){
    console.log(x);
  } finally {
    var typekeys = Object.keys(objects[0]);
    var objectkeys = Object.keys(objects[1]);
    var predicatekeys = Object.keys(objects[2]);
    console.log(objectkeys);
    for(var i =0;i<typekeys.length;i++){
      console.log(objects[0][typekeys[i]]);
      typeOptions[typekeys[i]] = objects[0][typekeys[i]];
      writeTypeOption(typekeys[i]);
    }
    for(var i =0;i<objectkeys.length;i++){
      console.log(objects[1][objectkeys[i]]);
      objectOptions[objectkeys[i]] = objects[1][objectkeys[i]];
      writeObjectOption(objectkeys[i]);
    }
    for(var i =0;i<predicatekeys.length;i++){
      console.log(objects[2][predicatekeys[i]]);
      predicateOptions[predicatekeys[i]] = objects[2][predicatekeys[i]];
      //writePredicateOption??
    }
  }
  console.log(objects);
  });
}
