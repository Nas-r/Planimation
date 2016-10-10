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
  generateAnimationTimeline(domain,problem,plan);
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

function parseInputFiles() {
    parseDomain(getInput);
}
