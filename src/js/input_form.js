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
  var positionInput = "<div><p>Location</p><textarea id=\"position\" rows=\"1\" cols=\"25\"></textarea></div>";
  var customCSS = "<div><p>Custom CSS Properties</p><textarea id=\"customCSS\" rows=\"1\" cols=\"25\"></textarea></div>";
  // var animationInput
  //     = "<tr><td>Select an Animation</td><td><select id=\"animation\"><option value=\"animation1\">Animation 1</option>"
  //     + "<option value=\"animation2\">Animation 2</option>"
  //     + "<option value=\"animation3\">Animation 3</option></select></td></tr>"
  //     ;

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
  var layout = $("#spatialLayout").val();
  var result = [image,customCSS, layout];
  return result;
}

function writeTypeOption(name){
    $("#imageURL").val(typeOptions[name].image);
    $("#customCSS").val(typeOptions[name].css);
    $("#spatialLayout").val(typeOptions[name].layout);
}

function readObjectOption() {
    var image = $("#imageURL").val();
    var location = $("#position").val();
    var customCSS = $("#customCSS").val();
    var result = [image,location,customCSS];
  return result;
}

function writeObjectOption(name) {
    $("#imageURL").val(objectOptions[name].image);
    $("#position").val(objectOptions[name].location);
    $("#customCSS").val(objectOptions[name].css);
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
  $("#truthiness").val(predicateOptions[name].truthiness);
  $("#arg1").val(predicateOptions[name].argument1);
  $("#arg2").val(predicateOptions[name].argument2);
  $("#objectSelector").val(predicateOptions[name].argument1_value);
  $("#imageURL").val(predicateOptions[name].animation[0]);
  $("#position").val(predicateOptions[name].animation[1]);
  $("#customCSS").val(predicateOptions[name].animation[2]);

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
      new PredicateOption(name, input[0], input[1], input[2], input[3], input[4], input[5]);
}
