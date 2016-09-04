

var CHAR = /[a-zA-Z_];
var DIGIT = /[0-9];
var NUMBER = /[0-9](_[0-9]|[0-9])*;
var STRING = /{CHAR}+(-|{CHAR}|{DIGIT})*;
var QUESTION_TAG = /[?];
var VARIABLE = /{QUESTION_TAG}+(-|{CHAR}|{DIGIT})*;

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
    RPAREN {printf("Domain: %s\n", $5);}
  ;

  domain_body
    : predicates_def domain_body
    | constants_def domain_body
    | action_def domain_body
    |
    ;

  domain_name
    : STRING
    {$$ = $1;}
  ;

  domain_definitions
    : LPAREN definition tRPAREN
    {printf("Parsed requirements: %s\n", str_requirements);}
  ;

  definition
    : REQUIREMENTS definition
    |  TYPING  definition {strcat(str_requirements, "types ");}
    |  STRIPS  definition {strcat(str_requirements, "strips ");}
    |
  ;

  /*Types*/
  domain_types
    : LPAREN types RPAREN {printf("Parsed types: %s\n", str_types);}

  types
    : TYPES types
    | STRING types {strcat(str_types, $1);}
    |
  ;

  predicates_def
    : LPAREN list_predicates RPAREN
  ;

  list_predicates
    : PREDICATES list_atomic_formula_skeleton
  ;
  /*Formulas*/
  list_atomic_formula_skeleton
    : atomic_formula_skeleton list_atomic_formula_skeleton
    |
  ;

  atomic_formula_skeleton
    : LPAREN terminal_string typed_list RPAREN
    | LPAREN NOT LPAREN terminal_string typed_list RPAREN RPAREN
  ;


  /*Variables ?i*/
  typed_list
    : variable typed_list
    | HYPHEN terminal_type_string typed_list
    |
  ;

  actions_typed_list
    : variable actions_typed_list
    {$2->add_parameter($1);
      $$ = $2;}
    |
    {Predicate* v = new Predicate();
      $$ = v;}
  ;

  variable
    : VARIABLE {
    string st = $1;
    Variable* v = new Variable(st);
    $$ = v;
    }
  ;

  /*Parameters variable*/
  parameter_typed_list
    : variable HYPHEN terminal_type_string parameter_typed_list
    {$1->set_type($3);}
    |
  ;

  /*Constants*/
  constants_def
    : LPAREN list_constants RPAREN
    ;

  list_constants
    : CONSTANTS constants_list
    ;

  constants_list
    : STRING constants_list
    | HYPHEN terminal_string constants_list
    |
  ;

  /*Actions*/
  action_def
    : LPAREN ACTION terminal_string parameters_action action_def_body RPAREN
    ;

  parameters_action
    : PARAMETERS LPAREN parameter_typed_list RPAREN
;

  action_def_body
    : action_preconditions action_result
;

  /*Action preconditions*/
  action_preconditions
    : PRECONDITION list_effects {
    /*cout << $3->print_predicates() << endl;*/
  }

  /*Action Effects*/
  action_result: EFFECT list_effects
  {
    Effect* e = new Effect();
    e->add_effect($2);
  }
  | EFFECT LPAREN AND action_effect RPAREN{
  }
  | OBSERVE list_fluents
;

  /*Action effects: can be conditional or not*/
  action_effect: LPAREN WHEN list_effects list_effects RPAREN {
    Effect* e = new Effect();
    e->set_conditional();
    e->add_condition($3);
    e->add_effect($4);
  }
;
  list_effects: fluent {
    ListPredicates* v = new ListPredicates();
    v->add_predicate($1);
    $$ = v;
  }
  | LPAREN list_fluents RPAREN {$$ = $2;}
  | LPAREN AND list_fluents RPAREN {$$ = $3;}
;

  list_fluents
    :  {
      ListPredicates* v = new ListPredicates();
      $$ = v;
    }
    | fluent list_fluents {
      $2->add_predicate($1);
      $$ = $2;
    }
  ;

  fluent
    : LPAREN terminal_string actions_typed_list RPAREN {
    string st = $2;
    $3->set_name($2);
    $$ = $3;
  }
  | LPAREN NOT LPAREN terminal_string actions_typed_list RPAREN RPAREN {
    $5->set_name($4);
    $5->negate();
    $$ = $5;
  };

  /*Terminal leafs*/
  terminal_string
    : STRING {
      $$ = $1;
  }
;

  terminal_type_string
    : STRING {
      $$ = $1;
  }
;
%%
