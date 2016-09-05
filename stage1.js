var domain_file;
var problem_file;
var plan_file;

/*
****************      LOAD TEST FILES     **********************
*/

$(document).ready(function(){

    $('#inputdomain').on('change', function(e){
        domain_file=this.files[0];
        readFile(this.files[0], function(e) {
            //manipulate with result...
            $('#domain').text(e.target.result);
        });
    });

    $('#inputproblem').on('change', function(e){
        problem_file=this.files[0];
        readFile(this.files[0], function(e) {
            //manipulate with result...
            $('#problem').text(e.target.result);
        });
    });

    $('#inputplan').on('change', function(e){
        plan_file=this.files[0];
        readFile(this.files[0], function(e) {
            //manipulate with result...
            $('#plan').text(e.target.result);
        });
    });

});

function readFile(file, callback){
    var reader = new FileReader();
    reader.onload = callback
    reader.readAsText(file);
}

function parse (input) {
    return require("./PDDL").parse(input);
}

var output = parse();



/*TODO: create a dictionary of type definitions*/

/*TODO: scan for annotated objects and note their types and create attributes for
 applicable fluents with a display tag (optional?)*/

 /*TODO: initialize them as objects in a dictionary*/

 /*TODO: scan for URL annotations to grab and assosciate images*/

 /*TODO:write a separate plugin that ties in to imagenet to auto insert image
 annotations*/

 /*How will I handle relational predicates (those with multiple objects/constants)?*/
 /*store them with all relevant objects and update as necessary? I think this is
 the most prudent approach, and it's not terribly inefficient. I can always improve it later.*/
