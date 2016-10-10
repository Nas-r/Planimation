
%lex

CHAR = [a-zA-Z_];
DIGIT = [0-9];
NUMBER = [0-9]*;
STRING = {CHAR}+(\-|{CHAR}|{DIGIT})*;
QUESTION_TAG = [?];
VARIABLE = {QUESTION_TAG}+(\-|{CHAR}|{DIGIT})*;

%%
[;;].*					   	{ /* ignore non animation comments */}

"domain"            { return 'DOMAIN';}
"define"            { return 'DEFINE';}
"problem"           { return 'PROBLEM';}

":requirements"     { return 'REQUIREMENTS';}
":strips"           { return 'STRIPS';}
":typing"           { return 'TYPING';}

":domain"           { return 'DOMAIN';}
":types"            { return 'TYPES';}
":predicates"       { return 'PREDICATES';}
":constants"        { return 'CONSTANTS';}
":parameters"       { return 'PARAMETERS';}
":action"           { return 'ACTION';}
":precondition"     { return 'PRECONDITION';}
":effect"           { return 'EFFECT';}
":observe"          { return 'OBSERVE';}
":objects"          { return 'OBJECTS';}

":init"             { return 'INIT';}
":INIT"             { return 'INIT';}
":goal"             { return 'GOAL';}

"and"               { return 'AND';}
"AND"               { return 'AND';}

"not"               { return 'NOT';}
"when"              { return 'WHEN';}
#.*$                {}
[(]                 { return 'LPAREN'; }
[)]                 { return 'RPAREN'; }
[\t ]               {}
[\n]                {}
[\r]                {}
[\-]                {return 'HYPHEN';}
{VARIABLE}          {return 'VARIABLE';}
{STRING}            {return 'STRING'; }

/lex

%%

start
  : LPAREN DEFINE LPAREN DOMAIN domain_name RPAREN
    domain_definitions
    domain_body
    RPAREN
    {return [types, constants, predicates, actionList];}
  | LPAREN DEFINE LPAREN PROBLEM problem_name RPAREN
    LPAREN DOMAIN domain_name RPAREN
    problem_body
    RPAREN
    {return [objects, startPredicates];}
;

domain_body
  : domain_types domain_body
  | predicates_def domain_body
  | constants_def domain_body
  | action_def domain_body
  |
;

problem_body
  : object_definitions problem_body
  | init_state problem_body
  | goal_state problem_body
  |
;

object_definitions
  : LPAREN OBJECTS object_list RPAREN
  ;

object_list
  : STRING object_list
  { objects.names.push($1)}
  | HYPHEN STRING object_list
  { objects.types.push($2); objects.typeIndex.push(objects.names.length);}
  |
;

init_state
  : LPAREN INIT initial_predicates RPAREN
  | LPAREN INIT LPAREN AND initial_predicates RPAREN RPAREN
;

initial_predicates
  : LPAREN STRING argument_list RPAREN initial_predicates
  {startPredicates.push(new Predicate($2,$3,false));}
  | LPAREN NOT LPAREN STRING argument_list RPAREN RPAREN initial_predicates
  {startPredicates.push(new Predicate($4,$5,true));}
  |
;

goal_state
  : LPAREN GOAL goal_predicates RPAREN
  | LPAREN GOAL LPAREN AND goal_predicates RPAREN RPAREN
;

goal_predicates
  : LPAREN STRING argument_list RPAREN goal_predicates
  {goalPredicates.push(new Predicate($2,$3,false));}
  | LPAREN NOT LPAREN STRING argument_list RPAREN RPAREN goal_predicates
  {goalPredicates.push(new Predicate($4,$5,true));}
  |
;

domain_name
  : STRING
  {$$ = $1;}
;

problem_name
  : STRING
  {$$ = $1;}
;

/*I can ignore the domain definition and requirements.*/
domain_definitions
  : LPAREN definition RPAREN
  {}
;

/*I can ignore these but I might as well store them somewhere*/
definition
  : REQUIREMENTS definition
  |  TYPING  definition {requirements.push("types");}
  |  STRIPS  definition {requirements.push("strips");}
  |
;

/*Types*/
domain_types
  : LPAREN TYPES types RPAREN {};

/*Keep track of the available types in the types array.*/
types
  : types STRING {types.push($2);}
  | STRING {types.push($1);}
;

/*Constants*/
constants_def
  : LPAREN CONSTANTS constants_list RPAREN
;

constants_list
  : constants_list STRING
  { constants.names.push($2)}
  | constants_list HYPHEN STRING
  { constants.types.push($3);constants.typeIndex.push(constants.names.length);}
  |
;

/*Predicates*/
predicates_def
  : LPAREN PREDICATES predicate_list RPAREN
;

/*Formulas*/
predicate_list
  : predicate predicate_list
  |
;

predicate
/* $2 is the predicate name, argument_list is the list of arguments*/
  : LPAREN STRING argument_list RPAREN
  {predicates.push(new Predicate($2,$3, false));}
  | LPAREN NOT LPAREN STRING argument_list RPAREN RPAREN
  {predicates.push(new Predicate($4,$5, true));}
;


/*Variables ?i*/

/*TODO: This only returns one argument instead of all of them*/
argument_list
  : argument argument_list
  { if ($2!=null) {$$ = [$1].concat($2);} else {$$=[$1]};}
  |
;

argument
  : VARIABLE
  {$$ = new Argument($1, "");}
  | VARIABLE HYPHEN STRING
  {$$ = new Argument($1, $3);}
  | STRING
  {$$ = new Argument($1, "");}
;

/*Actions*/
/*action_def_body here is just a list of the effects, everything else is ignored*/
action_def
  : LPAREN ACTION STRING parameters_action action_def_body RPAREN
  {actionList.push(new Action($3,$4,$5));}
;

parameters_action
  : PARAMETERS LPAREN argument_list RPAREN
  {$$=$3;}
;

action_def_body
  : action_preconditions action_result
  {$$ = $2;}
;

/*Action preconditions*/
action_preconditions
  : PRECONDITION list_effects
  {/* Don't care about predconditions */ }
;

/*Action Effects*/
/*TODO: Find out what the observe keyword is for?*/
action_result
  : EFFECT list_effects
  { $$ = $2;}
  | EFFECT LPAREN AND action_effect RPAREN
  { $$ = $4;}
  | OBSERVE list_fluents
;

/*TODO:Conditional effects are uncommon and used to represent nondeterministic
planning problems, only worry about it if there's time/*/

/*Action effects: can be conditional or not*/
/*action_effect
  : LPAREN WHEN list_effects list_effects RPAREN
  {}
;
*/

/*NOTE: The use of the word fluents here is probably a misnomer*/
/*fluents in pddl would be predicates without parameters,
fluents are already grounded*/
list_effects
  : fluent
  | LPAREN list_fluents RPAREN
    {$$ = $2;}
  | LPAREN AND list_fluents RPAREN
    {$$ = $3;}
;

list_fluents
  : fluent
  {$$=$1;}
  | list_fluents fluent
  {[$1].push($2); $$ = $1;}
;

fluent
  : LPAREN STRING argument_list RPAREN
  { $$ = new Predicate($2, $3, false); }
  | LPAREN NOT LPAREN STRING argument_list RPAREN RPAREN
  { $$ = new Predicate($4, $5, true) }
;


%%

var requirements = [];
var types = [];
var parameters = [];

/*list of constants followed by a list of types followed by where in the list
of constants the type was denoted (so I can attach types to constants at a
later stage )*/

function Constant(names, types, typeIndex){
  this.names = names;
  this.types = types;
  this.typeIndex = typeIndex;
}

var constants = new Constant([], [], []);
var objects = new Constant([],[],[]);

function Argument(name, type){
  this.name = name;
  this.type = type;
};

/*arguments may be typed*/
function Predicate(name, arguments,truthiness){
  this.name = name;
  this.arguments = arguments;
  this.truthiness = truthiness;
};

var predicates = [];
var startPredicates = [];
var goalPredicates = [];

function Action(name, parameters, effects){
  this.name = name;
  this.parameters = parameters;
  this.effects = effects;
}

var actionList = [];

function Effect(effectlist) {
  this.effectlist = effectlist;
}

function Variable(name, type) {
  this.name = name;
  this.type = type;
}
