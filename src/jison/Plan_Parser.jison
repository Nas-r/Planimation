
%lex

CHAR = [a-zA-Z_];
DIGIT = [0-9];
STRING = {CHAR}+(\-|{CHAR}|{DIGIT})*;

%%

"Found Plan"        {}
"(output)"          {return 'BEGIN';}
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
  : BEGIN actions
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
  : VARIABLE
  {$$ = new Argument($1, "", "");}
  | VARIABLE HYPHEN STRING
  {$$ = new Argument($1, $3, "");}
  | STRING
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
