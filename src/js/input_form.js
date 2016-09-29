
function generateInputForm(inputtype) {

  //option input format:
  var imageUrlInput = "<tr><td>ImageURL</td><td><textarea id=\"imageURL\" rows=\"1\" cols=\"25\"></textarea></td></tr>";
  var visibilityInput = "<tr><td>Is Visible?</td><td><input id=\"visible\"type=\"checkbox\" checked></td></tr>";
  var positionInput = "<tr><td>Initial Position</td><td><textarea id=\"position\" rows=\"1\" cols=\"25\"></textarea></td></tr>";
  var scaleInput = "<tr><td>Scale</td><td><input id=\"scale\" type=\"number\" step=\"0.01\"></td></tr>";
  var zInput = "<tr><td>Z Ordering</td><td><input id=\"zInput\" type=\"number\"></td></tr>";
  var customCSS = "<tr><td>Custom CSS Properties</td><td><textarea id=\"customCSS\" rows=\"1\" cols=\"25\"></textarea></td></tr>";
  var animationInput
      = "<tr><td>Select an Animation</td><td><select id=\"animation\"><option value=\"animation1\">Animation 1</option>"
      + "<option value=\"animation2\">Animation 2</option>"
      + "<option value=\"animation3\">Animation 3</option></td></tr>"
      ;

  var spatialOptionsInput
      = "<tr><td>Spatial Layout</td><td><select id=\"spatialLayout\"><option value=\"free\">Free</option>"
      + "<option value=\"network\">Network</option>"
      + "<option value=\"grid\">Grid</option></td></tr>"
      ;

  var globalOptionsInput
      = spatialOptionsInput
      ;

  var constantOptions
      = imageUrlInput
      + visibilityInput
      + positionInput
      + scaleInput
      + zInput
      + customCSS
      ;

  var predicateOptions
      = imageUrlInput
      + animationInput
      + positionInput
      + scaleInput
      + zInput
      + customCSS
      ;

  var typeOptions
      = imageUrlInput
      + visibilityInput
      + customCSS
      ;

  var result = "";

      switch (inputtype) {
        case 'type':      result += typeOptions;
                          break;
        case 'object':    result += constantOptions;
                          break;
        case 'constant':  result += constantOptions;
                          break;
        case 'predicate': result += predicateOptions;
                          break;
        default:          result += globalOptions;
                          break;
      }

      return "<table style=\"margin:auto;\">" + result + "</table>"
}

//this is a bad name, but what this does is takes the users input
//for a given entity and saves them in the requisite options object
//from those defined in input_options_objects.js
function createInputOptionEntity(optionType, entity) {
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
  var visible = $("#visible").checked;
  var customCSS = $("customCSS").val;

  var result = [image,visible,customCSS];
  console.log(result);
  return result;
}

function readObjectOption() {
  var image = $("#imageURL").val;
  var visible = $("#visible").checked;
  var location = $("#position").val;
  var scale = $("#scale").val;
  var zLevel = $("#zInput").val;
  var customCSS = $("customCSS").val;
  var result = [image,visible,position,scale,zInput,customCSS];
}

function readPredicateOption() {

}

function readActionOption() {

}

function createTypeOption(entity, input) {
  //if it already exists, amend it
  if (typeof typeOptions[entity] != "undefined") {

  } else {
    //otherwise create it

  }
}

function writeInputValue() {

}
