
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

":types"            { return 'TYPES';}
":predicates"       { return 'PREDICATES';}
":constants"        { return 'CONSTANTS';}
":parameters"       { return 'PARAMETERS';}
":action"           { return 'ACTION';}
":precondition"     { return 'PRECONDITION';}
":effect"           { return 'EFFECT';}
":observe"          { return 'OBSERVE';}

"and"               { return 'AND';}
"not"               { return 'NOT';}
"when"              { return 'WHEN';}
#.*$                {}
[(]                 { return 'LPAREN'; }
[)]                 { return 'RPAREN'; }
[\t ]               {}
\n                  {}
\-                  {return 'HYPHEN';}
{VARIABLE}          {return 'VARIABLE';}
{STRING}            {return 'STRING'; }


/lex

%%


start
  : LPAREN DEFINE LPAREN DOMAIN domain_name RPAREN
    domain_definitions
    domain_types
    domain_body
    RPAREN
    {console.log("Domain: %s\n", $5); console.log("Test: \n", JSON.stringify(actionList)); return [types, constants, predicates, actionList];}
  | LPAREN DEFINE LPAREN DOMAIN domain_name RPAREN
    domain_definitions
    domain_body
    RPAREN
    {console.log("Domain: %s\n", $5); console.log("Test: \n", JSON.stringify(actionList)); return [types, constants, predicates, actionList];}
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

/*I can ignore these but I might as well store them somewhere*/
definition
  : REQUIREMENTS definition
  |  TYPING  definition {requirements.push("types");}
  |  STRIPS  definition {requirements.push("strips");}
  |
;
