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
                          break;
        default:          result += globalOptions;
                          break;
      }

      return "<div class=\"inputOptions\" style=\"margin:auto;\">" + result + "</div>"
}

//this is a bad name, but what this does is takes the users input
//for a given entity and saves them in the requisite options object
//from those defined in input_options_objects.js
function updateInputOptionEntity(optionType, entity) {
  var input;
  switch (optionType) {
    case 'type':
      input = readTypeOption();
      createTypeOption(entity, input);
      break;
    case 'object':
      input = readObjectOption();
      break;
    case 'predicate':
      input = readPredicateOption();
      break;
    case 'action':
      input = readActionOption();
      break;
    default :
      console.log("something went wrong trying to create an option entity");
  }
}

function readTypeOption() {
  var image = $("#imageURL").val;
  var customCSS = $("customCSS").val;

  var result = [image,customCSS];
  console.log(result);
  return result;
}

function readObjectOption() {
  var image = $("#imageURL").val;
  var location = $("#position").val;
  var customCSS = $("customCSS").val;
  var result = [image,location,customCSS];
}

function readPredicateOption() {

}

function readActionOption() {

}

function updateTypeOption(entity, input) {
  var name = entity;
  typeOptions[name] =
    new TypeOption(name, input[0], input[1]);
}

function updateObjectOption(entity, input) {

}
