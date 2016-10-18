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

$(document).ready(function() {

    $('#inputdomain').on('change', function(e) {
        domain_file = this.files[0];
    });

    $('#inputproblem').on('change', function(e) {
        problem_file = this.files[0];
    });

    $('#inputplan').on('change', function(e) {
        plan_file = this.files[0];
    });

    $('#loadbutton').on('change', function(e) {
        parseSavedFile(this.files[0]);
    });

});

function readFile(file, callback) {
    var reader = new FileReader();
    reader.onload = callback;
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
            plan = null;
            plan = Plan_Parser.parse(e.target.result);
            console.log(plan);

        } catch (x) {
            console.log(x);
        } finally {
            callback(domain, problem, plan);
        }
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
            problem = null;
            problem = PDDL_Parser.parse(e.target.result);
            console.log(problem);

        } catch (x) {
            console.log(x);
        } finally {
            return parseSolution(domain, problem, callback);
        }
    });
}

/**Parses the loaded domain file and returns a lists of objects
 *@param {function} callback - the function that will run on the parsed files.
 */
function parseDomain(callback) {
    readFile(domain_file, function(e) {
        try {
            domain = null;
            domain = PDDL_Parser.parse(e.target.result);
            console.log(domain);

        } catch (x) {
            console.log(x);
        } finally {
            parseProblem(domain, callback);
        }
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
function getInput(domain, problem, plan) {
    types = domain[0];
    constants = domain[1];
    predicates = domain[2];
    objects = problem[0];

    var inputSelector = createInputSelector();
    document.getElementById("Window1").style.display = "none";
    document.getElementById("Window2").style.display = "block";
    createAnimationObjects();
    generateAnimationTimeline(domain, problem, plan);

    //set objects layout and initial location, display=none;
    //apply initial predicate options
    //-match predicate to options (there should be some match ranking
    //(i.e anything loses to a direct arg1val match))
    //set objects display=block;
    //apply predicate options (match each predicate type animation entity with
    //its matching options)
    $("#inputSelector").append(inputSelector);
    generateInputForm();

}

/**
 * Parse the input files
 */
function parseInputFiles() {
    parseDomain(getInput);
}

function switchToAnimation() {
    document.getElementById("Window2").style.display = "none";
    document.getElementById("Window3").style.display = "block";
    createInitialStage();
    console.log(animationTimeline.length);
    addStatesToAnimationEntities();
    console.log(animationTimeline);
}

function switchToOptions() {
    $("#Window3").html("");
    document.getElementById("Window3").style.display = "none";
    document.getElementById("Window2").style.display = "block";
}
/**
 * Options for the entire animation.
 * used to store the stage dimensions.
 * @global
 */
var globalOptions = new GlobalOption("100,100", "%");

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
function TypeOption(name, image, css, layout, size) {
    this.name = name;
    this.image = image;
    this.css = css;
    this.layout = layout;
    this.size = size;
}

/**
 * Store options that define global parameters such as the stage dimensions
 * @param {array} stageDimensions - The dimensions of the animation stage in pixels
 *  @constructor
 */
function GlobalOption(stageDimensions, units) {
    this.dimensions = stageDimensions;
    this.units = units;
    this.labelled = "true";
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
function ObjectOption(name, type, image, location, css, size) {
    this.name = name;
    this.type = type;
    this.image = image;
    this.location = location;
    this.css = css;
    this.size = size;
    this.custom_js = "";
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
function PredicateOption(name, truthiness, argument1, argument2, argument1_value, animation) {
    this.name = name.toLowerCase(); //predicate name
    this.truthiness = truthiness;
    this.argument1 = argument1;
    this.argument2 = argument2;
    this.argument1_value = argument1_value;
    this.animation = animation;
}

function ActionOption(name, parameter) {
    this.name = name;
    this.parameter = parameter;
    //hmm, how do I handle an arbitrary number of parameters?
    //do I treat action rules the same as predicate rules?
}


function AnimationOption(image, location, custom_js, size, duration, transition_image) {
    this.image = image;
    this.location = location;
    this.custom_js = custom_js;
    this.size = size;
    this.duration = duration;
    this.transition_image = transition_image;
}

/**
 * Initializes the input option containers and their structure
 */
function createAnimationObjects() {
    if (predicates.length > 0) {
        for (var i = 0; i < predicates.length; i++) {
            predicateOptions[predicates[i].name.toLowerCase()] = [];
        }
    }
    //types objects and constants
    if (types.length > 0) {
        for (var i = 0; i < types.length; i++) {
            typeOptions[types[i]] = new TypeOption(types[i]);
        }
        var typeCounter = 0;
        var type = "";
        for (var i = 0; i < constants.names.length; i++) {
            if (i < constants.typeIndex[typeCounter]) {
                type = constants.types[typeCounter];
            } else {
                typeCounter++;
                type = constants.types[typeCounter];
            }
            var name = constants.names[i];
            objectOptions[name] = new ObjectOption(name, type);
            objectOptions[name].location = [0, 0];
        }
        typeCounter = 0;
        for (var i = 0; i < objects.names.length; i++) {
            if (i < objects.typeIndex[typeCounter]) {
                type = objects.types[typeCounter];
            } else {
                typeCounter++;
                type = objects.types[typeCounter];
            }
            var name = objects.names[i];
            objectOptions[name] = new ObjectOption(name, type);
            objectOptions[name].location = [0, 0];
        }
    } else {
        for (var i = 0; i < constants.names.length; i++) {
            var name = constants.names[i];
            objectOptions[name] = new ObjectOption(name);
            objectOptions[name].location = [0, 0];
        }
        for (var i = 0; i < objects.names.length; i++) {
            var name = objects.names[i];
            objectOptions[name] = new ObjectOption(name);
            objectOptions[name].location = [0, 0];
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

/**When Load File is selected from the menu, present the file input field and
ensure the event handler is active*/
function loadFileSelector(){
  $("#inputOptions").html(
    "<br><br><br><input id=\"loadbutton\" type=\"file\">");
    $('#loadbutton').on('change', function(e){
      parseSavedFile(this.files[0]);
    });
}

/**Populate the input selector with all available configurable entities such as
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

/**Keep track of the currently selected objcet. This facilitates updating the
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
  if($("#selectionType").html()!="predicate"){
    updateInputOptionEntity($("#selectionName").html(),$("#selectionType").html());
  }
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
      for(var i=0;i<predicate.parameters.length;i++){
          if(predicate.parameters[i].name==argument) {
            argtype=predicate.parameters[i].type;
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
          for(var i=0;i<predicate.parameters.length;i++){
              if(predicate.parameters[i].name==argument) {
                argtype=predicate.parameters[i].type;
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
/**
 * Update the settings for an item when the user selects another input form.
 This avoids users having to always manually click save & apply.
 */

function saveAndApply() {
    updateInputOptionEntity($("#selectionName").html(), $("#selectionType").html());
}

/**Returns a string containing a passed argument object's name and type,
if it has one.
@param {Argument} arg - Argument object*/
function argumentDescriptor(arg) {
    if (typeof(arg.type) != "undefined") {
        return arg.name + " - " + arg.type;
    } else {
        return arg.name;
    }
}

/**Generates a selector from a list of parameters.
  *number will always be 1 or 2 because options apply
  *across at most two parameters.
  *i.e: when ?x takes some value, ?y adopts some transformation
  *I should see where I've called this function,
  *seems to me the number argument is... useless.
  *@param {array} argumentList - List of objects of type Argument.
  @param {number} number - The number of argument, this will always be a 1 or 2,
  and is used to differentiate between the two argument selectors in a predicates
  input page.
  */
function generateArgumentSelector(argumentList, number) {
    if (typeof(argumentList) != "undefined") {
        if (number > 2 || number <= 0) {
            console.log("invalid number passed to form generator: " + number);
        }
        var result = "<select id=\"arg" + number + "\">";
        for (var i = 0; i < argumentList.length; i++) {
            result += "<option value=\"" + argumentList[i].name + "\">" +
                argumentDescriptor(argumentList[i]) +
                "</option>";
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
    if (typeof(type) != "undefined") {
        Object.keys(objectOptions).forEach(function(key, index) {
            if (objectOptions[key].type == type) {
                result.push(key);
            }
        });
        return result;
    } else {
        Object.keys(objectOptions).forEach(function(key, index) {
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
    for (var i = 0; i < objectList.length; i++) {
        result += "<option value=\"" + objectList[i] + "\">" +
            objectList[i] + "</option>";
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
    var predicateHeader = "<div class=\"predicateOptionSpecification\">When " + name + " is " +
        "<select id=\"truthiness\">" +
        "<option value=\"true\">True</option>" +
        "<option value=\"false\">False</option></select>" +
        " and " + generateArgumentSelector(predicate.parameters, 1) +
        " is <select id=\"objectSelector\"><option value=\"anything\"> ** ANY ** </option></select> then the transformation" +
        " below will be applied to the argument " + generateArgumentSelector(predicate.parameters, 2) + " : " +
        "</div>";

    return predicateHeader;
}

/**
 * Generates the input form from the passed parameters and returns it as an html div
 @param {string} name - name of the entity
 @param {string} inputtype - type of the entity
 */
function generateInputForm(name, inputtype) {

    //option input format:
    var imageUrlInput = "<div><p>ImageURL</p><textarea id=\"imageURL\" rows=\"1\" cols=\"25\"></textarea></div>";
    var transitionaryImageUrlInput = "<div><p>Transitionary Image URL</p><textarea id=\"transitionaryImageURL\" rows=\"1\" cols=\"25\"></textarea></div>";
    var positionInput = "<div><p>Location</p><textarea id=\"position\" rows=\"1\" cols=\"25\"></textarea></div>";
    var customCSS = "<div><p>Custom CSS Properties</p><textarea id=\"customCSS\" rows=\"1\" cols=\"25\"></textarea></div>";
    var customJS = "<div><p>Custom AnimeJS Properties</p><textarea id=\"customJS\" rows=\"1\" cols=\"25\"></textarea></div>";
    var duration = "<div><p>Animation Duration (ms)</p><input type=\"number\" id=\"duration\"></input></div>";
    var sizeInput = "<div><p>Dimensions(W * H) </p><textarea id=\"size\" rows=\"1\" cols=\"25\"></textarea></div>";
    var labelledInput = "<div><p>Label Objects? : </p><input type=\"checkbox\" id=\"labelled\" value=\"true\" checked></input></div>";
    var spatialOptionsInput = "<div><p>Spatial Layout : </p><select id=\"spatialLayout\"><option value=\"free\">Free</option>" +
        "<option value=\"network\">Network</option>" +
        "<option value=\"grid\">Grid</option></select></div> ";

    var unitsInput = "<div><p>Dimensions and Object Location Unit (% or px) : </p><select id=\"units\">" +
        "<option value=\"%\">Percent</option>" +
        "<option value=\"px\">Pixels</option></select></div>";
    var globalOptionsInput = "<div id=\"globalOptions\" data-type=\"global\">" +
        "<p>Stage Dimensions</p><textarea id=\"dimensions\" rows=\"1\" cols=\"25\"></textarea>" +
        unitsInput +
        labelledInput +
        "</div>";

    var objectOptions = imageUrlInput +
        positionInput +
        sizeInput +
        customCSS;

    var predicateOptions = imageUrlInput +
        positionInput +
        sizeInput +
        duration +
        customJS;

    var typeOptions = imageUrlInput +
        sizeInput +
        customCSS +
        spatialOptionsInput;

    var result = "";

    switch (inputtype) {
        case 'type':
            result += typeOptions;
            break;
        case 'object':
            result += objectOptions;
            break;
        case 'constant':
            result += objectOptions;
            break;
        case 'predicate':
            result += generatePredicateInputForm(name);
            result += predicateOptions;
            break;
        case 'global':
            result += globalOptionsInput;
            break;
        default:
            result += globalOptions;
            break;
    }

    return "<div class=\"inputOptions\" style=\"margin:auto;\">" + result + "</div>";
}

/**
 * Generates a div containing a preview of a submitted predicate option.
 It includes a thumbnail of an image and the specified parameters.
 TODO: Should also contain a button to allow deletion of an option.
 @param {string} name - name of the predicate whose options are to be displayed.
 */
function generatePredicateOptionPreview(name) {
    var result = '';
    if (predicateOptions[name].length > 0) {
        for (var i = 0; i < predicateOptions[name].length; i++) {
            var pred = predicateOptions[name][i];
            result += "<div class=\"optionPreview\" onclick=\"writePredicateOption(" + i + ");\"><div>" +
                "When " + pred.name + " is " + pred.truthiness + " and " +
                pred.argument1 + " is " + pred.argument1_value + " animate " +
                pred.argument2 + "</div><div><img class=optionPreviewImage src=\"" +
                pred.animation.image + "\"></img><br>" +
                "</div></div><div class=\"deletebutton\" onclick=\"deletePredicateOption('" + name + "'," + i + ");\"" +
                "\"><img src=\"images\\delete.png\" style=\"width:35px;height:35px;\"></img></div>";
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
function generateObjectOptionPreview(name, type) {
    var result = '';
    if (type == "type") {
        if (typeOptions[name].image != "undefined") {
            result += "<div class=\"optionPreview\"><div>" +
                "<img class=objectOptionPreviewImage src=\"" +
                typeOptions[name].image + "\"></img>" +
                "</div></div>";
        }
    } else if (type == "object" || type == "constant") {
        if (objectOptions[name].image != "undefined") {
            result += "<div class=\"optionPreview\"><div>" +
                "<img class=objectOptionPreviewImage src=\"" +
                objectOptions[name].image + "\"></img>" +
                "</div></div>";
        }
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
    console.log("Updated: " + name + " - " + optionType);
    switch (optionType) {
        case "type":
            input = readTypeOption();
            updateTypeOption(name, input);
            console.log(typeOptions[name]);
            break;
        case "constant":
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
        default:
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
    var result = [image, customCSS, layout, size];
    return result;
}
/**
 * Write the values of an existing type option object
  @param {string} name - name of the type
 */
function writeTypeOption(name) {
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
    var result = [image, location, size, customCSS];
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
    objectOptions[name].image = input[0];
    objectOptions[name].location = input[1];
    objectOptions[name].size = input[2];
    objectOptions[name].css = input[3];
}

/**
 * Read the input from a predicate options input form
 */
function readPredicateOption() {
    var truthiness = $("#truthiness").val();
    var argument1 = $("#arg1").val();
    var argument2 = $("#arg2").val();
    var argument1_value = $("#objectSelector").val();
    var animation = new AnimationOption($("#imageURL").val(), $("#position").val(), $("#customCSS").val(), $("#size").val(), $("#duration").val(), $("#transitionaryImageURL").val());
    return [truthiness, argument1, argument2, argument1_value, animation];
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
    $("#duration").val(predicateOptions[name][index].animation.duration);
    $("#transitionaryImageURL").val(predicateOptions[name][index].animation.transition_image);

}

function readActionOption() {

}

/**
 * Read the values from a global options input form
 */
function readGlobalOption() {
    globalOptions.dimensions = $("#dimensions").val();
    globalOptions.units = $("#units").val();
    globalOptions.labelled = $("#labelled").val();
}

/**
 * Write the existing values to a global options input form
 */
function writeGlobalOption() {
    $("#dimensions").val(globalOptions.dimensions);
    $("#units").val(globalOptions.units);
    $("#labelled").val(globalOptions.labelled);
}

/**
 * This takes a predicates name and the inputs from an input form and, if there is
 existing input for this scenario, updates it, otherwise it creates a new predicate
 option.
 @param {string} name - name of the predicate
 @param {array} input - list containing user input
 */
function updatePredicateOption(name, input) {
    var pred = predicateOptions[name];
    //if any animation properties are defined
    if (Boolean(input[4].css) || Boolean(input[4].image) || Boolean(input[4].location) || Boolean(input[4].size)) {
        for (var i = 0; i < pred.length; i++) {
            if (pred[i].argument1 == input[1] &&
                pred[i].truthiness == input[0] &&
                pred[i].argument2 == input[2] &&
                pred[i].argument1_value == input[3]) {
                pred[i].animation = input[4];
                return;
            }
        }
        console.log("matching predicate option not found");
        predicateOptions[name].push(
            new PredicateOption(name, input[0], input[1], input[2], input[3], input[4])
        );
    }
}

/**
 * Removes a predicate option and updates the preview Window2
 @param {string} name - the name of the predicate
 @param {integer} index - the location of the option to be removed in the list
 of options that exist for the given predicate.
 */
function deletePredicateOption(name, index) {
    predicateOptions[name].splice(index, 1);
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
var animationTimeline = [];

function generateAnimationTimeline(domain, problem, plan) {
    initialPredicates = problem[1];
    var actionTitle = '';
    animationTimeline.push(new animationEntity("heading", "Initial State"));
    var initial_predicates = list_initial_predicates(domain[2], initialPredicates);
    for (var i = 0; i < initial_predicates.length; i++) {
        //attach predicate arguent values with their argument names from the definitions
        animationTimeline.push(new animationEntity("predicate", initial_predicates[i]));
    }
    for (var i = 0; i < plan.length; i++) {
        actionTitle = plan[i].name + " ";
        for (var j = 0; j < plan[i].parameters.length; j++) {
            actionTitle += plan[i].parameters[j] + " ";
        }
        animationTimeline.push(new animationEntity("heading", actionTitle));
        //create an entry for each action's predicate and
        //attach action parameter values with their names from the definitions
        var action_predicates = list_action_predicates(domain[3], plan[i]);
        for (var k = 0; k < action_predicates.length; k++) {
            animationTimeline.push(new animationEntity("predicate", action_predicates[k]));
        }
    }
}

/**
 *Ties the value to the attribute name (e.g ?x = airplane)
 There are a few ways to do this without using nested for loops (e.g making the name a key
and setting it equal to the value or undefined) but to be honest even a problem with
a hundred predicates won't notice the slowdown doing it this way, and it'll save me an hour.
 */
// function label_predicate_parameters(predicate_definitions, predicates) {
//   for(var i = 0; i<predicates.length;i++){
//     for(var j=0; j<predicate_definitions.length;j++) {
//       if(predicates[i].name==predicate_definitions[j].name){
//         for(var k=0;k<predicates[i].parameters.length;k++){
//           predicates[i].parameters[k].name=predicate_definitions[j].parameters[k].name;
//           predicates[i].parameters[k].type=predicate_definitions[j].parameters[k].type;
//         }
//       }
//     }
//   }
// }

function list_initial_predicates(predicate_definitions, initial_predicates) {
    var result = [];
    initial_predicates.forEach(function(item, index) {
        for (var i = 0; i < predicate_definitions.length; i++) {
            if (item.name == predicate_definitions[i].name) {
                if (typeof(predicate_definitions[i].parameters) != "undefined") {
                    for (var j = 0; j < predicate_definitions[i].parameters.length; j++) {
                        item.parameters[j].name = predicate_definitions[i].parameters[j].name;
                        item.parameters[j].type = predicate_definitions[i].parameters[j].type;
                    }
                    result.push(item);
                }
            } break;
        }
    });
    return result;
}

function list_action_predicates(action_definitions, action) {
    var result = [];
    //for each action definition
    for (var j = 0; j < action_definitions.length; j++) {
        // find the one that matches the current action name
        if (action.name == action_definitions[j].name) {
            // for each of this actions parameters, set its name and type
            //NOTE:should make sure parameters exist
            for (var k = 0; k < action.parameters.length; k++) {
                action.parameters[k].name = action_definitions[j].parameters[k].name;
                action.parameters[k].type = action_definitions[j].parameters[k].type;
            }
            for (var k = 0; k < action_definitions[j].effects.length; k++) {
                var temp_predicate = JSON.parse(JSON.stringify(action_definitions[j].effects[k]));
                // console.log(temp_predicate);
                if (typeof(temp_predicate.parameters) != "undefined") {
                    for (var x = 0; x < temp_predicate.parameters.length; x++) {
                        for (var y = 0; y < action.parameters.length; y++)
                            if (action.parameters[y].name == temp_predicate.parameters[x].name) {
                                temp_predicate.parameters[x].type = action.parameters[y].type;
                                temp_predicate.parameters[x].value = action.parameters[y].value;
                            }
                    }
                }
                result.push(temp_predicate);
            }
            break;
        }
    }
    return result;
}
/**
 * The entities present on the animation timeline (allows distinction between
headings and predicates)
 */
function animationEntity(type, content) {
    this.type = type;
    this.content = content;
}
/**
 * Store predicate description; this is the same constructor used in the parser
  @param {string} name - The name of the predicate
  @param {boolean} truthiness - Is it true or false
  @param {string} parameters - Collection of argument objects
* @constructor
 */
function Predicate(name, parameters, truthiness) {
    this.name = name;
    this.truthiness = truthiness;
    this.parameters = parameters;
}

/**
 * Store parameters - this is the same constructor used in the parser
  @param {string} name - The name of the argument
  @param {boolean} type - The type of the argument (if not typed this is undefined)
* @constructor
 */
function Argument(name, type, value) {
    this.name = name;
    this.value = value;
    this.type = type;
}
/**
 * iterates over animation timeline
 If there are stack overflows, it's happening here in the recursive call to this
 function. I only did this because javascript has no sleep method so in order to
temporally space the animations I need to use settimeout.
 */
function iterateOverTimeline(index) {
    console.log("iterating: " + index + " : " + animationTimeline.length);
    var delay_between_states = 500;
    if (index > animationTimeline.length) {
        return;
    }
    var animation_function;
    switch (animationTimeline[index].type) {
        case "predicate":
            if (animationTimeline[index].object_options &&
                animationTimeline[index].duration &&
                animationTimeline[index].stage_location) {

                animation_function = generateAnimationFunction(animationTimeline[index].object_options,
                    animationTimeline[index].duration,
                    animationTimeline[index].stage_location);
                if (typeof(animation_function) != "undefined") {
                    animation_function[0]();
                    console.log(animation_function);
                    console.log(index);
                    console.log(animationTimeline[index].duration);
                    setTimeout(iterateOverTimeline(index + 1), animationTimeline[index].duration + delay_between_states);
                    // setTimeout(animation_function[1], animationTimeline[index].duration);
                }
            }
            break;
        default:
            iterateOverTimeline(index + 1);
    }
}


/**
 * I'll need a function that will take an animation entity and create
 and execute the animation function
 */
function generateAnimationFunction(object_options, duration, stage_locations) {
    var funcdef = "";
    var set_final_images = "";
    var objects = Object.keys(object_options);
    objects.forEach(function(x, index) {
        var item = object_options[x];
        //if there's a transition image, apply it.
        if (typeof(item.transition_image) != "undefined") {
            funcdef += "$(\"#\"" + item.name + ").attr(\"src\",\"" + item.transition_image + "\"); ";
            console.log(funcdef);
            item.transition_image = "";
        }
        if (typeof(item.transition_image) != "undefined" ||
            item.image != objectOptions[item.name].image) {
            if (typeof(item.image) != "undefined") {
                set_final_images += "$(\"#\"" + item.name + ").attr(\"src\",\"" + item.image + "\"); ";
            }
        }
        //add /\ location translations and duration to animation
        funcdef += "anime({targets: \"#" + item.name + "\",";
        funcdef += "duration: " + duration + ", ";
        if (stage_locations[item.name] != stageLocation[item.name]) {
            funcdef += "left: \"" + stage_locations[0] + globalOptions.units + "\",";
            funcdef += "bottom: \"" + stage_locations[1] + globalOptions.units + "\",";
        }
        //add content of custom_js property
        if (item.custom_js != "undefined") {
            funcdef += item.custom_js;
            item.custom_js = "";
        }
        funcdef += "});";
        funcdef += "objectOptions = JSON.parse(JSON.stringify(object_options)); ";
        funcdef += "stageLocation = JSON.parse(JSON.stringify(stage_locations)); ";
    });

    //set Globals to match new state.
    var result = [Function(funcdef)];
    if (set_final_images.length > 1) {
        // result.push(Function(set_final_images));
    }
    return result;
}

function addStatesToAnimationEntities() {
    //Creates a deep copy
    var object_options = JSON.parse(JSON.stringify(objectOptions));
    var stage_location = JSON.parse(JSON.stringify(stageLocation));
    animationTimeline.forEach(function(item, index) {
        if (item.type == "predicate") {
            var temp = generateNewState(item, object_options, stage_location);
            if (typeof(temp) != "undefined") {
                object_options = temp[0][0];
                stage_location = temp[1];
                duration = temp[0][1];
                item.object_options = object_options;
                item.stage_location = stage_location;
                item.duration = duration;
            }
        }
    });
}
/**
 * Take the current object states, the current stage locations,
 and the next predicate or action animation entity. If it's a predicate, return an object
 containing the updated object_options and the updated stage_locations
 This should then be attached to the animationEntity*/
function generateNewState(animation_entity, object_options, stage_locations) {
    if (animation_entity.type == "predicate") {
        var predicate = animation_entity.content;
        var animations = findMatchingAnimationOptions(predicate, predicateOptions);
        console.log(animations);
        if (animations != false && typeof(animations) != "undefined" && animations[0].length > 0) {
            var updated_object_options = get_updated_objectOptions(animations, object_options);
            var duration = updated_object_options[1];
            console.log(updated_object_options);
            var updated_stage_locations = get_updated_stageLocations(updated_object_options[0], stage_locations);
            console.log(updated_stage_locations);
            return [updated_object_options, updated_stage_locations];
        }
    }
}

function setImage(object, image) {
    $("#" + object + " > img").attr("src", image);
}

/**
 * takes a predicate with arguments populated from the calling action and
 returns a list of all applicable animations and which argument they target.
 @param {Object} predicate - A predicate object generated from an input plan action
 */

function findMatchingAnimationOptions(predicate, defined_options) {
    var options = defined_options[predicate.name];
    // console.log(options);
    // console.log(predicate);
    if (typeof(options) != "undefined" && options.length > 0) {
        var result = []; //will have least specific options at the front of the array.
        for (var i = 0; i < options.length; i++) {
            var arg1 = null;
            var arg2 = null;
            if (options[i].truthiness == predicate.truthiness) {
                //If it's an exact match, add to end of array
                for (var j = 0; j < predicate.parameters.length; j++) {
                    console.log("option: " + options[i].argument1 + " parameter: " + predicate.parameters[j].name);
                    if (options[i].argument1 === predicate.parameters[j].name) {
                        arg1 = predicate.parameters[j];
                    }
                    if (options[i].argument2 === predicate.parameters[j].name) {
                        arg2 = predicate.parameters[j];
                    }
                }
                console.log([arg1, arg2]);
                if (options[i].argument1_value == arg1.value) {
                    //add the option and target object
                    result.push([options[i].animation, arg2]);

                    // console.log("Matching Predicate Option (exact):");
                    // console.log(options[i]);
                    // console.log(predicate);

                    //if its a catchall match add it to the start
                } else if (options[i].argument1_value == "anything") {
                    result.unshift([options[i].animation, arg2]);
                    // console.log("Matching Predicate Option (catchall):");
                    // console.log(options[i]);
                    // console.log(predicate);
                }
            }
        }
        return [result, predicate];
    } else {
        return;
    }

}

/**This function should be iteratively run over the results of the findMatchingPredicateAnimations
function with the exception of updated location, which will come from get_updated_stageLocations
 *'changed' is returned for debugging
 */
function get_updated_objectOptions(animation, object_options) {

    var animations = animation[0];
    var predicate = animation[1];
    var duration = 0;
    var result = JSON.parse(JSON.stringify(object_options));
    for (var i = 0; i < animations.length; i++) {
        var target = animations[i][1];
        console.log(target);
        //if there's a transition image, apply it here
        if (typeof(animations[i][0].transition_image) != "undefined") {
            result[target.value].transition_image = animations[i][0].transition_image;
        }
        //update location

        if (typeof(animations[i][0].location) != "undefined") {
            if (typeof(animations[i][0].location) == "string" &&
                animations[i][0].location.indexOf("?") > -1) {
                //resolve the parameter to an object name and get it's updated stage location
                var temp = animations[i][0].location.split(":");
                var target_object;
                for (var j = 0; j < predicate.parameters.length; j++) {
                    if (predicate.parameters[j].name == temp[1]) {
                        target_object = predicate.parameters[j].value;
                    }
                    result[target.value].location = temp[0] + ":" + target_object;
                }
            } else {
                result[target.value].location = animations[i][0].location;
            }
        }
        //update css
        if (typeof(animations[i][0].custom_js) != "undefined") {
            result[target.value].custom_js = animations[i][0].custom_js;
        }
        if (typeof(animations[i][0].image) != "undefined") {
            result[target.value].image = animations[i][0].image;
        }
        //updtae duration
        duration = animations[i][0].duration;
    }
    return [result, duration];
}

/**
 * return coordinates of all objects whose location has changed due to an
    updated objectOption property
 */
function get_updated_stageLocations(object_options, stage_locations) {
    // console.log(object_options);
    var result = JSON.parse(JSON.stringify(stage_locations));
    var keys = Object.keys(stage_locations);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var location;
        if (typeof(object_options[key].location) != "undefined") {
            location = getStageLocation(key, object_options, result);
        }
        result[key] = location;
    }
    return result;
}
var stageLocation = {};

function getWidthAndHeight(object, object_options) {
    return object_options[object].size.split(",");
}

function createInitialStage() {
    $("#Window3").html("<input id=\"gotoWindow2\" type=\"button\" " +
        " value=\"Return to Options Input Screen\"" +
        " onclick=\"switchToOptions();\" style=\"position:absolute;\">" +
        "<input id=\"play\" type=\"button\" " +
        " value=\"Play Animation\"" +
        " onclick=\"iterateOverTimeline(0);\" style=\"position:absolute;\">" +
        "<div id=\"stage\">" +
        "</div>");
    //apply typeOptions
    var typekeys = Object.keys(typeOptions);
    for (var i = 0; i < typekeys.length; i++) {
        var object_type = typekeys[i];
        var targets = getObjectListFromType(object_type);
        for (var j = 0; j < targets.length; j++) {
            var object_name = targets[j];
            if (!objectOptions[object_name].css) {
                objectOptions[object_name].css = typeOptions[object_type].css;
            }
            if (!objectOptions[object_name].image) {
                objectOptions[object_name].image = typeOptions[object_type].image;
            }
            if (!objectOptions[object_name].size) {
                objectOptions[object_name].size = typeOptions[object_type].size;
            }
        }
    }
    //apply regex options

    //apply objectOptions
    //1. Place them on the stage
    var object_keys = Object.keys(objectOptions);
    var objectshtml = "";
    for (var i = 0; i < object_keys.length; i++) {
        var key = object_keys[i];
        var object = objectOptions[key];
        var objectcontainer = "";
        objectcontainer += "<div id=\"" + object.name + "\" style=\"position:absolute\"><img src=\"" + object.image +
            "\" style=\"max-width:100%;max-height:100%\"></img>";
        if (globalOptions.labelled == "true") {
            objectcontainer += "<p>" + key + "</p>";
        }
        objectcontainer += "</div>";
        objectshtml += objectcontainer;
    }

    $("#stage").html(objectshtml);


    for (var i = 0; i < object_keys.length; i++) {
        var key = object_keys[i];
        stageLocation[key] = objectOptions[key].location;
    }

    for (var i = 0; i < object_keys.length; i++) {
        var key = object_keys[i];
        //2. set their size
        var size = getWidthAndHeight(key, objectOptions);
        // console.log("Size of "+key+" :" + size[0] +" , "+ size[1]);
        $("#" + key).css("width", "" + size[0] + globalOptions.units);
        //NOTE: Height is currently useless. object-fit doesnt work. need to fix
        $("#" + key).css("max-height", "" + size[1] + globalOptions.units);

        //3. set their location
        stageLocation[key] = getStageLocation(key, objectOptions, stageLocation);
        var x = stageLocation[key][0] - 0.5 * parseFloat(size[0]);
        var y = stageLocation[key][1] - 0.5 * parseFloat(size[1]);

        // console.log("Location of "+key+" :" + location[0] +" , "+ location[1]);
        // location[0] -= 0.5*parseFloat(size[0]);
        // location[1] -= 0.5*parseFloat(size[1]);
        // console.log("margins of "+key+" :" + location[0] +" , "+ location[1]);
        var mleft = x.toString() + globalOptions.units;
        var mtop = y.toString() + globalOptions.units;
        $("#" + key).css("left", mleft);
        $("#" + key).css("bottom", mtop);
        //4. apply any custom CSS
        applyCSS(objectOptions[key].css, key);
    }


    //NOTE: I need to copy object.locations to stageLocation after each
    //location change and then resolve all stageLocations to coordinates
    //to get new coordinates.
}

/**
 * Applies css to target objects instance in the DOMAIN
 @param {string} css - the string of css options
 @param {string} targetName - the name of the target object
 */
function applyCSS(css, targetName) {
    // console.log("applyCSS("+targetName+")");
    var css_statements = css.split(/[\n\r]/g);
    if (css_statements != false) {
        for (var i = 0; i < css_statements.length; i++) {
            var item = css_statements[i];
            var property = item.split(":");
            console.log("#" + targetName);
            console.log(property);
            $("#" + targetName).css(property[0].trim(), property[1].trim());
        }
    }
}
//use the objectOptions objects as paramater stores.
//NOTE: ObjectOptions.location always has to be a string
function getStageLocation(objectName, object_options, stage_locations) {
    var location = object_options[objectName].location;
    if (typeof(location) == "string") {
        location = object_options[objectName].location.split(",");
        //Either they're coordinates
        if (location.length == 2) {
            return [parseFloat(location[0]), parseFloat(location[1])];
        }
        //or a relative position
        else {
            return resolveRelativeLocation(objectName, object_options, stage_locations);
        }
    } else {
        //Either they're coordinates
        if (location.length == 2) {
            return [location[0], location[1]];
        }
    }
}

function resolveRelativeLocation(objectName, object_options, stage_locations) {
    var location = object_options[objectName].location.split(":");
    var position = location[0].trim();
    var relative_to_object = location[1].trim();
    // var dimensions  = getWidthAndHeight(object);
    var dimensions_of_relative_object = getWidthAndHeight(relative_to_object, object_options);
    var relative_to_position = getStageLocation(relative_to_object, object_options, stage_locations);

    // console.log(position + " : " + relative_to_object);
    // console.log(dimensions_of_relative_object);
    // console.log(relative_to_position);
    var x, y;
    switch (position) {
        case "on":
            return relative_to_position;
        case "left":
            //translate it by half(width of object + width of relative_to_object) from relative_to_position
            x = relative_to_position[0] - parseFloat(dimensions_of_relative_object[0]);
            y = relative_to_position[1];
            return [x, y];
        case "right":
            x = relative_to_position[0] + parseFloat(dimensions_of_relative_object[0]);
            y = relative_to_position[1];
            return [x, y];
        case "above":
            y = relative_to_position[1] + parseFloat(dimensions_of_relative_object[1]);
            x = relative_to_position[0];
            return [x, y];
        case "below":
            y = relative_to_position[1] - parseFloat(dimensions_of_relative_object[1]);
            x = relative_to_position[0];
            return [x, y];
    }
}
/**Serialize and output the animation options objects,
I should add a call to updateInputOptionEntity to ensure the last option input
is not lost in case the user forgets to click save & apply
@param {text} text - the JSON string containing all applied options
@param {string} name - default name of the saved text file
@param {string} type - the output text file's type
*/
function downloadOptionsInput(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}


/**
 * Stringifies the animation input and runs the download function.
 */
function downloadAnimationOptions() {
  var saveFile  = JSON.stringify([typeOptions,objectOptions,predicateOptions,globalOptions]);
  downloadOptionsInput(saveFile, 'animation_options.txt', 'text/plain');
}
/**Deserialize the saved objects from txt file and repopulate based on whether
the objects/predicates/etc exist in the newly parsed problem.
TODO: Should provide some feedback on things that are no longer found.
@param {file} file - the text file output from a previous save*/
function parseSavedFile(file) {
    readFile(file, function(e) {
        try {
            var objects = JSON.parse(e.target.result.toLowerCase());
        } catch (x) {
            console.log(x);
        } finally {
            var typekeys = Object.keys(objects[0]);
            var objectkeys = Object.keys(objects[1]);
            var predicatekeys = Object.keys(objects[2]);
            for (var i = 0; i < typekeys.length; i++) {
                typeOptions[typekeys[i]] = objects[0][typekeys[i]];
                writeTypeOption(typekeys[i]);
            }
            for (var i = 0; i < objectkeys.length; i++) {
                objectOptions[objectkeys[i]] = objects[1][objectkeys[i]];
                writeObjectOption(objectkeys[i]);
            }
            for (var i = 0; i < predicatekeys.length; i++) {
                predicateOptions[predicatekeys[i]] = objects[2][predicatekeys[i]];
                //writePredicateOption??
            }
            if (typeof(objects[3]) != "undefined") {
                globalOptions = objects[3];
            }
        }
        console.log(objects);
    });
}
