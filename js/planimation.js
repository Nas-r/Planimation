var domain_file;
var problem_file;
var plan_file;

var readDomain = false;
var readProblem = false;
var readPlan = false;


var globalOptions = new GlobalOptions();
var typeOptions = new TypeOptions();
var animatedObjects;
var animatedPredicates;
/*
****************      LOAD TEST FILES     **********************
*/

$(document).ready(function(){
    $('#inputdomain').on('change', function(e){
        domain_file=this.files[0];
        // try {
        //   readFile(this.files[0], function(e) {
        //     //manipulate with result...
        //     // $('#domain').text(e.target.result);
        //   });
        // } catch (x) { alert(x);}
    });

    $('#inputproblem').on('change', function(e){
        problem_file=this.files[0];
        // try {
        //   readFile(this.files[0], function(e) {
        //     //manipulate with result...
        //     // $('#problem').text(e.target.result);
        //   });
        // } catch (x) { alert(x); }
      });

    $('#inputplan').on('change', function(e){
        plan_file=this.files[0];
        // try {
        //   readFile(this.files[0], function(e) {
        //       // $('#plan').text(e.target.result);
        //   });
        // } catch (x) { alert(x);}
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
whitespace character at the end seems to fix it.*/
function parseProblem(domain, callback) {
      readFile(problem_file, function(e) {
        try {
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
      domain = PDDL_Parser.parse(e.target.result);
      console.log(domain);

    } catch (x) {
      console.log(x);
    } finally {parseProblem(domain, callback);}
  });
}

function parseInputFiles() {
  /*
    domain  = [[types], [constants], [predicates], [actionList]]
    problem = [[objects], [startPredicates]]
    plan    = [actions]
  */
  function getInput(domain,problem,plan) {
    populateAnimationObjects(domain,problem,plan);
    generateInputForm(domain);
    $("#submitInputs").append("<p></p><input id=\"submitInputs\" type=\"button\" "
          + "value=\"Submit Input\" onclick=\"createAnimationObjects();\">");
  }
    parseDomain(getInput);
}

/*
****************      GENERATE INPUT FORM    **********************
*/
function generateInputForm(domain) {
  var spatialOptions
            = "<select name=\"spatialLayout\"><option value=\"free\">Free</option>"
            + "<option value=\"network\">Network</option>"
            + "<option value=\"grid\">Grid</option>"
            ;

  var globalOptionsInput
            = "<p>Global Options</p><table><tr>"
            + "<th>Spatial Layout</th>"
            + "</tr>"
            + "<tr><td>"+ spatialOptions +"</td></tr>"
            + "</table>"
            ;

  $("#globalOptions").append(globalOptionsInput);

  if(domain != null){
    //Input form for types
    if(domain[0].length>0){
      //Option Headings
      var typeOptionsInput
          = "<table><tr>"
          + "<th>Type</th>"
          + "<th>Default Image URL</th>"
          + "<th>Visible?</th>"
          + "</tr>";

      var typeOptions
          = "<td><textarea name=\"imageURL\" rows=\"1\" cols=\"25\"></textarea></td>"
          + "<td><input name=\"visible\"type=\"checkbox\" checked></td>"
          ;

      for(var i=0; i<domain[0].length; i++){
          typeOptionsInput += "<tr id=\"type_"+i+"\"><td>" + domain[0][i] + "</td>";
          typeOptionsInput += typeOptions;
          typeOptionsInput += "</tr>";
      }
      typeOptionsInput += "</table";
      $("#typeOptions").append(typeOptionsInput);
    }

    if(domain[2].length>0) {
      for(var i = 0; i<domain[2].length; i++){
        var objectInput = "<p> " + domain[2][i] + "</p>";
        //Set input options here.
        $("#typeOptions").append(objectInput);
      }
    }
  }
}

/*Gets the values from the HTML form and attaches them to the relevant
objects*/
function getInputValues() {
//When adding something here, don't forget to add an equivalent entry in
//setInputValues()

  //globalOptions
  globalOptions.spatialLayout = $("#globalOptions").find("select[name=spatialLayout]").val();
  console.log(globalOptions);

  if(domain!=null){
  }
  //typeOptions

}

/*
****************      SAVE FORM INPUT        **********************
*/


/*
****************      LOAD FORM INPUT        **********************
*/


/*
****************      POPULATE OBJECTS       **********************
*/

function populateAnimationObjects(domain,problem,plan){

  globalOptions = new GlobalOptions();


}
/*Create interface for setting up the animation
Each object, constant and predicate should be listed with the following options
General Options:
- spatial layout (grid, network, free)
*/

function TypeOptions(typeName, visible, defaultImageURL) {
  this.typeName=typeName;
  this.visible=visible;
  this.defaultImageURL=defaultImageURL;
}

function GlobalOptions(spatialLayout) {
    this.spatialLayout = spatialLayout;
}

/*
For objects/constants
- Visible?
- Set Image
- Set initial position
- relative positioning options (above ?x, etc)
(maybe whether or not the relative positioning is persistant throughout
the animation)
- relative ordering (could probably use a z-property for this)
*/

function AnimatedObject(object, visible, imageURL, location, z) {

}

/*
for predicates:
- set image?
- set position
- sprite swap arguments when true/false and/or when value changes
- animate argument/s when true/false
- translate argument/s when true/false
- set relative position of argument/s when true/false
- set z-property of argument/s
*/

function AnimatedPredicate(predicate, animatedArgument, isTrue) {

}

/*all setX arguments are arrays with the first value corresponding to
when the predicate evaluates to true and the second when it's false.
*/
function animatedArgument(argument, type, setImage, setTransitionImage,
  setAnimation, setTranlation, setZ, setRelativePosition){
    this.argument = argument;
}

function relativePosition(object, relativePosition) {

}

/*
These options should be exportable via JSON.
*/

/*********************************************
            Pixi.js playground
**********************************************/
var width = 256;
var height = 256;
var center = [width/2, height/2];

//Create the renderer
var renderer = PIXI.autoDetectRenderer(width, height);

//Add the canvas to the HTML document
$(document).ready(function(){
document.body.appendChild(renderer.view);
});

//Create a container object called the `stage`
var stage = new PIXI.Container();

//Tell the `renderer` to `render` the `stage`
renderer.render(stage);
