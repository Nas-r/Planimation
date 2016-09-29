var domain_file;
var problem_file;
var plan_file;

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
  var inputSelector = createInputSelector(domain,problem);
  document.getElementById("Window1").style.display="none";
  document.getElementById("Window2").style.display="block";
  $("#inputSelector").append(inputSelector);
  generateInputForm(domain,problem,plan);
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
