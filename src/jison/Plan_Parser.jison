
%lex

CHAR = [a-zA-Z_];
DIGIT = [0-9];
STRING = {CHAR}+(\-|{CHAR}|{DIGIT})*;

%%

"Found Plan"        {}
"(output)"          {}
{STRING}            {return 'STRING';}

#.*$                {}
[(]                 { return 'LPAREN'; }
[)]                 { return 'RPAREN'; }
[\t ]               {}
[\n]                {}
[\r]                {}

/lex
%%

start
  : actions
  {return actions;}
;

actions
  : actions LPAREN STRING argument_list RPAREN
    {actions.push(new Action($3, $4));}
  |
;


argument_list
  : argument argument_list
  { if ($2!=null) {
      $$ = [$1].concat($2);
    } else {
      $$=[$1]
    };
  }
  |
;

argument
  :
  STRING
  {$$ = new Argument("", "", $1);}
;

%%
function Action(name, parameters){
  this.name = name.toLowerCase();;
  this.parameters = parameters;
}

function Argument(name,type,value){
  this.name = name.toLowerCase();
  this.type = type.toLowerCase();
  this.value = value.toLowerCase();
}

var actions = [];
