var domain_file;
var problem_file;
var plan_file;

var readDomain = false;
var readProblem = false;
var readPlan = false;
/*
****************      LOAD TEST FILES     **********************
*/

$(document).ready(function(){

    $('#inputdomain').on('change', function(e){
        domain_file=this.files[0];
        try {
          readFile(this.files[0], function(e) {
            //manipulate with result...
            // $('#domain').text(e.target.result);
          });
        } catch (x) { alert(x);}
    });

    $('#inputproblem').on('change', function(e){
        problem_file=this.files[0];
        try {
          readFile(this.files[0], function(e) {
            //manipulate with result...
            // $('#problem').text(e.target.result);
          });
        } catch (x) { alert(x); }
      });

    $('#inputplan').on('change', function(e){
        plan_file=this.files[0];
        try {
          readFile(this.files[0], function(e) {
              //manipulate with result...
              // $('#plan').text(e.target.result);
          });
        } catch (x) { alert(x);}
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

// TODO: Fix problem with ASYNC FileReader Calls by nesting functions below
// in callbacks, currently the code below the parsing functions
// is executed before the parser has finished its job since calls to readFile
// are not blocking. Solution = Callbacks.

// I can use currying to pass arguments down through the callbacks.
// ty google: https://www.sitepoint.com/currying-in-functional-javascript/

/*Parses the loaded domain file and returns
[types, constants, predicates, actionList]*/


var domain;
// [types, constants, predicates, actionList]
var problem;
// [objects, startPredicates]
var plan;
// [actions]


/*Prases the loaded plan and returns a list of actions*/
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
  // domain;
  // [[types], [constants], [predicates], [actionList]]

  // problem;
  // [[objects], [startPredicates]]

  // plan;
  // [actions]
  function getInput(domain,problem,plan) {
    console.log([domain,problem,plan]);
    console.log("so far so good");
    generateInputForm(domain);

  }
    parseDomain(getInput);
}

/*Create interface for setting up the animation
Each object, constant and predicate should be listed with the following options
General Options:
- spatial layout (grid, network, free)
*/

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

}

function relativePosition(object, relativePosition) {

}

/*
These options should be exportable via JSON.
*/


function generateInputForm(domain) {
  if(domain != null){

    // typeOptions.appendChild("<p>Type Options</p>");
    var typeInput = "<table>  <tr>  <th>Type</th> <th>Default Image URL</th>  </tr>";
    for(var i=0; i<domain[0].length; i++){
        var typeInput = "<tr><td>" + domain[0][i] + "</td>";
        typeInput += "<td><textarea name=\"Image URL\" rows=\"256\" cols=\"1\"></textarea></td>";
        typeInput += "</tr>";
        //Set input options here.
    }

    typeInput += "</table";
    console.log(typeInput);
    $("#typeOptions").append(typeInput);

    for(var i = 0; i<domain[2].length; i++){
      var objectInput = "<p> " + domain[2][i] + "</p>";
      //Set input options here.
      $("#typeOptions").append(objectInput);
    }
  }
}

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
