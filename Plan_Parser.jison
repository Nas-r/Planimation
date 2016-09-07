
%lex

CHAR = [a-zA-Z_];
DIGIT = [0-9];
STRING = {CHAR}+(\-|{CHAR}|{DIGIT})*;

%%

"Found Plan"        {}
"(output)"          {return 'BEGIN';}
{STRING}              {return 'STRING';}

#.*$                {}
[(]                 { return 'LPAREN'; }
[)]                 { return 'RPAREN'; }
[\t ]               {}
\n                  {}

/lex
%%

start
  : BEGIN actions
  {console.log(actions); return actions;}
;

actions
  : LPAREN STRING argument_list RPAREN actions
    {actions.push($2, $3);}
  |
;

argument_list
  : STRING argument_list
  { if ($2!=null) {$$ = [$1].concat($2);} else {$$=[$1]};}
  |
;

%%
function Action(name, arguments){
  this.name = name;
  this.arguments = arguments;
}

var actions = [];
