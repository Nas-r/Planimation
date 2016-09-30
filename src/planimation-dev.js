var domain_file;
var problem_file;
var plan_file;

var predicates;
var objects;
var constants;
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

});

function readFile(file, callback){
    var reader = new FileReader();
    reader.onload = callback
    reader.readAsText(file);
}

/*
****************      PARSE LOADED FILES     **********************
*/

/*Parses the loaded plan and returns a list of actions*/
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

/*Parses the loaded problem file and returns
[objects, startPredicates]
NOTE: Sometimes has problems if the file ends in an RPAREN,
I think the parser misses the EOF token when this is the case, adding a
whitespace character at the end seems to fix it. Could be some weird
CRLF v LF based bug, but I've covered both line endings in the parser*/
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

/*Parses the loaded domain file and returns
[types, constants, predicates, actionList]*/
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

/*Shouldmt ne called getInput, this function is passed as a callbasck to
parseDomain becasue FileReader runs ASYNC and I need to ensure files are prased
before the rest of the script is exectured]*/
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
  /*
    domain  = [[types], [constants], [predicates], [actionList]]
              types =
              constants = [[names],[typeIndex],[types]]

    problem = [[objects], [startPredicates]]
    plan    = [actions]
  */
    parseDomain(getInput);
}

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
  updateInputOptionEntity($('#selectionType').html(),$('#selectionName').html());
  var name = e.target.innerHTML;
  var type = e.target.getAttribute('data-type');
  console.log(type + " : "  + name);

  var form = "";
  form += "<h1 id=\"selectionType\">" + type + "</h1>";
  form += "<h2 id=\"selectionName\">" + name + "</h2><p></p>";
  form += generateInputForm(name, type);

  console.log(form)
  $('#inputOptions').html(form);

  if(type=="predicate"){
    $("#previewHeading").html("Existing Options");
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
  } else {    $("#previewHeading").html("Limited Preview");
}
  switch (type) {
    case 'type':      writeTypeOption(name);
                      break;
    case 'object':    writeObjectOption(name);
                      break;
    case 'constant':  writeObjectOption(name);
                      break;
    case 'predicate': writePredicateOption(name);
                      break;
    default:          
                      break;
   }
  selectedInput.type=type;
  selectedInput.name=name;
}
var globalOptions;
//Creating assosciative arrays to store option inputs for simple,
//fast name based ulookup.
var typeOptions = {};
var objectOptions = {};
var predicateOptions = {};

function TypeOption(typeName, image ,css) {
  this.name=typeName;
  this.defaultImageURL=image;
  this.css=css;
}

function GlobalOption(spatialLayout) {
    this.spatialLayout = spatialLayout;
}

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
function PredicateOption(name, truthiness, argument1, argument2, argumentValue, animation) {
  this.name = name; //predicate name
  this.truthiness = truthiness;
  this.argument1 = argument1;
  this.argument2 = argument2;
  this.argument1_value = argumentValue;
  this.animation = animation;
}

//parameterS ?
function ActionOption(name, parameter){
  this.name=name;
  this.parameter=parameter;
  //hmm, how do I handle an arbitrary number of parameters?
  //do I treat action rules the same as predicate rules?
}

function createAnimationObjects(){

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
    }
  } else {
    for (var i=0;i<constants.names.length;i++) {
      objectOptions[constants.names[i]] = new ObjectOption(constants.names[i]);
    }
    for (var i=0;i<objects.names.length;i++) {
      objectOptions[objects.names[i]] = new ObjectOption(objects.names[i]);
    }
  }

//I won't do this prepopulation for predicate and action options because
//they need to be created upon input submission. In fact this was probably
//entirely unnecessary except for allowing me to attach the types easily

  console.log(typeOptions);
  console.log(objectOptions);
}
function argumentDescriptor(arg){
    if(typeof(arg.type)!="undefined"){
      return arg.name + " - " + arg.type;
    } else {
      return arg.name;
    }
}

//number will always be 1 or 2 because options apply
// across at most two arguments
//i.e: when ?x takes some value, ?y adopts some transformation
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

function generateObjectSelector(objectList) {
  var result = "<select id=\"objectSelector\">";
  for(var i=0;i<objectList.length;i++){
      result += "<option value=\"" + objectList[i] + "\">"
              + objectList[i] + "</option>"
  }
  result += "<option value=\"all\"> ** ANY ** </option>";
  console.log("object selector : \n" + result);
  return result + "</select>";
}

function generatePredicateInputForm(name) {
  var predicate = getObjectByName(name, predicates);
  var predicateHeader = "<div class=\"predicateOptionSpecification\">When "+ name + " is "
      + "<select id=\"truthiness\">"
      + "<option value=\"true\">True</option>"
      + "<option value=\"false\">False</option></select>"
      + " and " + generateArgumentSelector(predicate.arguments, 1)
      + " is <select id=\"objectSelector\"><option value=\"all\"> ** ANY ** </option></select> then the transformation"
      + " below will be applied to the argument " + generateArgumentSelector(predicate.arguments, 2) + " : "
      + "</div>";

      return predicateHeader;
}

function generateInputForm(name, inputtype) {

  //option input format:
  var imageUrlInput = "<div><p>ImageURL</p><textarea id=\"imageURL\" rows=\"1\" cols=\"25\"></textarea></div>";
  var positionInput = "<div><p>Initial Position</p><textarea id=\"position\" rows=\"1\" cols=\"25\"></textarea></div>";
  var customCSS = "<div><p>Custom CSS Properties</p><textarea id=\"customCSS\" rows=\"1\" cols=\"25\"></textarea></div>";
  var animationInput
      = "<tr><td>Select an Animation</td><td><select id=\"animation\"><option value=\"animation1\">Animation 1</option>"
      + "<option value=\"animation2\">Animation 2</option>"
      + "<option value=\"animation3\">Animation 3</option></select></td></tr>"
      ;

  var spatialOptionsInput
      = "<tr><td>Spatial Layout</td><td><select id=\"spatialLayout\"><option value=\"free\">Free</option>"
      + "<option value=\"network\">Network</option>"
      + "<option value=\"grid\">Grid</option></td></tr>"
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
      + animationInput
      + positionInput
      + customCSS
      ;

  var typeOptions
      = imageUrlInput
      + customCSS
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

//this is a bad name, but what this does is takes the users input
//for a given entity and saves them in the requisite options object
//from those defined in input_options_objects.js
function updateInputOptionEntity(optionType, name) {
  var input;
  switch (optionType) {
    case 'type':
      input = readTypeOption();
      updateTypeOption(name, input);
      console.log(typeOptions[name]);
      break;
    case 'constant' :
    case 'object':
      input = readObjectOption();
      console.log(input);
      updateObjectOption(name, input);
      console.log(objectOptions[name]);
      break;
    case 'predicate':
      input = readPredicateOption();
      updatePredicateOption(name, input);
      console.log(predicateOptions[name]);
      break;
    case 'action':
      input = readActionOption();
      break;
    default :
      console.log("something went wrong trying to create an option entity");
  }
}

function readTypeOption() {
  var image = $("#imageURL").val();
  var customCSS = $("#customCSS").val();
  var result = [image,customCSS];
  return result;
}

function writeTypeOption(name){

}

function readObjectOption() {
  var image = $("#imageURL").val();
  var location = $("#position").val();
  var customCSS = $("#customCSS").val();
  var result = [image,location,customCSS];
  return result;
}

function writeObjectOption(name) {

}

function readPredicateOption() {
    var truthiness = $("#truthiness").val();
    var argument1 = $("#arg1").val();
    var argument2 = $("#arg2").val();
    var argument1_value = $("#objectSelector").val();
    var animation = [$("#imageURL").val(), $("#position").val(), $("#customCSS").val()];
    return [truthiness,argument1,argument2,argument1_value,animation];
}

function writePredicateOption(name) {

}

function readActionOption() {

}

function updateTypeOption(name, input) {
  typeOptions[name] =
    new TypeOption(name, input[0], input[1]);
}

function updateObjectOption(name, input) {
  objectOptions[name].image=input[0];
  objectOptions[name].location=input[1];
  objectOptions[name].css=input[2];
}

function updatePredicateOption(name, input) {
    predicateOptions[name] =
      new PredicateOption(input[0], input[1], input[2], input[3], input[4], input[5]);
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
