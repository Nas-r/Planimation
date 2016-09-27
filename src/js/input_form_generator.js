
function generateInputForm(inputtype) {

  //option input format:
  var imageUrlInput = "<tr><td>ImageURL</td><td><textarea name=\"imageURL\" rows=\"1\" cols=\"25\"></textarea></td></tr>";
  var visibilityInput = "<tr><td>Is Visible?</td><td><input name=\"visible\"type=\"checkbox\" checked></td></tr>";
  var positionInput = "<tr><td>Initial Position</td><td><textarea name=\"position\" rows=\"1\" cols=\"25\"></textarea></td></tr>"
  var scaleInput = "<tr><td>Scale</td><td><input name=\"scale\" type=\"number\" step=\"0.01\"></td></tr>"
  var zInput = "<tr><td>Z Ordering</td><td><input name=\"zInput\" type=\"number\"></td></tr>"
  var animationInput
      = "<tr><td>Select an Animation</td><td><select name=\"animation\"><option value=\"animation1\">Animation 1</option>"
      + "<option value=\"animation2\">Animation 2</option>"
      + "<option value=\"animation3\">Animation 3</option></td></tr>"
      ;

  var spatialOptionsInput
      = "<tr><td>Spatial Layout</td><td><select name=\"spatialLayout\"><option value=\"free\">Free</option>"
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
      ;

  var predicateOptions
      = imageUrlInput
      + animationInput
      + positionInput
      + scaleInput
      + zInput
      ;

  var typeOptions
      = imageUrlInput
      + visibilityInput
      ;

  var result = "";

      switch (inputtype) {
        case 'type':      result += typeOptions;
                          break;
        case 'object':    result += objectOptions;
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
