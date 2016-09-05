
%lex

CHAR = [a-zA-Z_];
DIGIT = [0-9];
NUMBER = [0-9]*;
STRING = {CHAR}+(\-|{CHAR}|{DIGIT})*;
QUESTION_TAG = [?];
VARIABLE = {QUESTION_TAG}+(\-|{CHAR}|{DIGIT})*;

%%

"domain"          { return 'DOMAIN';}
"define"          { return 'DEFINE';}
"problem"         { return 'PROBLEM';}

:requirements     { return 'REQUIREMENTS';}
:strips           { return 'STRIPS';}
:typing           { return 'TYPING';}

:types            { return 'TYPES';}
:predicates       { return 'PREDICATES';}
:constants        { return 'CONSTANTS';}
:parameters       { return 'PARAMETERS';}
:action           { return 'ACTION';}
:precondition     { return 'PRECONDITION';}
:effect           { return 'EFFECT';}
:observe          { return 'OBSERVE';}

"and"             { return 'AND';}
"not"             { return 'NOT';}
"when"            { return 'WHEN';}
#.*$              {}
[(]               { return 'LPAREN'; }
[)]               { return 'RPAREN'; }
[\t ]             {}
\n                {}
\-                {return 'HYPHEN';}
{VARIABLE}        {yylval.sval = strdup(yytext); return 'VARIABLE';}
{STRING}          {yylval.sval = strdup(yytext); return 'STRING'; }

/lex

%%

start
  : LPAREN DEFINE LPAREN DOMAIN domain_name RPAREN
    domain_definitions
    domain_types
    domain_body
    RPAREN {console.log("Domain: %s\n", $5);}
  ;

  domain_body
    : predicates_def domain_body
    | constants_def domain_body
    | action_def domain_body
    |
    ;

/*Throw the domain name up a level and print it to console*/
  domain_name
    : STRING
    {$$ = $1;}
  ;

/*I can ignore the domain definition and requirements.*/
  domain_definitions
    : LPAREN definition RPAREN
    {}
  ;

/*I can ignore these but I might as well store them somewhere for lulz*/
  definition
    : REQUIREMENTS definition
    |  TYPING  definition {requirements.push("types");}
    |  STRIPS  definition {requirements.push("strips");}
    |
  ;

  /*Types*/
  domain_types
    : LPAREN types RPAREN
    {console.log("Parsed types:\n"); console.log(types);}
    ;

/*Keep track of the available types in the types array.*/
  types
    : TYPES types
    | STRING types {types.push($1);}
    |
  ;

  /*Constants*/
  constants_def
    : LPAREN CONSTANTS constants_list RPAREN
    ;

  constants_list
    : STRING constants_list
    { constants.constantsList.push($1)}
    | HYPHEN STRING constants_list
    { constants.types.push($2);constants.typeIndex.push(constants.constantsList.length);}
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
    {predicates.push(new Predicate($2,$3);)}
    | LPAREN NOT LPAREN STRING argument_list RPAREN RPAREN
    {predicates.push(new Predicate($4,$5));}
  ;


  /*Variables ?i*/
  argument_list
    : argument_list VARIABLE
    { $1.push(new Argument($2, ""));
      $$ = $1;}
    | argument_list VARIABLE HYPHEN STRING
    { $1.push(new Argument($2,$3));
      $$=$1;}
    |
  ;

  /*Actions*/
  /*action_def_body here is just a list of the effects, everything else is ignored*/
  action_def
    : LPAREN ACTION STRING parameters_action action_def_body RPAREN
    {ActionList.push(new Action($3,$4,$5));}
    ;

  parameters_action
    : PARAMETERS LPAREN argument_list RPAREN
    {$$=$3;}
;

  action_def_body
    : action_preconditions action_result
;

  /*Action preconditions*/
  action_preconditions
    : PRECONDITION list_effects {
  }
  ;

  /*Action Effects*/
  action_result
    : EFFECT list_effects
  {  }
  | EFFECT LPAREN AND action_effect RPAREN
  {}
  | OBSERVE list_fluents
;

/*TODO:ASK NIR ABOUT CONDITIONAL ACTION EFFECTS*/
/*Action effects: can be conditional or not*/
  action_effect: LPAREN WHEN list_effects list_effects RPAREN {
    e->add_condition($3);
    e->add_effect($4);
  }
;
  list_effects
    : fluent
    | LPAREN list_fluents RPAREN
      {$$ = $2;}
    | LPAREN AND list_fluents RPAREN
      {$$ = $3;}
;

  list_fluents
    :
    {}
    | fluent list_fluents
    {}
  ;

  fluent
    : LPAREN STRING argument_list RPAREN
    {  }
  | LPAREN NOT LPAREN STRING argument_list RPAREN RPAREN
  {  };


%%

var requirements = [];
var types = [];
var parameters = [];

/*list of constants followed by a list of types followed by where in the list
of constants the type was denoted (so I can attach types to constants at a
later stage )*/

function Constant(constantsList, types, typeIndex){
  this.constantsList = constants;
  this.types = types;
  this.typeIndex = typeIndex;
}

var constants = new Constant([], [], []);

function Argument(name, type){
  this.name = name;
  this.type = type;
};

/*arguments may be typed*/
function Predicate(name, arguments){
  this.name = name;
  this.arguments = arguments;
};

var predicates = [];

function Action(name, parameters, effects){
  this.name = name;
  this.parameters = parameters;
  this.effects = effects;
}

var ActionList = [];

function Effect(effectlist) {
  this.effectlist = effectlist;
}

function Variable(name, type) {
  this.name = name;
  this.type = type;
}
