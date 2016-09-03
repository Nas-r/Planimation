

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
{VARIABLE}        {yylval.sval = strdup(yytext); TOKEN(VARIABLE);}
{STRING}          {yylval.sval = strdup(yytext); TOKEN(STRING); }

/lex


  start: LPAREN DEFINE LPAREN DOMAIN domain_name RPAREN
  domain_definitions
  domain_types
  domain_body
  RPAREN {printf("Domain: %s\n", $5);}
  ;

  domain_body: predicates_def domain_body
  | constants_def domain_body
  | action_def domain_body
  |
  ;

  domain_name: tSTRING {$$ = $1;}
  ;

  domain_definitions: tLPAREN definition tRPAREN {printf("Parsed requirements: %s\n", str_requirements);}

  definition:  kREQUIREMENTS definition
  |  kTYPING  definition {strcat(str_requirements, "types ");}
  |  kSTRIPS  definition {strcat(str_requirements, "strips ");}
  |
  ;

  /*Types*/
  domain_types: tLPAREN types tRPAREN {printf("Parsed types: %s\n", str_types);}

  types:  kTYPES types
  | tSTRING types {strcat(str_types, $1);}
  |
  ;

  predicates_def: tLPAREN list_predicates tRPAREN

  list_predicates: kPREDICATES list_atomic_formula_skeleton

  /*Formulas*/
  list_atomic_formula_skeleton: atomic_formula_skeleton list_atomic_formula_skeleton
  |
  ;

  atomic_formula_skeleton: tLPAREN terminal_string typed_list tRPAREN
  | tLPAREN kNOT tLPAREN terminal_string typed_list tRPAREN tRPAREN
  ;


  /*Variables ?i*/
  typed_list: variable typed_list
  | tHYPHEN terminal_type_string typed_list
  |
  ;

  actions_typed_list: variable actions_typed_list{
    $2->add_parameter($1);
    $$ = $2;
  }
  |{
    Predicate* v = new Predicate();
    $$ = v;
  }
  ;

  variable: tVARIABLE {
    string st = $1;
    Variable* v = new Variable(st);
    $$ = v;
  }

  /*Parameters variable*/
  parameter_typed_list: variable tHYPHEN terminal_type_string parameter_typed_list {
    $1->set_type($3);
  }
  |
  ;

  /*Constants*/
  constants_def: tLPAREN list_constants tRPAREN

  list_constants: kCONSTANTS constants_list

  constants_list: tSTRING constants_list
  | tHYPHEN terminal_string constants_list
  |
  ;

  /*Actions*/
  action_def: tLPAREN kACTION terminal_string parameters_action action_def_body tRPAREN

  parameters_action: kPARAMETERS tLPAREN parameter_typed_list tRPAREN

  action_def_body: action_preconditions action_result

  /*Action preconditions*/
  action_preconditions: kPRECONDITION list_effects {
    /*cout << $3->print_predicates() << endl;*/
  }


  /*Action Effects*/
  action_result: kEFFECT list_effects{
    Effect* e = new Effect();
    e->add_effect($2);
  }
  | kEFFECT tLPAREN kAND action_effect tRPAREN{

  }
  | kOBSERVE list_fluents

  /*Action effects: can be conditional or not*/
  action_effect: tLPAREN kWHEN list_effects list_effects tRPAREN {
    Effect* e = new Effect();
    e->set_conditional();
    e->add_condition($3);
    e->add_effect($4);
  }

  list_effects: fluent {
    ListPredicates* v = new ListPredicates();
    v->add_predicate($1);
    $$ = v;
  }
  | tLPAREN list_fluents tRPAREN {$$ = $2;}
  | tLPAREN kAND list_fluents tRPAREN {$$ = $3;}

  list_fluents:  {
    ListPredicates* v = new ListPredicates();
    $$ = v;
  }
  | fluent list_fluents {
    $2->add_predicate($1);
    $$ = $2;
  }
  ;

  fluent: tLPAREN terminal_string actions_typed_list tRPAREN {
    string st = $2;
    $3->set_name($2);
    $$ = $3;
  }
  | tLPAREN kNOT tLPAREN terminal_string actions_typed_list tRPAREN tRPAREN {
    $5->set_name($4);
    $5->negate();
    $$ = $5;
  };

  /*Terminal leafs*/
  terminal_string: tSTRING {
    $$ = $1;
  }

  terminal_type_string: tSTRING {
    $$ = $1;
  }

%%
